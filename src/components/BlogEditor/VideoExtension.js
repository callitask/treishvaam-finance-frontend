/**
 * AI-CONTEXT:
 * Purpose: Custom Tiptap Node for rendering HTML5 <video> elements.
 * Scope: Supports playback of HLS streams (.m3u8) and standard MP4s within the rich text editor.
 * Security Constraints: Renders strictly defined attributes to prevent XSS via media tags.
 * 
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 4 - Enterprise Video Integration):
 *   Created the VideoExtension node.
 *   Why: Allows the CMS editor to natively recognize and render video nodes inserted via the HLS pipeline, ensuring videos appear responsively inside the article flow.
 * 
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 *   This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions. 
 *   It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import { Node, mergeAttributes } from '@tiptap/core';

export const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            controls: {
                default: true,
            },
            width: {
                default: '100%',
            },
            className: {
                default: 'w-full rounded-lg shadow-md my-4 bg-slate-900',
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'video',
            mergeAttributes(HTMLAttributes),
            ['source', { src: HTMLAttributes.src, type: 'application/x-mpegURL' }],
            ['source', { src: HTMLAttributes.src, type: 'video/mp4' }]
        ];
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