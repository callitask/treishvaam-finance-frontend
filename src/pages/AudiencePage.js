/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Render the Historical Audience Analytics Dashboard.
 *
 * Scope:
 * - Responsible for managing dynamic dimension filters, date ranges, and user-specific exclusion/inclusion rules.
 * - Displays telemetry parsed from GA4 and Faro RUM payloads.
 *
 * Non-Negotiables:
 * - Must strictly adhere to ESLint rules (no unused imports) as process.env.CI = true enforces warnings as errors on Cloudflare Pages.
 *
 * Change Intent:
 * - Convert User ID inputs to native Multi-Select dropdowns populated dynamically from the database.
 * - Implement Manual GA4 Data Refresh sync.
 * - Map String-based ISO dates to fix the "Invalid Date" Javascript UI crashes.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (LATEST):
 * • Removed unused `FaUser` import to fix strict CI build failure.
 * • Upgraded ID targeting to multi-select dropdown UI.
 * • Added GA4 Refresh Sync capability.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getHistoricalAudienceData, getFilterOptions, refreshGA4Data } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaMobileAlt, FaDesktop, FaClock, FaRedo,
    FaExclamationTriangle, FaChartBar, FaGlobe, FaPlus, FaTimes, FaEyeSlash, FaCrosshairs, FaCheckSquare, FaSquare, FaSyncAlt, FaCheckCircle
} from 'react-icons/fa';

// Helper component for table cell display
const DetailCell = ({ icon: Icon, value, label }) => (
    <div className="flex items-center text-sm text-gray-700">
        <Icon className="text-sky-500 mr-2 flex-shrink-0" title={label} />
        <span className="truncate" title={value || 'N/A'}>
            {value || 'N/A'}
        </span>
    </div>
);

