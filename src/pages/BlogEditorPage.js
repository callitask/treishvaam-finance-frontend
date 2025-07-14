import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'suneditor/dist/css/suneditor.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import { getPost, createPost, updatePost, API_URL } from '../apiConfig';

const SunEditor = React.lazy(() => import('suneditor-react'));
const allCategories = ['News', 'Stocks', 'Crypto', 'Trading'];

// --- Helper Functions ---
const canvasToBlob = (canvas) => new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));

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

// --- Main Component ---
const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- State Management ---
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('News');
    const [isFeatured, setIsFeatured] = useState(false);
    const [error, setError] = useState('');
    
    const [modalState, setModalState] = useState({ isOpen: false, type: null, src: '' });
    const [thumbPreview, setThumbPreview] = useState('');
    const thumbCropCanvasRef = useRef(null);
    const [coverPreview, setCoverPreview] = useState('');
    const coverCropCanvasRef = useRef(null);

    const [createdAt, setCreatedAt] = useState('');
    useEffect(() => {
        if (id) {
            getPost(id)
                .then(res => {
                    const post = res.data;
                    setTitle(post.title);
                    setContent(post.content);
                    setCategory(post.category);
                    setIsFeatured(post.featured);
                    setCreatedAt(post.createdAt || new Date().toISOString());
                    if (post.thumbnailUrl) setThumbPreview(`${API_URL}${post.thumbnailUrl}`);
                    if (post.coverImageUrl) setCoverPreview(`${API_URL}${post.coverImageUrl}`);
                })
                .catch(() => setError('Failed to fetch post data.'));
        } else {
            setCreatedAt(new Date().toISOString());
        }
    }, [id]);

    const onSelectFile = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setModalState({ isOpen: true, type, src: reader.result?.toString() || '' });
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            // Append each field as required by backend
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            // Send featured as string 'true'/'false' for backend compatibility
            formData.append('featured', isFeatured ? 'true' : 'false');

            // Append images if present
            if (thumbCropCanvasRef.current) {
                const thumbBlob = await canvasToBlob(thumbCropCanvasRef.current);
                if (thumbBlob) formData.append('thumbnail', thumbBlob, 'thumbnail.png');
            }
            if (coverCropCanvasRef.current) {
                const coverBlob = await canvasToBlob(coverCropCanvasRef.current);
                if (coverBlob) formData.append('coverImage', coverBlob, 'cover.png');
            }

            if (id) {
                await updatePost(id, formData);
            } else {
                await createPost(formData);
            }
            navigate('/dashboard/manage-posts');
        } catch (err) {
            setError('Failed to save the post. Please check the data and try again.');
            console.error(err);
        }
    };

    const handleImageUploadBefore = (files, info, uploadHandler) => {
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            const response = { result: [{ url: target.result, name: files[0].name, size: files[0].size }] };
            uploadHandler(response);
        };
        reader.readAsDataURL(files[0]);
        return undefined;
    }

    // ...existing code...

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {modalState.isOpen && 
                <CropModal 
                    src={modalState.src}
                    type={modalState.type}
                    onClose={() => setModalState({isOpen: false, type: null, src: ''})}
                    onSave={(canvas) => {
                        if (modalState.type === 'thumbnail') {
                            thumbCropCanvasRef.current = canvas;
                            setThumbPreview(canvas.toDataURL());
                        } else {
                            coverCropCanvasRef.current = canvas;
                            setCoverPreview(canvas.toDataURL());
                        }
                    }}
                />
            }
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                {/* Left Column: Form */}
                <div className="w-full md:w-1/3 p-6 bg-white border-r border-gray-200 flex flex-col">
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{id ? 'Edit Post' : 'Create New Post'}</h1>
                    <div className="text-xs text-gray-500 mb-4">{new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                    <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-200" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Thumbnail (Any Size)</label>
                            {thumbPreview && <img src={thumbPreview} alt="Thumbnail Preview" className="w-full h-auto object-contain border rounded mb-2"/>}
                            <input type="file" accept="image/*" onChange={e => onSelectFile(e, 'thumbnail')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Cover Image (16:9)</label>
                            {coverPreview && <img src={coverPreview} alt="Cover Preview" className="w-full h-auto object-contain border rounded mb-2"/>}
                            <input type="file" accept="image/*" onChange={e => onSelectFile(e, 'cover')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-gray-700">
                                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="h-5 w-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500" />
                                <span className="ml-2">Mark as Featured Post</span>
                            </label>
                        </div>
                        <button type="submit" form="blog-editor-form" className="bg-sky-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-sky-700 transition duration-300 mt-2">
                            {id ? 'Update Post' : 'Publish Post'}
                        </button>
                    </form>
                </div>
                {/* Right Column: SunEditor */}
                <div className="w-full md:w-2/3 p-6 flex flex-col h-full">
                    <label className="block text-gray-700 font-semibold mb-2">Content</label>
                    <div className="flex-grow h-full">
                        <Suspense fallback={<div>Loading editor...</div>}>
                            <SunEditor
                                setContents={content}
                                onChange={setContent}
                                onImageUploadBefore={handleImageUploadBefore}
                                setOptions={{
                                    minHeight: '300px',
                                    height: '100%',
                                    maxHeight: '70vh',
                                    resizingBar: false,
                                    buttonList: [
                                        ['undo', 'redo'], ['font', 'fontSize', 'formatBlock'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'],
                                        ['fontColor', 'hiliteColor'], ['outdent', 'indent'], ['align', 'horizontalRule', 'list', 'lineHeight'],
                                        ['table', 'link', 'image', 'video'], ['fullScreen', 'showBlocks', 'codeView'], ['preview', 'print'],
                                    ],
                                }}
                                width="100%"
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CropModal = ({ src, type, onClose, onSave }) => {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const aspect = type === 'cover' ? 16 / 9 : undefined;

    useEffect(() => {
        if (completedCrop?.width && imgRef.current && canvasRef.current) {
            canvasPreview(imgRef.current, canvasRef.current, completedCrop);
        }
    }, [completedCrop]);
    
    const handleSave = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
                <h3 className="text-xl font-bold mb-4">Crop Your Image</h3>
                <div className="max-h-[60vh] overflow-y-auto">
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect}>
                        <img ref={imgRef} alt="Crop" src={src} />
                    </ReactCrop>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Save Crop</button>
                </div>
            </div>
        </div>
    );
};

export default BlogEditorPage;