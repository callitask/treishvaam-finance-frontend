import imageCompression from 'browser-image-compression';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'suneditor/dist/css/suneditor.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import { getPost, createPost, updatePost, uploadFile, getCategories, addCategory, API_URL } from '../apiConfig';

const SunEditor = React.lazy(() => import('suneditor-react'));

const TagsInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
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
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (press Enter or comma)"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-200"
            />
        </div>
    );
};

const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9));

function canvasPreview(image, canvas, crop) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();
}

const CropModal = ({ src, type, onClose, onSave }) => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const aspect = type === 'cover' ? 16 / 9 : (type === 'thumbnail' ? 1/1 : undefined);

    useEffect(() => {
        if (completedCrop?.width && imgRef.current && canvasRef.current) {
            canvasPreview(imgRef.current, canvasRef.current, completedCrop);
        }
    }, [completedCrop]);

    const handleSave = () => {
        if (canvasRef.current) onSave(canvasRef.current);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Crop Image</h3>
                <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
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


const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [categories, setCategories] = useState([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [thumbPreview, setThumbPreview] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [finalThumbFile, setFinalThumbFile] = useState(null);
    const [finalCoverFile, setFinalCoverFile] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, type: null, src: '' });
    const [sunEditorUploadHandler, setSunEditorUploadHandler] = useState(null);

    const [thumbnailAltText, setThumbnailAltText] = useState('');
    const [thumbnailTitle, setThumbnailTitle] = useState('');
    const [coverImageAltText, setCoverImageAltText] = useState('');
    const [coverImageTitle, setCoverImageTitle] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesRes = await getCategories();
                setCategories(categoriesRes.data || []);

                if (id) {
                    const postRes = await getPost(id);
                    const post = postRes.data;
                    setTitle(post.title);
                    setContent(post.content);
                    setCategory(post.category || (categoriesRes.data[0]?.name || ''));
                    setTags(post.tags || []);
                    setIsFeatured(post.featured);
                    setCreatedAt(post.createdAt || new Date().toISOString());
                    if (post.thumbnailUrl) setThumbPreview(`${API_URL}${post.thumbnailUrl}`);
                    if (post.coverImageUrl) setCoverPreview(`${API_URL}${post.coverImageUrl}`);
                    setThumbnailAltText(post.thumbnailAltText || '');
                    setThumbnailTitle(post.thumbnailTitle || '');
                    setCoverImageAltText(post.coverImageAltText || '');
                    setCoverImageTitle(post.coverImageTitle || '');

                } else {
                    setCategory(categoriesRes.data[0]?.name || '');
                    setCreatedAt(new Date().toISOString());
                }
            } catch (err) {
                setError('Failed to load initial data.');
            }
        };
        fetchInitialData();
    }, [id]);

    const handleAddNewCategory = async () => {
        if (!newCategoryName || categories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
            alert('Category name cannot be empty or a duplicate.');
            return;
        }
        try {
            const newCategory = { name: newCategoryName };
            const response = await addCategory(newCategory);
            setCategories([...categories, response.data]);
            setCategory(response.data.name);
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (err) {
            setError('Failed to add new category.');
        }
    };

    const compressImage = async (file) => {
        if (!file) return null;
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        try { return await imageCompression(file, options); } catch (e) { return file; }
    };

    const onSelectFile = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setModalState({ isOpen: true, type, src: reader.result?.toString() || '' }));
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

    const handleCropSave = async (canvas) => {
        const croppedBlob = await canvasToBlob(canvas);
        const compressedFile = await compressImage(croppedBlob);
        if (modalState.type === 'thumbnail') {
            setFinalThumbFile(compressedFile);
            setThumbPreview(URL.createObjectURL(compressedFile));
        } else if (modalState.type === 'cover') {
            setFinalCoverFile(compressedFile);
            setCoverPreview(URL.createObjectURL(compressedFile));
        } else if (modalState.type === 'suneditor' && sunEditorUploadHandler) {
            const formData = new FormData();
            formData.append('file', compressedFile, 'image.jpg');
            uploadFile(formData)
                .then(res => sunEditorUploadHandler(res.data))
                .catch(err => {
                    alert("Image upload failed in editor.");
                    sunEditorUploadHandler();
                });
        }
        setModalState({ isOpen: false, type: null, src: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Append all the post fields directly to the FormData object
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('featured', isFeatured);
            
            // Append each tag separately
            if (tags && tags.length > 0) {
                tags.forEach(tag => formData.append('tags', tag));
            } else {
                // If there are no tags, we should still send an empty value
                // if the backend expects the field to be present.
                // Based on your controller, it's not required, but this is good practice.
                formData.append('tags', ''); 
            }

            // The backend controller doesn't currently handle these SEO fields.
            // They should be added to the BlogPost entity and controller to be saved.
            // formData.append('thumbnailAltText', thumbnailAltText);
            // formData.append('thumbnailTitle', thumbnailTitle);
            // formData.append('coverImageAltText', coverImageAltText);
            // formData.append('coverImageTitle', coverImageTitle);

            if (finalThumbFile) {
                formData.append('thumbnail', finalThumbFile, 'thumbnail.jpg');
            }
            if (finalCoverFile) {
                formData.append('coverImage', finalCoverFile, 'cover.jpg');
            }
            
            if (id) {
                await updatePost(id, formData);
            } else {
                await createPost(formData);
            }
            navigate('/dashboard/manage-posts');
        } catch (err) {
            setError('Failed to save the post.');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {modalState.isOpen && <CropModal src={modalState.src} type={modalState.type} onClose={() => setModalState({isOpen: false, type: null, src: ''})} onSave={handleCropSave} />}
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 flex flex-col overflow-y-auto" style={{ maxHeight: '100vh' }}>
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{id ? 'Edit Post' : 'Create New Post'}</h1>
                    <div className="text-xs text-gray-500 mb-4">{new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                    
                    <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
                            <div className="flex items-center gap-2">
                                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                    <option value="">Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
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

                        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                            <label className="block text-gray-700 font-semibold">Thumbnail SEO</label>
                            {thumbPreview && <img src={thumbPreview} alt="Thumbnail Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                            <input type="file" accept="image/*" onChange={e => onSelectFile(e, 'thumbnail')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                            <div>
                                <label htmlFor="thumbnailAltText" className="text-sm font-medium text-gray-600">Alt Text</label>
                                <input type="text" id="thumbnailAltText" value={thumbnailAltText} onChange={e => setThumbnailAltText(e.target.value)} placeholder="Describe the image for SEO" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"/>
                            </div>
                            <div>
                                <label htmlFor="thumbnailTitle" className="text-sm font-medium text-gray-600">Image Title</label>
                                <input type="text" id="thumbnailTitle" value={thumbnailTitle} onChange={e => setThumbnailTitle(e.target.value)} placeholder="Optional title for the image" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"/>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
                            <label className="block text-gray-700 font-semibold">Cover Image SEO</label>
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-white" />}
                            <input type="file" accept="image/*" onChange={e => onSelectFile(e, 'cover')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                            <div>
                                <label htmlFor="coverImageAltText" className="text-sm font-medium text-gray-600">Alt Text</label>
                                <input type="text" id="coverImageAltText" value={coverImageAltText} onChange={e => setCoverImageAltText(e.target.value)} placeholder="Describe the image for SEO" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"/>
                            </div>
                            <div>
                                <label htmlFor="coverImageTitle" className="text-sm font-medium text-gray-600">Image Title</label>
                                <input type="text" id="coverImageTitle" value={coverImageTitle} onChange={e => setCoverImageTitle(e.target.value)} placeholder="Optional title for the image" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"/>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500" />
                            <span className="ml-2 text-gray-700">Mark as Featured</span>
                        </div>
                        <button type="submit" form="blog-editor-form" className="w-full bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-700 transition">
                            {id ? 'Update Post' : 'Publish Post'}
                        </button>
                    </form>
                </div>
                <div className="w-full md:w-2/3 p-6 flex flex-col h-full">
                    <label className="block text-gray-700 font-semibold mb-2">Content</label>
                    <div className="flex-grow h-full">
                        <Suspense fallback={<div>Loading editor...</div>}>
                            <SunEditor setContents={content} onChange={setContent} onImageUploadBefore={handleImageUploadBefore} setOptions={{ height: '100%', buttonList: [['undo', 'redo'],['font', 'fontSize', 'formatBlock'],['bold', 'underline', 'italic', 'strike'],['fontColor', 'hiliteColor'],['align', 'list'],['table', 'link', 'image'],['fullScreen', 'codeView']] }} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditorPage;