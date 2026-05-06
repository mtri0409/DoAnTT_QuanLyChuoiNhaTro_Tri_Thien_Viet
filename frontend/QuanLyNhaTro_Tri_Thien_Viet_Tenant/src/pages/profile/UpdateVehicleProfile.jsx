import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaCar, FaIdCard, FaArrowLeft, FaSave, FaExclamationCircle, FaTag, 
  FaUserCircle
} from 'react-icons/fa';
// Giả định bạn có apiVehicle hoặc tương đương
import apiVehicle from '../../api/apiVehicle'; 
import { notify } from '../../utils/swalUtils';
// import apiProfile from '../../api/apiProfile';

const UpdateVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nameOwner,setOwnerName] = useState("");
  const { id } = useParams();
  console.log(id);
  // 1. State lưu dữ liệu Form (Chỉ còn brand và licensePlate)
  const [formData, setFormData] = useState({
    brand: '',
    licensePlate: ''
  });

  // 2. State lưu thông báo lỗi từ Backend
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };
  
 
  useEffect(() => {
    const fetchVehicleById = async (id) => {
      try {
        const response = await apiVehicle.getVehicleById(id);
        console.log("Dữ liệu xe:", response);

        setFormData({
          brand: response.brand || '',
          licensePlate: response.licensePlate || '',
        });
        
        setOwnerName(response.fullName || response.ownerName || 'Không rõ');

      } catch (error) {
        console.error("Lỗi server:", error.response?.data || error.message);
      }
    };

    // 3. Thực thi hàm nếu có id
    if (id) {
      fetchVehicleById(id);
    }

  }, [id]); 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      console.log(formData);
      // Gọi API thêm xe
      await apiVehicle.updateVehicle(id,formData);
      notify("Cập nhập phương tiện thành công!");
      navigate(-1); 
    } catch (err) {
      console.error("Lỗi API:", err.response);
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data || {});
      } else {
        notify("Lỗi hệ thống hoặc mất kết nối Server.","error");
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
      {/* Header Điều hướng */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          title="Quay lại"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Thêm xe mới</h4>
          <p className="text-muted small mb-0">Đăng ký phương tiện mới vào hệ thống quản lý</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaCar size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin phương tiện</h6>
              </div>

             <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    <FaUserCircle className="me-1 text-primary"/> Chủ xe <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="ownerName" // Đổi từ "brand" thành "ownerName" cho đúng ý nghĩa
                    className="form-control bg-light border-0 py-2 fw-semibold" 
                    value={nameOwner} // Hiển thị biến nameOwner
                    disabled          // Vô hiệu hóa không cho nhập
                    style={{ cursor: 'not-allowed', opacity: 0.8 }} // Thêm style để người dùng biết là ô này bị khóa
                  />
                  {/* Thông báo nhắc nhở nhẹ nếu cần */}
                  <div className="form-text small text-muted">
                    Thông tin chủ xe được lấy tự động từ hồ sơ khách thuê.
                  </div>
              </div>

              {/* HÃNG XE / HIỆU XE */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  <FaTag className="me-1"/> Hãng xe <span className="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  name="brand"
                  className={`form-control bg-light border-0 py-2 ${errors.brand ? 'is-invalid border-danger' : ''}`} 
                  placeholder="VD: Honda Vision, Yamaha Exciter..." 
                  value={formData.brand}
                  onChange={handleInputChange} 
                />
                {renderError('brand')}
              </div>

              {/* BIỂN SỐ XE */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  <FaIdCard className="me-1"/> Biển số xe <span className="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  name="licensePlate"
                  className={`form-control bg-light border-0 py-2 fw-bold ${errors.licensePlate ? 'is-invalid border-danger' : ''}`} 
                  placeholder="VD: 59-X3 123.45" 
                  value={formData.licensePlate}
                  onChange={handleInputChange} 
                />
                {renderError('licensePlate')}
              </div>

              {/* NÚT THAO TÁC */}
              <div className="pt-3 text-end">
                <hr className="text-muted opacity-25 mb-4" />
                <button 
                  type="button" 
                  onClick={() => navigate('/vehicles')}
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
                    <><FaSave size={14}/> Lưu phương tiện</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateVehicle;