import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTools, FaArrowLeft, FaSave, FaExclamationCircle 
} from 'react-icons/fa';
import apiService from '../../api/apiService';

const CreateService = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    serviceName: '',
    unit: '',
    price: '',
    serviceType: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // convert status -> boolean
    if (name === 'isActive') {
      newValue = value === 'true';
    }

    setFormData({ ...formData, [name]: newValue });

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
      await apiService.createService({
        ...formData,
        is_active: formData.isActive // map đúng DB
      });

      alert("Tạo dịch vụ thành công!");
      navigate('/services/1');

    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        alert("Lỗi hệ thống.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <div className="text-danger small mt-1 d-flex gap-1">
        <FaExclamationCircle size={12}/> {errors[field]}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light shadow-sm rounded-circle">
          <FaArrowLeft />
        </button>
        <div>
          <h4 className="fw-bold text-uppercase mb-0">Tạo dịch vụ</h4>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">

          {/* LEFT */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4">

              {/* NAME */}
              <div className="mb-3">
                <label className="fw-bold small text-muted">TÊN DỊCH VỤ *</label>
                <input
                  name="serviceName"
                  className={`form-control bg-light border-0 ${errors.serviceName && 'is-invalid'}`}
                  value={formData.serviceName}
                  onChange={handleInputChange}
                />
                {renderError('serviceName')}
              </div>

              {/* PRICE */}
              <div className="mb-3">
                <label className="fw-bold small text-muted">GIÁ *</label>
                <input
                  type="number"
                  name="price"
                  className="form-control bg-light border-0"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              {/* UNIT */}
              <div className="mb-3">
                <label className="fw-bold small text-muted">ĐƠN VỊ *</label>
                <input
                  name="unit"
                  className="form-control bg-light border-0"
                  value={formData.unit}
                  onChange={handleInputChange}
                />
              </div>

              {/* TYPE */}
              <div className="mb-3">
                <label className="fw-bold small text-muted">LOẠI DỊCH VỤ</label>
                <select
                  name="serviceType"
                  className="form-select bg-light border-0"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn --</option>
                  <option value="METERED">Theo chỉ số</option>
                  <option value="FIXED">Cố định</option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="fw-bold small text-muted">TRẠNG THÁI</label>
                <select
                  name="isActive"
                  className="form-select bg-light border-0"
                  value={formData.isActive.toString()}
                  onChange={handleInputChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

            </div>
          </div>

          {/* ACTION */}
          <div className="col-12 text-end">
            <button type="submit" disabled={loading} className="btn btn-primary px-5">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default CreateService;