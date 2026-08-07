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
 * - EDITED (Incident 66 - ReferenceError Fix):
 * • Injected getOptionsForFilterType helper function safely mapping it from the filterOptions state.
 * • Why: Resolved a fatal React white-screen crash triggered by invoking an undefined function in the dynamic filter row.
 * - EDITED (Phase 7 - UI Redesign & Data Hierarchy):
 * • Implemented Cloudflare-style monochromatic layout: simplified structural boundaries and removed visual noise (excessive borders, sky-500 overload).
 * • Added dynamic `KPISummaryBar` to calculate and surface Top Level metrics (Total Visitors, Sessions, Top Entry Point).
 * • Restructured multi-tier tables into minimalist parent-child accordions with clean gray-50/white separation.
 * - EDITED (Incident 75 - Build Failure Fix):
 * • Restored missing closing `</div>` tag inside the JSX ternary operator for the data table wrapper, curing SWC compiler syntax error.
 */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getGroupedAudienceData, getFilterOptions, refreshGA4Data, healHistoricalAnalytics } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaRedo, FaExclamationTriangle,
    FaPlus, FaTimes, FaEyeSlash, FaCrosshairs, FaCheckSquare,
    FaSquare, FaSyncAlt, FaCheckCircle, FaChevronDown, FaChevronRight,
    FaDatabase, FaShieldAlt, FaCog, FaChartBar, FaMobileAlt, FaGlobe, FaClock
} from 'react-icons/fa';

const DetailCell = ({ icon: Icon, value, label }) => (
    <div className="flex items-center text-sm text-gray-700">
        <Icon className="text-blue-500 mr-2 flex-shrink-0" title={label} />
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
            <div className={`p-1.5 border rounded-lg w-full text-sm min-h-[40px] flex flex-wrap gap-1 items-center ${disabled ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'border-slate-300 bg-white hover:border-blue-600 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all'}`}>
                {selectedValues.map(val => (
                    <span key={val} className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded flex items-center border border-slate-200">
                        {val.substring(0, 10)}...
                        <FaTimes
                            className="ml-1.5 cursor-pointer text-slate-400 hover:text-slate-800 transition-colors"
                            onClick={(e) => { e.stopPropagation(); toggleSelection(val); }}
                        />
                    </span>
                ))}
                <input
                    type="text"
                    disabled={disabled}
                    className="flex-grow outline-none bg-transparent min-w-[120px] text-sm p-1 placeholder-slate-400 text-slate-800"
                    placeholder={selectedValues.length === 0 ? placeholder : 'Type to add more...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col">
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center text-sm text-slate-500 py-2">No matching IDs found.</div>
                        ) : (
                            filteredOptions.slice(0, 100).map(opt => (
                                <div
                                    key={opt}
                                    className="flex items-center text-sm p-1.5 hover:bg-slate-50 cursor-pointer rounded transition-colors text-slate-800"
                                    onClick={() => toggleSelection(opt)}
                                >
                                    {selectedValues.includes(opt) ? <FaCheckSquare className="text-blue-600 mr-2" /> : <FaSquare className="text-slate-300 mr-2" />}
                                    <span className="truncate font-mono" title={opt}>{opt}</span>
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="text-xs text-center text-slate-400 py-1.5 border-t mt-1 bg-slate-50 rounded-b">Showing top 100 recommendations. Keep typing to filter.</div>
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
        return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
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

    // Filter Panel toggle state
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    // Grouping State (Accordions)
    const [expandedGroups, setExpandedGroups] = useState({});

    // Admin Tools dropdown
    const [showAdminMenu, setShowAdminMenu] = useState(false);

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
        setShowAdminMenu(false);

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
        setShowAdminMenu(false);

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

    const getOptionsForFilterType = (type) => {
        if (!filterOptions) return [];
        return filterOptions[type] || [];
    };

    // Calculate Dynamic KPIs
    const kpiMetrics = useMemo(() => {
        if (!data || data.length === 0) return { visitors: 0, sessions: 0, topLanding: 'N/A' };

        let totalSessions = 0;
        const landingCounts = {};

        data.forEach(group => {
            totalSessions += group.totalGroupedSessions || 0;
            if (group.sessions && Array.isArray(group.sessions)) {
                group.sessions.forEach(s => {
                    if (s.landingPage) {
                        landingCounts[s.landingPage] = (landingCounts[s.landingPage] || 0) + 1;
                    }
                });
            }
        });

        // Find the most frequent landing page
        const topLanding = Object.entries(landingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
            visitors: data.length,
            sessions: totalSessions,
            topLanding: topLanding.length > 25 ? topLanding.substring(0, 25) + '...' : topLanding
        };
    }, [data]);

    return (
        <div className="container mx-auto p-4 md:p-8 bg-white min-h-screen font-sans text-slate-900">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audience Intelligence</h1>

                    {/* Inline Date Picker */}
                    <div className="flex items-center space-x-2 text-sm">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-600 text-slate-600 font-medium pb-1"
                            disabled={loading || optionsLoading || isRefreshing}
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-600 text-slate-600 font-medium pb-1"
                            disabled={loading || optionsLoading || isRefreshing}
                        />
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-4 relative">
                    {(loading || optionsLoading) && <FaRedo className="animate-spin text-blue-600" />}

                    <button
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        className="text-slate-500 hover:text-slate-800 p-2 rounded transition-colors"
                        title="Advanced Admin Actions"
                    >
                        <FaCog size={18} />
                    </button>

                    {showAdminMenu && (
                        <div className="absolute top-10 right-0 z-50 w-56 bg-white border border-slate-200 rounded-lg shadow-lg flex flex-col overflow-hidden">
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing || loading}
                                className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-400 text-left border-b border-slate-100"
                            >
                                <FaDatabase className="mr-3 text-slate-400" />
                                Refresh GA4 Data
                            </button>
                            <button
                                onClick={handleZkpDataHealer}
                                disabled={isHealing || loading}
                                className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-50 disabled:text-slate-400 text-left font-medium"
                            >
                                <FaShieldAlt className="mr-3 text-amber-500" />
                                Re-Align Historical Data
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {successMsg && (
                <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center rounded text-sm font-medium">
                    <FaCheckCircle className="mr-2 text-emerald-500" /> {successMsg}
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Visitors</div>
                    <div className="text-3xl font-bold text-slate-900">{kpiMetrics.visitors.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Sessions</div>
                    <div className="text-3xl font-bold text-slate-900">{kpiMetrics.sessions.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Entry Point</div>
                    <div className="text-xl font-bold text-slate-900 truncate mt-2">{kpiMetrics.topLanding}</div>
                </div>
            </div>

            {/* Streamlined Filter Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl mb-6">
                <div
                    className="flex justify-between items-center px-5 py-3 cursor-pointer hover:bg-slate-100 transition-colors rounded-xl"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                    <div className="flex items-center text-sm font-semibold text-slate-700">
                        <FaChartBar className="mr-2 text-blue-600" />
                        Audience Filters
                        {((targetClientIds.length + excludeClientIds.length + filters.length) > 0) && (
                            <span className="ml-3 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">
                                {targetClientIds.length + excludeClientIds.length + filters.length} Active
                            </span>
                        )}
                    </div>
                    {isFilterExpanded ? <FaChevronDown className="text-slate-400" /> : <FaChevronRight className="text-slate-400" />}
                </div>

                {isFilterExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-200 space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                                    <FaCrosshairs className="mr-1.5 text-slate-400" /> Include Users
                                </label>
                                <TypeAheadDropdown
                                    options={filterOptions?.clientIds || []}
                                    selectedValues={targetClientIds}
                                    onChange={setTargetClientIds}
                                    placeholder="Search specific IDs..."
                                    disabled={loading || optionsLoading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                                    <FaEyeSlash className="mr-1.5 text-slate-400" /> Exclude Users
                                </label>
                                <TypeAheadDropdown
                                    options={filterOptions?.clientIds || []}
                                    selectedValues={excludeClientIds}
                                    onChange={setExcludeClientIds}
                                    placeholder="Search IDs to exclude..."
                                    disabled={loading || optionsLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dimension Constraints</label>
                                <button
                                    onClick={addFilter}
                                    disabled={loading || optionsLoading}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition flex items-center"
                                >
                                    <FaPlus className="mr-1" /> Add Rule
                                </button>
                            </div>

                            {filters.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No dimension constraints applied.</p>
                            ) : (
                                <div className="space-y-2">
                                    {filters.map((filter) => (
                                        <div key={filter.id} className="flex items-center space-x-2">
                                            <select
                                                value={filter.type}
                                                onChange={(e) => updateFilter(filter.id, 'type', e.target.value)}
                                                className="p-1.5 border border-slate-300 rounded text-sm bg-white focus:border-blue-600 focus:ring-0 text-slate-700 w-1/3"
                                                disabled={loading || optionsLoading}
                                            >
                                                <option value="">-- Field --</option>
                                                {Object.entries(FILTER_TYPES).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={filter.value}
                                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                                className="p-1.5 border border-slate-300 rounded text-sm bg-white focus:border-blue-600 focus:ring-0 text-slate-700 w-full"
                                                disabled={!filter.type || loading || optionsLoading}
                                            >
                                                <option value="">-- Value --</option>
                                                {getOptionsForFilterType(filter.type).map(option => (
                                                    <option key={option} value={option}>
                                                        {option || '(Not Set)'}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => removeFilter(filter.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 transition"
                                                title="Remove filter"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* DATA TABLE */}
            <div>
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 flex items-start rounded-lg">
                        <FaExclamationTriangle className="mr-3 mt-0.5 flex-shrink-0 text-lg text-red-500" />
                        <div>
                            <p className="font-semibold text-sm">{error}</p>
                            <p className="text-xs mt-1 opacity-80">Check network diagnostics or adjust filter boundaries.</p>
                        </div>
                    </div>
                )}

                {loading && data.length === 0 ? (
                    <div className="py-20 text-center">
                        <FaRedo className="mx-auto text-3xl mb-4 animate-spin text-slate-300" />
                        <p className="font-medium text-sm text-slate-500 tracking-wide">Compiling Telemetry Matrix...</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {/* Table Actions Header */}
                        <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-end">
                            <div className="flex space-x-4 text-xs font-medium">
                                <button onClick={expandAllGroups} className="text-slate-500 hover:text-blue-600 transition-colors">Expand All</button>
                                <span className="text-slate-300">|</span>
                                <button onClick={collapseAllGroups} className="text-slate-500 hover:text-slate-800 transition-colors">Collapse All</button>
                            </div>
                        </div>

                        {data.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {data.map((deviceGroup) => {
                                    const isExpanded = expandedGroups[deviceGroup.fingerprintId];
                                    return (
                                        <div key={deviceGroup.fingerprintId} className="flex flex-col">
                                            {/* Parent Row (Device Group) */}
                                            <div
                                                className="grid grid-cols-1 lg:grid-cols-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors items-center gap-4 lg:gap-0"
                                                onClick={() => toggleGroup(deviceGroup.fingerprintId)}
                                            >
                                                {/* 1. Chevron & Badge */}
                                                <div className="flex items-center">
                                                    <div className="w-5 flex justify-center mr-2">
                                                        {isExpanded ? <FaChevronDown className="text-slate-400 text-[10px]" /> : <FaChevronRight className="text-slate-400 text-[10px]" />}
                                                    </div>
                                                    <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-100">
                                                        {deviceGroup.totalGroupedSessions} Sessions
                                                    </span>
                                                </div>

                                                {/* 2. Device Identifier */}
                                                <div className="lg:col-span-1">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {deviceGroup.deviceBrand !== 'Unknown' ? `${deviceGroup.deviceBrand} ` : ''}
                                                        {deviceGroup.deviceModel || (deviceGroup.fingerprintId.startsWith('legacy-') ? 'Visitor' : 'Device')}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {deviceGroup.operatingSystem} {deviceGroup.osVersion !== 'N/A' && deviceGroup.osVersion !== '' ? deviceGroup.osVersion : ''}
                                                    </div>
                                                </div>

                                                {/* 3. Last Seen */}
                                                <div className="text-sm text-slate-600 font-medium">
                                                    {formatIST(deviceGroup.lastSeen) || deviceGroup.lastSeen}
                                                </div>

                                                {/* 4. Location & Hash */}
                                                <div className="flex justify-between items-center text-sm text-slate-600">
                                                    <span className="truncate pr-4">
                                                        {deviceGroup.sessions[0]?.city && deviceGroup.sessions[0]?.city !== 'Unknown'
                                                            ? `${deviceGroup.sessions[0].city}, ${deviceGroup.sessions[0].country}`
                                                            : (deviceGroup.sessions[0]?.country || 'Unknown Location')
                                                        }
                                                    </span>
                                                    <span
                                                        className="text-[10px] text-slate-400 font-mono group-hover:text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate max-w-[80px]"
                                                        title={deviceGroup.fingerprintId}
                                                    >
                                                        {deviceGroup.fingerprintId.startsWith('legacy-') ? 'UN-HASHED' : deviceGroup.fingerprintId.substring(0, 8)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Child Rows (Individual Sessions) */}
                                            {isExpanded && (
                                                <div className="bg-slate-50/80 border-t border-slate-100">
                                                    {deviceGroup.sessions.map((session, sIdx) => (
                                                        <div key={session.rawSessionId || sIdx} className="px-5 py-4 border-b border-slate-100 last:border-b-0 lg:pl-16 hover:bg-white transition-colors">

                                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                                                {/* Date / Entry */}
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1 tracking-wider uppercase font-semibold">Timeline</div>
                                                                    <div className="text-sm font-medium text-slate-800">{formatIST(session.sessionStartTime) || session.sessionDate}</div>
                                                                    {session.firstVisitDate && (
                                                                        <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block mt-1.5">
                                                                            1st Visit: {session.firstVisitDate}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Source & Landing */}
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1 tracking-wider uppercase font-semibold">Acquisition</div>
                                                                    <div className="text-sm text-slate-800 break-words mb-1">
                                                                        <span className="text-slate-400 mr-1">Src:</span> {session.sessionSource}
                                                                    </div>
                                                                    <div className="text-xs text-slate-600 truncate" title={session.landingPage}>
                                                                        <span className="text-slate-400 mr-1">Land:</span> {session.landingPage}
                                                                    </div>
                                                                </div>

                                                                {/* Engagement */}
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1 tracking-wider uppercase font-semibold">Engagement</div>
                                                                    <div className="flex space-x-4 text-sm text-slate-800">
                                                                        <div><span className="text-slate-400 mr-1">Time:</span> {session.timeOnSiteFormatted}</div>
                                                                        <div><span className="text-slate-400 mr-1">Views:</span> {session.views}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Hardware / ID */}
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1 tracking-wider uppercase font-semibold">Context</div>
                                                                    <div className="text-xs text-slate-600 mb-1.5">
                                                                        {session.deviceClass !== 'Unknown' ? `${session.deviceClass} · ` : ''} {session.screenResolution !== 'N/A' ? session.screenResolution : 'Unknown Res'}
                                                                    </div>

                                                                    <div className="flex items-center justify-between bg-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-500" title={session.userIdentifier}>
                                                                        <span className="truncate pr-2">{session.userIdentifier || 'N/A'}</span>
                                                                        {session.userIdentifier && session.userIdentifier !== 'Not available (GA4)' && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (!targetClientIds.includes(session.userIdentifier)) {
                                                                                        setTargetClientIds([...targetClientIds, session.userIdentifier]);
                                                                                    }
                                                                                }}
                                                                                className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
                                                                                title="Isolate this exact session ID"
                                                                            >
                                                                                <FaCrosshairs />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            !error && !loading && (
                                <div className="px-6 py-20 text-center text-slate-500 bg-slate-50">
                                    <FaChartBar className="mx-auto text-4xl mb-3 text-slate-300" />
                                    <p className="text-base font-medium text-slate-700">No session telemetry found.</p>
                                    <p className="text-sm mt-1">Adjust filters or date boundaries to search again.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudiencePage;