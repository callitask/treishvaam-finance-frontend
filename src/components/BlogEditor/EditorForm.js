"use client";
/**
 * AI-CONTEXT:
 * Purpose: Rich text editor component for the Blog/News CMS.
 * Scope: Full enterprise editor with all Tiptap extensions, image upload, YouTube embed,
 *   drag-drop, paste-image, BubbleMenu, word count, and keyboard shortcuts.
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
 * • Why: Phase 5 Next.js Migration (Library Swap). Resolves Cloudflare Pages build crash caused by missing suneditor dependencies.
 *
 * - EDITED:
 * • Memoized the `extensions` array passed to `useEditor`.
 * • Why: Fixes `Duplicate extension names found: ['link', 'underline']` warnings caused by React Strict Mode/Fast Refresh re-rendering the component and re-registering extensions.
 *
 * - EDITED (2026-05-15 P0-6 Advanced Editor Upgrade):
 *   • Added all installed Tiptap extensions: Image, Link, Youtube, Underline, Color, TextStyle, TextAlign.
 *   • Built full enterprise toolbar with grouped buttons: History, Text Style, Headings, Lists, Alignment, Extras.
 *   • Added BubbleMenu for floating toolbar on text selection.
 *   • Added image upload via toolbar button (hidden file input → uploadFile → setImage).
 *   • Added drag-and-drop image upload on editor wrapper.
 *   • Added paste-image from clipboard detection and upload.
 *   • Added YouTube embed via toolbar button (prompt for URL).
 *   • Added Link insert via toolbar button (inline URL input).
 *   • Added word count + reading time live counter.
 *   • Added Ctrl+S keyboard shortcut to trigger parent handleAutoSave.
 *   • Why: EditorForm only used StarterKit — none of the 7 installed extensions were active.
 *     Enterprise CMS requires full rich text editing capabilities.
 */

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { uploadFile } from '../../apiConfig';

// ═══════════════════════════════════════════════════════════════
// TOOLBAR COMPONENT
// ═══════════════════════════════════════════════════════════════
const MenuBar = ({ editor, onImageUpload, onYoutubeEmbed, onLinkInsert }) => {
    if (!editor) return null;

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
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

    const Divider = () => <div className="w-px h-7 bg-slate-300 mx-1"></div>;

    return (
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">↶</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">↷</ToolbarButton>

            <Divider />

            {/* Text Style */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
                <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
                <em>I</em>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
                <u>U</u>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                <s>S</s>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
                {'</>'}
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                H1
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                H2
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                H3
            </ToolbarButton>

            <Divider />

            {/* Lists & Blocks */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                • List
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                1. List
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
                ❝
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
                {'{ }'}
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                ―
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                ≡←
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                ≡↔
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                ≡→
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
                ≡≡
            </ToolbarButton>

            <Divider />

            {/* Color Picker */}
            <div className="relative flex items-center">
                <input
                    type="color"
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                    title="Text Color"
                    defaultValue="#000000"
                />
            </div>

            <Divider />

            {/* Extras */}
            <ToolbarButton onClick={onLinkInsert} isActive={editor.isActive('link')} title="Insert Link">
                🔗
            </ToolbarButton>
            <ToolbarButton onClick={onImageUpload} title="Upload Image">
                🖼️
            </ToolbarButton>
            <ToolbarButton onClick={onYoutubeEmbed} title="Embed YouTube Video">
                ▶️
            </ToolbarButton>
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

    // Memoize extensions to prevent re-registration on re-render
    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
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

    const editor = useEditor({
        extensions,
        content: content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setContent(html);

            // Update word count
            const text = editor.state.doc.textContent;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
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
                    if (handleAutoSave) handleAutoSave();
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
        if (editor && content && !editor.isDestroyed) {
            const currentContent = editor.getHTML();
            if (content !== currentContent && content !== '<p></p>') {
                editor.commands.setContent(content, false);
            }
        }
    }, [content, editor]);

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

    // Image upload handler
    const handleImageFile = useCallback(async (file) => {
        if (!editor) return;

        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
            const response = await uploadFile(formData);
            const imageUrl = response.data;

            if (imageUrl) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
                const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${apiUrl}/api/v1/files/download/${imageUrl}`;
                editor.chain().focus().setImage({ src: fullUrl }).run();
            }
        } catch (err) {
            console.error('[EditorForm] Image upload failed:', err);
            alert('Image upload failed. Please try again.');
        }
    }, [editor]);

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

    // Drag-and-drop visual feedback
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        setIsDragging(false);
        // The editor's handleDrop will handle the actual file
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

            {/* Bubble Menu (floating toolbar on text selection) */}
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="flex gap-1 bg-slate-900 text-white rounded-lg shadow-xl px-2 py-1.5">
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`px-2 py-0.5 text-xs rounded ${editor.isActive('bold') ? 'bg-sky-600' : 'hover:bg-slate-700'}`}
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`px-2 py-0.5 text-xs rounded ${editor.isActive('italic') ? 'bg-sky-600' : 'hover:bg-slate-700'}`}
                        >
                            <em>I</em>
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`px-2 py-0.5 text-xs rounded ${editor.isActive('underline') ? 'bg-sky-600' : 'hover:bg-slate-700'}`}
                        >
                            <u>U</u>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const url = prompt('Enter URL:');
                                if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
                            }}
                            className={`px-2 py-0.5 text-xs rounded ${editor.isActive('link') ? 'bg-sky-600' : 'hover:bg-slate-700'}`}
                        >
                            🔗
                        </button>
                    </div>
                </BubbleMenu>
            )}

            {/* Editor Content Area */}
            <div
                className={`relative transition-colors ${isDragging ? 'bg-sky-50 ring-2 ring-sky-300 ring-inset' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
