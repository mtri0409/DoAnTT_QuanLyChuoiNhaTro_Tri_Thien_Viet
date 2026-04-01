import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey, FaSave, FaArrowLeft, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import apiUser from '../../api/apiUser'; // Giả định axios instance của nhóm
import { useAuth } from '../../context/AuthContext';

const ChangePassword = () => {
  const navigate = useNavigate();
    const {user} = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // State quản lý thông báo lỗi/thành công
  const [status, setStatus] = useState({ type: '', message: '', code: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra nhanh tại Frontend
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'danger', message: 'Mật khẩu xác nhận không khớp!', code: 400 });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '', code: null });

    try {
      // Gọi API đổi mật khẩu
      const response = await apiUser.changePassword(user.userId, formData);
      console.log(">>----",response);
      setStatus({ type: 'success', message: 'Đổi mật khẩu thành công!', code: 200 });
      
      // Thành công thì xóa form và về trang chủ sau 2s
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate('/'), 2000);
      
    } catch (err) {
      // LOG LỖI THEO YÊU CẦU: Lấy message từ response và bắt mã 500
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra từ máy chủ!";
      const errorCode = err.response?.status || 500;

      setStatus({ 
        type: 'danger', 
        message: errorMsg, 
        code: errorCode 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if(!user) return;
  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm">
              <FaArrowLeft />
            </button>
            <h4 className="fw-bold mb-0 text-uppercase">Đổi mật khẩu</h4>
          </div>

          <div className="card border-0 shadow rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              
              {/* FIELD TỔNG ĐỂ LOG LỖI (Mã 500 / Message từ Backend) */}
              {status.message && (
                <div className={`alert alert-${status.type} d-flex align-items-center mb-4 shadow-sm border-0 animate__animated animate__shakeX`} role="alert">
                  {status.type === 'danger' ? <FaExclamationTriangle className="me-2"/> : <FaCheckCircle className="me-2"/>}
                  <div>
                    <strong>{status.code === 500 ? "[Hệ thống - 500]: " : ""}</strong>
                    {status.message}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Mật khẩu cũ */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Mật khẩu hiện tại</label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden">
                    <span className="input-group-text bg-white border-0"><FaKey className="text-primary"/></span>
                    <input 
                      type="password" 
                      className="form-control border-0 bg-white" 
                      name="oldPassword"
                      placeholder="••••••••"
                      value={formData.oldPassword} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Mật khẩu mới</label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden">
                    <span className="input-group-text bg-white border-0"><FaLock className="text-info"/></span>
                    <input 
                      type="password" 
                      className="form-control border-0 bg-white" 
                      name="newPassword"
                      placeholder="Mật khẩu ít nhất 6 ký tự"
                      value={formData.newPassword} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Xác nhận mật khẩu mới</label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden">
                    <span className="input-group-text bg-white border-0"><FaLock className="text-info"/></span>
                    <input 
                      type="password" 
                      className="form-control border-0 bg-white" 
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Nút bấm */}
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn btn-primary w-100 py-3 rounded-pill shadow fw-bold mt-2"
                >
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</>
                  ) : (
                    <><FaSave className="me-2"/> Cập nhật mật khẩu mới</>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          <p className="text-center mt-4 text-muted small">
            Nhóm khuyên bạn nên đặt mật khẩu mạnh để bảo vệ phòng trọ của mình!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;