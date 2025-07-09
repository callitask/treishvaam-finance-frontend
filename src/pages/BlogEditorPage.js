// treishvaam-finance-frontend/src/pages/BlogEditorPage.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, createPost, updatePost } from '../apiConfig';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
// Import ReactCrop and its CSS
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to get a cropped image from a canvas
const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas is empty');
                return;
            }
            blob.name = fileName;
            resolve(new File([blob], fileName, { type: blob.type }));
        }, 'image/jpeg'); // You can change the output format if needed
    });
};


const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postThumbnailFile, setPostThumbnailFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);

    const [src, setSrc] = useState(null); // Image source for the cropper
    // MODIFIED: Initialize crop with width/height as undefined, let aspect handle it initially
    const [crop, setCrop] = useState(undefined); // Initialize as undefined, set on image load
    const [completedCrop, setCompletedCrop] = useState(null);
    const [currentImageForCrop, setCurrentImageForCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imageTypeToCrop, setImageTypeToCrop] = useState(null);
    const imgRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchPost = async () => {
                try {
                    const response = await getPost(id);
                    setTitle(response.data.title);
                    setContent(response.data.content);
                } catch (err) {
                    setError('Failed to fetch post data.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        } else {
            setTitle('');
            setContent('');
            setPostThumbnailFile(null);
            setCoverImageFile(null);
            setError(null);
        }
    }, [id]);

    const handleContentChange = (newContent) => {
        setContent(newContent);
    };

    const handleFileChange = (type) => (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSrc(reader.result);
                setImageTypeToCrop(type);
                setIsCropperOpen(true);
                // MODIFIED: Do not set initial crop width/height here, set it in onImageLoad
                setCrop(undefined); // Reset crop state to undefined
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // MODIFIED: onImageLoad now sets the initial crop dimensions
    const onImageLoad = useCallback((img) => {
        imgRef.current = img.currentTarget; // Ensure imgRef.current points to the actual <img> element
        setCurrentImageForCrop(img.currentTarget); // Store reference to the image element

        const { naturalWidth: width, naturalHeight: height } = img.currentTarget;
        const aspectRatio = imageTypeToCrop === 'cover' ? 4 / 1 : 1 / 1;

        // Calculate initial crop based on image dimensions and aspect ratio
        let newCrop;
        if (width / height > aspectRatio) {
            // Image is wider than aspect ratio, constrain by height
            newCrop = {
                unit: 'px',
                x: (width - height * aspectRatio) / 2,
                y: 0,
                width: height * aspectRatio,
                height: height,
                aspect: aspectRatio,
            };
        } else {
            // Image is taller or same aspect ratio, constrain by width
            newCrop = {
                unit: 'px',
                x: 0,
                y: (height - width / aspectRatio) / 2,
                width: width,
                height: width / aspectRatio,
                aspect: aspectRatio,
            };
        }
        setCrop(newCrop);
    }, [imageTypeToCrop]); // Depend on imageTypeToCrop to ensure correct aspect ratio

    const onCropChange = useCallback((c) => {
        setCrop(c);
    }, []);

    const onCropComplete = useCallback((c) => {
        setCompletedCrop(c);
    }, []);

    const handleCropConfirm = async () => {
        if (currentImageForCrop && completedCrop && completedCrop.width && completedCrop.height) {
            const croppedImageBlob = await getCroppedImg(
                currentImageForCrop,
                completedCrop,
                `${imageTypeToCrop}_${Date.now()}.jpeg` // Unique filename for cropped image
            );
            if (imageTypeToCrop === 'thumbnail') {
                setPostThumbnailFile(croppedImageBlob);
            } else if (imageTypeToCrop === 'cover') {
                setCoverImageFile(croppedImageBlob);
            }
            setIsCropperOpen(false); // Close cropper
            setSrc(null); // Clear image source
            setCompletedCrop(null); // Clear completed crop
        } else {
            setError('Please select a crop area.');
        }
    };

    const handleCropCancel = () => {
        setIsCropperOpen(false);
        setSrc(null);
        setCompletedCrop(null);
        setCurrentImageForCrop(null);
        setImageTypeToCrop(null);
        setError(null); // Clear any crop-related errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!id && !postThumbnailFile) {
            setError('Post Thumbnail is required for new posts.');
            setLoading(false);
            return;
        }

        const postData = { 
            title, 
            content, 
            postThumbnail: postThumbnailFile, 
            coverImage: coverImageFile 
        };

        try {
            if (id) {
                await updatePost(id, postData);
            } else {
                await createPost(postData);
            }
            navigate('/dashboard/manage-posts');
        } catch (err) {
            setError('Failed to save the post. Please check the details and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left Column for Controls */}
            <div className="w-96 flex-shrink-0 p-6 bg-white shadow-xl flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{id ? 'Edit Post' : 'Create New Post'}</h1>
                
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}

                <form id="blog-editor-form" onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    {/* Scrollable area for form fields */}
                    <div className="flex-grow space-y-6 overflow-y-auto pr-3">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title" 
                                autoComplete="off" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="postThumbnail" className="block text-sm font-medium text-gray-700">Post Thumbnail</label>
                            <input
                                type="file"
                                id="postThumbnail"
                                name="postThumbnail" 
                                autoComplete="off" 
                                onChange={handleFileChange('thumbnail')}
                                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                required={!id} 
                            />
                            {id && <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing thumbnail.</p>}
                            {/* Display preview of selected/cropped thumbnail */}
                            {postThumbnailFile && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Selected Thumbnail:</p>
                                    <img src={URL.createObjectURL(postThumbnailFile)} alt="Thumbnail Preview" className="mt-1 h-24 w-24 object-cover rounded-md" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image</label>
                            <input
                                type="file"
                                id="coverImage"
                                name="coverImage" 
                                autoComplete="off" 
                                onChange={handleFileChange('cover')}
                                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                            />
                            {id && <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing cover image.</p>}
                            {/* Display preview of selected/cropped cover image */}
                            {coverImageFile && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">Selected Cover Image:</p>
                                    <img src={URL.createObjectURL(coverImageFile)} alt="Cover Image Preview" className="mt-1 h-24 w-auto object-cover rounded-md" style={{ maxWidth: '100%' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Non-scrolling save button at the bottom */}
                    <div className="flex-shrink-0 mt-auto pt-6">
                        <button
                            type="submit"
                            form="blog-editor-form"
                            disabled={loading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column for SunEditor */}
            <div className="flex-grow p-6 flex flex-col">
                <div className="w-full h-full">
                    <SunEditor
                        setContents={content}
                        onChange={handleContentChange}
                        setOptions={{
                            height: '100%', // Fills the parent div's height
                            buttonList: [
                                ['undo', 'redo'], ['font', 'fontSize', 'formatBlock'],
                                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                                ['removeFormat'], ['outdent', 'indent'],
                                ['align', 'horizontalRule', 'list', 'lineHeight'],
                                ['table', 'link', 'image'],
                                ['fullScreen', 'showBlocks', 'codeView'],
                            ],
                        }}
                    />
                </div>
            </div>

            {/* Cropper Modal */}
            {isCropperOpen && src && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Crop Image ({imageTypeToCrop === 'cover' ? '4:1 Aspect' : 'Thumbnail'})</h2>
                        <div className="flex justify-center items-center mb-4">
                            <ReactCrop 
                                crop={crop} 
                                onChange={onCropChange} 
                                onComplete={onCropComplete}
                                aspect={imageTypeToCrop === 'cover' ? 4 / 1 : 1 / 1} // Set aspect ratio dynamically
                            >
                                <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Crop" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                            </ReactCrop>
                        </div>
                        {completedCrop && completedCrop.width && completedCrop.height ? (
                            <p className="text-sm text-gray-600 text-center mb-4">Drag to adjust crop area. Aspect ratio is fixed.</p>
                        ) : (
                            <p className="text-sm text-gray-600 text-center mb-4">Drag to select a crop area.</p>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={handleCropCancel} 
                                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCropConfirm} 
                                className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!completedCrop?.width || !completedCrop?.height}
                            >
                                Crop & Use
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogEditorPage;