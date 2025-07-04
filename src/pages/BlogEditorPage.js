import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

// Import the new editor and its CSS
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; 

const categories = ['Stocks', 'Crypto', 'Trading', 'News'];

const BlogEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [category, setCategory] = useState(categories[0]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // This is the function that connects the editor's upload button to our backend
  const handleImageUploadBefore = (files, info, uploadHandler) => {
    const formData = new FormData();
    formData.append('file', files[0]);

    apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(response => {
      // The editor expects the response in this specific format
      const res = {
        result: [
          {
            url: response.data.url,
            name: files[0].name,
            size: files[0].size,
          },
        ],
      };
      uploadHandler(res);
    })
    .catch(error => {
      console.error("Image upload failed", error);
      uploadHandler(error.toString());
    });
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      apiClient.get(`/posts/${id}`)
        .then(response => {
          const post = response.data;
          setTitle(post.title);
          setAuthor(post.author);
          setCategory(post.category || categories[0]);
          setIsFeatured(post.isFeatured || false);
          setContent(post.content || '');
        })
        .catch(err => setError('Failed to load post.'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const postData = { title, content, author, category, isFeatured };

    try {
      if (id) {
        await apiClient.put(`/posts/${id}`, postData);
      } else {
        await apiClient.post('/posts', postData);
      }
      navigate('/dashboard/manage-posts');
    } catch (err) {
      setError('Failed to save the post. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && id) return <p>Loading post for editing...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium">Author</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md" required />
            </div>
            <div>
              <label className="block text-lg font-medium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
        </div>
        <div className="flex items-center">
            <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Mark as Featured Post</label>
        </div>
        <div>
          <label className="block text-lg font-medium">Content</label>
          <SunEditor
            setContents={content}
            onChange={setContent}
            onImageUploadBefore={handleImageUploadBefore}
            setOptions={{
              height: 200,
              buttonList: [
                ['undo', 'redo'],
                ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                ['removeFormat'],
                ['outdent', 'indent'],
                ['align', 'horizontalRule', 'list', 'lineHeight'],
                ['table', 'link', 'image'],
                ['fullScreen', 'showBlocks', 'codeView'],
              ],
            }}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <button type="submit" disabled={isLoading} className="px-6 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
            {isLoading ? 'Saving...' : (id ? 'Update Post' : 'Publish Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditorPage;