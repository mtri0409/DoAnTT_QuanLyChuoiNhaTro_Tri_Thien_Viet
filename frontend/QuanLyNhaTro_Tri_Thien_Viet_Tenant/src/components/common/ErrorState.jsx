import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";

const ErrorState = ({ 
  message = "Không tìm thấy dữ liệu.", 
  onBack, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  // Nếu không truyền hàm onBack, mặc định sẽ quay lại trang trước đó
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="container py-5 text-center">
      <div 
        className="alert alert-danger rounded-4 shadow-sm d-inline-block px-5 py-4" 
        style={{ maxWidth: "600px" }}
      >
        <div className="mb-3">
          <FaExclamationTriangle size={40} className="text-danger" />
        </div>
        <h4 className="alert-heading fw-bold">Đã xảy ra lỗi!</h4>
        <p className="mb-0 text-secondary">{message}</p>
      </div>

      {showBackButton && (
        <div className="mt-4">
          <button
            className="btn btn-outline-secondary px-4 rounded-pill shadow-sm"
            onClick={handleBack}
          >
            <FaArrowLeft className="me-2" /> Quay lại
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;