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
 * Critical Dependencies:
 * - Backend: AnalyticsController (/api/v1/analytics and /api/v1/analytics/filters).
 * - Component: standard Tailwind UI formatting.
 *
 * Security Constraints:
 * - Must pass exclude parameters as clean, comma-separated strings to be processed by Spring Boot safely.
 *
 * Non-Negotiables:
 * - User ID filters must be standard text inputs, not dropdowns, to prevent browser memory crashes from attempting to render 100k+ unique visitor IDs in a select element.
 * - Must strictly adhere to ESLint rules (no unused imports) as process.env.CI = true enforces warnings as errors on Cloudflare Pages.
 *
 * Change Intent:
 * - Remove unused `FaUser` import to unblock the CI/CD deployment pipeline.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Added `targetClientId` and `excludeClientIds` manual text filters to allow targeted debugging and internal traffic hiding.
 * • Updated the 'Date' column to parse and display precise `sessionStartTime` (LocalDateTime) and `firstVisitDate` (LocalDate).
 * • Exposed full `userIdentifier` (non-truncated) to make copy-pasting easier for the exclude filter.
 * - EDITED (LATEST):
 * • Removed unused `FaUser` import from `react-icons/fa` to fix strict CI build failure.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { getHistoricalAudienceData, getFilterOptions } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaMobileAlt, FaDesktop, FaClock, FaRedo,
    FaExclamationTriangle, FaChartBar, FaGlobe, FaPlus, FaTimes, FaEyeSlash, FaCrosshairs
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

// Function to format today's date in YYYY-MM-DD format
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// Define the available filter types and their user-friendly labels (Excluding massive unique fields like ID)
const FILTER_TYPES = {
    country: 'Country',
    region: 'Region',
    city: 'City',
    operatingSystem: 'Operating System',
    osVersion: 'OS Version',
    sessionSource: 'Session Source',
};

// Define dependencies for cascading resets
const FILTER_DEPENDENCIES = {
    country: ['region', 'city'],
    region: ['city'],
    operatingSystem: ['osVersion'],
};

const AudiencePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- FILTER STATE ---
    const [startDate, setStartDate] = useState(
        new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(getTodayDateString());

    // Explicit User ID Filters
    const [targetClientId, setTargetClientId] = useState('');
    const [excludeClientIds, setExcludeClientIds] = useState('');

    // Dynamic dropdown filters
    const [filters, setFilters] = useState([]);
    const [filterOptions, setFilterOptions] = useState(null);

    // Helper to convert all filters into a flat params object for the API
    const buildApiParams = useCallback(() => {
        const params = {
            startDate,
            endDate,
        };

        // Add dynamic dropdown filters
        filters.forEach(filter => {
            if (filter.type && filter.value) {
                params[filter.type] = filter.value;
            }
        });

        // Add User Identity filters
        if (targetClientId.trim()) {
            params.clientId = targetClientId.trim();
        }

        if (excludeClientIds.trim()) {
            // Split by comma, trim whitespace, remove empty strings, and join back
            params.excludeClientIds = excludeClientIds
                .split(',')
                .map(id => id.trim())
                .filter(Boolean)
                .join(',');
        }

        return params;
    }, [startDate, endDate, filters, targetClientId, excludeClientIds]);


    // Main data fetching logic
    useEffect(() => {
        const fetchDataAndOptions = async () => {
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
                console.error('Error fetching audience data or options:', err);
                if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                    setError('Access Denied. You do not have permission to view this data.');
                } else {
                    setError('Failed to fetch historical audience data. Check backend logs and GA4 setup.');
                }
                setData([]);
                setFilterOptions(null);
            } finally {
                setLoading(false);
                setOptionsLoading(false);
            }
        };

        // Debounce slightly to prevent spamming the backend when typing comma-separated IDs
        const timeoutId = setTimeout(() => {
            fetchDataAndOptions();
        }, 500);

        return () => clearTimeout(timeoutId);

    }, [buildApiParams]);


    // --- FILTER ROW MANAGEMENT ---

    const addFilter = () => {
        setFilters(prevFilters => [
            ...prevFilters,
            { id: Date.now(), type: '', value: '' }
        ]);
    };

    const removeFilter = (id) => {
        setFilters(prevFilters => prevFilters.filter(f => f.id !== id));
    };

    const updateFilter = (id, field, newValue) => {
        setFilters(prevFilters => {
            const newFilters = [...prevFilters];
            const filterIndex = newFilters.findIndex(f => f.id === id);
            if (filterIndex === -1) return prevFilters;

            const oldFilter = newFilters[filterIndex];
            newFilters[filterIndex] = { ...oldFilter, [field]: newValue };

            // CASCADING RESET LOGIC
            if (field === 'type') {
                newFilters[filterIndex].value = '';
            }

            const dependencies = FILTER_DEPENDENCIES[oldFilter.type];
            if (field === 'value' && dependencies) {
                return newFilters.map(f => {
                    if (dependencies.includes(f.type)) {
                        return { ...f, value: '' };
                    }
                    return f;
                });
            }

            return newFilters;
        });
    };

    const columns = [
        {
            key: 'sessionDate',
            title: 'Date & Time',
            render: (item) => (
                <div className="space-y-1">
                    <p className="text-xs text-gray-800 font-semibold" title={`Stored Exact Time: ${item.sessionStartTime || 'N/A'}`}>
                        <FaCalendarAlt className="inline mr-1 text-sky-500" />
                        {item.sessionStartTime
                            ? new Date(item.sessionStartTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                            : item.sessionDate}
                    </p>
                    {item.firstVisitDate && (
                        <p className="text-xs text-green-700 font-medium" title="Global First Visit Date for this User ID">
                            <FaClock className="inline mr-1 text-green-500" /> 1st Visit: {item.firstVisitDate}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'location',
            title: 'Location (City, Region, Country)',
            render: (item) => (
                <DetailCell
                    icon={FaMapMarkedAlt}
                    value={`${item.city || 'N/A'}, ${item.region || 'N/A'}, ${item.country || 'N/A'}`}
                    label="Location"
                />
            )
        },
        {
            key: 'device',
            title: 'Device & OS',
            render: (item) => (
                <div className="space-y-1">
                    <p className="text-xs text-gray-700 font-semibold">
                        <FaMobileAlt className="inline mr-1 text-sky-500" /> {item.deviceCategory} ({item.deviceModel || 'N/A'})
                    </p>
                    <p className="text-xs text-gray-500">
                        <FaGlobe className="inline mr-1 text-sky-500" /> {item.operatingSystem} ({item.osVersion || 'N/A'})
                    </p>
                    <p className="text-xs text-gray-500">
                        <FaDesktop className="inline mr-1 text-sky-500" /> Resolution: {item.screenResolution || 'N/A'}
                    </p>
                </div>
            )
        },
        {
            key: 'traffic',
            title: 'Source & Landing Page',
            render: (item) => (
                <div className="space-y-1">
                    <p className="text-xs text-gray-700 font-semibold">Source: {item.sessionSource}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs" title={item.landingPage}>Landing: {item.landingPage}</p>
                </div>
            )
        },
        {
            key: 'time',
            title: 'Time & Views',
            render: (item) => (
                <div className="space-y-1">
                    <p className="text-xs text-gray-700 font-semibold">
                        <FaClock className="inline mr-1 text-sky-500" /> {item.timeOnSiteFormatted}
                    </p>
                    <p className="text-xs text-gray-500">
                        <FaChartBar className="inline mr-1 text-sky-500" /> Sessions: {item.views}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 break-all bg-gray-100 p-1 rounded mt-1" title={item.userIdentifier}>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Historical Audience Report</h1>
            <p className="text-gray-600 mb-6">Detailed visitor logs stored in the database. Data is synchronized daily from Google Analytics (GA4) and enriched via Edge Telemetry.</p>

            {/* --- DATE FILTER ROW --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex-shrink-0">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading || optionsLoading}
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
                        disabled={loading || optionsLoading}
                    />
                </div>
                <div className="text-sm text-gray-500 flex-grow text-right font-medium">
                    {(loading || optionsLoading) && <FaRedo className="inline mr-2 animate-spin text-sky-500" />}
                    {loading ? 'Fetching report data...' : ''}
                    {optionsLoading && !loading ? 'Updating options...' : ''}
                </div>
            </div>

            {/* --- EXPLICIT USER ID FILTERS --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 border-l-4 border-sky-500">
                <div className="flex-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaCrosshairs className="mr-2 text-sky-500" /> Target Specific User ID
                    </label>
                    <input
                        type="text"
                        value={targetClientId}
                        onChange={(e) => setTargetClientId(e.target.value)}
                        placeholder="e.g., r4u0xpo6..."
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-sky-500 focus:border-sky-500"
                        disabled={loading || optionsLoading}
                    />
                    <p className="text-xs text-gray-400 mt-1">Show ONLY data for this explicit User ID.</p>
                </div>
                <div className="flex-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaEyeSlash className="mr-2 text-red-400" /> Hide User IDs
                    </label>
                    <input
                        type="text"
                        value={excludeClientIds}
                        onChange={(e) => setExcludeClientIds(e.target.value)}
                        placeholder="e.g., callitas..., jnSu6j2F..."
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-red-400 focus:border-red-400"
                        disabled={loading || optionsLoading}
                    />
                    <p className="text-xs text-gray-400 mt-1">Exclude internal or test traffic (Comma separated).</p>
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
                            <p className="text-sm">Please check the date range and ensure the scheduled job is running successfully to import new data.</p>
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
                                    <th
                                        key={col.key}
                                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                    >
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
                                            <p className="text-sm mt-2">Adjust the date range or remove strict User ID exclusions.</p>
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