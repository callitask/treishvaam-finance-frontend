import React, { useEffect, useState, useCallback } from 'react';
import { getHistoricalAudienceData, getFilterOptions } from '../apiConfig';
import {
    FaCalendarAlt, FaMapMarkedAlt, FaMobileAlt, FaDesktop, FaClock, FaRedo,
    FaExclamationTriangle, FaChartBar, FaUser, FaGlobe, FaPlus, FaTimes
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

// Define the available filter types and their user-friendly labels
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

    // --- NEW FILTER STATE ---
    const [startDate, setStartDate] = useState(
        new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(getTodayDateString());
    // Holds the dynamic filter rows, e.g., [{ id: 1, type: 'country', value: 'India' }]
    const [filters, setFilters] = useState([]);
    // Holds the dynamic options for all dropdowns, e.g., { countries: ['India', 'USA'], regions: ['Rajasthan'] }
    const [filterOptions, setFilterOptions] = useState(null);
    // --- END NEW FILTER STATE ---

    // Helper to convert the filters array into a flat params object for the API
    const buildApiParams = useCallback(() => {
        const params = {
            startDate,
            endDate,
        };
        filters.forEach(filter => {
            if (filter.type && filter.value) {
                params[filter.type] = filter.value;
            }
        });
        return params;
    }, [startDate, endDate, filters]);


    // Main data fetching logic, triggered by any filter change
    useEffect(() => {
        const fetchDataAndOptions = async () => {
            setLoading(true);
            setOptionsLoading(true);
            setError('');

            const params = buildApiParams();

            // We fetch both data and options simultaneously
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
                setFilterOptions(null); // Reset options on error
            } finally {
                setLoading(false);
                setOptionsLoading(false);
            }
        };

        fetchDataAndOptions();
    }, [startDate, endDate, filters, buildApiParams]); // Reacts to any change


    // --- FILTER ROW MANAGEMENT ---

    const addFilter = () => {
        setFilters(prevFilters => [
            ...prevFilters,
            { id: Date.now(), type: '', value: '' } // Use timestamp as unique key
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

            // --- CASCADING RESET LOGIC ---
            if (field === 'type') {
                // If user changes the *type* of filter, reset its value
                newFilters[filterIndex].value = '';
            }

            // If user changes a value, reset dependent filters
            const dependencies = FILTER_DEPENDENCIES[oldFilter.type];
            if (field === 'value' && dependencies) {
                return newFilters.map(f => {
                    if (dependencies.includes(f.type)) {
                        return { ...f, value: '' }; // Reset value of dependent filter
                    }
                    return f;
                });
            }
            return newFilters;
        });
    };

    // --- END FILTER ROW MANAGEMENT ---


    const columns = [
        {
            key: 'sessionDate',
            title: 'Date',
            render: (item) => <DetailCell icon={FaCalendarAlt} value={item.sessionDate} label="Session Date" />
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
                    <p className="text-xs text-gray-500">
                        <FaUser className="inline mr-1 text-sky-500" /> ID: {item.userIdentifier ? item.userIdentifier.substring(0, 8) + '...' : 'N/A'}
                    </p>
                </div>
            )
        }
    ];

    // Helper to get the correct options list for a given filter type
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
            <p className="text-gray-600 mb-6">Detailed visitor logs stored in the database. Data is synchronized daily from Google Analytics (GA4).</p>

            {/* --- DATE FILTER ROW --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex-shrink-0">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm"
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
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm"
                        disabled={loading || optionsLoading}
                    />
                </div>
                <div className="text-sm text-gray-500 flex-grow">
                    {(loading || optionsLoading) && <FaRedo className="inline mr-2 animate-spin" />}
                    {loading ? 'Fetching report data...' : ''}
                    {optionsLoading && !loading ? 'Updating filter options...' : ''}
                </div>
            </div>

            {/* --- DYNAMIC MULTI-LEVEL FILTER ROW --- */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-3">
                <label className="text-sm font-medium text-gray-700">Filters</label>
                {filters.length === 0 && (
                    <p className="text-sm text-gray-500">No filters applied. Click "Add Filter" to begin.</p>
                )}

                {filters.map((filter) => (
                    <div key={filter.id} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                        {/* 1. Filter Type Dropdown */}
                        <select
                            aria-label="Filter type"
                            value={filter.type}
                            onChange={(e) => updateFilter(filter.id, 'type', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3 text-sm"
                            disabled={loading || optionsLoading}
                        >
                            <option value="">-- Select Filter Type --</option>
                            {Object.entries(FILTER_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        {/* 2. Filter Value Dropdown */}
                        <select
                            aria-label="Filter value"
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg w-full md:w-2/3 text-sm"
                            disabled={!filter.type || loading || optionsLoading}
                        >
                            <option value="">-- Select Value --</option>
                            {getOptionsForFilterType(filter.type).map(option => (
                                <option key={option} value={option}>
                                    {option || '(Not Set)'}
                                </option>
                            ))}
                        </select>

                        {/* 3. Remove Button */}
                        <button
                            onClick={() => removeFilter(filter.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Remove filter"
                            disabled={loading || optionsLoading}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}

                {/* 4. Add Button */}
                <button
                    onClick={addFilter}
                    disabled={loading || optionsLoading}
                    className="flex items-center px-4 py-2 text-sm rounded-lg transition duration-300 bg-sky-600 text-white hover:bg-sky-700 disabled:bg-gray-300"
                >
                    <FaPlus className="mr-2" />
                    Add Filter
                </button>
            </div>
            {/* --- END DYNAMIC FILTER ROW --- */}


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
                    <div className="p-6 text-center text-gray-500">
                        <FaRedo className="mx-auto text-3xl mb-2 animate-spin" />
                        <p>Loading historical report for selected dates...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {col.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-sky-50/50">
                                        {columns.map(col => (
                                            <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                                {col.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                !error && !loading && (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                            <FaChartBar className="mx-auto text-4xl mb-4 text-gray-400" />
                                            <p className="text-lg font-semibold">No visitor data found for the selected criteria.</p>
                                            <p className="text-sm">Try adjusting the date range or removing some filters.</p>
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