/**
 * AI-CONTEXT:
 * Purpose: Full rich text editor and content management system for posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/navigation.
 * - EDITED: Replaced `editorRef.current.getContents(true)` with `editorRef.current.getHTML()` to fix publishing crash with Tiptap.
 * - EDITED (Phase 7 - Cloudflare UI Overhaul):
 * • Redesigned the container to implement a "Zen-mode" canvas layout.
 * • Stripped heavy panel borders, drop-shadows, and bright colors.
 * • Implemented high-density monochromatic sidebar (`w-1/4`, `text-[11px]`) for meta controls.
 * - EDITED (Phase 8 - Video Infrastructure Frontend):
 * • Integrated `VideoPanel` component to support Enterprise HLS video uploads.
 * • Added dedicated `videoInputRef` and FormData appending logic to pass `.mp4`/`.mov` files to the backend transcoder queue.
 * 
 * - EDITED (Phase 4 - Zen Mode UI & Video Payload State Lifting):
 * • Refactored the 7 static configuration panels into collapsible Headless UI-style accordions to reduce visual noise.
 * • Scaled grid to strict 75/25 split and removed nested scrollbars to optimize canvas space.
 * • Added `onVideoFileSelect={setVideoFile}` to `EditorForm` to capture the raw binary from the Tiptap toolbar and sync it with the master `FormData` payload.
 *
 * - EDITED (Phase 5 - Incident 109 CMS Blob Leak Resolution):
 * • Intercepted `handleSubmit` to isolate and resolve the `blob:` URL database leak.
 * • Why: Tiptap preview injected local ephemeral `blob:https://...` URLs. Previously, `getHTML()` extracted this raw local string and persisted it to the backend, breaking public playback. The submit flow now detects local blobs, uploads the raw video binary to the server first, awaits the canonical MinIO/CDN URL, executes a Regex replacement on the HTML string, and only then submits the sanitized payload.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPost, createPost, updatePost, uploadFile, getCategories, addCategory, API_URL, createDraft, updateDraft } from '../apiConfig';

import { canvasToBlob } from '../utils/editorUtils';
import CropModal from '../components/BlogEditor/modals/CropModal';
import LockChoiceModal from '../components/BlogEditor/modals/LockChoiceModal';
import AddFromPostModal from '../components/BlogEditor/modals/AddFromPostModal';
import MetaPanel from '../components/BlogEditor/MetaPanel';
import SeoPanel from '../components/BlogEditor/SeoPanel';
import CategoryPanel from '../components/BlogEditor/CategoryPanel';
import PlacementPanel from '../components/BlogEditor/PlacementPanel';
import ThumbnailPanel from '../components/BlogEditor/thumbnail/ThumbnailPanel';
import CoverImagePanel from '../components/BlogEditor/CoverImagePanel';
import VideoPanel from '../components/BlogEditor/VideoPanel';
import PublishPanel from '../components/BlogEditor/PublishPanel';
import EditorForm from '../components/BlogEditor/EditorForm';
import { FaCheck, FaExclamationTriangle, FaPenNib } from 'react-icons/fa';

// --- Accordion Wrapper Component ---
const SidebarAccordion = ({ title, defaultOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200 bg-white">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-3 px-5 hover:bg-slate-50 transition-colors focus:outline-none"
            >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{title}</span>
                <span className="text-slate-400 text-[10px]">{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && <div className="px-5 pb-5 pt-2">{children}</div>}
        </div>
    );
};

const BlogEditorPage = () => {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();

    const [postId, setPostId] = useState(null);
    const [version, setVersion] = useState(null);
    const [saveStatus, setSaveStatus] = useState('Idle');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: null, src: '', aspect: undefined });
    const [scheduledTime, setScheduledTime] = useState('');
    const [customSnippet, setCustomSnippet] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [coverImageAltText, setCoverImageAltText] = useState('');

    // Video State
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');

    const [thumbnailMode, setThumbnailMode] = useState('single');
    const [storyThumbnails, setStoryThumbnails] = useState([]);
    const [thumbnailOrientation, setThumbnailOrientation] = useState(null);
    const [lockedAspectRatio, setLockedAspectRatio] = useState(null);
    const [isAddFromPostModalOpen, setAddFromPostModalOpen] = useState(false);
    const [postImagesForSelection, setPostImagesForSelection] = useState([]);
    const [thumbPreview, setThumbPreview] = useState('');
    const [finalThumbFile, setFinalThumbFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [finalCoverFile, setFinalCoverFile] = useState(null);
    const [sunEditorUploadHandler, setSunEditorUploadHandler] = useState(null);
    const [thumbnailAltText, setThumbnailAltText] = useState('');
    const [isLockChoiceModalOpen, setLockChoiceModalOpen] = useState(false);
    const [pendingCrop, setPendingCrop] = useState(null);
    const [displaySection, setDisplaySection] = useState('STANDARD');
    const [postUserFriendlySlug, setPostUserFriendlySlug] = useState('');

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const isContentLoaded = useRef(false);
    const autoSaveTimer = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesRes = await getCategories();
                if (Array.isArray(categoriesRes.data)) setAllCategories(categoriesRes.data);

                if (id) {
                    const postRes = await getPost(id);
                    const post = postRes.data;
                    setPostId(post.id);
                    setVersion(post.version);
                    setTitle(post.title);
                    setContent(post.content);

                    if (post.category && categoriesRes.data) {
                        const currentCategory = categoriesRes.data.find(c => c.name === post.category.name);
                        setSelectedCategory(currentCategory || null);
                    }

                    setTags(post.tags || []);
                    setIsFeatured(post.featured);
                    setCustomSnippet(post.customSnippet || '');
                    setMetaDescription(post.metaDescription || '');
                    setKeywords(post.keywords || '');
                    setSeoTitle(post.seoTitle || '');
                    setCanonicalUrl(post.canonicalUrl || '');
                    setFocusKeyword(post.focusKeyword || '');
                    setDisplaySection(post.displaySection || 'STANDARD');
                    setCoverImageAltText(post.coverImageAltText || '');
                    setPostUserFriendlySlug(post.userFriendlySlug || '');

                    if (post.thumbnails && post.thumbnails.length > 0) {
                        setThumbnailMode('story');
                        const orientation = post.thumbnailOrientation || 'landscape';
                        setThumbnailOrientation(orientation);
                        setLockedAspectRatio(orientation === 'landscape' ? 16 / 9 : 4 / 5);
                        const loadedThumbnails = post.thumbnails.map(thumb => ({
                            id: thumb.id,
                            preview: `${API_URL}/api/uploads/${thumb.imageUrl}-small.webp`,
                            altText: thumb.altText || '',
                            source: 'existing',
                            url: thumb.imageUrl,
                            file: null
                        })).sort((a, b) => a.displayOrder - b.displayOrder);
                        setStoryThumbnails(loadedThumbnails);
                    }
                    if (post.coverImageUrl) setCoverPreview(`${API_URL}/api/uploads/${post.coverImageUrl}.webp`);
                    if (post.scheduledTime) setScheduledTime(new Date(post.scheduledTime).toISOString().slice(0, 16));
                } else {
                    if (categoriesRes.data?.length > 0) setSelectedCategory(categoriesRes.data[0]);
                }
            } catch (err) {
                setError('Failed to load initial data.');
                console.error(err);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleAutoSave = useCallback(async () => {
        if (!title.trim() && !content.trim()) return;
        setSaveStatus('Saving...');
        try {
            const editorContent = editorRef.current && typeof editorRef.current.getHTML === 'function'
                ? editorRef.current.getHTML()
                : content;

            const draftData = { title, content: editorContent, customSnippet, metaDescription, keywords, version };
            if (postId) {
                const res = await updateDraft(postId, draftData);
                if (res.data && res.data.version) setVersion(res.data.version);
            } else {
                const response = await createDraft(draftData);
                setPostId(response.data.id);
                if (response.data.version) setVersion(response.data.version);
                router.replace(`/dashboard/blog/edit/${response.data.userFriendlySlug}/${response.data.id}`);
            }
            setSaveStatus('Saved');
        } catch (err) {
            setSaveStatus('Error');
            if (err.response && err.response.status === 409) {
                setError("Conflict detected. Please refresh the page.");
            }
        }
    }, [title, content, customSnippet, metaDescription, keywords, postId, router, version]);

    useEffect(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => handleAutoSave(), 2000);
        return () => clearTimeout(autoSaveTimer.current);
    }, [title, content, customSnippet, metaDescription, keywords, handleAutoSave]);

    const onSelectFile = (e, type, aspect) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setModalState({ isOpen: true, type, src: reader.result?.toString() || '', aspect }));
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = null;
    };

    const handleVideoFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
        e.target.value = null;
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoPreview('');
    };

    const handleImageUploadBefore = (files, info, uploadHandler) => {
        const file = files[0];
        if (!file) return;
        setSunEditorUploadHandler(() => uploadHandler);
        const reader = new FileReader();
        reader.addEventListener('load', () => setModalState({ isOpen: true, type: 'suneditor', src: reader.result?.toString() || '' }));
        reader.readAsDataURL(file);
        return false;
    };

    const handleLockChoice = (choice) => {
        const orientation = choice;
        const aspect = orientation === 'landscape' ? 16 / 9 : 4 / 5;
        setThumbnailOrientation(orientation);
        setLockedAspectRatio(aspect);
        if (pendingCrop) addCroppedImageToStory(pendingCrop.canvas);
        setLockChoiceModalOpen(false);
        setPendingCrop(null);
    }

    const addCroppedImageToStory = async (canvas) => {
        const croppedBlob = await canvasToBlob(canvas);
        const finalFile = new File([croppedBlob], `thumbnail-${Date.now()}.png`, { type: 'image/png' });
        const previewUrl = URL.createObjectURL(finalFile);
        const newThumbnail = { id: `new-${Date.now()}`, preview: previewUrl, altText: '', source: 'new', file: finalFile };
        setStoryThumbnails(prev => [...prev, newThumbnail]);
    }

    const handleCropSave = async (canvas, cropDetails) => {
        setModalState({ isOpen: false, type: null, src: '', aspect: undefined });
        if (modalState.type === 'story-thumbnail') {
            if (!thumbnailOrientation) {
                const { width, height } = cropDetails;
                const aspect = width / height;
                const isSquare = aspect > 0.95 && aspect < 1.05;
                if (isSquare) {
                    setPendingCrop({ canvas });
                    setLockChoiceModalOpen(true);
                    return;
                } else {
                    const orientation = width > height ? 'landscape' : 'portrait';
                    setThumbnailOrientation(orientation);
                    setLockedAspectRatio(aspect);
                    addCroppedImageToStory(canvas);
                }
            } else {
                addCroppedImageToStory(canvas);
            }
        } else {
            const croppedBlob = await canvasToBlob(canvas);
            const finalFile = new File([croppedBlob], "image.png", { type: 'image/png' });
            const previewUrl = URL.createObjectURL(finalFile);

            if (modalState.type === 'single-thumbnail') {
                setFinalThumbFile(finalFile);
                setThumbPreview(previewUrl);
            } else if (modalState.type === 'cover') {
                setFinalCoverFile(finalFile);
                setCoverPreview(previewUrl);
            } else if (modalState.type === 'suneditor' && sunEditorUploadHandler) {
                const formData = new FormData();
                formData.append('file', finalFile, 'image.png');
                uploadFile(formData).then(res => sunEditorUploadHandler(res.data)).catch(err => {
                    alert("Image upload failed in editor.");
                    sunEditorUploadHandler();
                });
            }
        }
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName) return;
        const isDuplicate = allCategories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase());
        if (isDuplicate) return alert('Category name cannot be a duplicate.');
        try {
            const response = await addCategory({ name: newCategoryName });
            setAllCategories([...allCategories, response.data]);
            setSelectedCategory(response.data);
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (err) {
            setError('Failed to add new category.');
            console.error(err);
        }
    };

    const handleAddFromPostClick = () => {
        if (!editorRef.current || typeof editorRef.current.getHTML !== 'function') return;
        const editorContent = editorRef.current.getHTML();
        const parser = new DOMParser();
        const doc = parser.parseFromString(editorContent, 'text/html');
        const images = Array.from(doc.querySelectorAll('img')).map(img => img.src);
        setPostImagesForSelection(images);
        setAddFromPostModalOpen(true);
    };

    const handleSelectFromPost = (selectedUrls) => {
        const newThumbnails = selectedUrls.map((url) => ({
            id: `existing-${url}-${Date.now()}`,
            preview: url,
            altText: '',
            source: 'existing',
            file: null,
            url: new URL(url).pathname.replace('/api/uploads/', ''),
        }));
        setStoryThumbnails([...storyThumbnails, ...newThumbnails]);
        setAddFromPostModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!editorRef.current || typeof editorRef.current.getHTML !== 'function') return setError("Editor is not yet available.");
        if (!selectedCategory) return setError("Please select a category.");

        setSaveStatus('Saving...');
        let finalContent = editorRef.current.getHTML();

        // --- CMS BLOB INGESTION FLAW INTERCEPT ---
        // If a video file exists in state AND the raw HTML contains an ephemeral blob URL
        if (videoFile && finalContent.includes('blob:')) {
            try {
                // 1. Isolate and upload the video binary first
                const videoFormData = new FormData();
                videoFormData.append('file', videoFile);

                const uploadRes = await uploadFile(videoFormData);
                const serverVideoUrl = uploadRes.data; // e.g., "api/v1/uploads/raw/video.mp4"

                // 2. Sanitize the HTML: Search and destroy the local blob string
                // Replacing all instances of `src="blob:https://..."` with the permanent server URL.
                finalContent = finalContent.replace(/src="blob:[^"]+"/g, `src="${serverVideoUrl}"`);

            } catch (uploadErr) {
                console.error("In-content video upload failed", uploadErr);
                setError("Failed to upload the in-content video. Please try again.");
                setSaveStatus('Error');
                return; // Halt submission if the video fails to upload
            }
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', finalContent);

        if (version !== null && version !== undefined) formData.append('version', version);
        formData.append('category', selectedCategory.name);
        formData.append('featured', isFeatured);
        formData.append('customSnippet', customSnippet);
        formData.append('metaDescription', metaDescription);
        formData.append('keywords', keywords);
        formData.append('seoTitle', seoTitle);
        formData.append('canonicalUrl', canonicalUrl);
        formData.append('focusKeyword', focusKeyword);
        formData.append('displaySection', displaySection);
        formData.append('coverImageAltText', coverImageAltText);
        formData.append('userFriendlySlug', postUserFriendlySlug);

        tags.forEach(tag => formData.append('tags', tag));
        if (scheduledTime) formData.append('scheduledTime', new Date(scheduledTime).toISOString());

        if (finalCoverFile) formData.append('coverImage', finalCoverFile);

        // We only append videoFile here if it's the COVER video (not in-content), 
        // as the backend handles cover videos natively.
        if (videoFile && !finalContent.includes(videoFile.name)) {
            formData.append('videoFile', videoFile);
        }

        if (thumbnailMode === 'story') {
            formData.append('thumbnailOrientation', thumbnailOrientation);
            const metadata = storyThumbnails.map((thumb, index) => ({
                source: thumb.source, fileName: thumb.source === 'new' ? thumb.file.name : null,
                url: thumb.source === 'existing' ? thumb.url : null, altText: thumb.altText, displayOrder: index
            }));
            formData.append('thumbnailMetadata', JSON.stringify(metadata));
            storyThumbnails.forEach(thumb => { if (thumb.source === 'new') formData.append('newThumbnails', thumb.file); });
        } else {
            if (finalThumbFile) {
                const metadata = [{ source: 'new', fileName: 'thumbnail.png', altText: thumbnailAltText, displayOrder: 0 }];
                formData.append('thumbnailMetadata', JSON.stringify(metadata));
                formData.append('newThumbnails', finalThumbFile, 'thumbnail.png');
            } else if (thumbPreview) {
                const url = new URL(thumbPreview).pathname.replace('/api/uploads/', '').replace('-small.webp', '');
                const metadata = [{ source: 'existing', url: url, altText: thumbnailAltText, displayOrder: 0 }];
                formData.append('thumbnailMetadata', JSON.stringify(metadata));
            } else {
                formData.append('thumbnailMetadata', JSON.stringify([]));
            }
        }

        try {
            if (postId) await updatePost(postId, formData);
            else await createPost(formData);
            router.push('/dashboard/manage-posts');
        } catch (err) {
            setSaveStatus('Error');
            if (err.response && err.response.status === 409) {
                if (window.confirm("CONFLICT DETECTED!\n\nSomeone else has updated this post. Click OK to reload (lose changes).")) window.location.reload();
                else setError("CRITICAL: Version conflict. Please back up your text manually.");
            } else {
                setError('Failed to save the post. Check console for details.');
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans -mx-4 sm:-mx-6 lg:-mx-8 -my-6">
            <input type="file" id="file-upload" name="file-upload" ref={fileInputRef} className="hidden" accept="image/*" />
            <input type="file" id="video-upload" name="video-upload" ref={videoInputRef} className="hidden" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoFileChange} />

            <AddFromPostModal images={postImagesForSelection} isOpen={isAddFromPostModalOpen} onClose={() => setAddFromPostModalOpen(false)} onSelect={handleSelectFromPost} />
            {modalState.isOpen && <CropModal src={modalState.src} type={modalState.type} onClose={() => setModalState({ isOpen: false, type: null, src: '', aspect: undefined })} onSave={handleCropSave} aspect={modalState.aspect} />}
            <LockChoiceModal isOpen={isLockChoiceModalOpen} onChoice={handleLockChoice} />

            <div className="flex flex-col md:flex-row flex-grow overflow-hidden h-full">

                {/* Meta Configuration Sidebar (25%) */}
                <div className="w-full md:w-1/4 xl:w-[25%] bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar shadow-sm z-10" style={{ maxHeight: '100vh' }}>
                    <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-20 px-5 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
                        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700">
                            <FaPenNib className="text-slate-400 mr-2" />
                            {postId ? 'Update Post' : 'New Post'}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                            {saveStatus === 'Saving...' && <span className="text-slate-400 animate-pulse">Saving...</span>}
                            {saveStatus === 'Saved' && <span className="text-emerald-600 flex items-center"><FaCheck className="mr-1" /> Saved</span>}
                            {saveStatus === 'Error' && <span className="text-red-500 flex items-center"><FaExclamationTriangle className="mr-1" /> Error</span>}
                        </div>
                    </div>

                    {error && <div className="mx-5 mt-4 p-2 bg-red-50 border-l-2 border-red-500 text-xs text-red-700">{error}</div>}

                    <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col flex-grow bg-slate-100">
                        <SidebarAccordion title="Meta & Routing" defaultOpen={true}>
                            <MetaPanel title={title} onTitleChange={setTitle} userFriendlySlug={postUserFriendlySlug} onUserFriendlySlugChange={setPostUserFriendlySlug} />
                        </SidebarAccordion>

                        <SidebarAccordion title="Category & Layout" defaultOpen={false}>
                            <CategoryPanel selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} allCategories={allCategories} showNewCategoryInput={showNewCategoryInput} onShowNewCategoryToggle={() => setShowNewCategoryInput(!showNewCategoryInput)} newCategoryName={newCategoryName} onNewCategoryNameChange={setNewCategoryName} onAddNewCategory={handleAddNewCategory} />
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <PlacementPanel displaySection={displaySection} onDisplaySectionChange={setDisplaySection} tags={tags} onTagsChange={setTags} />
                            </div>
                        </SidebarAccordion>

                        <SidebarAccordion title="Media: Thumbnails" defaultOpen={false}>
                            <ThumbnailPanel thumbnailMode={thumbnailMode} onThumbnailModeChange={setThumbnailMode} thumbPreview={thumbPreview} thumbnailAltText={thumbnailAltText} onThumbnailAltTextChange={setThumbnailAltText} onUploadSingleClick={() => { fileInputRef.current.multiple = false; fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'single-thumbnail'); fileInputRef.current.click(); }} storyThumbnails={storyThumbnails} setStoryThumbnails={setStoryThumbnails} onAddFromPostClick={handleAddFromPostClick} onUploadStoryClick={() => { fileInputRef.current.multiple = false; fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'story-thumbnail', lockedAspectRatio); fileInputRef.current.click(); }} />
                        </SidebarAccordion>

                        <SidebarAccordion title="Media: Cover & Video" defaultOpen={false}>
                            <CoverImagePanel coverPreview={coverPreview} coverImageAltText={coverImageAltText} onCoverImageAltTextChange={setCoverImageAltText} onUploadCoverClick={() => { fileInputRef.current.multiple = false; fileInputRef.current.onchange = (e) => onSelectFile(e, 'cover'); fileInputRef.current.click(); }} />
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <VideoPanel videoPreview={videoPreview} onUploadVideoClick={() => videoInputRef.current?.click()} onRemoveVideo={handleRemoveVideo} />
                            </div>
                        </SidebarAccordion>

                        <SidebarAccordion title="SEO & Intelligence" defaultOpen={false}>
                            <SeoPanel title={title} keywords={keywords} onKeywordsChange={setKeywords} metaDescription={metaDescription} onMetaDescriptionChange={setMetaDescription} customSnippet={customSnippet} onCustomSnippetChange={setCustomSnippet} seoTitle={seoTitle} onSeoTitleChange={setSeoTitle} canonicalUrl={canonicalUrl} onCanonicalUrlChange={setCanonicalUrl} focusKeyword={focusKeyword} onFocusKeywordChange={setFocusKeyword} />
                        </SidebarAccordion>

                        <SidebarAccordion title="Publish Settings" defaultOpen={true}>
                            <PublishPanel scheduledTime={scheduledTime} onScheduledTimeChange={setScheduledTime} isFeatured={isFeatured} onIsFeaturedChange={setIsFeatured} isUpdating={!!postId} />
                        </SidebarAccordion>
                    </form>
                </div>

                {/* Zen-Mode Rich Text Editor Canvas (75%) */}
                <div className="w-full md:w-3/4 xl:w-[75%] bg-slate-200/50 flex flex-col relative overflow-y-auto custom-scrollbar p-0 sm:p-6 lg:p-8">
                    <div className="w-full max-w-5xl mx-auto h-full min-h-[700px] flex flex-col shadow-sm rounded-lg border border-slate-200 bg-white">
                        <EditorForm
                            content={content}
                            setContent={setContent}
                            editorRef={editorRef}
                            handleAutoSave={handleAutoSave}
                            onImageUploadBefore={handleImageUploadBefore}
                            onLoad={() => { if (editorRef.current && content && !isContentLoaded.current) isContentLoaded.current = true; }}
                            onVideoFileSelect={setVideoFile}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditorPage;