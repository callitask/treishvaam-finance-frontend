import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'suneditor/dist/css/suneditor.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import { getPostBySlug, createPost, updatePost, uploadFile, getCategories, addCategory, API_URL, createDraft, updateDraft } from '../apiConfig';
import { buttonList } from 'suneditor-react';

const SunEditor = React.lazy(() => import('suneditor-react'));

// HELPER COMPONENTS (TagsInput, canvasToBlob, canvasPreview, CropModal, etc.)
const TagsInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const addTag = () => {
        const newTag = inputValue.trim().replace(/,/g, '');
        if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
        setInputValue('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };
    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <div key={tag} className="bg-sky-100 text-sky-800 text-sm font-semibold px-2 py-1 rounded-full flex items-center">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-sky-600 hover:text-sky-900">&times;</button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Add a tag" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-200" />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Add</button>
            </div>
        </div>
    );
};

const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/webp', 0.9));

function canvasPreview(image, canvas, crop) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !crop.width || !crop.height) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    ctx.drawImage(image, cropX, cropY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);
}

const CropModal = ({ src, type, onClose, onSave, aspect }) => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    useEffect(() => {
        if (completedCrop?.width && imgRef.current && canvasRef.current) {
            canvasPreview(imgRef.current, canvasRef.current, completedCrop);
        }
    }, [completedCrop]);
    const handleSave = () => {
        if (!completedCrop || !canvasRef.current) return;
        onSave(canvasRef.current, completedCrop);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Crop Image</h3>
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect}>
                        <img ref={imgRef} alt="Crop" src={src} />
                    </ReactCrop>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Save</button>
                </div>
            </div>
        </div>
    );
};

const LockChoiceModal = ({ isOpen, onChoice }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-4">Square Image Detected</h3>
                <p className="text-gray-600 mb-6">For subsequent images in this story, how should they be cropped?</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => onChoice('landscape')} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Lock Height (Landscape Style)</button>
                    <button onClick={() => onChoice('portrait')} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Lock Width (Portrait Style)</button>
                </div>
            </div>
        </div>
    )
}

