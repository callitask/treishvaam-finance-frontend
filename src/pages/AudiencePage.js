/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Render the Historical Audience Analytics Dashboard.
 *
 * Change Intent:
 * - Implemented client-side memory-safe Data Grouping via `useMemo` to analyze multi-session paths.
 * - Unhid First Visit Date logic to guarantee persistent visibility on all rows.
 * - Added inline `Target Isolate` action inside the data table to instantly drill down into a specific user.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Implemented native `Asia/Kolkata` datetime configurations for absolute IST precision.
 * • Upgraded User ID filters into an inline Type-Ahead combobox design.
 * - EDITED (LATEST):
 * • Implemented memory-safe `useMemo` table grouping for User ID isolation.
 * • Removed conditional hiding of `First Visit Date`.
 * • Added inline `<FaCrosshairs />` isolate action directly to the engagement cell.
 * - EDITED (Incident 41 - Zero-Trust Device Clustering):
 * • Refactored `useMemo` tableData generation to group by `deviceFingerprint` mapping natively to the new `GroupedAudienceDataDto`.
 * • Replaced the `isGroupedView` boolean toggle with a native parent-child rendering approach supporting dynamic multi-session device cards.
 * • Added `Re-Align Historical Data` button to trigger the ZKP-gated Data Healer endpoint.
 * • Date: 2026-08-05
 * - EDITED (Incident 48/49 - Legacy Hardware Isolation):
 * • Updated UI rendering to safely isolate and label legacy un-hashed visitors, preventing grouping collapse.
 */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getGroupedAudienceData, getFilterOptions, refreshGA4Data, healHistoricalAnalytics } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaMobileAlt, FaDesktop, FaClock, FaRedo,
    FaExclamationTriangle, FaChartBar, FaGlobe, FaPlus, FaTimes, FaEyeSlash,
    FaCrosshairs, FaCheckSquare, FaSquare, FaSyncAlt, FaCheckCircle, FaLayerGroup,
    FaChevronDown, FaChevronRight, FaDatabase, FaShieldAlt
} from 'react-icons/fa';

const DetailCell = ({ icon: Icon, value, label }) => (
    <div className="flex items-center text-sm text-gray-700">
        <Icon className="text-sky-500 mr-2 flex-shrink-0" title={label} />
        <span className="truncate" title={value || 'N/A'}>
            {value || 'N/A'}
        </span>
    </div>
);

