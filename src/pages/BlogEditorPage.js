import imageCompression from 'browser-image-compression';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'suneditor/dist/css/suneditor.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import StoryThumbnailManager from '../components/StoryThumbnailManager';
import { getPostBySlug, createPost, updatePost, getCategories, addCategory, API_URL } from '../apiConfig';
import { buttonList } from 'suneditor-react';

const SunEditor = React.lazy(() => import('suneditor-react'));

const TagsInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const addTag = () => {
        const newTag = inputValue.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setInputValue('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
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
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-200"
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Add</button>
            </div>
        </div>
    );
};


const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/webp', 0.9));

const CropModal = ({ src, type, onClose, onSave, aspect }) => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const [crop, setCrop] = useState();
    const [ , setCompletedCrop] = useState();

    const handleSave = () => {
        if (canvasRef.current) onSave(canvasRef.current, imgRef.current);
    };

    function canvasPreview(image, canvas, crop) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);
    }
    
    useEffect(() => {
        if (crop?.width && crop?.height && imgRef.current && canvasRef.current) {
            canvasPreview(imgRef.current, canvasRef.current, crop);
        }
    }, [crop]);

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

const AddFromPostModal = ({ images, isOpen, onClose, onSelect }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    if (!isOpen) return null;

    const toggleSelection = (url) => {
        setSelectedImages(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
                <h3 className="text-xl font-bold mb-4">Select Images from Post</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
                    {images.map((url, index) => (
                        <div key={index} onClick={() => toggleSelection(url)} className={`relative rounded-lg overflow-hidden cursor-pointer border-4 ${selectedImages.includes(url) ? 'border-sky-500' : 'border-transparent'}`}>
                            <img src={url} alt={`Post content ${index}`} className="w-full h-full object-cover" />
                            {selectedImages.includes(url) && (
                                <div className="absolute inset-0 bg-sky-500 bg-opacity-50 flex items-center justify-center text-white text-2xl">
                                    ✓
                                </div>
                            )}
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

const BlogEditorPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [postId, setPostId] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const [coverPreview, setCoverPreview] = useState('');
    const [finalCoverFile, setFinalCoverFile] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, type: null, src: '', aspect: undefined });
    const [scheduledTime, setScheduledTime] = useState('');
    const [customSnippet, setCustomSnippet] = useState('');
    const [thumbnailMode, setThumbnailMode] = useState('single');
    const [storyThumbnails, setStoryThumbnails] = useState([]);
    const [thumbnailOrientation, setThumbnailOrientation] = useState('landscape');
    const [isAddFromPostModalOpen, setAddFromPostModalOpen] = useState(false);
    const [postImagesForSelection, setPostImagesForSelection] = useState([]);
    const [thumbPreview, setThumbPreview] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const isContentLoaded = useRef(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesRes = await getCategories();
                if (Array.isArray(categoriesRes.data)) {
                    setAllCategories(categoriesRes.data);
                }

                if (slug) {
                    const postRes = await getPostBySlug(slug);
                    const post = postRes.data;
                    setPostId(post.id);
                    setTitle(post.title);
                    setContent(post.content);
                    setCategory(post.category || (categoriesRes.data[0]?.name || ''));
                    setTags(post.tags || []);
                    setIsFeatured(post.featured);
                    setCustomSnippet(post.customSnippet || '');

                    if (post.thumbnails && post.thumbnails.length > 0) {
                        setThumbnailMode('story');
                        setThumbnailOrientation(post.thumbnailOrientation || 'landscape');
                        const loadedThumbnails = post.thumbnails.map(thumb => ({
                            id: thumb.id,
                            previewUrl: `${API_URL}${thumb.imageUrl}`,
                            altText: thumb.altText || '',
                            source: 'existing',
                            url: thumb.imageUrl,
                            file: null,
                            displayOrder: thumb.displayOrder
                        })).sort((a, b) => a.displayOrder - b.displayOrder);
                        setStoryThumbnails(loadedThumbnails);
                    } else {
                        setThumbnailMode('single');
                        if (post.thumbnailUrl) setThumbPreview(`${API_URL}/${post.thumbnailUrl}`);
                    }

                    if (post.coverImageUrl) setCoverPreview(`${API_URL}${post.coverImageUrl}`);
                    if (post.scheduledTime) {
                        const localDateTime = new Date(post.scheduledTime).toISOString().slice(0, 16);
                        setScheduledTime(localDateTime);
                    }
                } else {
                    if (categoriesRes.data && categoriesRes.data.length > 0) {
                        setCategory(categoriesRes.data[0].name);
                    }
                }
            } catch (err) {
                setError('Failed to load initial data.');
                console.error(err);
            }
        };
        fetchInitialData();
    }, [slug]);

    const handleAddNewCategory = async () => {
        const isDuplicate = allCategories.some(c => c && c.name && c.name.toLowerCase() === newCategoryName.toLowerCase());
        if (!newCategoryName || isDuplicate) {
            alert('Category name cannot be empty or a duplicate.');
            return;
        }
        try {
            const newCategory = { name: newCategoryName };
            const response = await addCategory(newCategory);
            setAllCategories([...allCategories, response.data]);
            setCategory(response.data.name);
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (err) {
            setError('Failed to add new category.');
            console.error("Failed to add category:", err);
        }
    };

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
    
    const handleStoryThumbUploadClick = () => {
        fileInputRef.current.onchange = (e) => onSelectFile(e, 'story-thumbnail', undefined);
        fileInputRef.current.click();
    };

    const handleCropSave = async (canvas, image) => {
        const croppedBlob = await canvasToBlob(canvas);
        const finalFile = await compressImage(croppedBlob);
        const previewUrl = URL.createObjectURL(finalFile);

        if (modalState.type === 'story-thumbnail') {
            const newThumbnail = {
                id: `new-${Date.now()}`,
                previewUrl,
                altText: '',
                source: 'new',
                file: new File([finalFile], `thumbnail-${Date.now()}.webp`, { type: 'image/webp' }),
                url: null,
                displayOrder: storyThumbnails.length
            };
            setStoryThumbnails([...storyThumbnails, newThumbnail]);

            if (storyThumbnails.length === 0) {
                const orientation = canvas.width / canvas.height >= 1 ? 'landscape' : 'portrait';
                setThumbnailOrientation(orientation);
            }
        } else if (modalState.type === 'single-thumbnail') {
            setThumbPreview(previewUrl);
        } else if (modalState.type === 'cover') {
            setFinalCoverFile(finalFile);
            setCoverPreview(previewUrl);
        }
        
        setModalState({ isOpen: false, type: null, src: '', aspect: undefined });
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
        const newThumbnails = selectedUrls.map((url, i) => ({
            id: `existing-${url}-${Date.now()}`,
            previewUrl: url,
            altText: '',
            source: 'existing',
            file: null,
            url: new URL(url).pathname,
            displayOrder: storyThumbnails.length + i
        }));
        setStoryThumbnails([...storyThumbnails, ...newThumbnails]);
        setAddFromPostModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!editorRef.current) {
            setError("Editor is not yet available.");
            return;
        }

        const formData = new FormData();
        const editorContent = editorRef.current.getContents(true);

        const postData = {
            title,
            content: editorContent,
            category,
            featured: isFeatured,
            tags: tags || [],
            scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
            customSnippet: customSnippet,
            thumbnailOrientation: thumbnailMode === 'story' ? thumbnailOrientation : null
        };
        formData.append('postData', JSON.stringify(postData));
        
        if (thumbnailMode === 'story') {
            const metadata = storyThumbnails.map((thumb, index) => ({
                source: thumb.source,
                fileName: thumb.source === 'new' ? thumb.file.name : null,
                url: thumb.source === 'existing' ? thumb.url : null,
                altText: thumb.altText,
                displayOrder: index
            }));
            formData.append('thumbnailsMetadata', JSON.stringify(metadata));
            storyThumbnails.forEach(thumb => {
                if (thumb.source === 'new') {
                    formData.append('thumbnailFiles', thumb.file, thumb.file.name);
                }
            });
        }
        
        if (finalCoverFile) {
            formData.append('coverImage', finalCoverFile, `cover-${Date.now()}.webp`);
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
            {modalState.isOpen && <CropModal src={modalState.src} type={modalState.type} onClose={() => setModalState({ isOpen: false, type: null, src: '', aspect: undefined })} onSave={handleCropSave} aspect={modalState.aspect} />}
            <AddFromPostModal images={postImagesForSelection} isOpen={isAddFromPostModalOpen} onClose={() => setAddFromPostModalOpen(false)} onSelect={handleSelectFromPost} />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>
                   
                    <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
                        <h1 className="text-2xl font-bold text-gray-800">{postId ? 'Edit Post' : 'Create New Post'}</h1>
                        {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                       
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
                        </div>
                        
                        <div>
                            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
                            <div className="flex items-center gap-2">
                                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                    <option value="">Select a category</option>
                                    {allCategories && allCategories.filter(cat => cat && cat.id).map((cat) => (
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
                                <button type="button" onClick={(e) => {
                                    fileInputRef.current.onchange = (ev) => onSelectFile(ev, 'single-thumbnail', undefined);
                                    fileInputRef.current.click();
                                }} className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">Upload Thumbnail</button>
                            </div>
                        ) : (
                            <StoryThumbnailManager 
                                thumbnails={storyThumbnails} 
                                setThumbnails={setStoryThumbnails} 
                                onUploadClick={handleStoryThumbUploadClick}
                                onAddFromPostClick={handleAddFromPostClick}
                            />
                        )}
                        
                        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                            <label className="block text-gray-700 font-semibold">Cover Image</label>
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                            <button type="button" onClick={() => {
                                fileInputRef.current.onchange = (e) => onSelectFile(e, 'cover', 16/9);
                                fileInputRef.current.click();
                            }} className="w-full text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">Upload Cover Image</button>
                        </div>

                        {/* --- FIX: Restored the Schedule Publication section --- */}
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
                           {postId
                                ? 'Update Post'
                                : (scheduledTime ? 'Schedule Post' : 'Publish Post')
                           }
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