import React, { useState } from 'react';
import { uploadTourImages } from '../../api/tourApi';
import './ImageUploadModal.css';

export default function ImageUploadModal({ tourId, isOpen, onClose, onSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setMsg({ text: '', type: '' });
    };

    const handleRemoveImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setMsg({ text: "Vui lòng chọn ít nhất 1 ảnh!", type: 'error' });
            return;
        }

        setIsUploading(true);
        setMsg({ text: "Đang tải ảnh lên Cloudinary...", type: 'info' });

        try {
            await uploadTourImages(tourId, selectedFiles);
            setMsg({ text: "Tải ảnh thành công!", type: 'success' });
            
            // Đợi 1 chút rồi đóng modal và refresh dữ liệu
            setTimeout(() => {
                onSuccess();
                onClose();
                // Reset state
                setSelectedFiles([]);
                setPreviews([]);
                setMsg({ text: '', type: '' });
            }, 1500);

        } catch (error) {
            console.error("Lỗi upload:", error);
            setMsg({ text: "Lỗi khi upload ảnh. Vui lòng thử lại.", type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="upload-modal-overlay">
            <div className="upload-modal-content">
                <header className="modal-header">
                    <h3>Thêm ảnh cho Tour</h3>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </header>

                <div className="modal-body">
                    <div className="upload-zone">
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            id="file-input"
                            hidden 
                        />
                        <label htmlFor="file-input" className="upload-label">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>Nhấn để chọn ảnh từ máy tính</span>
                        </label>
                    </div>

                    {previews.length > 0 && (
                        <div className="preview-grid">
                            {previews.map((url, index) => (
                                <div key={index} className="preview-item">
                                    <img src={url} alt="Preview" />
                                    <button onClick={() => handleRemoveImage(index)} className="btn-remove">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {msg.text && <p className={`status-msg ${msg.type}`}>{msg.text}</p>}
                </div>

                <footer className="modal-footer">
                    <button onClick={onClose} disabled={isUploading} className="btn-cancel">HỦY BỎ</button>
                    <button 
                        onClick={handleUpload} 
                        disabled={isUploading || selectedFiles.length === 0} 
                        className="btn-confirm-upload"
                    >
                        {isUploading ? "ĐANG TẢI..." : `TẢI LÊN (${selectedFiles.length})`}
                    </button>
                </footer>
            </div>
        </div>
    );
}
