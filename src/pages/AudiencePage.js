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
 * - EDITED (Incident 77 - Filter Mapping & UI Polish):
 * • Added `DTO_KEY_MAP` to translate singular frontend filter keys to plural backend DTO keys, restoring dropdown functionality.
 * • Added `startsWith` deduplication to prevent "Apple Apple iPhone" concatenated strings.
 * • Applied maximum-density Cloudflare Radar UI aesthetic (py-1.5, 11px typography, condensed device strings).
 */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getGroupedAudienceData, getFilterOptions, refreshGA4Data, healHistoricalAnalytics } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaRedo, FaExclamationTriangle,
    FaPlus, FaTimes, FaEyeSlash, FaCrosshairs, FaCheckSquare,
    FaSquare, FaSyncAlt, FaCheckCircle, FaChevronDown, FaChevronRight,
    FaDatabase, FaShieldAlt, FaCog, FaChartBar, FaMobileAlt, FaGlobe, FaClock, FaDesktop
} from 'react-icons/fa';

const DetailCell = ({ icon: Icon, value, label }) => (
    <div className="flex items-center text-[11px] text-slate-700">
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
            <div className={`p-1.5 border rounded w-full text-[11px] min-h-[32px] flex flex-wrap gap-1 items-center ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-slate-300 bg-white hover:border-blue-500 focus-within:border-blue-500 transition-colors'}`}>
                {selectedValues.map(val => (
                    <span key={val} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded flex items-center border border-slate-200">
                        {val.substring(0, 10)}...
                        <FaTimes
                            className="ml-1 cursor-pointer text-slate-400 hover:text-slate-800 transition-colors"
                            onClick={(e) => { e.stopPropagation(); toggleSelection(val); }}
                        />
                    </span>
                ))}
                <input
                    type="text"
                    disabled={disabled}
                    className="flex-grow outline-none bg-transparent min-w-[100px] p-0.5 placeholder-slate-400 text-slate-800"
                    placeholder={selectedValues.length === 0 ? placeholder : 'Type to add more...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-60 flex flex-col">
                    <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center text-[11px] text-slate-500 py-2">No matching IDs found.</div>
                        ) : (
                            filteredOptions.slice(0, 100).map(opt => (
                                <div
                                    key={opt}
                                    className="flex items-center text-[11px] p-1.5 hover:bg-slate-50 cursor-pointer rounded transition-colors text-slate-700"
                                    onClick={() => toggleSelection(opt)}
                                >
                                    {selectedValues.includes(opt) ? <FaCheckSquare className="text-blue-500 mr-2" /> : <FaSquare className="text-slate-300 mr-2" />}
                                    <span className="truncate font-mono" title={opt}>{opt}</span>
                                </div>
                            ))
                        )}
                        {filteredOptions.length > 100 && (
                            <div className="text-[10px] text-center text-slate-400 py-1 border-t mt-1 bg-slate-50 rounded-b">Top 100 shown. Keep typing.</div>
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

// INCIDENT 77 FIX: Map singular UI keys to plural Backend DTO keys
const DTO_KEY_MAP = {
    country: 'countries',
    region: 'regions',
    city: 'cities',
    operatingSystem: 'operatingSystems',
    osVersion: 'osVersions',
    sessionSource: 'sessionSources'
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

    // INCIDENT 77 FIX: Route singular filter keys to plural DTO keys
    const getOptionsForFilterType = (type) => {
        if (!filterOptions || !type) return [];
        const pluralKey = DTO_KEY_MAP[type];
        return filterOptions[pluralKey] || [];
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
            topLanding: topLanding.length > 35 ? topLanding.substring(0, 35) + '...' : topLanding
        };
    }, [data]);

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen bg-white font-sans text-slate-900">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-6">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Audience Intelligence</h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">Zero-Trust grouped telemetry & heuristics.</p>
                    </div>

                    {/* Inline Date Picker */}
                    <div className="flex items-center space-x-2 text-[11px]">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-600 text-slate-600 font-medium pb-0.5 px-0"
                            disabled={loading || optionsLoading || isRefreshing}
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-600 text-slate-600 font-medium pb-0.5 px-0"
                            disabled={loading || optionsLoading || isRefreshing}
                        />
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3 relative">
                    {(loading || optionsLoading) && <FaRedo className="animate-spin text-blue-600 text-[11px]" />}

                    <button
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition-colors border border-transparent hover:border-slate-200"
                        title="Advanced Admin Actions"
                    >
                        <FaCog size={14} />
                    </button>

                    {showAdminMenu && (
                        <div className="absolute top-8 right-0 z-50 w-52 bg-white border border-slate-200 rounded shadow-lg flex flex-col overflow-hidden">
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing || loading}
                                className="flex items-center px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 disabled:text-slate-400 text-left border-b border-slate-100"
                            >
                                <FaDatabase className="mr-2 text-slate-400" />
                                Refresh GA4 Data
                            </button>
                            <button
                                onClick={handleZkpDataHealer}
                                disabled={isHealing || loading}
                                className="flex items-center px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 disabled:text-slate-400 text-left font-medium"
                            >
                                <FaShieldAlt className="mr-2 text-amber-500" />
                                Re-Align Historical Data
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {successMsg && (
                <div className="mb-4 p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center rounded text-[11px] font-medium">
                    <FaCheckCircle className="mr-2 text-emerald-500" /> {successMsg}
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-white border border-slate-200 rounded p-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Visitors</div>
                    <div className="text-2xl font-bold text-slate-800">{kpiMetrics.visitors.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded p-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Sessions</div>
                    <div className="text-2xl font-bold text-slate-800">{kpiMetrics.sessions.toLocaleString()}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded p-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Top Entry Point</div>
                    <div className="text-sm font-semibold text-slate-700 truncate mt-1.5" title={kpiMetrics.topLanding}>{kpiMetrics.topLanding}</div>
                </div>
            </div>

            {/* Streamlined Filter Panel */}
            <div className="bg-white border border-slate-200 rounded mb-6">
                <div
                    className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                    <div className="flex items-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <FaChartBar className="mr-2 text-blue-500" />
                        Audience Filters
                        {((targetClientIds.length + excludeClientIds.length + filters.length) > 0) && (
                            <span className="ml-2 bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.5 rounded border border-blue-100">
                                {targetClientIds.length + excludeClientIds.length + filters.length} Active
                            </span>
                        )}
                    </div>
                    {isFilterExpanded ? <FaChevronDown className="text-slate-400 text-[10px]" /> : <FaChevronRight className="text-slate-400 text-[10px]" />}
                </div>

                {isFilterExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
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
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
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
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimension Constraints</label>
                                <button
                                    onClick={addFilter}
                                    disabled={loading || optionsLoading}
                                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition flex items-center bg-white px-2 py-1 rounded border border-slate-200 shadow-sm"
                                >
                                    <FaPlus className="mr-1" /> Add Rule
                                </button>
                            </div>

                            {filters.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">No dimension constraints applied.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {filters.map((filter) => (
                                        <div key={filter.id} className="flex items-center space-x-1.5">
                                            <select
                                                value={filter.type}
                                                onChange={(e) => updateFilter(filter.id, 'type', e.target.value)}
                                                className="p-1 border border-slate-200 rounded text-[11px] bg-white focus:border-blue-500 focus:ring-0 text-slate-700 w-1/3 outline-none"
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
                                                className="p-1 border border-slate-200 rounded text-[11px] bg-white focus:border-blue-500 focus:ring-0 text-slate-700 w-full outline-none"
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
                                                className="p-1.5 text-slate-400 hover:text-red-600 transition bg-white border border-slate-200 rounded"
                                                title="Remove filter"
                                            >
                                                <FaTimes size={10} />
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
                    <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 flex items-start rounded">
                        <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0 text-[13px] text-red-500" />
                        <div>
                            <p className="font-semibold text-[11px]">{error}</p>
                            <p className="text-[10px] mt-0.5 opacity-80">Check network diagnostics or adjust filter boundaries.</p>
                        </div>
                    </div>
                )}

                {loading && data.length === 0 ? (
                    <div className="py-16 text-center">
                        <FaRedo className="mx-auto text-2xl mb-3 animate-spin text-slate-300" />
                        <p className="font-medium text-[11px] text-slate-500 tracking-wide uppercase">Compiling Telemetry Matrix...</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded overflow-hidden bg-white">
                        {/* Table Actions Header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-end">
                            <div className="flex space-x-3 text-[10px] font-semibold uppercase tracking-wider">
                                <button onClick={expandAllGroups} className="text-slate-500 hover:text-blue-600 transition-colors">Expand All</button>
                                <span className="text-slate-300">|</span>
                                <button onClick={collapseAllGroups} className="text-slate-500 hover:text-slate-800 transition-colors">Collapse All</button>
                            </div>
                        </div>

                        {data.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {data.map((deviceGroup) => {
                                    const isExpanded = expandedGroups[deviceGroup.fingerprintId];

                                    // INCIDENT 77 FIX: Prevent "Apple Apple iPhone" duplication string
                                    const brand = deviceGroup.deviceBrand !== 'Unknown' ? deviceGroup.deviceBrand : '';
                                    const model = deviceGroup.deviceModel || (deviceGroup.fingerprintId.startsWith('legacy-') ? 'Visitor' : 'Device');

                                    let displayDevice = model;
                                    if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
                                        displayDevice = model; // Model string already contains brand
                                    } else if (brand) {
                                        displayDevice = `${brand} ${model}`;
                                    }

                                    return (
                                        <div key={deviceGroup.fingerprintId} className="flex flex-col">
                                            {/* Parent Row (Device Group) */}
                                            <div
                                                className="grid grid-cols-1 lg:grid-cols-12 px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors items-center gap-2 border-l-2 border-transparent hover:border-blue-500"
                                                onClick={() => toggleGroup(deviceGroup.fingerprintId)}
                                            >
                                                {/* 1. Chevron & Sessions (Col span 2) */}
                                                <div className="lg:col-span-2 flex items-center">
                                                    <div className="w-4 flex justify-center mr-1">
                                                        {isExpanded ? <FaChevronDown className="text-slate-400 text-[9px]" /> : <FaChevronRight className="text-slate-400 text-[9px]" />}
                                                    </div>
                                                    <span className="text-slate-600 text-[11px] font-semibold">{deviceGroup.totalGroupedSessions} Sessions</span>
                                                </div>

                                                {/* 2. Device Identifier (Col span 4) */}
                                                <div className="lg:col-span-4 flex items-center text-[11px] text-slate-800 font-medium truncate">
                                                    <FaDesktop className="mr-1.5 text-slate-400" />
                                                    {displayDevice} <span className="mx-1.5 text-slate-300">•</span> {deviceGroup.operatingSystem} {deviceGroup.osVersion !== 'N/A' && deviceGroup.osVersion !== '' ? deviceGroup.osVersion : ''}
                                                </div>

                                                {/* 3. Location (Col span 3) */}
                                                <div className="lg:col-span-3 text-[11px] text-slate-600 truncate">
                                                    {deviceGroup.sessions[0]?.city && deviceGroup.sessions[0]?.city !== 'Unknown'
                                                        ? `${deviceGroup.sessions[0].city}, ${deviceGroup.sessions[0].country}`
                                                        : (deviceGroup.sessions[0]?.country || 'Unknown Location')
                                                    }
                                                </div>

                                                {/* 4. Last Seen & Hash (Col span 3) */}
                                                <div className="lg:col-span-3 flex justify-between items-center text-[11px] text-slate-500">
                                                    <span>{formatIST(deviceGroup.lastSeen) || deviceGroup.lastSeen}</span>
                                                    <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 truncate max-w-[60px]" title={deviceGroup.fingerprintId}>
                                                        {deviceGroup.fingerprintId.startsWith('legacy-') ? 'UN-HASHED' : deviceGroup.fingerprintId.substring(0, 8)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Child Rows (Individual Sessions) */}
                                            {isExpanded && (
                                                <div className="bg-slate-50/50 border-t border-slate-100">
                                                    {deviceGroup.sessions.map((session, sIdx) => (
                                                        <div key={session.rawSessionId || sIdx} className="grid grid-cols-1 lg:grid-cols-12 px-4 py-1.5 border-b border-slate-100 last:border-0 lg:pl-10 hover:bg-white transition-colors items-center gap-2">

                                                            {/* Date */}
                                                            <div className="lg:col-span-3 text-[10px] text-slate-500 flex flex-col">
                                                                <span className="font-medium text-slate-700">{formatIST(session.sessionStartTime) || session.sessionDate}</span>
                                                                {session.firstVisitDate && <span className="text-[9px] text-emerald-600">1st: {session.firstVisitDate}</span>}
                                                            </div>

                                                            {/* Acquisition */}
                                                            <div className="lg:col-span-4 text-[10px] text-slate-600 flex flex-col truncate pr-2">
                                                                <span><span className="text-slate-400">Src:</span> {session.sessionSource}</span>
                                                                <span className="truncate" title={session.landingPage}><span className="text-slate-400">Land:</span> {session.landingPage}</span>
                                                            </div>

                                                            {/* Engagement */}
                                                            <div className="lg:col-span-2 text-[10px] text-slate-600 flex flex-col">
                                                                <span><span className="text-slate-400">Time:</span> {session.timeOnSiteFormatted}</span>
                                                                <span><span className="text-slate-400">Views:</span> {session.views}</span>
                                                            </div>

                                                            {/* Context/ID */}
                                                            <div className="lg:col-span-3 flex justify-between items-center text-[10px] text-slate-500">
                                                                <span className="truncate pr-2">{session.deviceClass !== 'Unknown' ? `${session.deviceClass} · ` : ''}{session.screenResolution !== 'N/A' ? session.screenResolution : 'Unknown Res'}</span>
                                                                {session.userIdentifier && session.userIdentifier !== 'Not available (GA4)' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!targetClientIds.includes(session.userIdentifier)) {
                                                                                setTargetClientIds([...targetClientIds, session.userIdentifier]);
                                                                            }
                                                                        }}
                                                                        className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0 bg-blue-50 px-1 py-0.5 rounded border border-blue-100"
                                                                        title="Isolate this exact session ID"
                                                                    >
                                                                        <FaCrosshairs size={10} />
                                                                    </button>
                                                                )}
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
                                <div className="px-6 py-12 text-center text-slate-500 bg-slate-50">
                                    <FaChartBar className="mx-auto text-3xl mb-2 text-slate-300" />
                                    <p className="text-[12px] font-medium text-slate-700">No session telemetry found.</p>
                                    <p className="text-[11px] mt-0.5">Adjust filters or date boundaries to search again.</p>
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