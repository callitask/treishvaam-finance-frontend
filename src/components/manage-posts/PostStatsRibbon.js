import React from 'react';
import { FaFileAlt, FaCheckCircle, FaClock, FaEdit } from 'react-icons/fa';

const StatCard = ({ label, value, icon: Icon, color, active, onClick }) => (
    <div
        onClick={onClick}
        className={`
            relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group
            ${active
                ? `bg-white border-${color}-500 shadow-md ring-1 ring-${color}-500`
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }
        `}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-black text-gray-800 group-hover:text-gray-900">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const PostStatsRibbon = ({ stats, currentView, onViewChange }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
                label="All Content"
                value={stats.total}
                icon={FaFileAlt}
                color="blue"
                active={currentView === 'ALL'}
                onClick={() => onViewChange('ALL')}
            />
            <StatCard
                label="Published"
                value={stats.published}
                icon={FaCheckCircle}
                color="emerald"
                active={currentView === 'PUBLISHED'}
                onClick={() => onViewChange('PUBLISHED')}
            />
            <StatCard
                label="Scheduled"
                value={stats.scheduled}
                icon={FaClock}
                color="amber"
                active={currentView === 'SCHEDULED'}
                onClick={() => onViewChange('SCHEDULED')}
            />
            <StatCard
                label="Drafts"
                value={stats.drafts}
                icon={FaEdit}
                color="slate"
                active={currentView === 'DRAFT'}
                onClick={() => onViewChange('DRAFT')}
            />
        </div>
    );
};

export default PostStatsRibbon;