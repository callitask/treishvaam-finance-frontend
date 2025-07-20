import imageCompression from 'browser-image-compression';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'suneditor/dist/css/suneditor.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import { getPost, createPost, updatePost, uploadFile, getCategories, addCategory, API_URL } from '../apiConfig';

const SunEditor = React.lazy(() => import('suneditor-react'));

const TagsInput = ({ tags, setTags }) => {
    // ... existing TagsInput component code ...
};

const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9));

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

    // --- NEW STATE FOR IMAGE METADATA ---
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
                    
                    // --- POPULATE NEW STATE ON EDIT ---
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

    const handleAddNewCategory = async () => { /* ... existing function ... */ };
    const compressImage = async (file) => { /* ... existing function ... */ };
    const onSelectFile = (e, type) => { /* ... existing function ... */ };
    const handleImageUploadBefore = (files, info, uploadHandler) => { /* ... existing function ... */ };
    const handleCropSave = async (canvas) => { /* ... existing function ... */ };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('featured', isFeatured);
            tags.forEach(tag => formData.append('tags', tag));
            if (finalThumbFile) formData.append('thumbnail', finalThumbFile, 'thumbnail.jpg');
            if (finalCoverFile) formData.append('coverImage', finalCoverFile, 'cover.jpg');
            
            // --- APPEND NEW METADATA TO FORMDATA ---
            formData.append('thumbnailAltText', thumbnailAltText);
            formData.append('thumbnailTitle', thumbnailTitle);
            formData.append('coverImageAltText', coverImageAltText);
            formData.append('coverImageTitle', coverImageTitle);
            
            if (id) {
                await updatePost(id, formData);
            } else {
                await createPost(formData);
            }
            navigate('/dashboard/manage-posts');
        } catch (err) {
            setError('Failed to save the post.');
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
                        {/* ... Title, Category, Tags inputs ... */}

                        {/* --- UPDATED THUMBNAIL SECTION --- */}
                        <div className="p-4 border rounded-lg space-y-3">
                            <label className="block text-gray-700 font-semibold">Thumbnail</label>
                            {thumbPreview && <img src={thumbPreview} alt="Thumbnail Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-gray-50" />}
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

                        {/* --- UPDATED COVER IMAGE SECTION --- */}
                        <div className="p-4 border rounded-lg space-y-3">
                            <label className="block text-gray-700 font-semibold">Cover Image</label>
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto aspect-video object-contain my-4 border rounded-lg bg-gray-50" />}
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

                        {/* ... Featured checkbox and Submit button ... */}

                    </form>
                </div>
                <div className="w-full md:w-2/3 p-6 flex flex-col h-full">
                    {/* ... SunEditor component ... */}
                </div>
            </div>
        </div>
    );
};

const CropModal = ({ src, type, onClose, onSave }) => { /* ... existing function ... */ };
function canvasPreview(image, canvas, crop) { /* ... existing function ... */ }

export default BlogEditorPage;