// Advanced Type-Ahead Combobox for robust User ID searching
const TypeAheadDropdown = ({ options, selectedValues, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

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
            setSearchTerm(''); // Clear text on selection
        }
    };

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative" ref={dropdownRef}>
            <div className={`p-1.5 border rounded-lg w-full text-sm min-h-[40px] flex flex-wrap gap-1 items-center ${disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 bg-white hover:border-sky-500'}`}>
                {selectedValues.map(val => (
                    <span key={val} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-md flex items-center border border-sky-200">
                        {val.substring(0, 10)}...
                        <FaTimes
                            className="ml-1.5 cursor-pointer text-sky-500 hover:text-red-500 transition-colors"
                            onClick={(e) => { e.stopPropagation(); toggleSelection(val); }}
                        />
                    </span>
                ))}
                <input
                    type="text"
                    disabled={disabled}
                    className="flex-grow outline-none bg-transparent min-w-[120px] text-sm p-1 placeholder-gray-400"
                    placeholder={selectedValues.length === 0 ? placeholder : 'Type to add more...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 flex flex-col">
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-2">No matching IDs found.</div>
                        ) : (
                            filteredOptions.slice(0, 100).map(opt => (
                                <div
                                    key={opt}
                                    className="flex items-center text-sm p-1.5 hover:bg-sky-50 cursor-pointer rounded transition-colors"
                                    onClick={() => toggleSelection(opt)}
                                >
                                    {selectedValues.includes(opt) ? <FaCheckSquare className="text-sky-500 mr-2" /> : <FaSquare className="text-gray-300 mr-2" />}
                                    <span className="truncate font-mono" title={opt}>{opt}</span>
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="text-xs text-center text-gray-400 py-1.5 border-t mt-1 bg-gray-50 rounded-b">Showing top 100 recommendations. Keep typing to filter.</div>
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

// Explicit IST Time formatter
const formatIST = (isoString) => {
    try {
        const d = new Date(isoString);
        if (isNaN(d)) return null;
        return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' (IST)';
    } catch (e) {
        return null;
    }
};

const AudiencePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isHealing, setIsHealing] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [startDate, setStartDate] = useState(
        new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(getTodayDateString());

    const [targetClientIds, setTargetClientIds] = useState([]);
    const [excludeClientIds, setExcludeClientIds] = useState([]);

    const [filters, setFilters] = useState([]);
    const [filterOptions, setFilterOptions] = useState(null);

    // Grouping State (Accordions)
    const [expandedGroups, setExpandedGroups] = useState({});

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
                getGroupedAudienceData(params) // Hit the new Grouped API endpoint
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

    const handleZkpDataHealer = async () => {
        const proof = window.prompt("AEGIS Zero-Knowledge Proof Required:\nPlease enter your admin ZKP token to trigger a background data reconciliation.");
        if (!proof) return;

        setIsHealing(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await healHistoricalAnalytics(proof);
            setSuccessMsg(res.data.message || 'Historical data healing initiated.');
            // We do not await fetchDataAndOptions here because healing is an async backend process
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to authenticate ZKP or trigger healer.');
        } finally {
            setIsHealing(false);
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

    const toggleGroup = (fingerprintId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [fingerprintId]: !prev[fingerprintId]
        }));
    };

    const expandAllGroups = () => {
        const newExpanded = {};
        data.forEach(group => { newExpanded[group.fingerprintId] = true; });
        setExpandedGroups(newExpanded);
    };

    const collapseAllGroups = () => {
        setExpandedGroups({});
    };

    return (
        <div className="container mx-auto p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Audience Intelligence</h1>
                    <p className="text-gray-600 mt-1">Zero-Trust grouped telemetry with historic YAUAA analysis.</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                        onClick={handleZkpDataHealer}
                        disabled={isHealing || loading}
                        className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg shadow transition"
                        title="Retroactively reprocess legacy telemetry via YAUAA and BouncyCastle SHA3-256."
                    >
                        {isHealing ? <FaSyncAlt className="mr-2 animate-spin" /> : <FaShieldAlt className="mr-2" />}
                        Re-Align Historical Data
                    </button>
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing || loading}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg shadow transition"
                    >
                        <FaDatabase className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh GA4 Data
                    </button>
                </div>
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
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 border-l-4 border-sky-500">
                <div className="flex-1 w-full">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaCrosshairs className="mr-2 text-sky-500" /> Target Specific Users
                    </label>
                    <TypeAheadDropdown
                        options={filterOptions?.clientIds || []}
                        selectedValues={targetClientIds}
                        onChange={setTargetClientIds}
                        placeholder="Type to search & include IDs..."
                        disabled={loading || optionsLoading}
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                        <FaEyeSlash className="mr-2 text-red-400" /> Hide Users
                    </label>
                    <TypeAheadDropdown
                        options={filterOptions?.clientIds || []}
                        selectedValues={excludeClientIds}
                        onChange={setExcludeClientIds}
                        placeholder="Type to search & exclude IDs..."
                        disabled={loading || optionsLoading}
                    />
                </div>
                <div className="flex items-center space-x-3 lg:ml-auto w-full lg:w-auto mt-4 lg:mt-0">
                    <button onClick={expandAllGroups} className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-2 py-1 bg-sky-50 rounded">Expand All</button>
                    <button onClick={collapseAllGroups} className="text-xs text-gray-600 hover:text-gray-800 font-semibold px-2 py-1 bg-gray-100 rounded">Collapse All</button>
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
                    <div className="min-w-full divide-y divide-gray-200">
                        {/* Header */}
                        <div className="bg-gray-50 grid grid-cols-4 px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            <div>Date & Time</div>
                            <div>Device & Hardware</div>
                            <div>Traffic & Entry</div>
                            <div>Engagement & Location</div>
                        </div>

                        {/* Body */}
                        <div className="bg-white divide-y divide-gray-100">
                            {data.length > 0 ? (
                                data.map((deviceGroup) => {
                                    const isExpanded = expandedGroups[deviceGroup.fingerprintId];
                                    return (
                                        <div key={deviceGroup.fingerprintId} className="flex flex-col">
                                            {/* Parent Row (Device Node) */}
                                            <div
                                                className="grid grid-cols-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-sky-400"
                                                onClick={() => toggleGroup(deviceGroup.fingerprintId)}
                                            >
                                                <div className="flex items-center">
                                                    {isExpanded ? <FaChevronDown className="text-sky-500 mr-3" /> : <FaChevronRight className="text-gray-400 mr-3" />}
                                                    <div>
                                                        <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                                                            {deviceGroup.totalGroupedSessions} Sessions
                                                        </span>
                                                        <div className="text-sm font-semibold text-gray-900 mt-0.5">
                                                            Last: {formatIST(deviceGroup.lastSeen) || deviceGroup.lastSeen}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-sm">
                                                    <p className="text-gray-900 font-bold">
                                                        <FaMobileAlt className="inline mr-1 text-gray-400" />
                                                        {deviceGroup.deviceBrand || (deviceGroup.fingerprintId.startsWith('legacy-') ? 'Legacy' : 'Unknown')} {deviceGroup.deviceModel || (deviceGroup.fingerprintId.startsWith('legacy-') ? 'Visitor' : 'Device')}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        <FaGlobe className="inline mr-1 text-gray-400" /> {deviceGroup.operatingSystem} {deviceGroup.osVersion}
                                                    </p>
                                                    <p className="text-xs font-mono text-gray-400 truncate w-48" title={deviceGroup.fingerprintId}>
                                                        {deviceGroup.fingerprintId.startsWith('legacy-')
                                                            ? 'Legacy Visitor (Un-Hashed)'
                                                            : `Hash: ${deviceGroup.fingerprintId}`}
                                                    </p>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="italic">Multiple Entry Points...</span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className="italic">Aggregated Locations...</span>
                                                </div>
                                            </div>

                                            {/* Child Rows (Individual Sessions) */}
                                            {isExpanded && (
                                                <div className="bg-slate-50 border-t border-gray-100">
                                                    {deviceGroup.sessions.map((session, sIdx) => (
                                                        <div key={session.rawSessionId || sIdx} className="grid grid-cols-4 px-6 py-3 border-b border-gray-100 last:border-b-0 pl-14 hover:bg-white transition-colors">

                                                            {/* Child Date */}
                                                            <div className="space-y-1 relative">
                                                                <div className="absolute -left-6 top-2 w-4 h-px bg-gray-300"></div>
                                                                <div className="absolute -left-6 -top-3 w-px h-5 bg-gray-300"></div>
                                                                <p className="text-xs text-gray-800">
                                                                    <FaCalendarAlt className="inline mr-1 text-gray-400" /> {formatIST(session.sessionStartTime) || session.sessionDate}
                                                                </p>
                                                                {session.firstVisitDate && (
                                                                    <p className="text-[10px] text-green-700 font-medium tracking-tight bg-green-50 px-1.5 py-0.5 rounded inline-flex items-center mt-0.5" title="Historical First Visit Date">
                                                                        <FaClock className="mr-1 text-green-500" /> 1st Visit: {session.firstVisitDate}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Child Device overrides (usually match parent, but kept for legacy tracking) */}
                                                            <div className="space-y-0.5 text-xs text-gray-500">
                                                                <p>Class: {session.deviceClass || 'N/A'}</p>
                                                                <p>Res: {session.screenResolution || 'N/A'}</p>
                                                            </div>

                                                            {/* Child Traffic */}
                                                            <div className="space-y-1 text-xs">
                                                                <p className="text-gray-700 font-semibold break-words">Src: {session.sessionSource}</p>
                                                                <p className="text-gray-500 truncate pr-4" title={session.landingPage}>Land: {session.landingPage}</p>
                                                            </div>

                                                            {/* Child Engagement & Location */}
                                                            <div className="space-y-1 text-xs">
                                                                <div className="flex justify-between items-center pr-4">
                                                                    <span className="font-semibold text-gray-700"><FaClock className="inline mr-1 text-gray-400" /> {session.timeOnSiteFormatted}</span>
                                                                    <span className="text-gray-500"><FaChartBar className="inline mr-1 text-gray-400" /> Views: {session.views}</span>
                                                                </div>
                                                                <DetailCell icon={FaMapMarkedAlt} value={`${session.city || 'N/A'}, ${session.region || 'N/A'}, ${session.country || 'N/A'}`} label="Location" />
                                                                <div className="flex items-center justify-between font-mono text-gray-400 bg-gray-100/50 p-1 rounded border border-gray-200 text-[9px] mt-1 pr-1" title={session.userIdentifier}>
                                                                    <span>ID: <span className="font-semibold text-gray-500">{session.userIdentifier || 'N/A'}</span></span>
                                                                    {session.userIdentifier && session.userIdentifier !== 'Not available (GA4)' && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (!targetClientIds.includes(session.userIdentifier)) {
                                                                                    setTargetClientIds([...targetClientIds, session.userIdentifier]);
                                                                                }
                                                                            }}
                                                                            className="ml-2 text-sky-500 hover:text-sky-700 focus:outline-none transition-transform hover:scale-110"
                                                                            title="Isolate this exact session ID"
                                                                        >
                                                                            <FaCrosshairs size={11} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                !error && !loading && (
                                    <div className="px-6 py-16 text-center text-gray-500">
                                        <FaChartBar className="mx-auto text-5xl mb-4 text-gray-300" />
                                        <p className="text-xl font-semibold text-gray-700">No visitor data found.</p>
                                        <p className="text-sm mt-2">Adjust the date range, triggers, or hit 'Refresh GA4 Data'.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudiencePage;