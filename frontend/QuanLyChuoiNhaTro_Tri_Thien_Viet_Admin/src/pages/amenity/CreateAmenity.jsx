import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaToolbox, FaImage, FaArrowLeft, 
  FaSave, FaExclamationCircle 
} from 'react-icons/fa';
import apiAmenity from '../../api/apiAmenity';

const CreateAmenity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amenityName: '',
    icon: ''
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
      const res = await apiAmenity.createAmenity(formData);
      console.log(res);

      alert("Thêm tiện ích thành công!");
      navigate('/amenities/1');

    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data;

        if (backendErrors) {
          setErrors(backendErrors);
        } else {
          alert(err.response.data.message || "Dữ liệu không hợp lệ.");
        }
      } else {
        alert("Lỗi hệ thống hoặc mất kết nối server.");
      }

    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={12}/> {errors[field]}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
        >
          <FaArrowLeft />
        </button>

        <div>
          <h4 className="fw-bold text-uppercase mb-0">Thêm tiện ích</h4>
          <p className="text-muted small mb-0">
            Quản lý tiện ích phòng
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* LEFT */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">

              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaToolbox />
                </div>
                <h6 className="fw-bold mb-0 text-primary">
                  Thông tin tiện ích
                </h6>
              </div>

              {/* NAME */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">
                  TÊN TIỆN ÍCH <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="amenityName"
                  className={`form-control bg-light border-0 py-2 ${errors.amenityName ? 'is-invalid border-danger' : ''}`}
                  placeholder="VD: Wifi, Máy lạnh..."
                  value={formData.amenityName}
                  onChange={handleInputChange}
                />
                {renderError('amenityName')}
              </div>

              {/* ICON */}
              <div className="mb-0">
                <label className="form-label small fw-bold text-muted">
                  ICON (tuỳ chọn)
                </label>

                <input
                  type="text"
                  name="icon"
                  className="form-control bg-light border-0 py-2"
                  placeholder="VD: wifi, tv, fan..."
                  value={formData.icon}
                  onChange={handleInputChange}
                />
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex justify-content-center align-items-center text-center">

              <FaImage size={40} className="text-primary mb-3"/>

              <h5 className="fw-bold">Thông tin tiện ích</h5>
              <p className="text-muted small mb-0">
                Nhập tên tiện ích và icon để thêm mới vào hệ thống
              </p>

            </div>
          </div>

          {/* ACTION */}
          <div className="col-12 text-end">
            <hr className="opacity-25" />

            <button
              type="button"
              onClick={() => navigate('/amenities/1')}
              className="btn btn-light me-2 fw-bold"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-5 fw-bold d-inline-flex align-items-center gap-2"
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm"></span> Đang lưu...</>
              ) : (
                <><FaSave size={14}/> Lưu</>
              )}
            </button>

          </div>

        </div>
      </form>
    </div>
  );
};

export default CreateAmenity;