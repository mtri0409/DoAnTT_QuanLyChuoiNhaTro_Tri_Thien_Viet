import React, { useState, useEffect, useRef } from "react";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaYoutube,
  FaMapMarkerAlt,
  FaCopyright,
  FaSave,
  FaUndo,
  FaImage,
  FaGlobe,
  FaCloudUploadAlt,
  FaTrash,
  FaSpinner,
  FaPhoneAlt,
} from "react-icons/fa";
import apiSystemSetting from "../../api/apiSetting";
import { toast } from "react-toastify";

// ====================== COMPONENTS ======================
const SettingSection = ({ icon, title, children }) => (
  <div className="card border-0 shadow-sm rounded-4 mb-4">
    <div className="card-header bg-white border-0 py-3 px-4">
      <div className="d-flex align-items-center gap-2">
        <div className="p-2 rounded-3 bg-primary-subtle text-primary">
          {icon}
        </div>
        <h5 className="fw-bold mb-0 text-primary">{title}</h5>
      </div>
    </div>
    <div className="card-body px-4 pb-4">{children}</div>
  </div>
);

const SettingRow = ({ label, children, required }) => (
  <div className="row mb-3 align-items-start">
    <div className="col-md-3">
      <label className="fw-semibold text-dark pt-2">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
    </div>
    <div className="col-md-9">{children}</div>
  </div>
);