const AddFromPostModal = ({ images, isOpen, onClose, onSelect }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    if (!isOpen) return null;
    const toggleSelection = (url) => setSelectedImages(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
                <h3 className="text-xl font-bold mb-4">Select Images from Post</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
                    {images.map((url, index) => (
                        <div key={index} onClick={() => toggleSelection(url)} className={`relative rounded-lg overflow-hidden cursor-pointer border-4 ${selectedImages.includes(url) ? 'border-sky-500' : 'border-transparent'}`}>
                            <img src={url} alt={`Post content ${index + 1}`} className="w-full h-full object-cover" />
                            {selectedImages.includes(url) && (<div className="absolute inset-0 bg-sky-500 bg-opacity-50 flex items-center justify-center text-white text-2xl">✓</div>)}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={() => {onSelect(selectedImages); setSelectedImages([]);}} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Add Selected</button>
                </div>
            </div>
        </div>
    );
};

const DraggableThumbnail = ({ id, thumbnail, index, moveThumbnail, onRemove, onAltTextChange }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: 'thumbnail',
        hover(item) {
            if (!ref.current || item.index === index) return;
            moveThumbnail(item.index, index);
            item.index = index;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'thumbnail',
        item: { type: 'thumbnail', id, index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="p-2 border rounded-lg bg-white flex items-start gap-3">
             <img src={thumbnail.preview} alt="preview" className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
             <div className="flex-grow">
                <input type="text" value={thumbnail.altText || ''} onChange={(e) => onAltTextChange(index, e.target.value)} placeholder="Alt text" className="w-full p-2 text-sm border border-gray-300 rounded mb-2" />
                <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-600 hover:underline">Remove</button>
             </div>
        </div>
    );
};

const StoryThumbnailManager = ({ thumbnails, setThumbnails, onUploadClick, onAddFromPostClick }) => {
    const moveThumbnail = useCallback((dragIndex, hoverIndex) => {
        setThumbnails(prev => {
            const newThumbnails = [...prev];
            const [draggedItem] = newThumbnails.splice(dragIndex, 1);
            newThumbnails.splice(hoverIndex, 0, draggedItem);
            return newThumbnails;
        });
    }, [setThumbnails]);
    const removeThumbnail = (index) => setThumbnails(prev => prev.filter((_, i) => i !== index));
    const handleAltTextChange = (index, text) => {
        setThumbnails(prev => {
            const newThumbnails = [...prev];
            newThumbnails[index].altText = text;
            return newThumbnails;
        });
    };
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {thumbnails.length > 0 ? thumbnails.map((thumb, index) => (
                        <DraggableThumbnail key={thumb.id || index} index={index} id={thumb.id || index} thumbnail={thumb} moveThumbnail={moveThumbnail} onRemove={removeThumbnail} onAltTextChange={handleAltTextChange} />
                    )) : (<p className="text-center text-gray-500 text-sm py-4">No story thumbnails yet.</p>)}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button type="button" onClick={onUploadClick} className="flex-1 flex items-center justify-center gap-2 text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload New
                    </button>
                    <button type="button" onClick={onAddFromPostClick} className="flex-1 flex items-center justify-center gap-2 text-sm p-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Add from Post
                    </button>
                </div>
            </div>
        </DndProvider>
    );
};

const generateLayoutGroupId = () => `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


// MAIN COMPONENT
const BlogEditorPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    // STATE
    const [postId, setPostId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('Idle');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, type: null, src: '', aspect: undefined });
    const [scheduledTime, setScheduledTime] = useState('');
    const [customSnippet, setCustomSnippet] = useState('');
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
    
    // --- NEW STATE FOR LAYOUT ---
    const [layoutStyle, setLayoutStyle] = useState('DEFAULT');
    const [layoutGroupId, setLayoutGroupId] = useState(null);

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
                if (slug) {
                    const postRes = await getPostBySlug(slug);
                    const post = postRes.data;
                    setPostId(post.id);
                    setTitle(post.title);
                    setContent(post.content);
                    setCategory(post.category || (categoriesRes.data?.[0]?.name || ''));
                    setTags(post.tags || []);
                    setIsFeatured(post.featured);
                    setCustomSnippet(post.customSnippet || '');
                    
                    setLayoutStyle(post.layoutStyle || 'DEFAULT');
                    setLayoutGroupId(post.layoutGroupId || null);

                    if (post.thumbnails && post.thumbnails.length > 0) {
                        setThumbnailMode('story');
                        const orientation = post.thumbnailOrientation || 'landscape';
                        setThumbnailOrientation(orientation);
                        setLockedAspectRatio(orientation === 'landscape' ? 16/9 : 4/5);
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
                    if(post.coverImageUrl) setCoverPreview(`${API_URL}/api/uploads/${post.coverImageUrl}.webp`);
                    if (post.scheduledTime) setScheduledTime(new Date(post.scheduledTime).toISOString().slice(0, 16));
                } else {
                    if (categoriesRes.data?.length > 0) setCategory(categoriesRes.data[0].name);
                }
            } catch (err) {
                setError('Failed to load initial data.');
                console.error(err);
            }
        };
        fetchInitialData();
    }, [slug]);

    const handleAutoSave = useCallback(async () => {
        if (!title.trim() && !content.trim()) return;
        setSaveStatus('Saving...');
        try {
            const editorContent = editorRef.current ? editorRef.current.getContents(true) : content;
            const draftData = { title, content: editorContent, customSnippet };
            if (postId) {
                await updateDraft(postId, draftData);
            } else {
                const response = await createDraft(draftData);
                setPostId(response.data.id);
                navigate(`/dashboard/blog/edit/${response.data.slug}`, { replace: true });
            }
            setSaveStatus('Saved');
        } catch (err) {
            setSaveStatus('Error');
            console.error("Auto-save failed:", err);
        }
    }, [title, content, customSnippet, postId, navigate]);

    useEffect(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => handleAutoSave(), 2000);
        return () => clearTimeout(autoSaveTimer.current);
    }, [title, content, customSnippet, handleAutoSave]);


    const compressImage = async (file) => {
        if (!file) return null;
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
        try { return await imageCompression(file, options); } catch (e) { return file; }
    };
    
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
        const aspect = orientation === 'landscape' ? 16/9 : 4/5;
        setThumbnailOrientation(orientation);
        setLockedAspectRatio(aspect);
        if(pendingCrop) {
            addCroppedImageToStory(pendingCrop.canvas);
        }
        setLockChoiceModalOpen(false);
        setPendingCrop(null);
    }

    const addCroppedImageToStory = async (canvas) => {
        const croppedBlob = await canvasToBlob(canvas);
        const finalFile = await compressImage(croppedBlob);
        const previewUrl = URL.createObjectURL(finalFile);
        const newThumbnail = {
            id: `new-${Date.now()}`,
            preview: previewUrl,
            altText: '',
            source: 'new',
            file: new File([finalFile], `thumbnail-${Date.now()}.webp`, { type: 'image/webp' }),
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
                    setPendingCrop({canvas});
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
            const finalFile = await compressImage(croppedBlob);
            const previewUrl = URL.createObjectURL(finalFile);
            if (modalState.type === 'single-thumbnail') {
                setFinalThumbFile(finalFile);
                setThumbPreview(previewUrl);
            } else if (modalState.type === 'cover') {
                setFinalCoverFile(finalFile);
                setCoverPreview(previewUrl);
            } else if (modalState.type === 'suneditor' && sunEditorUploadHandler) {
                const formData = new FormData();
                formData.append('file', finalFile, 'image.webp');
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
            setCategory(response.data.name);
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

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', editorRef.current.getContents(true));
        formData.append('category', category);
        formData.append('featured', isFeatured);
        formData.append('customSnippet', customSnippet);
        tags.forEach(tag => formData.append('tags', tag));
        if (scheduledTime) formData.append('scheduledTime', new Date(scheduledTime).toISOString());
        if (finalCoverFile) formData.append('coverImage', finalCoverFile);
        
        formData.append('layoutStyle', layoutStyle);
        if (layoutStyle.startsWith('MULTI_COLUMN')) {
            formData.append('layoutGroupId', layoutGroupId || generateLayoutGroupId());
        } else {
            formData.append('layoutGroupId', '');
        }

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
                const metadata = [{ source: 'new', fileName: 'thumbnail.webp', altText: thumbnailAltText, displayOrder: 0 }];
                formData.append('thumbnailMetadata', JSON.stringify(metadata));
                formData.append('newThumbnails', finalThumbFile, 'thumbnail.webp');
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
    
    const handleLayoutStyleChange = (e) => {
        const newStyle = e.target.value;
        setLayoutStyle(newStyle);
        if (newStyle.startsWith('MULTI_COLUMN')) {
            if (!layoutGroupId) {
                setLayoutGroupId(generateLayoutGroupId());
            }
        } else {
            setLayoutGroupId(null);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            <AddFromPostModal images={postImagesForSelection} isOpen={isAddFromPostModalOpen} onClose={() => setAddFromPostModalOpen(false)} onSelect={handleSelectFromPost} />
            {modalState.isOpen && <CropModal src={modalState.src} type={modalState.type} onClose={() => setModalState({ isOpen: false, type: null, src: '', aspect: undefined })} onSave={handleCropSave} aspect={modalState.aspect} />}
            <LockChoiceModal isOpen={isLockChoiceModalOpen} onChoice={handleLockChoice} />

            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
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
                        
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
                        </div>

                        <div>
                            <label htmlFor="customSnippet" className="block text-gray-700 font-semibold mb-2">Custom Snippet (for SEO & Previews)</label>
                            <textarea id="customSnippet" value={customSnippet} onChange={e => setCustomSnippet(e.target.value)} rows="3" className="w-full p-2 border border-gray-300 rounded" />
                        </div>
                        
                        <div>
                            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
                            <div className="flex items-center gap-2">
                                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                    <option value="">Select a category</option>
                                    {allCategories && allCategories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} className="p-2 bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold">+</button>
                            </div>
                            {showNewCategoryInput && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" className="w-full p-2 border border-gray-300 rounded" />
                                    <button type="button" onClick={handleAddNewCategory} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Add</button>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="layoutStyle" className="block text-gray-700 font-semibold mb-2">Layout Style</label>
                            <select id="layoutStyle" value={layoutStyle} onChange={handleLayoutStyleChange} className="w-full p-2 border border-gray-300 rounded">
                                <option value="DEFAULT">Default (Masonry)</option>
                                <option value="BANNER">Banner</option>
                                <option value="MULTI_COLUMN_2">2 Column Row</option>
                                <option value="MULTI_COLUMN_3">3 Column Row</option>
                                <option value="MULTI_COLUMN_4">4 Column Row</option>
                                <option value="MULTI_COLUMN_5">5 Column Row</option>
                                <option value="MULTI_COLUMN_6">6 Column Row</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                            <TagsInput tags={tags} setTags={setTags} />
                        </div>
                        
                        <div className="my-4">
                            <label className="block text-gray-700 font-semibold mb-2">Thumbnail Mode</label>
                            <div className="flex rounded-lg p-1 bg-gray-200">
                                <button type="button" onClick={() => setThumbnailMode('single')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${thumbnailMode === 'single' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>
                                    Single Image
                                </button>
                                <button type="button" onClick={() => setThumbnailMode('story')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition ${thumbnailMode === 'story' ? 'bg-white text-sky-600 shadow' : 'text-gray-600'}`}>
                                    Story Thumbnails
                                </button>
                            </div>
                        </div>

                        {thumbnailMode === 'single' ? (
                            <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                <label className="block text-gray-700 font-semibold">Thumbnail Image</label>
                                {thumbPreview && <img src={thumbPreview} alt="Thumbnail Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                                <button type="button" onClick={() => {
                                    fileInputRef.current.multiple = false;
                                    fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'single-thumbnail');
                                    fileInputRef.current.click();
                                }} className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">Upload Thumbnail</button>
                                <div>
                                    <label htmlFor="thumbnailAltText" className="text-sm font-medium text-gray-600">Alt Text</label>
                                    <input type="text" id="thumbnailAltText" value={thumbnailAltText} onChange={e => setThumbnailAltText(e.target.value)} placeholder="Describe the image for SEO" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded" />
                                </div>
                            </div>
                        ) : (
                            <StoryThumbnailManager 
                                thumbnails={storyThumbnails} 
                                setThumbnails={setStoryThumbnails} 
                                onUploadClick={() => {
                                    fileInputRef.current.multiple = false;
                                    fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'story-thumbnail', lockedAspectRatio);
                                    fileInputRef.current.click();
                                }}
                                onAddFromPostClick={handleAddFromPostClick}
                            />
                        )}
                        
                        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                            <label className="block text-gray-700 font-semibold">Cover Image</label>
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                            <button type="button" onClick={() => {
                                fileInputRef.current.multiple = false;
                                fileInputRef.current.onchange = (e) => onSelectFile(e, 'cover');
                                fileInputRef.current.click();
                            }} className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">Upload Cover Image</button>
                        </div>
                        
                        <div>
                            <label htmlFor="scheduledTime" className="block text-gray-700 font-semibold mb-2">Schedule Publication</label>
                            <input
                                type="datetime-local"
                                id="scheduledTime"
                                value={scheduledTime}
                                onChange={e => setScheduledTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave blank to publish immediately.</p>
                        </div>

                        <div className="flex items-center">
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500" />
                            <span className="ml-2 text-gray-700">Mark as Featured</span>
                        </div>

                        <button type="submit" className="w-full bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition">
                           {postId ? 'Update Post' : 'Publish Post'}
                        </button>
                    </form>
                </div>
                <div className="w-full md:w-2/3 p-6 flex flex-col h-full overflow-y-auto">
                    <label className="block text-gray-700 font-semibold mb-2">Content</label>
                    <div className="flex-grow h-full">
                        <Suspense fallback={<div>Loading editor...</div>}>
                            <SunEditor
                                setContents={content}
                                getSunEditorInstance={(sunEditor) => { editorRef.current = sunEditor; }}
                                onImageUploadBefore={handleImageUploadBefore}
                                onLoad={() => {
                                    if (editorRef.current && content && !isContentLoaded.current) {
                                        isContentLoaded.current = true;
                                    }
                                }}
                                setOptions={{
                                    height: 'auto',
                                    minHeight: '400px',
                                    buttonList: buttonList.complex
                                }}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditorPage;