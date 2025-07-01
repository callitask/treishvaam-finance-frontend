import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BlogEditorPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('Market News');
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const { token } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    if (!image) {
      setStatusMessage({ type: 'error', text: 'A featured image is required.' });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('summary', summary);
    formData.append('category', category);
    formData.append('isFeatured', isFeatured);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:8080/api/blog/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setStatusMessage({ type: 'success', text: 'Post published successfully!' });
        // Reset form
        setTitle('');
        setContent('');
        setSummary('');
        setCategory('Market News');
        setIsFeatured(false);
        setImage(null);
        setImagePreview('');
      } else {
        const errorData = await response.json();
        setStatusMessage({ type: 'error', text: errorData.message || 'Failed to publish post.' });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Market News",
    "Technical Analysis",
    "Crypto",
    "Commodities",
    "Forex",
    "Personal Finance",
  ];

  return (
    <div className="container mx-auto">
      {statusMessage.text && (
        <div className={`p-4 mb-4 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {statusMessage.text}
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Blog Post Editor</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter a compelling title"
              required
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Full Post Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="15"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Write your blog post here... You can use Markdown."
              required
            ></textarea>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">Post Summary / Excerpt</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="A short summary that will appear in post previews."
              required
            ></textarea>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Publishing</h3>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cta-button-primary text-white font-semibold py-3 px-6 rounded-lg transition duration-300 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="w-full mt-3 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-300 hover:bg-gray-300 disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <input
              type="file"
              id="featuredImage"
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Image preview" className="w-full h-auto rounded-lg object-cover" />
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as Featured Post</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditorPage;
