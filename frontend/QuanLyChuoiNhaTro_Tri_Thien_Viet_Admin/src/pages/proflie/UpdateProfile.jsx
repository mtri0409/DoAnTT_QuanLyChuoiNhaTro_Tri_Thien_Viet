import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaUserCircle, FaIdCard, FaPhoneAlt, FaCalendarAlt, 
  FaArrowLeft, FaSave, FaExclamationCircle 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';

const UpdateProfile = () => {
  const { id } = useParams(); // Lấy profileId từ URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    identityNumber: '',
    idExpirationDate: '',
    idIssueDate: '',
    idIssuePlace: ''
  });

  const [errors, setErrors] = useState({});

  // 1. Lấy dữ liệu cũ đổ vào Form khi load trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiProfile.getProfileById(id);
        console.log(response)
        const data = response;
        // Map dữ liệu từ API vào form (đảm bảo đúng định dạng ngày YYYY-MM-DD cho input date)
        setFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          identityNumber: data.identityNumber || '',
          idExpirationDate: data.idExpirationDate || '',
          idIssueDate: data.idIssueDate || '',
          idIssuePlace: data.idIssuePlace || ''
        });
      } catch (err) {
        console.error("Lỗi khi lấy thông tin:", err);
        alert("Không thể tải thông tin hồ sơ.");
        navigate('/profiles');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

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
      // Gửi PUT request để cập nhật
      await apiProfile.updateProfile(id, formData);
      alert("Cập nhật hồ sơ thành công!");
      navigate('/profiles'); 
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data); // Hứng lỗi validation từ Backend
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

  if (fetching) return <div className="text-center py-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Chỉnh sửa hồ sơ</h4>
          <p className="text-muted small mb-0">Cập nhật thông tin định danh cho khách thuê ID: #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                  <FaUserCircle size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-dark">Thông tin liên lạc</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">HỌ VÀ TÊN</label>
                <input 
                  type="text" name="fullName"
                  className={`form-control bg-light border-0 py-2 ${errors.fullName ? 'is-invalid border-danger' : ''}`} 
                  value={formData.fullName}
                  onChange={handleInputChange} 
                />
                {renderError('fullName')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">SỐ ĐIỆN THOẠI</label>
                <div className="input-group">
                  <span className={`input-group-text bg-light border-0 ${errors.phone ? 'border border-danger border-end-0' : ''}`}>
                    <FaPhoneAlt className="text-success" size={12}/>
                  </span>
                  <input 
                    type="text" name="phone"
                    className={`form-control bg-light border-0 py-2 ${errors.phone ? 'is-invalid border border-danger border-start-0' : ''}`} 
                    value={formData.phone}
                    onChange={handleInputChange} 
                  />
                </div>
                {renderError('phone')}
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-muted">ĐỊA CHỈ THƯỜNG TRÚ</label>
                <textarea 
                  name="address" rows="5" 
                  className={`form-control bg-light border-0 ${errors.address ? 'is-invalid' : ''}`} 
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
                {renderError('address')}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
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
                    value={formData.identityNumber}
                    onChange={handleInputChange} 
                  />
                  {renderError('identityNumber')}
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-bold text-muted">NƠI CẤP</label>
                  <input type="text" name="idIssuePlace" className="form-control bg-light border-0 py-2" value={formData.idIssuePlace} onChange={handleInputChange} />
                </div>

                <div className="col-md-6 mt-4">
                  <label className="form-label small fw-bold text-muted"><FaCalendarAlt className="me-1 text-muted"/> NGÀY CẤP</label>
                  <input type="date" name="idIssueDate" className="form-control bg-light border-0 py-2" value={formData.idIssueDate} onChange={handleInputChange} />
                </div>

                <div className="col-md-6 mt-4">
                  <label className="form-label small fw-bold text-muted"><FaCalendarAlt className="me-1 text-muted"/> NGÀY HẾT HẠN</label>
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
                  <button type="button" onClick={() => navigate(-1)} className="btn btn-light px-4 me-2 border-0 fw-bold">Hủy bỏ</button>
                  <button type="submit" disabled={loading} className="btn btn-warning px-5 shadow-sm fw-bold">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật ngay'}
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

export default UpdateProfile;