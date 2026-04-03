import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, 
  FaCalendarAlt, FaArrowLeft, FaSave, FaExclamationCircle,
  FaEnvelope // Thêm icon email
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
import apiUser from '../../api/apiUser';

const CreateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 1. Thêm email vào formData
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '', // Trường mới
    address: '',
    identityNumber: '',
    idExpirationDate: '',
    idIssueDate: '',
    idIssuePlace: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await apiProfile.createProfile(formData);
      await apiUser.generareAcount(response.profileId);
      alert("Tạo hồ sơ khách thuê thành công!");
      navigate('/profiles'); 
    } catch (err) {
      console.error("Lỗi API:", err.response);
      if (err.response && err.response.status === 400) {

        const backendErrors = err.response.data;

        if (backendErrors) {
          setErrors(backendErrors);
        } else {
          alert(err.response.data || "Dữ liệu không hợp lệ.");
        }
      } else {
        alert("Lỗi hệ thống hoặc mất kết nối Server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1 animate__animated animate__fadeIn">
        <FaExclamationCircle size={12}/> {errors[fieldName]}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          title="Quay lại"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Thêm khách thuê mới</h4>
          <p className="text-muted small mb-0">Thông tin sẽ được lưu vào hệ thống quản lý chuỗi nhà trọ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN LẠC */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaUserCircle size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin cơ bản</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">HỌ VÀ TÊN <span className="text-danger">*</span></label>
                <input 
                  type="text" name="fullName"
                  className={`form-control bg-light border-0 py-2 ${errors.fullName ? 'is-invalid border-danger' : ''}`} 
                  placeholder="VD: Phạm Đình Minh Tri" 
                  value={formData.fullName}
                  onChange={handleInputChange} 
                />
                {renderError('fullName')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">SỐ ĐIỆN THOẠI <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className={`input-group-text bg-light border-0 ${errors.phone ? 'border border-danger border-end-0' : ''}`}>
                    <FaPhoneAlt className="text-success" size={12}/>
                  </span>
                  <input 
                    type="text" name="phone"
                    className={`form-control bg-light border-0 py-2 ${errors.phone ? 'is-invalid border border-danger border-start-0' : ''}`} 
                    placeholder="09xx xxx xxx" 
                    value={formData.phone}
                    onChange={handleInputChange} 
                  />
                </div>
                {renderError('phone')}
              </div>

              {/* TRƯỜNG EMAIL MỚI THÊM */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">EMAIL LIÊN HỆ</label>
                <div className="input-group">
                  <span className={`input-group-text bg-light border-0 ${errors.email ? 'border border-danger border-end-0' : ''}`}>
                    <FaEnvelope className="text-primary" size={12}/>
                  </span>
                  <input 
                    type="email" name="email"
                    className={`form-control bg-light border-0 py-2 ${errors.email ? 'is-invalid border border-danger border-start-0' : ''}`} 
                    placeholder="example@gmail.com" 
                    value={formData.email}
                    onChange={handleInputChange} 
                  />
                </div>
                {renderError('email')}
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-muted">ĐỊA CHỈ THƯỜNG TRÚ</label>
                <textarea 
                  name="address" rows="4" 
                  className={`form-control bg-light border-0 ${errors.address ? 'is-invalid' : ''}`} 
                  placeholder="Địa chỉ chi tiết..." 
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
                {renderError('address')}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: GIẤY TỜ ĐỊNH DANH */}
          <div className="col-lg-7">
            {/* Giữ nguyên code cũ của Tri */}
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info">
                  <FaIdCard size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-info">Giấy tờ tùy thân (CCCD)</h6>
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small fw-bold text-muted">SỐ CCCD / ĐỊNH DANH</label>
                  <input 
                    type="text" name="identityNumber" 
                    className={`form-control bg-light border-0 py-2 fw-bold text-primary ${errors.identityNumber ? 'is-invalid border-danger' : ''}`} 
                    placeholder="12 chữ số" 
                    value={formData.identityNumber}
                    onChange={handleInputChange} 
                  />
                  {renderError('identityNumber')}
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-bold text-muted">NƠI CẤP</label>
                  <input 
                    type="text" name="idIssuePlace" 
                    className="form-control bg-light border-0 py-2" 
                    value={formData.idIssuePlace}
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="col-md-6 mt-4">
                  <label className="form-label small fw-bold text-muted">
                    <FaCalendarAlt className="me-1 text-muted"/> NGÀY CẤP
                  </label>
                  <input 
                    type="date" name="idIssueDate" 
                    className="form-control bg-light border-0 py-2" 
                    value={formData.idIssueDate}
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="col-md-6 mt-4">
                  <label className="form-label small fw-bold text-muted">
                    <FaCalendarAlt className="me-1 text-muted"/> NGÀY HẾT HẠN
                  </label>
                  <input 
                    type="date" name="idExpirationDate" 
                    className={`form-control bg-light border-0 py-2 ${errors.idExpirationDate ? 'is-invalid border-danger' : ''}`} 
                    value={formData.idExpirationDate}
                    onChange={handleInputChange} 
                  />
                  {renderError('idExpirationDate')}
                </div>

                <div className="col-12 mt-auto pt-5 text-end">
                  <hr className="text-muted opacity-25 mb-4" />
                  <button 
                    type="button" 
                    onClick={() => navigate('/profiles')}
                    className="btn btn-light px-4 me-2 border-0 fw-bold"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm"></span> Đang lưu...</>
                    ) : (
                      <><FaSave size={14}/> Lưu hồ sơ</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;