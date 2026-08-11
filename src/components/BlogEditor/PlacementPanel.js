/**
 * AI-CONTEXT:
 * Purpose: Editorial section placement selection for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * changed `rounded-lg border-2` to `rounded border`, updated typography to `text-[11px]` and `text-[10px]`,
 * and tightened padding to `p-2.5`.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaStar, FaList, FaBolt, FaNewspaper } from 'react-icons/fa';
import TagsInput from './TagsInput';

const PlacementPanel = ({ displaySection, onDisplaySectionChange, tags, onTagsChange }) => {
    // Definition of the available newsroom sections
    const sections = [
        {
            id: 'HERO',
            label: 'Lead Story (Hero)',
            desc: 'Top of the homepage. Large visual impact. Use for major market events.',
            icon: <FaStar className="text-amber-500" />,
            color: 'border-amber-400 bg-amber-50 ring-1 ring-amber-100'
        },
        {
            id: 'MUST_READ',
            label: 'Must Read',
            desc: 'High visibility horizontal rail. Good for important analysis.',
            icon: <FaBolt className="text-purple-600" />,
            color: 'border-purple-400 bg-purple-50 ring-1 ring-purple-100'
        },
        {
            id: 'QUICK_READ',
            label: 'Market Brief',
            desc: 'Text-heavy strip. Best for quick updates or breaking news bullets.',
            icon: <FaList className="text-sky-600" />,
            color: 'border-sky-400 bg-sky-50 ring-1 ring-sky-100'
        },
        {
            id: 'STANDARD',
            label: 'Standard Analysis',
            desc: 'Main feed grid. The default home for most articles.',
            icon: <FaNewspaper className="text-slate-400" />,
            color: 'border-slate-400 bg-white ring-1 ring-slate-200'
        }
    ];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Editorial Placement
                </label>
                <div className="space-y-2">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => onDisplaySectionChange(section.id)}
                            className={`
                                relative flex items-start p-2.5 rounded border cursor-pointer transition-all duration-200
                                ${displaySection === section.id ? section.color : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}
                            `}
                        >
                            <div className="mt-0.5 mr-2.5 text-base">
                                {section.icon}
                            </div>
                            <div>
                                <h4 className={`text-[11px] font-bold ${displaySection === section.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {section.label}
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                    {section.desc}
                                </p>
                            </div>
                            {displaySection === section.id && (
                                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <hr className="border-slate-200" />
            <div className="mt-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tags</label>
                <TagsInput tags={tags} setTags={onTagsChange} />
            </div>
        </div>
    );
};

export default PlacementPanel;