import React, { useEffect, useState } from 'react';
import { getHistoricalAudienceData } from '../apiConfig';
import { FaCalendarAlt, FaMapMarkedAlt, FaMobileAlt, FaDesktop, FaClock, FaRedo, FaExclamationTriangle, FaChartBar, FaUser, FaGlobe, FaSearch } from 'react-icons/fa';

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

const AudiencePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [endDate, setEndDate] = useState(getTodayDateString());
    const [lastFetchTime, setLastFetchTime] = useState(null);

    const fetchData = async (start, end) => {
        setLoading(true);
        setError('');

        // Simple validation
        if (!start || !end || new Date(start) > new Date(end)) {
            setError('Invalid date range. Start date must be before or equal to the end date.');
            setLoading(false);
            return;
        }

        try {
            const response = await getHistoricalAudienceData(start, end);
            setData(response.data);
            setLastFetchTime(new Date());
        } catch (err) {
            console.error('Error fetching audience data:', err);
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                setError('Access Denied. You do not have permission to view this data.');
            } else {
                setError('Failed to fetch historical audience data. Check backend logs and GA4 setup. The last attempt to fetch historical data might have failed.');
            }
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch when component mounts: loads last 7 days of data
    useEffect(() => {
        const today = new Date();
        const defaultStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setStartDate(defaultStart);
        fetchData(defaultStart, getTodayDateString());
    }, []);

    const handleDateChange = (e, type) => {
        const value = e.target.value;
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
    };

    const handleSearchClick = () => {
        fetchData(startDate, endDate);
    };

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

    return (
        <div className="container mx-auto p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Historical Audience Report</h1>
            <p className="text-gray-600 mb-6">Detailed visitor logs stored in the database. Data is synchronized daily from Google Analytics (GA4).</p>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex-shrink-0">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => handleDateChange(e, 'start')}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm"
                        disabled={loading}
                    />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex-shrink-0">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => handleDateChange(e, 'end')}
                        className="p-2 border border-gray-300 rounded-lg w-full text-sm"
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleSearchClick}
                    disabled={loading}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition duration-300 w-full md:w-auto justify-center ${loading
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                >
                    <FaSearch className={`mr-2 ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? 'Fetching...' : 'Filter Data'}
                </button>
            </div>

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
                                !error && (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                            <FaChartBar className="mx-auto text-4xl mb-4 text-gray-400" />
                                            <p className="text-lg font-semibold">No visitor data found for the selected date range.</p>
                                            <p className="text-sm">If this is the first day after implementation, initial data might be pending synchronization. Check back tomorrow.</p>
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