// Custom Multi-Select Dropdown for User IDs to prevent 100k <option> crashes
const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSelection = (id) => {
        if (selectedValues.includes(id)) {
            onChange(selectedValues.filter(val => val !== id));
        } else {
            onChange([...selectedValues, id]);
        }
    };

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`p-2 border rounded-lg w-full text-sm cursor-pointer min-h-[40px] flex flex-wrap gap-1 items-center ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 bg-white hover:border-sky-500'}`}
            >
                {selectedValues.length === 0 ? (
                    <span className="text-gray-400">{placeholder}</span>
                ) : (
                    selectedValues.map(val => (
                        <span key={val} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full flex items-center">
                            {val.substring(0, 10)}...
                            <FaTimes
                                className="ml-1 cursor-pointer hover:text-red-500"
                                onClick={(e) => { e.stopPropagation(); toggleSelection(val); }}
                            />
                        </span>
                    ))
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 flex flex-col">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            className="w-full p-1 text-sm border rounded focus:outline-none focus:border-sky-500"
                            placeholder="Search IDs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-2">No IDs match.</div>
                        ) : (
                            filteredOptions.slice(0, 100).map(opt => (
                                <div
                                    key={opt}
                                    className="flex items-center text-sm p-1 hover:bg-gray-50 cursor-pointer rounded"
                                    onClick={() => toggleSelection(opt)}
                                >
                                    {selectedValues.includes(opt) ? <FaCheckSquare className="text-sky-500 mr-2" /> : <FaSquare className="text-gray-300 mr-2" />}
                                    <span className="truncate" title={opt}>{opt}</span>
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="text-xs text-center text-gray-400 py-1 border-t mt-1">Showing first 100 results...</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const FILTER_TYPES = {
    country: 'Country',
    region: 'Region',
    city: 'City',
    operatingSystem: 'Operating System',
    osVersion: 'OS Version',
    sessionSource: 'Session Source',
};

const FILTER_DEPENDENCIES = {
    country: ['region', 'city'],
    region: ['city'],
    operatingSystem: ['osVersion'],
};

const AudiencePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [startDate, setStartDate] = useState(
        new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(getTodayDateString());

    // Arrays for Multi-Select
    const [targetClientIds, setTargetClientIds] = useState([]);
    const [excludeClientIds, setExcludeClientIds] = useState([]);

    const [filters, setFilters] = useState([]);
    const [filterOptions, setFilterOptions] = useState(null);

    const buildApiParams = useCallback(() => {
        const params = { startDate, endDate };

        filters.forEach(filter => {
            if (filter.type && filter.value) {
                params[filter.type] = filter.value;
            }
        });

        if (targetClientIds.length > 0) {
            params.targetClientIds = targetClientIds.join(',');
        }
        if (excludeClientIds.length > 0) {
            params.excludeClientIds = excludeClientIds.join(',');
        }

        return params;
    }, [startDate, endDate, filters, targetClientIds, excludeClientIds]);

    const fetchDataAndOptions = useCallback(async () => {
        setLoading(true);
        setOptionsLoading(true);
        setError('');

        const params = buildApiParams();

        try {
            const [optionsResponse, dataResponse] = await Promise.all([
                getFilterOptions(params),
                getHistoricalAudienceData(params)
            ]);
            setFilterOptions(optionsResponse.data);
            setData(dataResponse.data);
        } catch (err) {
            console.error('Error fetching audience data:', err);
            setError('Failed to fetch historical audience data.');
            setData([]);
        } finally {
            setLoading(false);
            setOptionsLoading(false);
        }
    }, [buildApiParams]);

    useEffect(() => {
        const timeoutId = setTimeout(() => { fetchDataAndOptions(); }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchDataAndOptions]);

    const handleManualRefresh = async () => {
        if (!window.confirm(`Are you sure you want to completely re-sync Google Analytics data between ${startDate} and ${endDate}? This will replace historical entries for these dates. Real-time Faro data will be preserved.`)) return;

        setIsRefreshing(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await refreshGA4Data(startDate, endDate);
            setSuccessMsg(res.data.message || 'Data refreshed successfully.');
            await fetchDataAndOptions(); // Reload view
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to trigger manual GA4 sync.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const addFilter = () => setFilters(prev => [...prev, { id: Date.now(), type: '', value: '' }]);
    const removeFilter = (id) => setFilters(prev => prev.filter(f => f.id !== id));
    const updateFilter = (id, field, newValue) => {
        setFilters(prev => {
            const newFilters = [...prev];
            const filterIndex = newFilters.findIndex(f => f.id === id);
            if (filterIndex === -1) return prev;

            const oldFilter = newFilters[filterIndex];
            newFilters[filterIndex] = { ...oldFilter, [field]: newValue };

            if (field === 'type') newFilters[filterIndex].value = '';

            const dependencies = FILTER_DEPENDENCIES[oldFilter.type];
            if (field === 'value' && dependencies) {
                return newFilters.map(f => dependencies.includes(f.type) ? { ...f, value: '' } : f);
            }
            return newFilters;
        });
    };

    const columns = [
        {
            key: 'sessionDate',
            title: 'Date & Time',
            render: (item) => {
                let displayTime = item.sessionDate; // Fallback to raw string
                if (item.sessionStartTime) {
                    try {
                        const d = new Date(item.sessionStartTime);
                        if (!isNaN(d)) displayTime = d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                    } catch (e) { }
                }

                return (
                    <div className="space-y-1">
                        <p className="text-xs text-gray-800 font-semibold">
                            <FaCalendarAlt className="inline mr-1 text-sky-500" /> {displayTime}
                        </p>
                        {item.firstVisitDate && item.firstVisitDate !== item.sessionDate && (
                            <p className="text-[10px] text-green-700 font-medium tracking-tight bg-green-50 inline-block px-1 rounded" title="Historical First Visit Date">
                                <FaClock className="inline mr-1 text-green-500" /> 1st Visit: {item.firstVisitDate}
                            </p>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'location',
            title: 'Location',
            render: (item) => (
                <DetailCell icon={FaMapMarkedAlt} value={`${item.city || 'N/A'}, ${item.region || 'N/A'}, ${item.country || 'N/A'}`} label="Location" />
            )
        },
        {
            key: 'device',
            title: 'Device & OS',
            render: (item) => (
                <div className="space-y-1 text-xs">
                    <p className="text-gray-700 font-semibold"><FaMobileAlt className="inline mr-1 text-sky-500" /> {item.deviceCategory} ({item.deviceModel || 'N/A'})</p>
                    <p className="text-gray-500"><FaGlobe className="inline mr-1 text-sky-500" /> {item.operatingSystem} ({item.osVersion || 'N/A'})</p>
                    <p className="text-gray-500"><FaDesktop className="inline mr-1 text-sky-500" /> Res: {item.screenResolution || 'N/A'}</p>
                </div>
            )
        },
        {
            key: 'traffic',
            title: 'Traffic & Entry',
            render: (item) => (
                <div className="space-y-1 text-xs">
                    <p className="text-gray-700 font-semibold break-words">Source: {item.sessionSource}</p>
                    <p className="text-gray-500 truncate max-w-xs" title={item.landingPage}>Land: {item.landingPage}</p>
                </div>
            )
        },
        {
            key: 'time',
            title: 'Engagement',
            render: (item) => (
                <div className="space-y-1 text-xs">
                    <p className="text-gray-700 font-semibold"><FaClock className="inline mr-1 text-sky-500" /> {item.timeOnSiteFormatted}</p>
                    <p className="text-gray-500"><FaChartBar className="inline mr-1 text-sky-500" /> Views: {item.views}</p>
                    <p className="font-mono text-gray-500 break-all bg-gray-100 p-1 rounded mt-1 shadow-inner text-[9px]" title={item.userIdentifier}>
                        ID: {item.userIdentifier || 'N/A'}
                    </p>
                </div>
            )
        }
    ];

    const getOptionsForFilterType = (type) => {
        if (!filterOptions) return [];
        switch (type) {
            case 'country': return filterOptions.countries || [];
            case 'region': return filterOptions.regions || [];
            case 'city': return filterOptions.cities || [];
            case 'operatingSystem': return filterOptions.operatingSystems || [];
            case 'osVersion': return filterOptions.osVersions || [];
            case 'sessionSource': return filterOptions.sessionSources || [];
            default: return [];
        }
    };

    return (
        <div className="container mx-auto p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Audience Intelligence</h1>
                    <p className="text-gray-600 mt-1">Real-time Faro telemetry combined with historical GA4 records.</p>
                </div>
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || loading}
                    className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg shadow transition"
                >
                    <FaSyncAlt className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Syncing GA4...' : 'Refresh GA4 Data'}
                </button>
            </div>

            {successMsg && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 border-l-4 border-green-500 flex items-center rounded">
                    <FaCheckCircle className="mr-2" /> {successMsg}
                </div>
            )}

            {/* --- DATE FILTER ROW --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border-t-4 border-gray-800">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex-shrink-0">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading || optionsLoading || isRefreshing}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex-shrink-0">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading || optionsLoading || isRefreshing}
                    />
                </div>
                <div className="text-sm text-gray-500 flex-grow text-right font-medium">
                    {(loading || optionsLoading) && <FaRedo className="inline mr-2 animate-spin text-sky-500" />}
                    {loading ? 'Evaluating...' : ''}
                </div>
            </div>

            {/* --- MULTI-SELECT USER ID FILTERS --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 border-l-4 border-sky-500">
                <div className="flex-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaCrosshairs className="mr-2 text-sky-500" /> Target Specific Users
                    </label>
                    <MultiSelectDropdown
                        options={filterOptions?.clientIds || []}
                        selectedValues={targetClientIds}
                        onChange={setTargetClientIds}
                        placeholder="Select users to include..."
                        disabled={loading || optionsLoading}
                    />
                    <p className="text-xs text-gray-400 mt-1">Isolate tracking to these specific IDs.</p>
                </div>
                <div className="flex-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaEyeSlash className="mr-2 text-red-400" /> Hide Users
                    </label>
                    <MultiSelectDropdown
                        options={filterOptions?.clientIds || []}
                        selectedValues={excludeClientIds}
                        onChange={setExcludeClientIds}
                        placeholder="Select users to exclude..."
                        disabled={loading || optionsLoading}
                    />
                    <p className="text-xs text-gray-400 mt-1">Filter out internal or test traffic.</p>
                </div>
            </div>

            {/* --- DYNAMIC MULTI-LEVEL FILTER ROW --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-3">
                <label className="text-sm font-semibold text-gray-700 border-b pb-2 block">Dimension Filters</label>
                {filters.length === 0 && (
                    <p className="text-sm text-gray-500">No dimension filters applied. Click "Add Filter" to refine by OS, City, etc.</p>
                )}

                {filters.map((filter) => (
                    <div key={filter.id} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                        <select
                            aria-label="Filter type"
                            value={filter.type}
                            onChange={(e) => updateFilter(filter.id, 'type', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3 text-sm focus:ring-sky-500 focus:border-sky-500"
                            disabled={loading || optionsLoading}
                        >
                            <option value="">-- Select Filter Type --</option>
                            {Object.entries(FILTER_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter value"
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg w-full md:w-2/3 text-sm focus:ring-sky-500 focus:border-sky-500"
                            disabled={!filter.type || loading || optionsLoading}
                        >
                            <option value="">-- Select Value --</option>
                            {getOptionsForFilterType(filter.type).map(option => (
                                <option key={option} value={option}>
                                    {option || '(Not Set)'}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => removeFilter(filter.id)}
                            className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            title="Remove filter"
                            disabled={loading || optionsLoading}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addFilter}
                    disabled={loading || optionsLoading}
                    className="flex items-center px-4 py-2 text-sm rounded-lg transition duration-300 bg-sky-600 text-white hover:bg-sky-700 disabled:bg-gray-300 mt-2"
                >
                    <FaPlus className="mr-2" />
                    Add Filter
                </button>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                {error && (
                    <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500 flex items-center">
                        <FaExclamationTriangle className="mr-3 flex-shrink-0 text-xl" />
                        <div>
                            <p className="font-semibold">{error}</p>
                            <p className="text-sm">Check the network tab or retry the fetch operation.</p>
                        </div>
                    </div>
                )}

                {loading && data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FaRedo className="mx-auto text-4xl mb-3 animate-spin text-sky-500" />
                        <p className="font-medium text-lg">Crunching telemetry data...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        {col.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-sky-50/40 transition-colors">
                                        {columns.map(col => (
                                            <td key={col.key} className="px-6 py-4 whitespace-nowrap align-top">
                                                {col.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                !error && !loading && (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-500">
                                            <FaChartBar className="mx-auto text-5xl mb-4 text-gray-300" />
                                            <p className="text-xl font-semibold text-gray-700">No visitor data found.</p>
                                            <p className="text-sm mt-2">Adjust the date range, triggers, or hit 'Refresh GA4 Data'.</p>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AudiencePage;