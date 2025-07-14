
import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';

const BlogEditorPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [finalThumbnailFile, setFinalThumbnailFile] = useState(null);
    const [finalCoverFile, setFinalCoverFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (finalThumbnailFile) {
            formData.append('thumbnail', finalThumbnailFile, finalThumbnailFile.name);
        }
        if (finalCoverFile) {
            formData.append('coverImage', finalCoverFile, finalCoverFile.name);
        }
        // TODO: Add your API submission logic here
        console.log('Submitting with optimized files...', formData);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem' }}>
            <h1>Blog Post Editor</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '1rem'}}/>
                <textarea placeholder="Content..." value={content} onChange={e => setContent(e.target.value)} style={{width: '100%', height: '200px', padding: '8px', marginBottom: '1rem'}}></textarea>
                <hr style={{margin: '2rem 0'}}/>
                <ImageUploader 
                    label="Cover Photo (16:9 Rectangle Crop)"
                    aspect={16 / 9} 
                    onFileCroppedAndCompressed={setFinalCoverFile}
                />
                <hr style={{margin: '2rem 0'}}/>
                <ImageUploader
                    label="Thumbnail (Square Crop)"
                    aspect={1 / 1}
                    onFileCroppedAndCompressed={setFinalThumbnailFile}
                />
                <button type="submit" style={{ padding: '10px 20px', marginTop: '2rem', cursor: 'pointer' }}>
                    Publish Post
                </button>
            </form>
        </div>
    );
};

const ImageUploader = ({ label, aspect, onFileCroppedAndCompressed }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const imgRef = useRef(null);
    const inputRef = useRef(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setModalIsOpen(true);
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            width,
            height
        );
        const centeredCrop = centerCrop(crop, width, height);
        setCrop(centeredCrop);
    };

    const handleCropAndCompress = async () => {
        if (completedCrop && imgRef.current) {
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            try {
                const compressedFile = await imageCompression(croppedImageBlob, options);
                onFileCroppedAndCompressed(compressedFile);
            } catch (error) {
                console.error('Error during compression:', error);
            }
            closeModal();
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setImgSrc('');
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div>
            <label>{label}</label>
            <br />
            <input type="file" accept="image/*" onChange={onSelectFile} ref={inputRef} />
            {modalIsOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h2>Crop Image</h2>
                        {imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '70vh' }}
                                />
                            </ReactCrop>
                        )}
                        <button onClick={handleCropAndCompress}>Crop & Save</button>
                        <button onClick={closeModal}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

function getCroppedImg(image, crop) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
    );
    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            resolve(blob);
        }, 'image/jpeg', 0.9);
    });
}

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    content: {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    }
};

export default BlogEditorPage;