"use client";
/**
 * AI-CONTEXT:
 * Purpose: Rich text editor component for the Blog/News CMS.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Replaced `suneditor-react` with `@tiptap/react` and `@tiptap/starter-kit`.
 * • Added `"use client";` directive.
 * • Built a custom MenuBar to replicate the standard formatting controls.
 * • Why: Phase 5 Next.js Migration (Library Swap). Resolves Cloudflare Pages build crash caused by missing suneditor dependencies.
 */

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 mb-2 p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors font-bold ${editor.isActive('bold') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors italic ${editor.isActive('italic') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                I
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors line-through ${editor.isActive('strike') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                S
            </button>
            <div className="w-px h-8 bg-slate-300 mx-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                H3
            </button>
            <div className="w-px h-8 bg-slate-300 mx-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors ${editor.isActive('bulletList') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors ${editor.isActive('orderedList') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                1. List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-3 py-1.5 text-sm border rounded shadow-sm transition-colors ${editor.isActive('blockquote') ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
            >
                Quote
            </button>
            <div className="w-px h-8 bg-slate-300 mx-1"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="px-3 py-1.5 text-sm border rounded shadow-sm transition-colors bg-white text-slate-700 hover:bg-slate-100 border-slate-300 disabled:opacity-50"
            >
                Undo
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="px-3 py-1.5 text-sm border rounded shadow-sm transition-colors bg-white text-slate-700 hover:bg-slate-100 border-slate-300 disabled:opacity-50"
            >
                Redo
            </button>
        </div>
    );
};

const EditorForm = ({ content, onContentChange, editorRef, onImageUploadBefore, onLoad }) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            // Pass the HTML string back to the parent component
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                // Tailwind Typography (prose) handles the internal WYSIWYG styling
                className: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4 bg-white border border-slate-200 rounded-b-lg shadow-inner',
            },
        },
    });

    // Sync external refs and onload handlers
    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }
        if (onLoad && editor) {
            onLoad(editor);
        }
    }, [editor, editorRef, onLoad]);

    // Handle external content updates (e.g., loading a draft)
    useEffect(() => {
        if (editor && content !== undefined && content !== editor.getHTML()) {
            // We only set content externally if the user hasn't typed it to avoid cursor jumping
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    return (
        <div className="w-full md:w-2/3 p-6 flex flex-col h-full overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <label className="block text-slate-800 dark:text-slate-200 font-bold mb-3 uppercase tracking-wider text-sm">
                Article Body Content
            </label>
            <div className="flex-grow flex flex-col h-full">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="flex-grow flex flex-col" />
            </div>
        </div>
    );
};

export default EditorForm;