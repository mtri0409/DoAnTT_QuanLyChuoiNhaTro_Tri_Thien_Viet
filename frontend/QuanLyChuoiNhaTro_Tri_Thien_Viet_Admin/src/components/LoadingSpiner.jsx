// components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ 
  message = "Đang tải dữ liệu...", 
  minHeight = 400,
  size = "primary",
  spinnerSize = ""
}) => {
  return (
    <div className="container py-5">
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="text-center">
          <div 
            className={`spinner-border text-${size} mb-3 ${spinnerSize}`} 
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;