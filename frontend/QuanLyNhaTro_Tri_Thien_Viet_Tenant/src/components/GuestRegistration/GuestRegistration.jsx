import React, { useState, useEffect } from 'react';
import {
  FaPlus, FaArrowLeft, FaTrash, FaImage, FaIdCard,
  FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendar,
  FaMotorcycle, FaInfoCircle
} from 'react-icons/fa';
import apiGuestRegistration from '../../api/apiGuestRegistration';
import { notify } from '../../utils/swalUtils';
import './GuestRegistration.css';

const GuestRegistration = ({  onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    profileId: null,
    fullName: '',
    phone: '',
    email: '',
    identityNumber: '',
    idIssueDate: '',
    idExpirationDate: '',
    idIssuePlace: '',
    address: '',
    relationship: '',
    memberType: 'STAYING_WITH',
    vehicles: [],
  });

  const [vehicles, setVehicles] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState({
    licensePlate: '',
    brand: '',
    color: ''
  });

  const [uploadingIdFront, setUploadingIdFront] = useState(false);
  const [uploadingIdBack, setUploadingIdBack] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle vehicle input changes
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setCurrentVehicle(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  // Add vehicle to list
  const addVehicle = () => {
    if (!currentVehicle.licensePlate || !currentVehicle.brand) {
      notify('Vui lòng nhập đầy đủ thông tin xe', 'warning');
      return;
    }

    // Check duplicate license plate
    if (vehicles.some(v => v.licensePlate === currentVehicle.licensePlate)) {
      notify('Biển số này đã tồn tại', 'warning');
      return;
    }

    setVehicles(prev => [...prev, { ...currentVehicle }]);
    setCurrentVehicle({ licensePlate: '', brand: '', color: '' });
  };

  // Remove vehicle from list
  const removeVehicle = (index) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle ID Front Image
  const handleIdFrontUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIdFrontPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle ID Back Image
  const handleIdBackUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIdBackPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    if (!formData.fullName.trim()) errors.push('Họ tên không được để trống');
    if (!formData.phone || formData.phone.length !== 10) errors.push('SĐT phải đủ 10 số');
    if (!formData.email) errors.push('Email không được để trống');
    if (!formData.identityNumber || formData.identityNumber.length !== 12) {
      errors.push('CCCD phải đủ 12 số');
    }
    if (!formData.idIssueDate) errors.push('Ngày cấp không được để trống');
    if (!formData.idExpirationDate) errors.push('Ngày hết hạn không được để trống');
    if (!formData.idIssuePlace) errors.push('Nơi cấp không được để trống');
    if (!formData.address || formData.address.trim().length === 0) {
      errors.push('Địa chỉ không được để trống');
    }
    if (!formData.relationship) errors.push('Mối quan hệ không được để trống');

    if (errors.length > 0) {
      errors.forEach(error => notify(error, 'error'));
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Tự động thêm xe nếu người dùng nhập thông tin vào ô nhưng quên bấm nút "Thêm"
      let finalVehicles = [...vehicles];
      if (currentVehicle.licensePlate.trim() && currentVehicle.brand.trim()) {
        const plate = currentVehicle.licensePlate.trim().toUpperCase();
        if (!finalVehicles.some(v => v.licensePlate === plate)) {
          finalVehicles.push({
            licensePlate: plate,
            brand: currentVehicle.brand.trim(),
            color: currentVehicle.color.trim()
          });
        }
      }

      const submitData = {
        ...formData,
        vehicles: finalVehicles.length > 0 ? finalVehicles : null
      };

      const response = await apiGuestRegistration.registerGuest(submitData);
      console.log('Đăng ký thành công:', response);
      if (response.memberId) {
        const memberId = response.memberId;
        notify('Đơn đăng ký người thân đã được gửi!', 'success');

        // Upload ID images if provided
        if (idFrontPreview) {
          try {
            const formDataFront = new FormData();
            const fileInputFront = document.getElementById('idFront');
            if (fileInputFront?.files[0]) {
              formDataFront.append('image', fileInputFront.files[0]);
              await apiGuestRegistration.uploadGuestIdFront(memberId, formDataFront);
              notify('Upload ảnh mặt trước thành công!', 'success');
            }
          } catch (imgError) {
            console.error('Lỗi upload ảnh trước:', imgError);
            notify('Lỗi upload ảnh mặt trước', 'warning');
          }
        }

        if (idBackPreview) {
          try {
            const formDataBack = new FormData();
            const fileInputBack = document.getElementById('idBack');
            if (fileInputBack?.files[0]) {
              formDataBack.append('image', fileInputBack.files[0]);
              await apiGuestRegistration.uploadGuestIdBack(memberId, formDataBack);
              notify('Upload ảnh mặt sau thành công!', 'success');
            }
          } catch (imgError) {
            console.error('Lỗi upload ảnh sau:', imgError);
            notify('Lỗi upload ảnh mặt sau', 'warning');
          }
        }

        if (onSuccess) {
          onSuccess();
        } else {
          // Reset form
          setFormData({
            profileId: null,
            fullName: '',
            phone: '',
            email: '',
            identityNumber: '',
            idIssueDate: '',
            idExpirationDate: '',
            idIssuePlace: '',
            address: '',
            relationship: '',
            memberType: 'STAYING_WITH',
            vehicles: [],
          });
          setVehicles([]);
          setIdFrontPreview(null);
          setIdBackPreview(null);
        }
      } else {
        throw new Error(response?.message || 'Không nhận được memberId từ server');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      notify(error.response?.data?.message || 'Lỗi đăng ký người thân', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container px-0 text-start">
      <form onSubmit={handleSubmit}>
        {/* Section: Thông tin cơ bản */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
            <FaUser className="text-primary" /> Thông Tin Cơ Bản
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">HỌ VÀ TÊN *</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">MỐI QUAN HỆ *</label>
              <select
                className="form-select rounded-3"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn mối quan hệ --</option>
                <option value="Vợ">Vợ</option>
                <option value="Chồng">Chồng</option>
                <option value="Con">Con</option>
                <option value="Anh">Anh</option>
                <option value="Em">Em</option>
                <option value="Cha">Cha</option>
                <option value="Mẹ">Mẹ</option>
                <option value="Bạn">Bạn</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">LOẠI THÀNH VIÊN *</label>
              <select
                className="form-select rounded-3"
                name="memberType"
                value={formData.memberType}
                onChange={handleInputChange}
                required
              >
                <option value="STAYING_WITH">Ở Nhờ Thường Xuyên (Ở cùng)</option>
                <option value="VISITING">Khách Đến Chơi (Ở lại tạm thời)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">SỐ ĐIỆN THOẠI *</label>
              <input
                type="tel"
                className="form-control rounded-3"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                pattern="\d{10}"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">EMAIL *</label>
              <input
                type="email"
                className="form-control rounded-3"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="small text-muted fw-bold mb-2">ĐỊA CHỈ THƯỜNG TRÚ *</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Giấy Tờ Tùy Thân */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
            <FaIdCard className="text-info" /> Giấy Tờ Tùy Thân & Ảnh CCCD
          </h6>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="small text-muted fw-bold mb-2">SỐ CCCD *</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="identityNumber"
                value={formData.identityNumber}
                onChange={handleInputChange}
                placeholder="12 số"
                pattern="\d{12}"
                maxLength="12"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="small text-muted fw-bold mb-2">NƠI CẤP *</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="idIssuePlace"
                value={formData.idIssuePlace}
                onChange={handleInputChange}
                placeholder="Công an TP/Tỉnh"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-2">NGÀY CẤP *</label>
              <input
                type="date"
                className="form-control rounded-3"
                name="idIssueDate"
                value={formData.idIssueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="small text-muted fw-bold mb-2">NGÀY HẾT HẠN *</label>
              <input
                type="date"
                className="form-control rounded-3"
                name="idExpirationDate"
                value={formData.idExpirationDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="row g-4">
            {/* Mặt trước */}
            <div className="col-md-6">
              <span className="small text-muted fw-bold d-block mb-2">MẶT TRƯỚC CCCD *</span>
              <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '200px' }}>
                {idFrontPreview ? (
                  <img src={idFrontPreview} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt trước" />
                ) : <span className="text-muted small">Chưa chọn ảnh mặt trước</span>}
              </div>
              <input
                id="idFront"
                type="file"
                accept="image/*"
                onChange={handleIdFrontUpload}
                hidden
              />
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100 py-2 rounded-3 shadow-sm fw-semibold"
                onClick={() => document.getElementById('idFront').click()}
              >
                <FaImage className="me-1" /> Chọn ảnh mặt trước
              </button>
            </div>

            {/* Mặt sau */}
            <div className="col-md-6">
              <span className="small text-muted fw-bold d-block mb-2">MẶT SAU CCCD *</span>
              <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '200px' }}>
                {idBackPreview ? (
                  <img src={idBackPreview} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt sau" />
                ) : <span className="text-muted small">Chưa chọn ảnh mặt sau</span>}
              </div>
              <input
                id="idBack"
                type="file"
                accept="image/*"
                onChange={handleIdBackUpload}
                hidden
              />
              <button
                type="button"
                className="btn btn-outline-dark btn-sm w-100 py-2 rounded-3 shadow-sm fw-semibold"
                onClick={() => document.getElementById('idBack').click()}
              >
                <FaImage className="me-1" /> Chọn ảnh mặt sau
              </button>
            </div>
          </div>
        </div>

        {/* Section: Đăng ký Xe */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
            <FaMotorcycle className="text-warning" /> Đăng ký Biển Số Xe (Tùy Chọn)
          </h6>
          <div className="row g-3 align-items-end mb-4">
            <div className="col-md-4">
              <label className="small text-muted fw-bold mb-2">BIỂN SỐ XE</label>
              <input
                type="text"
                className="form-control rounded-3 text-uppercase"
                name="licensePlate"
                value={currentVehicle.licensePlate}
                onChange={handleVehicleChange}
                placeholder="VD: 59A312345"
              />
            </div>
            <div className="col-md-4">
              <label className="small text-muted fw-bold mb-2">HÃNG XE</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="brand"
                value={currentVehicle.brand}
                onChange={handleVehicleChange}
                placeholder="VD: Honda Vision"
              />
            </div>
            <div className="col-md-3">
              <label className="small text-muted fw-bold mb-2">MÀU XE</label>
              <input
                type="text"
                className="form-control rounded-3"
                name="color"
                value={currentVehicle.color}
                onChange={handleVehicleChange}
                placeholder="VD: Trắng"
              />
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className="btn btn-dark w-100 py-2 rounded-3 fw-bold"
                onClick={addVehicle}
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Vehicle List */}
          {vehicles.length > 0 && (
            <div className="bg-light p-3 rounded-4 border">
              <label className="small text-muted fw-bold mb-3 d-block text-uppercase">Danh sách xe đã thêm:</label>
              <div className="d-flex flex-column gap-2">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center bg-white p-3 border rounded-3">
                    <div>
                      <strong className="text-dark">{vehicle.licensePlate}</strong>
                      <div className="text-muted small mt-1">{vehicle.brand} - Màu {vehicle.color}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger border-0 rounded-3 px-3 fw-bold"
                      onClick={() => removeVehicle(index)}
                    >
                      <FaTrash className="me-1" /> Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notice & Form Actions */}
        <div className="alert alert-info border-0 rounded-4 p-3 d-flex align-items-center gap-3 mb-4 shadow-sm">
          <FaInfoCircle className="text-info fs-4 flex-shrink-0" />
          <p className="mb-0 small text-dark opacity-75">
            Sau khi gửi đơn, quản lý sẽ kiểm duyệt thông tin của người thân.
            Bạn sẽ nhận được thông báo khi đơn được phê duyệt hoặc từ chối.
          </p>
        </div>

        <div className="d-flex justify-content-end gap-3 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary px-5 py-2.5 rounded-3 fw-semibold shadow-sm"
            onClick={onBack}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary px-5 py-2.5 rounded-3 fw-bold shadow-sm text-white"
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi Đơn Đăng Ký'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestRegistration;
