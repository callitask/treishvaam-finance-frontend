import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';

// This is a self-contained component for uploading, cropping, and compressing an image.
const ImageCropUploader = ({ label, aspect, onFileReady }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [finalPreview, setFinalPreview] = useState('');
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
        const cropConfig = makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height);
        setCrop(centerCrop(cropConfig, width, height));
    };

    const handleCropAndCompress = async () => {
        if (completedCrop && imgRef.current) {
            const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true };
            try {
                const compressedFile = await imageCompression(croppedImageBlob, options);
                onFileReady(compressedFile); // Send the final file to the parent component
                setFinalPreview(URL.createObjectURL(compressedFile)); // Show a preview of the final image
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
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: '500' }}>{label}</label>
            <br />
            <input type="file" accept="image/*" onChange={onSelectFile} ref={inputRef} style={{ marginTop: '0.5rem' }}/>

            {finalPreview && (
                <div style={{ marginTop: '1rem' }}>
                    <p>Preview:</p>
                    <img src={finalPreview} alt="Final Preview" style={{ maxWidth: '250px', maxHeight: '250px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            )}

            {modalIsOpen && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.content}>
                        <h2>Crop Image</h2>
                        {imgSrc && (
                            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
                            </ReactCrop>
                        )}
                        <div style={{ marginTop: '1rem' }}>
                            <button type="button" onClick={handleCropAndCompress}>Crop & Save</button>
                            <button type="button" onClick={closeModal} style={{ marginLeft: '1rem' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to get the cropped image
function getCroppedImg(image, crop) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);
    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if (!blob) {
                console.error('Canvas is empty');
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}

// Styles for the modal
const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    content: { background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }
};

export default ImageCropUploader;
