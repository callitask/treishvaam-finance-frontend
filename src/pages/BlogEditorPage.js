
import React, { useState } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import ImageCropUploader from '../components/ImageCropUploader';

const BlogEditorPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [finalThumbnailFile, setFinalThumbnailFile] = useState(null);
    const [finalCoverFile, setFinalCoverFile] = useState(null);

    const handleEditorChange = (editorContent) => {
        setContent(editorContent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (finalThumbnailFile) {
            formData.append('thumbnail', finalThumbnailFile, 'thumbnail.jpg');
        }
        if (finalCoverFile) {
            formData.append('coverImage', finalCoverFile, 'cover.jpg');
        }
        // TODO: Add your API submission logic here
        console.log('Submitting form with SunEditor content and optimized files...', formData);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem' }}>
            <h1>Blog Editor</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '1rem'}} />
                <SunEditor 
                    setContents={content}
                    onChange={handleEditorChange}
                    // ... other SunEditor props
                />
                <hr style={{margin: '2rem 0'}}/>
                <ImageCropUploader 
                    label="Cover Photo (Rectangle Crop 16:9)"
                    aspect={16 / 9}
                    onFileReady={setFinalCoverFile}
                />
                <hr style={{margin: '2rem 0'}}/>
                <ImageCropUploader
                    label="Thumbnail (Square Crop 1:1)"
                    aspect={1 / 1}
                    onFileReady={setFinalThumbnailFile}
                />
                <button type="submit" style={{ padding: '10px 20px', marginTop: '2rem', cursor: 'pointer' }}>
                    Publish Post
                </button>
            </form>
        </div>
    );
};


export default BlogEditorPage;