import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBuilding, FaMapMarkerAlt, FaArrowLeft, 
  FaSave, FaExclamationCircle 
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';

const UpdateBranch = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const [formData, setFormData] = useState({
    branchName: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const loadBranch = async () => {
    try {
      const res = await apiBranches.getBranchById(id);

      setFormData({
        branchName: res.branchName || '',
        address: res.address || ''
      });

    } catch (err) {
      console.error(err);
      alert("Không tìm thấy chi nhánh!");
      navigate('/branches/1');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    loadBranch();
  }, [id]);

  // HANDLE INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await apiBranches.updateBranch(id, formData);
      console.log(res);

      alert("Cập nhật chi nhánh thành công!");
      navigate('/branches/1');

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

  // RENDER ERROR
  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={12}/> {errors[field]}
      </div>
    );
  };

  if (initLoading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border"></div>
      </div>
    );
  }

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
          <h4 className="fw-bold text-uppercase mb-0">Cập nhật chi nhánh</h4>
          <p className="text-muted small mb-0">
            Chỉnh sửa thông tin chi nhánh trong hệ thống
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
                  <FaBuilding />
                </div>
                <h6 className="fw-bold mb-0 text-primary">
                  Thông tin chi nhánh
                </h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">
                  TÊN CHI NHÁNH <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="branchName"
                  className={`form-control bg-light border-0 py-2 ${errors.branchName ? 'is-invalid border-danger' : ''}`}
                  value={formData.branchName}
                  onChange={handleInputChange}
                />
                {renderError('branchName')}
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-muted">
                  ĐỊA CHỈ <span className="text-danger">*</span>
                </label>

                <textarea
                  name="address"
                  rows="4"
                  className={`form-control bg-light border-0 ${errors.address ? 'is-invalid' : ''}`}
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
                {renderError('address')}
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex justify-content-center align-items-center text-center">

              <FaMapMarkerAlt size={40} className="text-primary mb-3"/>

              <h5 className="fw-bold">Cập nhật chi nhánh</h5>
              <p className="text-muted small mb-0">
                Chỉnh sửa tên và địa chỉ chi nhánh
              </p>

            </div>
          </div>

          {/* ACTION */}
          <div className="col-12 text-end">
            <hr className="opacity-25" />

            <button
              type="button"
              onClick={() => navigate('/branches/1')}
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
                <><FaSave size={14}/> Cập nhật</>
              )}
            </button>

          </div>

        </div>
      </form>
    </div>
  );
};

export default UpdateBranch;