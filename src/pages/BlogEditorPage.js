// treishvaam-finance-frontend/src/pages/BlogEditorPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, createPost, updatePost } from '../apiConfig';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postThumbnail, setPostThumbnail] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
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
            setPostThumbnail(null);
            setCoverImage(null);
            setError(null);
        }
    }, [id]);

    const handleContentChange = (newContent) => {
        setContent(newContent);
    };

    const handleFileChange = (setter) => (e) => {
        setter(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const postData = { title, content, postThumbnail, coverImage };

        try {
            if (id) {
                await updatePost(id, postData);
            } else {
                await createPost(postData);
            }
            navigate('/manage-posts');
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
                                onChange={handleFileChange(setPostThumbnail)}
                                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                            />
                            {id && <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing thumbnail.</p>}
                        </div>

                        <div>
                            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image</label>
                            <input
                                type="file"
                                id="coverImage"
                                onChange={handleFileChange(setCoverImage)}
                                className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                            />
                            {id && <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing cover image.</p>}
                        </div>
                    </div>

                    {/* Non-scrolling save button at the bottom */}
                    <div className="flex-shrink-0 mt-auto pt-6">
                        <button
                            type="submit"
                            form="blog-editor-form"
                            disabled={loading}
                            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400"
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
        </div>
    );
};

export default BlogEditorPage;