// Component upload ảnh đơn giản
const ImageUploadField = ({ label, value, onUpload, uploadLoading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    // Kiểm tra định dạng
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPEG, PNG, GIF, WEBP)");
      e.target.value = "";
      return;
    }

    await onUpload(file);
    e.target.value = ""; // Reset input
  };

  const getImageUrl = (fileName) => {
    if (!fileName) return "";
    if (fileName.startsWith("http")) return fileName;
    return `http://localhost:8080/api/public/system/image/${fileName}`;
  };

  return (
    <div>
      <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '180px' }}>
        {value ? (
          <img 
            src={getImageUrl(value)} 
            className="img-fluid h-100 w-100 object-fit-contain" 
            alt={label} 
          />
        ) : (
          <span className="text-muted small">Chưa có {label.toLowerCase()}</span>
        )}
      </div>
      
      <div className="d-flex gap-2">
        <input 
          type="file" 
          id={`${label}-input`} 
          hidden 
          onChange={handleFileChange} 
          accept="image/*" 
          ref={fileInputRef}
        />
        <label 
          htmlFor={`${label}-input`} 
          className={`btn btn-sm w-100 py-2 ${uploadLoading ? 'btn-secondary' : 'btn-primary'} rounded-3 shadow-sm`}
          style={{ cursor: uploadLoading ? 'not-allowed' : 'pointer' }}
        >
          {uploadLoading ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <><FaCloudUploadAlt className="me-2" /> Tải {label.toLowerCase()} lên</>
          )}
        </label>
      </div>
    </div>
  );
};

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    name: "",
    hotline: "",
    email: "",
    logo: "",
    favicon: "",
    facebookLink: "",
    youtubeLink: "",
    address: "",
    copyrightText: "",
    primaryColor: "#0d6efd",
    isMaintenance: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ====================== FETCH ======================
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiSystemSetting.getSetting();
      setSettings({
        name: data.name || "",
        hotline: data.hotline || "",
        email: data.email || "",
        logo: data.logo || "",
        favicon: data.favicon || "",
        facebookLink: data.facebookLink || "",
        youtubeLink: data.youtubeLink || "",
        address: data.address || "",
        copyrightText: data.copyrightText || "",
        primaryColor: data.primaryColor || "#0d6efd",
        isMaintenance: data.isMaintenance || false,
      });
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
      setError("Không thể tải thông tin cài đặt");
    } finally {
      setLoading(false);
    }
  };

  // ====================== HANDLERS ======================
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Upload Logo
  const handleUploadLogo = async (file) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await apiSystemSetting.uploadLogo(formData);
      await fetchSettings(); // Refresh dữ liệu
      toast.success("Cập nhật logo thành công!");
    } catch (err) {
      console.error("Lỗi upload logo:", err);
      toast.error("Lỗi upload logo!");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Favicon
  const handleUploadFavicon = async (file) => {
    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await apiSystemSetting.uploadFavicon(formData);
      await fetchSettings(); // Refresh dữ liệu
      toast.success("Cập nhật favicon thành công!");
    } catch (err) {
      console.error("Lỗi upload favicon:", err);
      toast.error("Lỗi upload favicon!");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await apiSystemSetting.update(settings);
      toast.success("Cập nhật cài đặt thành công!");
      setSuccess("Cập nhật cài đặt thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      const errorMsg = err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Bạn có muốn reset về cài đặt mặc định?")) {
      fetchSettings();
    }
  };

  // ====================== LOADING ======================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Đang tải cài đặt hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Cài đặt hệ thống</h3>
          <p className="text-muted mb-0">Quản lý thông tin chung của hệ thống</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            <FaUndo className="me-2" />
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert */}
      {error && (
        <div className="alert alert-danger rounded-3 mb-4 d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success rounded-3 mb-4 d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Thông tin chung */}
        <SettingSection icon={<FaBuilding size={18} />} title="Thông tin chung">
          <SettingRow label="Tên hệ thống" required>
            <input
              type="text"
              className="form-control"
              value={settings.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Hệ Thống Quản Lý Nhà Trọ"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow label="Số điện thoại hotline">
            <input
              type="tel"
              className="form-control"
              value={settings.hotline}
              onChange={(e) => handleChange("hotline", e.target.value)}
              placeholder="VD: 0901234567"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow label="Email liên hệ">
            <input
              type="email"
              className="form-control"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="VD: contact@example.com"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow label="Địa chỉ">
            <textarea
              className="form-control"
              rows={2}
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="VD: 123 Đường ABC, Quận XYZ, TP. HCM"
              disabled={saving}
            />
          </SettingRow>
        </SettingSection>

        {/* Hình ảnh & Giao diện */}
        <SettingSection icon={<FaImage size={18} />} title="Hình ảnh & Giao diện">
          <SettingRow label="Logo">
            <ImageUploadField
              label="Logo"
              value={settings.logo}
              onUpload={handleUploadLogo}
              uploadLoading={uploadingLogo}
            />
          </SettingRow>

          <SettingRow label="Favicon">
            <ImageUploadField
              label="Favicon"
              value={settings.favicon}
              onUpload={handleUploadFavicon}
              uploadLoading={uploadingFavicon}
            />
            <small className="text-muted d-block mt-2">
              Favicon là biểu tượng hiển thị trên tab trình duyệt (kích thước khuyến nghị: 32x32 hoặc 64x64 pixels)
            </small>
          </SettingRow>

          <SettingRow label="Màu chủ đạo">
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <input
                type="color"
                className="form-control form-control-color"
                value={settings.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                style={{ width: 60 }}
                disabled={saving}
              />
              <input
                type="text"
                className="form-control"
                value={settings.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                placeholder="#0d6efd"
                style={{ width: 120 }}
                disabled={saving}
              />
              <div
                className="rounded-circle shadow-sm"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: settings.primaryColor,
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1px #ddd"
                }}
              />
              <span className="text-muted small">Mã màu hex (VD: #0d6efd)</span>
            </div>
          </SettingRow>
        </SettingSection>

        {/* Mạng xã hội */}
        <SettingSection icon={<FaGlobe size={18} />} title="Mạng xã hội">
          <SettingRow label="Facebook">
            <input
              type="url"
              className="form-control"
              value={settings.facebookLink}
              onChange={(e) => handleChange("facebookLink", e.target.value)}
              placeholder="https://facebook.com/your-page"
              disabled={saving}
            />
          </SettingRow>

          <SettingRow label="Youtube">
            <input
              type="url"
              className="form-control"
              value={settings.youtubeLink}
              onChange={(e) => handleChange("youtubeLink", e.target.value)}
              placeholder="https://youtube.com/@your-channel"
              disabled={saving}
            />
          </SettingRow>
        </SettingSection>

        {/* Footer & Bản quyền */}
        <SettingSection icon={<FaCopyright size={18} />} title="Footer & Bản quyền">
          <SettingRow label="Nội dung bản quyền">
            <input
              type="text"
              className="form-control"
              value={settings.copyrightText}
              onChange={(e) => handleChange("copyrightText", e.target.value)}
              placeholder="Copyright © 2024 Your Company. All rights reserved."
              disabled={saving}
            />
          </SettingRow>

          <SettingRow label="Chế độ bảo trì">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="maintenanceMode"
                checked={settings.isMaintenance}
                onChange={(e) => handleChange("isMaintenance", e.target.checked)}
                disabled={saving}
                style={{
                  cursor: saving ? "not-allowed" : "pointer",
                  width: 40,
                  height: 20,
                  backgroundColor: settings.isMaintenance ? "#dc3545" : "#198754"
                }}
              />
              <label className="form-check-label ms-2" htmlFor="maintenanceMode">
                {settings.isMaintenance ? (
                  <span className="text-danger">🔧 Đang bảo trì (chỉ admin truy cập)</span>
                ) : (
                  <span className="text-success">✅ Hệ thống hoạt động bình thường</span>
                )}
              </label>
            </div>
            <small className="text-muted d-block mt-1">
              Khi bật chế độ bảo trì, người dùng thường sẽ thấy thông báo bảo trì
            </small>
          </SettingRow>
        </SettingSection>

        {/* Preview thông tin */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">🔍 Xem trước thông tin</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex flex-column gap-2">
                  {settings.logo && (
                    <div className="d-flex align-items-center gap-2">
                      <img 
                        src={`http://localhost:8080/api/public/system/image/${settings.logo}`}
                        alt="Logo" 
                        style={{ height: 32, objectFit: "contain" }}
                        onError={(e) => e.target.style.display = "none"}
                      />
                    </div>
                  )}
                  <div className="d-flex align-items-center gap-2">
                    <FaBuilding className="text-primary" size={14} />
                    <strong>{settings.name || "Chưa có tên"}</strong>
                  </div>
                  {settings.hotline && (
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <FaPhoneAlt size={12} />
                      <span>{settings.hotline}</span>
                    </div>
                  )}
                  {settings.email && (
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <FaEnvelope size={12} />
                      <span>{settings.email}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                {settings.facebookLink && (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FaFacebook size={14} className="text-primary" />
                    <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  </div>
                )}
                {settings.youtubeLink && (
                  <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                    <FaYoutube size={14} className="text-danger" />
                    <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer">
                      Youtube
                    </a>
                  </div>
                )}
              </div>
            </div>
            {settings.address && (
              <div className="mt-3 pt-2 border-top">
                <div className="d-flex gap-2 text-muted small">
                  <FaMapMarkerAlt size={12} />
                  <span>{settings.address}</span>
                </div>
              </div>
            )}
            {settings.copyrightText && (
              <div className="mt-2 text-muted small text-center">
                {settings.copyrightText}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;