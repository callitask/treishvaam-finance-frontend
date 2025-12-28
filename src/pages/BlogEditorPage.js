import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// REMOVED: import imageCompression from 'browser-image-compression'; 
// Enterprise Grade: We now rely on the Backend (Java 21/Virtual Threads) for compression.
import { getPost, createPost, updatePost, uploadFile, getCategories, addCategory, API_URL, createDraft, updateDraft } from '../apiConfig';

// Import New Utils
import { canvasToBlob } from '../utils/editorUtils';

// Import New Modals
import CropModal from '../components/BlogEditor/modals/CropModal';
import LockChoiceModal from '../components/BlogEditor/modals/LockChoiceModal';
import AddFromPostModal from '../components/BlogEditor/modals/AddFromPostModal';

// Import New Sidebar Panels
import MetaPanel from '../components/BlogEditor/MetaPanel';
import SeoPanel from '../components/BlogEditor/SeoPanel';
import CategoryPanel from '../components/BlogEditor/CategoryPanel';
import PlacementPanel from '../components/BlogEditor/PlacementPanel';
import ThumbnailPanel from '../components/BlogEditor/thumbnail/ThumbnailPanel';
import CoverImagePanel from '../components/BlogEditor/CoverImagePanel';
import PublishPanel from '../components/BlogEditor/PublishPanel';

// Import New Main Content Component
import EditorForm from '../components/BlogEditor/EditorForm';

