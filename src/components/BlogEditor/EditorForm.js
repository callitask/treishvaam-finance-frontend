"use client";
/**
 * AI-CONTEXT:
 * Purpose: Rich text editor component for the Blog/News CMS.
 * Scope: Full enterprise editor with all Tiptap extensions, image upload, YouTube embed,
 *   drag-drop, paste-image, word count, and keyboard shortcuts.
 *
 * Critical Dependencies:
 * - Backend: uploadFile() from apiConfig.js → POST /api/v1/files/upload
 * - Parent: BlogEditorPage.js passes content, setContent, editorRef, handleAutoSave
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Replaced `suneditor-react` with `@tiptap/react` and `@tiptap/starter-kit`.
 * • Added `"use client";` directive.
 * • Built a custom MenuBar to replicate the standard formatting controls.
 * • Why: Phase 5 Next.js Migration (Library Swap). Resolves Cloudflare Pages build crash.
 *
 * - EDITED:
 * • Memoized the `extensions` array passed to `useEditor`.
 * • Why: Fixes `Duplicate extension names found: ['link', 'underline']` warnings.
 *
 * - EDITED (2026-05-15 P0-6 Advanced Editor Upgrade):
 *   • Added all installed Tiptap extensions: Image, Link, Youtube, Underline, Color, TextStyle, TextAlign.
 *   • Built full enterprise toolbar with grouped buttons.
 *   • Added image upload, drag-drop, paste-image, YouTube embed, Link insert.
 *   • Added word count + reading time live counter.
 *   • Added Ctrl+S keyboard shortcut to trigger parent handleAutoSave.
 *
 * - EDITED (2026-05-15 BUG-TIPTAP-V3 Fix):
 *   • CRITICAL: Tiptap v3 changed TextStyle to a named export — changed to `import { TextStyle }`.
 *   • CRITICAL: BubbleMenu was removed from @tiptap/react in v3 edge builds — removed entirely.
 *   • CRITICAL: StarterKit v3 bundles Link and Underline internally. Adding them separately causes
 *     "Duplicate extension names found: ['link', 'underline']" warning and `a is not a function`
 *     crash in onUpdate. Fix: disable link and underline in StarterKit, then add them separately
 *     with custom config. This gives us full control over their behavior.
 *   • Why: These crashes caused the editor to throw on every keystroke and crash the entire page.
 */

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { uploadFile } from '../../apiConfig';

// ═══════════════════════════════════════════════════════════════
// TOOLBAR COMPONENT
// ═══════════════════════════════════════════════════════════════
const MenuBar = ({ editor, onImageUpload, onYoutubeEmbed, onLinkInsert }) => {
    if (!editor) return null;

    const Btn = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-2.5 py-1.5 text-sm border rounded shadow-sm transition-colors ${isActive
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                }`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-7 bg-slate-300 mx-1 self-center"></div>;

    return (
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg items-center">
            {/* History */}
            <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">↶</Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">↷</Btn>
            <Divider />

            {/* Text Style */}
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><strong>B</strong></Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><em>I</em></Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><u>U</u></Btn>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><s>S</s></Btn>
            <Btn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">{'</>'}</Btn>
            <Divider />

            {/* Headings */}
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>
            <Divider />

            {/* Lists & Blocks */}
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">• List</Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">1. List</Btn>
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">❝</Btn>
            <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">{'{ }'}</Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">―</Btn>
            <Divider />

            {/* Alignment */}
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">≡←</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">≡↔</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">≡→</Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">≡≡</Btn>
            <Divider />

            {/* Color Picker */}
            <input
                type="color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                title="Text Color"
                defaultValue="#000000"
            />
            <Divider />

            {/* Extras */}
            <Btn onClick={onLinkInsert} isActive={editor.isActive('link')} title="Insert Link">🔗</Btn>
            <Btn onClick={onImageUpload} title="Upload Image">🖼️</Btn>
            <Btn onClick={onYoutubeEmbed} title="Embed YouTube Video">▶️</Btn>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════
const EditorForm = ({ content, setContent, editorRef, handleAutoSave }) => {
    const [wordCount, setWordCount] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // BUG-TIPTAP-V3 FIX: StarterKit v3 includes link and underline internally.
    // We MUST disable them in StarterKit and add them separately to avoid
    // "Duplicate extension names" warning and `a is not a function` crash.
    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            // Disable built-in link and underline to prevent duplicate registration
            link: false,
            underline: false,
        }),
        Image.configure({
            inline: false,
            allowBase64: false,
        }),
        Link.configure({
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer',
            },
        }),
        Youtube.configure({
            width: 640,
            height: 360,
            nocookie: true,
        }),
        Underline,
        TextStyle,
        Color,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
    ], []);

    // Image upload handler — used by toolbar, drag-drop, and paste
    const handleImageFile = useCallback(async (file, editorInstance) => {
        const activeEditor = editorInstance || editor;
        if (!activeEditor) return;

        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await uploadFile(formData);
            const imageUrl = response.data;

            if (imageUrl) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
                const fullUrl = imageUrl.startsWith('http')
                    ? imageUrl
                    : `${apiUrl}/api/v1/files/download/${imageUrl}`;
                activeEditor.chain().focus().setImage({ src: fullUrl }).run();
            }
        } catch (err) {
            console.error('[EditorForm] Image upload failed:', err);
            alert('Image upload failed. Please try again.');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const editor = useEditor({
        extensions,
        content: content || '',
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            // Guard: setContent must be a function (BUG-TIPTAP-V3: `a is not a function`)
            if (typeof setContent === 'function') {
                setContent(html);
            }

            // Update word count
            const text = ed.state.doc.textContent;
            const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
            setWordCount(words);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4',
            },
            handleKeyDown: (view, event) => {
                // Ctrl+S → trigger auto-save
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    if (typeof handleAutoSave === 'function') handleAutoSave();
                    return true;
                }
                return false;
            },
            handlePaste: (view, event) => {
                // Handle paste-image from clipboard
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        event.preventDefault();
                        const file = items[i].getAsFile();
                        if (file) handleImageFile(file);
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event) => {
                // Handle drag-and-drop image
                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return false;

                const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
                if (imageFile) {
                    event.preventDefault();
                    handleImageFile(imageFile);
                    return true;
                }
                return false;
            },
        },
    });

    // Sync content from parent (e.g., when loading existing post)
    useEffect(() => {
        if (editor && !editor.isDestroyed && content) {
            const currentContent = editor.getHTML();
            // Only update if content actually changed to avoid infinite loop
            if (content !== currentContent && content !== '<p></p>' && content.length > 0) {
                // Use a timeout to avoid the setContent crash during React render cycle
                const timer = setTimeout(() => {
                    if (!editor.isDestroyed) {
                        editor.commands.setContent(content, false);
                    }
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

    // Expose editor methods to parent via ref
    useEffect(() => {
        if (editor && editorRef) {
            editorRef.current = {
                getHTML: () => editor.getHTML(),
                getJSON: () => editor.getJSON(),
                getText: () => editor.state.doc.textContent,
            };
        }
    }, [editor, editorRef]);

    // Toolbar action handlers
    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageFile(file);
        e.target.value = '';
    };

    const handleYoutubeEmbed = () => {
        const url = prompt('Enter YouTube video URL:');
        if (url && editor) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const handleLinkInsert = () => {
        if (!editor) return;

        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        const url = prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
        }
    };

    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
            {/* Toolbar */}
            <MenuBar
                editor={editor}
                onImageUpload={handleImageUploadClick}
                onYoutubeEmbed={handleYoutubeEmbed}
                onLinkInsert={handleLinkInsert}
            />

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Editor Content Area */}
            <div
                className={`relative transition-colors ${isDragging ? 'bg-sky-50 ring-2 ring-sky-300 ring-inset' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={() => setIsDragging(false)}
            >
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-sky-50/80 z-10 pointer-events-none">
                        <p className="text-sky-700 font-bold text-sm">Drop image to upload</p>
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
                <span>{wordCount} words · ~{readingTime} min read</span>
                <span className="text-slate-400">Ctrl+S to save · Drag images to upload</span>
            </div>
        </div>
    );
};

export default EditorForm;
