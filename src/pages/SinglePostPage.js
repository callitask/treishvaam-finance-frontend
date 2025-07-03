import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import DOMPurify from 'dompurify';

const SinglePostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch the post. It may not exist.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  if (loading) return <div className="text-center p-10">Loading post...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!post) return null;

  return (
    <div className="bg-white py-12">
     <div className="container mx-auto px-4">
      <article className="max-w-4xl mx-auto bg-white p-8">
       <p className="text-sky-600 font-semibold">{post.category}</p>
       <h1 className="text-4xl font-bold my-4 text-gray-900">{post.title}</h1>
       <p className="text-gray-500 mb-6">By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</p>
       <div className="prose max-w-none" dangerouslySetInnerHTML={createMarkup(post.content)} />
       <Link to="/blog" className="text-sky-600 hover:text-sky-500 mt-8 inline-block">&larr; Back to all posts</Link>
      </article>
     </div>
    </div>
  );
};

export default SinglePostPage;