// MAIN COMPONENT
const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // STATE
    const [postId, setPostId] = useState(null);
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

    // --- SEO & SNIPPET STATE ---
    const [customSnippet, setCustomSnippet] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');

    const [coverImageAltText, setCoverImageAltText] = useState('');
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

    // --- NEW PLACEMENT STATE ---
    const [displaySection, setDisplaySection] = useState('STANDARD');
    const [postUserFriendlySlug, setPostUserFriendlySlug] = useState('');

    // REFS
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
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

                    // Populate New Fields
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
                    if (categoriesRes.data?.length > 0) {
                        setSelectedCategory(categoriesRes.data[0]);
                    }
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
            const editorContent = editorRef.current ? editorRef.current.getContents(true) : content;
            const draftData = { title, content: editorContent, customSnippet, metaDescription, keywords };
            if (postId) {
                await updateDraft(postId, draftData);
            } else {
                const response = await createDraft(draftData);
                setPostId(response.data.id);
                navigate(`/dashboard/blog/edit/${response.data.userFriendlySlug}/${response.data.id}`, { replace: true });
            }
            setSaveStatus('Saved');
        } catch (err) {
            setSaveStatus('Error');
            console.error("Auto-save failed:", err);
        }
    }, [title, content, customSnippet, metaDescription, keywords, postId, navigate]);

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
        if (pendingCrop) {
            addCroppedImageToStory(pendingCrop.canvas);
        }
        setLockChoiceModalOpen(false);
        setPendingCrop(null);
    }

    const addCroppedImageToStory = async (canvas) => {
        const croppedBlob = await canvasToBlob(canvas);
        // Enterprise Fix: No client-side compression. Send as PNG.
        const finalFile = new File([croppedBlob], `thumbnail-${Date.now()}.png`, { type: 'image/png' });
        const previewUrl = URL.createObjectURL(finalFile);
        const newThumbnail = {
            id: `new-${Date.now()}`,
            preview: previewUrl,
            altText: '',
            source: 'new',
            file: finalFile,
        };
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
            // Enterprise Fix: No client-side compression. Send as PNG.
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
        if (!editorRef.current) return;
        const editorContent = editorRef.current.getContents(true);
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
        if (!editorRef.current) return setError("Editor is not yet available.");
        if (!selectedCategory) return setError("Please select a category.");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', editorRef.current.getContents(true));
        formData.append('category', selectedCategory.name);
        formData.append('featured', isFeatured);
        formData.append('customSnippet', customSnippet);
        formData.append('metaDescription', metaDescription);
        formData.append('keywords', keywords);

        // --- NEW FIELDS ---
        formData.append('seoTitle', seoTitle);
        formData.append('canonicalUrl', canonicalUrl);
        formData.append('focusKeyword', focusKeyword);
        formData.append('displaySection', displaySection);
        // ------------------

        formData.append('coverImageAltText', coverImageAltText);
        tags.forEach(tag => formData.append('tags', tag));
        if (scheduledTime) formData.append('scheduledTime', new Date(scheduledTime).toISOString());
        if (finalCoverFile) formData.append('coverImage', finalCoverFile);

        formData.append('userFriendlySlug', postUserFriendlySlug);

        if (thumbnailMode === 'story') {
            formData.append('thumbnailOrientation', thumbnailOrientation);
            const metadata = storyThumbnails.map((thumb, index) => ({
                source: thumb.source,
                fileName: thumb.source === 'new' ? thumb.file.name : null,
                url: thumb.source === 'existing' ? thumb.url : null,
                altText: thumb.altText,
                displayOrder: index
            }));
            formData.append('thumbnailMetadata', JSON.stringify(metadata));
            storyThumbnails.forEach(thumb => {
                if (thumb.source === 'new') formData.append('newThumbnails', thumb.file);
            });
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
            if (postId) {
                await updatePost(postId, formData);
            } else {
                await createPost(formData);
            }
            navigate('/dashboard/manage-posts');
        } catch (err) {
            setError('Failed to save the post. Check console for details.');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Added id and name attributes to fix the warning */}
            <input
                type="file"
                id="file-upload"
                name="file-upload"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
            />

            <AddFromPostModal images={postImagesForSelection} isOpen={isAddFromPostModalOpen} onClose={() => setAddFromPostModalOpen(false)} onSelect={handleSelectFromPost} />
            {modalState.isOpen && <CropModal src={modalState.src} type={modalState.type} onClose={() => setModalState({ isOpen: false, type: null, src: '', aspect: undefined })} onSave={handleCropSave} aspect={modalState.aspect} />}
            <LockChoiceModal isOpen={isLockChoiceModalOpen} onChoice={handleLockChoice} />

            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                {/* --- REFACTORED SIDEBAR --- */}
                <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{postId ? 'Edit Post' : 'Create New Post'}</h1>
                        <div className="text-sm">
                            {saveStatus === 'Saving...' && <span className="text-gray-500">Saving...</span>}
                            {saveStatus === 'Saved' && <span className="text-green-600">Saved</span>}
                            {saveStatus === 'Error' && <span className="text-red-600">Save Error!</span>}
                        </div>
                    </div>

                    {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

                    <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">

                        <MetaPanel
                            title={title}
                            onTitleChange={setTitle}
                            userFriendlySlug={postUserFriendlySlug}
                            onUserFriendlySlugChange={setPostUserFriendlySlug}
                        />

                        {/* Updated SEO Panel with new props */}
                        <SeoPanel
                            title={title}
                            keywords={keywords}
                            onKeywordsChange={setKeywords}
                            metaDescription={metaDescription}
                            onMetaDescriptionChange={setMetaDescription}
                            customSnippet={customSnippet}
                            onCustomSnippetChange={setCustomSnippet}
                            // New Props
                            seoTitle={seoTitle}
                            onSeoTitleChange={setSeoTitle}
                            canonicalUrl={canonicalUrl}
                            onCanonicalUrlChange={setCanonicalUrl}
                            focusKeyword={focusKeyword}
                            onFocusKeywordChange={setFocusKeyword}
                        />

                        <CategoryPanel
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            allCategories={allCategories}
                            showNewCategoryInput={showNewCategoryInput}
                            onShowNewCategoryToggle={() => setShowNewCategoryInput(!showNewCategoryInput)}
                            newCategoryName={newCategoryName}
                            onNewCategoryNameChange={setNewCategoryName}
                            onAddNewCategory={handleAddNewCategory}
                        />

                        {/* REPLACED LayoutPanel WITH PlacementPanel */}
                        <PlacementPanel
                            displaySection={displaySection}
                            onDisplaySectionChange={setDisplaySection}
                            tags={tags}
                            onTagsChange={setTags}
                        />

                        <ThumbnailPanel
                            thumbnailMode={thumbnailMode}
                            onThumbnailModeChange={setThumbnailMode}
                            thumbPreview={thumbPreview}
                            thumbnailAltText={thumbnailAltText}
                            onThumbnailAltTextChange={setThumbnailAltText}
                            onUploadSingleClick={() => {
                                fileInputRef.current.multiple = false;
                                fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'single-thumbnail');
                                fileInputRef.current.click();
                            }}
                            storyThumbnails={storyThumbnails}
                            setStoryThumbnails={setStoryThumbnails}
                            onAddFromPostClick={handleAddFromPostClick}
                            onUploadStoryClick={() => {
                                fileInputRef.current.multiple = false;
                                fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'story-thumbnail', lockedAspectRatio);
                                fileInputRef.current.click();
                            }}
                        />

                        <CoverImagePanel
                            coverPreview={coverPreview}
                            coverImageAltText={coverImageAltText}
                            onCoverImageAltTextChange={setCoverImageAltText}
                            onUploadCoverClick={() => {
                                fileInputRef.current.multiple = false;
                                fileInputRef.current.onchange = (e) => onSelectFile(e, 'cover');
                                fileInputRef.current.click();
                            }}
                        />

                        <PublishPanel
                            scheduledTime={scheduledTime}
                            onScheduledTimeChange={setScheduledTime}
                            isFeatured={isFeatured}
                            onIsFeaturedChange={setIsFeatured}
                            isUpdating={!!postId}
                        />

                    </form>
                </div>

                {/* EDITOR */}
                <EditorForm
                    content={content}
                    onContentChange={setContent}
                    editorRef={editorRef}
                    onImageUploadBefore={handleImageUploadBefore}
                    onLoad={() => {
                        if (editorRef.current && content && !isContentLoaded.current) {
                            isContentLoaded.current = true;
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default BlogEditorPage;