// treishvaam-finance-frontend/src/pages/SinglePostPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../apiConfig';

const SinglePostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPost(id);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch post.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading post...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-10">Post not found.</div>;

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  const coverImageContainerStyle = {
    height: '350px', // A fixed height for the banner
    backgroundColor: '#e5e7eb', // A light gray fallback color
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100%',
  };

  const coverImageStyle = {
    backgroundImage: `url(${post.coverImageUrl || ''})`,
  };

  return (
    <article className="bg-white">
      <header>
        <div style={coverImageContainerStyle}>
           <div style={{...coverImageContainerStyle, ...coverImageStyle}}>
              {/* This div renders the background image */}
           </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl -mt-24 relative">
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{post.title}</h1>
            <p className="text-gray-500 mb-6">
              Posted on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {/* Fix for rendering HTML content */}
            <div 
              className="prose lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={createMarkup(post.content)}
            >
            </div>
        </div>
      </div>
    </article>
  );
};

export default SinglePostPage;