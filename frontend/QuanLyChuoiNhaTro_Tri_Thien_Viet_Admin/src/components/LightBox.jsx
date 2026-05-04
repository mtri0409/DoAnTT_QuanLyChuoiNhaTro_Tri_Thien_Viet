import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Lightbox = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.95)', zIndex: 3000, cursor: 'zoom-out' }}
      onClick={onClose}
    >
      <img 
        src={src} 
        alt="meter preview" 
        className="img-fluid rounded"
        style={{ maxWidth: '92vw', maxHeight: '92vh' }}
      />
      <button
        onClick={onClose}
        className="position-fixed btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
        style={{ top: 16, right: 16, width: 40, height: 40 }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Lightbox;