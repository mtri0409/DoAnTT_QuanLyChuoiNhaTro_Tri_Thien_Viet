import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTools,
  FaSave,
  FaTrash,
  FaTimes,
  FaPlus,
  FaImages,
} from "react-icons/fa";
import apiMaintenance from "../../api/apiMaintenance";
import { imgURL } from "../../api/config";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const MaintenanceEdit = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Form fields */
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [assetName, setAssetName] = useState("");

  /* Ảnh hiện có (từ server) */
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  /* File mới upload */
  const [newFiles, setNewFiles] = useState([]); // array of File

  const imgSrc = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  /* Load dữ liệu */
  useEffect(() => {
    apiMaintenance
      .getRequestById(requestId)
      .then((res) => {
        setDescription(res.description || "");
        setStatus(res.status || "PENDING");
        setAssetName(res.assetName || "");
        setExistingImages(res.images || []);
      })
      .catch(() => setError("Không thể tải dữ liệu yêu cầu"))
      .finally(() => setLoading(false));
  }, [requestId]);

  /* Xử lý chọn file mới */
  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setNewFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const unique = picked.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...unique];
    });
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  /* Xóa file mới khỏi danh sách chờ upload */
  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* Đánh dấu xóa ảnh cũ */
  const toggleRemoveExisting = (imageId) => {
    setRemovedImageIds((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
  };

  /* Submit */
  const handleSave = async () => {
    if (!description.trim()) {
      setError("Mô tả không được để trống");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("status", status);
      if (assetName.trim()) formData.append("assetName", assetName.trim());
      removedImageIds.forEach((id) => formData.append("removeImageIds", id));
      newFiles.forEach((file) => formData.append("images", file));

      await apiMaintenance.updateRequest(requestId, formData);
      setSuccess("Lưu thành công!");
      setTimeout(() => navigate(`/maintenance/${requestId}/detail`), 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Lưu thất bại, vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-secondary spinner-border-sm" />
      </div>
    );

  return (
    <div className="container-fluid py-4">
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(`/maintenance/${requestId}/detail`)}
            className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHỈNH SỬA BÁO HỎNG</h4>
            <span className="badge bg-primary-subtle text-primary mt-1">
              ID: #MR-{requestId}
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary shadow-sm d-flex align-items-center gap-2 px-4"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span
              className="spinner-border spinner-border-sm"
              style={{ width: 13, height: 13 }}
            />
          ) : (
            <FaSave size={13} />
          )}
          Lưu thay đổi
        </button>
      </div>

      {/* ── Alert ── */}
      {error && (
        <div className="alert alert-danger   py-2 px-3 small mb-3">{error}</div>
      )}
      {success && (
        <div className="alert alert-success  py-2 px-3 small mb-3">
          {success}
        </div>
      )}

      <div className="row g-3">
        {/* ── Cột trái: thông tin chính ── */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center bg-warning-subtle"
                style={{ width: 44, height: 44, flexShrink: 0 }}
              >
                <FaTools className="text-warning" size={18} />
              </div>
              <div>
                <div className="fw-bold">Thông tin yêu cầu</div>
                <div className="text-muted small">
                  Chỉnh sửa mô tả và trạng thái
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Mô tả */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Mô tả sự cố <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Mô tả chi tiết sự cố cần sửa chữa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Tài sản liên quan */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Tài sản liên quan
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Điều hòa phòng 201, Vòi nước bếp..."
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Card ảnh đính kèm ── */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center gap-2">
              <FaImages className="text-muted" size={14} />
              <span className="fw-bold">Ảnh đính kèm</span>
            </div>
            <div className="card-body">
              {/* Ảnh cũ */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-muted small fw-semibold text-uppercase mb-2"
                    style={{ letterSpacing: 0.6 }}
                  >
                    Ảnh hiện có ({existingImages.length})
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {existingImages.map((img) => {
                      const removed = removedImageIds.includes(img.imageId);
                      return (
                        <div
                          key={img.imageId}
                          className="position-relative"
                          style={{ width: 100, height: 100 }}
                        >
                          <img
                            src={imgSrc(img)}
                            alt=""
                            className="rounded-3 border w-100 h-100"
                            style={{
                              objectFit: "cover",
                              opacity: removed ? 0.3 : 1,
                              transition: "opacity 0.2s",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <button
                            className={`btn btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center p-0 ${removed ? "btn-secondary" : "btn-danger"}`}
                            style={{ width: 22, height: 22, fontSize: 9 }}
                            onClick={() => toggleRemoveExisting(img.imageId)}
                            title={removed ? "Khôi phục" : "Xóa ảnh"}
                          >
                            {removed ? (
                              <FaPlus size={8} />
                            ) : (
                              <FaTimes size={8} />
                            )}
                          </button>
                          {removed && (
                            <div
                              className="position-absolute inset-0 d-flex align-items-center justify-content-center rounded-3"
                              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            >
                              <span
                                className="badge bg-danger"
                                style={{ fontSize: 9 }}
                              >
                                Sẽ xóa
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {removedImageIds.length > 0 && (
                    <p className="text-danger small mt-2 mb-0">
                      Sẽ xóa {removedImageIds.length} ảnh khi lưu.
                      <button
                        className="btn btn-link btn-sm p-0 ms-2 text-secondary"
                        onClick={() => setRemovedImageIds([])}
                      >
                        Khôi phục tất cả
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* Upload ảnh mới */}
              <div>
                <p
                  className="text-muted small fw-semibold text-uppercase mb-2"
                  style={{ letterSpacing: 0.6 }}
                >
                  Thêm ảnh mới
                </p>
                <div className="mb-3">
                  <label className="form-label small text-muted">
                    Chọn file ảnh (jpg, png, webp...)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <div className="form-text">
                    Có thể chọn nhiều file cùng lúc. Định dạng: JPG, PNG, WEBP.
                  </div>
                </div>

                {/* Danh sách file đã chọn */}
                {newFiles.length > 0 && (
                  <div>
                    <p className="small text-muted fw-semibold mb-2">
                      Đã chọn {newFiles.length} file:
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {newFiles.map((file, i) => (
                        <div
                          key={i}
                          className="border rounded-3 p-2 d-flex align-items-center gap-2 bg-light"
                          style={{ maxWidth: 220 }}
                        >
                          <div
                            className="rounded-2 bg-white border d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                            style={{ width: 40, height: 40 }}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div className="flex-fill overflow-hidden">
                            <div
                              className="text-truncate small fw-semibold"
                              style={{ maxWidth: 130 }}
                            >
                              {file.name}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 10 }}
                            >
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-light border-0 flex-shrink-0"
                            onClick={() => removeNewFile(i)}
                            title="Bỏ file này"
                          >
                            <FaTimes size={11} className="text-danger" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cột phải: trạng thái + nút lưu ── */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 py-3">
              <p
                className="text-muted small fw-semibold text-uppercase mb-0"
                style={{ letterSpacing: 0.8 }}
              >
                Trạng thái
              </p>
            </div>
            <div className="card-body">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="form-text mt-2">
                Chọn trạng thái phù hợp với tiến độ xử lý.
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body d-flex flex-column gap-2">
              <button
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: 14, height: 14 }}
                  />
                ) : (
                  <FaSave size={14} />
                )}
                Lưu thay đổi
              </button>
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate(`/maintenance/${requestId}/detail`)}
              >
                <FaArrowLeft size={13} /> Hủy bỏ
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="alert alert-warning mt-3 small mb-0">
            <strong>Lưu ý:</strong> Ảnh bị đánh dấu xóa sẽ bị xóa vĩnh viễn khi
            bấm <em>Lưu thay đổi</em>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceEdit;
