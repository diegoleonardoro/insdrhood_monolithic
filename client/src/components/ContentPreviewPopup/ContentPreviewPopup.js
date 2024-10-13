import React from 'react';
import './ContentPreviewPopup.css';

const ContentPreviewPopup = ({ isOpen, onClose, previewImages }) => {
  if (!isOpen) return null;

  return (
    <div className="preview-popup-overlay">
      <div className="preview-popup-content">
        <button className="preview-popup-close" onClick={onClose}>Close</button>
        <div className="preview-scroll-container">
          {previewImages.map((image, index) => (
            <div key={index} className="preview-image-wrapper">
              <img 
                src={image} 
                alt={`Preview page ${index + 1}`} 
                className="preview-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewPopup;
