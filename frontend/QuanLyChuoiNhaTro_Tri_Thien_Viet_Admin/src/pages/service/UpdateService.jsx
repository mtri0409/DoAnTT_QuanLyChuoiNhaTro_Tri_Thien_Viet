import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import apiServices from '../../api/apiService';

const UpdateService = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    serviceName: '',
    unit: '',
    price: '',
    serviceType: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      const res = await apiServices.getServiceById(id);
      const data = res.data || res;

      setFormData({
        serviceName: data.serviceName || '',
        unit: data.unit || '',
        price: data.price || '',
        serviceType: data.serviceType || '',
        isActive: data.is_active ?? true
      });

    } catch {
      alert("Không tìm thấy!");
      navigate('/services/1');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === 'isActive') newValue = value === 'true';

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiServices.updateService(id, {
        ...formData,
        is_active: formData.isActive
      });

      alert("Cập nhật thành công!");
      navigate('/services/1');

    } catch {
      alert("Lỗi!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container py-4">

      <button onClick={() => navigate(-1)} className="btn btn-light mb-3">
        <FaArrowLeft />
      </button>

      <form onSubmit={handleSubmit}>
        <div className="card p-4 shadow-sm">

          <input name="serviceName" value={formData.serviceName} onChange={handleInputChange} className="form-control mb-3"/>

          <input name="price" value={formData.price} onChange={handleInputChange} className="form-control mb-3"/>

          <input name="unit" value={formData.unit} onChange={handleInputChange} className="form-control mb-3"/>

          <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="form-select mb-3">
            <option value="METERED">METERED</option>
            <option value="FIXED">FIXED</option>
          </select>

          <select name="isActive" value={formData.isActive.toString()} onChange={handleInputChange} className="form-select mb-3">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button className="btn btn-primary">
            {loading ? "Đang lưu..." : <><FaSave/> Lưu</>}
          </button>

        </div>
      </form>
    </div>
  );
};

export default UpdateService;