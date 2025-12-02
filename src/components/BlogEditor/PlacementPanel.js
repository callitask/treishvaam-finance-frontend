import React from 'react';
import { FaStar, FaList, FaBolt, FaNewspaper } from 'react-icons/fa';
import TagsInput from './TagsInput'; // Using your existing component

const PlacementPanel = ({ displaySection, onDisplaySectionChange, tags, onTagsChange }) => {

    // Definition of the available newsroom sections
    const sections = [
        {
            id: 'HERO',
            label: 'Lead Story (Hero)',
            desc: 'Top of the homepage. Large visual impact. Use for major market events.',
            icon: <FaStar className="text-amber-500" />,
            color: 'border-amber-500 bg-amber-50'
        },
        {
            id: 'MUST_READ',
            label: 'Must Read',
            desc: 'High visibility horizontal rail. Good for important analysis.',
            icon: <FaBolt className="text-purple-600" />,
            color: 'border-purple-500 bg-purple-50'
        },
        {
            id: 'QUICK_READ',
            label: 'Market Brief',
            desc: 'Text-heavy strip. Best for quick updates or breaking news bullets.',
            icon: <FaList className="text-sky-600" />,
            color: 'border-sky-500 bg-sky-50'
        },
        {
            id: 'STANDARD',
            label: 'Standard Analysis',
            desc: 'Main feed grid. The default home for most articles.',
            icon: <FaNewspaper className="text-gray-500" />,
            color: 'border-gray-200 hover:border-gray-300'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-gray-700 font-bold mb-3 text-sm uppercase tracking-wide">
                    Editorial Placement
                </label>
                <div className="space-y-3">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => onDisplaySectionChange(section.id)}
                            className={`
                                relative flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                                ${displaySection === section.id ? section.color : 'border-gray-100 bg-white hover:border-gray-200'}
                            `}
                        >
                            <div className="mt-1 mr-3 text-lg">
                                {section.icon}
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${displaySection === section.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {section.label}
                                </h4>
                                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                                    {section.desc}
                                </p>
                            </div>
                            {displaySection === section.id && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Using the existing TagsInput component */}
            <div className="mt-4">
                <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                <TagsInput tags={tags} setTags={onTagsChange} />
            </div>
        </div>
    );
};

export default PlacementPanel;