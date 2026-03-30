import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { 
  FaUserShield, FaKey, FaUserCheck, FaArrowLeft, 
  FaSave, FaExclamationCircle, FaEye, FaEyeSlash, FaTimes 
} from 'react-icons/fa';
import apiUser from '../../api/apiUser';
import apiProfile from '../../api/apiProfile';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [serverError, setServerError] = useState(null);

  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });

  const [profileId, setProfileId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await apiProfile.getProfileWithoutAccount(); 
        const options = response.map(p => ({
          value: p.profileId,
          label: `${p.fullName} - ${p.phone}`
        }));
        setProfiles(options);
      } catch (err) {
        console.log(err)
        setServerError("Không thể tải danh sách hồ sơ từ máy chủ.");
      }
    };
    fetchProfiles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    // Khi người dùng nhập lại thì ẩn lỗi server đi cho thoáng
    if (serverError) setServerError(null);
  };

  const handleSelectChange = (selectedOption) => {
    setProfileId(selectedOption ? selectedOption.value : null);
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    if (!profileId) {
        setServerError("Vui lòng chọn một hồ sơ để liên kết tài khoản.");
        setLoading(false);
        return;
    }

    try {
      await apiUser.createAccount(profileId, formData);
      alert("Tạo tài khoản hệ thống thành công!");
      navigate('/users'); 
    } catch (err) {
      console.error("Full Error:", err);
      
      if (err.response) {
        if (err.response.status === 400) {
            setErrors(err.response.data); 
        } 
        else {
            const msg = err.response.data?.message || "Đã xảy ra lỗi ngoài ý muốn từ phía máy chủ.";
            setServerError(msg);
        }
      } else {
        setServerError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={12}/> {errors[fieldName]}
      </div>
    );
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Cấp tài khoản mới</h4>
          <p className="text-muted small mb-0">Liên kết hồ sơ khách thuê với tài khoản đăng nhập</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">

          {/* ----- LOG LỖI SERVER TẠI ĐÂY ----- */}
          {serverError && (
            <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center animate__animated animate__shakeX" role="alert">
              <div className="bg-danger text-white p-2 rounded-3 me-3">
                <FaExclamationCircle size={18} />
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">Lỗi yêu cầu</div>
                <div className="small text-danger-emphasis">{serverError}</div>
              </div>
              <button 
                type="button" 
                className="btn-close small" 
                onClick={() => setServerError(null)}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaUserShield size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin đăng nhập</h6>
              </div>

              {/* CHỌN PROFILE */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">CHỌN HỒ SƠ LIÊN KẾT <span className="text-danger">*</span></label>
                <Select
                  options={profiles}
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                  isClearable
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#f8f9fa',
                      border: '0',
                      borderRadius: '8px',
                      padding: '2px',
                      boxShadow: 'none'
                    })
                  }}
                />
              </div>

              {/* TÊN ĐĂNG NHẬP */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">TÊN ĐĂNG NHẬP <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaUserCheck className="text-muted" size={14}/></span>
                  <input 
                    type="text" name="userName"
                    className={`form-control bg-light border-0 py-2 ${errors.userName ? 'is-invalid' : ''}`} 
                    placeholder="VD: trithienviet123" 
                    value={formData.userName}
                    onChange={handleInputChange} 
                  />
                </div>
                {renderError('userName')}
              </div>

              {/* MẬT KHẨU */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">MẬT KHẨU TẠM THỜI <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaKey className="text-muted" size={14}/></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    className={`form-control bg-light border-0 py-2 ${errors.password ? 'is-invalid' : ''}`} 
                    placeholder="Tối thiểu 6 ký tự" 
                    value={formData.password}
                    onChange={handleInputChange} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-light border-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
                  </button>
                </div>
                {renderError('password')}
              </div>

              {/* NÚT THAO TÁC */}
              <div className="mt-4 pt-3 text-end border-top">
                <button 
                  type="button" 
                  onClick={() => navigate('/users')}
                  className="btn btn-light px-4 me-2 border-0 fw-bold text-muted"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm"></span> Đang tạo...</>
                  ) : (
                    <><FaSave size={14}/> Tạo tài khoản</>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;