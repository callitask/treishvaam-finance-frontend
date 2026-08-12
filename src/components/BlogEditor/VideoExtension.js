/**
 * AI-CONTEXT:
 * Purpose: Custom Tiptap Node for rendering HTML5 <video> elements.
 * Scope: Supports playback of HLS streams (.m3u8) and standard MP4s within the rich text editor.
 * Security Constraints: Renders strictly defined attributes to prevent XSS via media tags.
 * 
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 4 - Enterprise Video Integration):
 *   Created the VideoExtension node.
 *   Why: Allows the CMS editor to natively recognize and render video nodes inserted via the HLS pipeline, ensuring videos appear responsively inside the article flow.
 * 
 * - EDITED:
 * • Wrapped component in `NodeViewWrapper` and `ReactNodeViewRenderer` to prevent React unmount/remount flashing on scroll.
 * • Added dynamic native alignment/width controls to allow editors to wrap text around videos securely.
 * • Date/Phase: Phase 2 (Tiptap Anti-Flash & Layout Engine)
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

const VideoNodeView = ({ node, updateAttributes, selected, editor }) => {
    const { src, width, alignment, controls } = node.attrs;
    const isEditable = editor.isEditable;

    const alignmentClasses = {
        left: 'float-left mr-4 mb-4 clear-left',
        center: 'mx-auto block my-4 clear-both',
        right: 'float-right ml-4 mb-4 clear-right'
    };

    const wrapperClass = alignmentClasses[alignment] || alignmentClasses.center;

    return (
        <NodeViewWrapper className={`relative group transition-all ${wrapperClass}`}>
            {isEditable && (selected || false) && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
                    <span className="font-semibold text-slate-400 mr-1">Align:</span>
                    <button
                        type="button"
                        onClick={() => updateAttributes({ alignment: 'left' })}
                        className={`px-2 py-0.5 rounded ${alignment === 'left' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800'}`}
                    >
                        Left
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAttributes({ alignment: 'center' })}
                        className={`px-2 py-0.5 rounded ${alignment === 'center' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800'}`}
                    >
                        Center
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAttributes({ alignment: 'right' })}
                        className={`px-2 py-0.5 rounded ${alignment === 'right' ? 'bg-sky-500 text-white' : 'hover:bg-slate-800'}`}
                    >
                        Right
                    </button>
                    <div className="h-3 w-px bg-slate-700 mx-1" />
                    <span className="font-semibold text-slate-400 mr-1">Width:</span>
                    {['50%', '75%', '100%'].map((w) => (
                        <button
                            key={w}
                            type="button"
                            onClick={() => updateAttributes({ width: w })}
                            className={`px-1.5 py-0.5 rounded ${width === w ? 'bg-sky-500 text-white' : 'hover:bg-slate-800'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            )}
            <div style={{ width: width || '100%' }}>
                <video
                    src={src}
                    controls={controls}
                    className="w-full h-auto rounded-lg shadow-md bg-slate-900 border border-slate-200"
                />
            </div>
        </NodeViewWrapper>
    );
};

export const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            controls: { default: true },
            width: { default: '100%' },
            alignment: { default: 'center' },
            className: { default: 'w-full rounded-lg shadow-md my-4 bg-slate-900' }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video',
                getAttrs: (element) => ({
                    src: element.getAttribute('src') || element.querySelector('source')?.getAttribute('src'),
                    width: element.style.width || element.getAttribute('width') || '100%',
                    alignment: element.getAttribute('data-alignment') || 'center'
                })
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { alignment, width, ...rest } = HTMLAttributes;
        return [
            'div',
            { class: `video-wrapper alignment-${alignment}`, style: `width: ${width};` },
            ['video', mergeAttributes(rest, { 'data-alignment': alignment }),
                ['source', { src: HTMLAttributes.src, type: 'application/x-mpegURL' }],
                ['source', { src: HTMLAttributes.src, type: 'video/mp4' }]
            ]
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoNodeView);
    },

    addCommands() {
        return {
            setVideo: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});