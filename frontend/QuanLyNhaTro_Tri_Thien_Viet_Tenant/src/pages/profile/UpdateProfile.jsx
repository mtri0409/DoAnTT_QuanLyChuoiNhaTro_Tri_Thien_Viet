import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaIdCard, FaCalendarAlt, FaSave, FaArrowLeft, FaCheckCircle 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';

const ProfileUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State quản lý form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identityNumber: '',
    idIssuePlace: '',
    idIssueDate: '',
    idExpirationDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Lấy dữ liệu cũ đổ vào Form
  useEffect(() => {
    const fetchOldData = async () => {
      try {
        const data = await apiProfile.getProfileById(id);
        // Map dữ liệu từ API vào form (tránh null)
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          identityNumber: data.identityNumber || '',
          idIssuePlace: data.idIssuePlace || '',
          idIssueDate: data.idIssueDate || '',
          idExpirationDate: data.idExpirationDate || ''
        });
      } catch (err) {
        setMessage({ type: 'danger', text: 'Không thể tải dữ liệu hồ sơ!' });
      } finally {
        setLoading(false);
      }
    };
    fetchOldData();
  }, [id]);

  // 2. Xử lý thay đổi Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Gửi dữ liệu cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await apiProfile.updateProfile(id, formData);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      
      // Đợi 1.5s rồi quay lại trang chi tiết
      setTimeout(() => navigate(`/user/profile/${id}`), 1500);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm">
          <FaArrowLeft />
        </button>
        <h4 className="fw-bold mb-0">CẬP NHẬT HỒ SƠ</h4>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} d-flex align-items-center shadow-sm rounded-4`} role="alert">
          {message.type === 'success' ? <FaCheckCircle className="me-2"/> : null}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="row g-4">
        {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold mb-4 text-primary border-bottom pb-2">Thông tin liên lạc</h6>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Họ và tên</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><FaUser className="text-muted"/></span>
                <input type="text" className="form-control border-0 bg-light" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold">Số điện thoại</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaPhone className="text-muted"/></span>
                  <input type="text" className="form-control border-0 bg-light" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaEnvelope className="text-muted"/></span>
                  <input type="email" className="form-control border-0 bg-light" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Địa chỉ thường trú</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><FaMapMarkerAlt className="text-muted"/></span>
                <textarea className="form-control border-0 bg-light" name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: ĐỊNH DANH (CCCD) */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold mb-4 text-info border-bottom pb-2">Định danh cá nhân</h6>

            <div className="mb-3">
              <label className="form-label small fw-bold">Số CCCD / Định danh</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><FaIdCard className="text-muted"/></span>
                <input type="text" className="form-control border-0 bg-light" name="identityNumber" value={formData.identityNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Nơi cấp</label>
              <input type="text" className="form-control border-0 bg-light" name="idIssuePlace" value={formData.idIssuePlace} onChange={handleChange} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold">Ngày cấp</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaCalendarAlt className="text-muted"/></span>
                  <input type="date" className="form-control border-0 bg-light" name="idIssueDate" value={formData.idIssueDate} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold">Ngày hết hạn</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaCalendarAlt className="text-muted text-danger"/></span>
                  <input type="date" className="form-control border-0 bg-light" name="idExpirationDate" value={formData.idExpirationDate} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nút bấm cuối cùng */}
        <div className="col-12 text-end mt-3">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-link text-muted me-3 text-decoration-none">Hủy bỏ</button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary px-5 py-2 rounded-pill shadow shadow-sm fw-bold">
            {isSubmitting ? (
              <><span className="spinner-border spinner-border-sm me-2"></span> Đang lưu...</>
            ) : (
              <><FaSave className="me-2"/> Lưu thay đổi</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;