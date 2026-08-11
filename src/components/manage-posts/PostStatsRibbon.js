/**
 * AI-CONTEXT:
 * Purpose: Displays aggregate statistics for blog posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`, 
 * reduced padding from `p-4` to `p-3`, changed `rounded-xl` to `rounded`, and reduced shadows.
 * Typography tightened to `text-[10px]` and `text-lg`.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaFileAlt, FaCheckCircle, FaClock, FaEdit } from 'react-icons/fa';

const StatCard = ({ label, value, icon: Icon, color, active, onClick }) => (
    <div
        onClick={onClick}
        className={`
            relative p-3 rounded border cursor-pointer transition-all duration-200 group
            ${active
                ? `bg-white border-slate-400 shadow-sm ring-1 ring-slate-200`
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
            }
        `}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                <h3 className="text-lg font-black text-slate-800 group-hover:text-slate-900">{value}</h3>
            </div>
            <div className={`p-1.5 rounded bg-${color}-50 text-${color}-600`}>
                <Icon size={14} />
            </div>
        </div>
    </div>
);

const PostStatsRibbon = ({ stats, currentView, onViewChange }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard
                label="All Content"
                value={stats.total}
                icon={FaFileAlt}
                color="sky"
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