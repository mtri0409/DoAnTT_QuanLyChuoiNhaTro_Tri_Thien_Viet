import React, { useState, useEffect, useRef } from "react";
import {
  FaNewspaper,
  FaSave,
  FaArrowLeft,
  FaTag,
  FaAlignLeft,
  FaBullhorn,
  FaImage,
  FaThumbtack,
  FaInfoCircle,
  FaExclamationCircle,
  FaLink,
  FaExternalLinkAlt,
  FaSortNumericDown,
  FaLock,
  FaUpload,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";

// Hàm tạo slug từ tiêu đề (hỗ trợ tiếng Việt)
const generateSlug = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const isBanner = (type) => type === "BANNER";

const NewsPostForm = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [slugManual, setSlugManual] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    type: "ARTICLE",
    categoryId: "",
    pinned: false,
    targetUrl: "",
    displayOrder: "",
  });

  const [errors, setErrors] = useState({});

  // --- Image state ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAltText, setImageAltText] = useState("");
  const [imageIsPrimary, setImageIsPrimary] = useState(true);
  const fileInputRef = useRef();

  useEffect(() => {
    apiNewsPost
      .getAllCategories()
      .then((res) => setCategories(res || [])) // ✅ interceptor đã unwrap
      .catch(console.error);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Tiêu đề không được để trống";
    else if (form.title.trim().length < 5)
      errs.title = "Tiêu đề phải có ít nhất 5 ký tự";
    if (!form.type) errs.type = "Vui lòng chọn loại bài đăng";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = {
      title: form.title.trim(),
      type: form.type,
      pinned: form.pinned,
      ...(!isBanner(form.type) && {
        slug: form.slug.trim() || undefined,
        summary: form.summary.trim() || undefined,
        content: form.content.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      }),
      ...(isBanner(form.type) && {
        targetUrl: form.targetUrl.trim() || undefined,
        displayOrder:
          form.displayOrder !== "" ? Number(form.displayOrder) : undefined,
      }),
    };

    setSaving(true);
    try {
      const authorId = localStorage.getItem("userId") || 1;
      const res = await apiNewsPost.createPost(payload, authorId);
      const newPostId = res.postId; // ✅ interceptor đã unwrap

      // Upload ảnh nếu có chọn
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("isPrimary", imageIsPrimary);
        if (imageAltText) formData.append("altText", imageAltText);
        try {
          await apiNewsPost.addImage(newPostId, formData);
        } catch (imgErr) {
          toast.warning("Tạo bài thành công nhưng upload ảnh thất bại!");
        }
      }

      toast.success(
        isBanner(form.type)
          ? "Tạo banner thành công!"
          : "Tạo bài đăng thành công! Bài đang ở trạng thái Nháp.",
      );
      navigate(`/news-posts/${newPostId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu bài đăng!");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManual || isBanner(prev.type) ? prev.slug : generateSlug(title),
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleSlugChange = (e) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageAltText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={11} /> {errors[fieldName]}
      </div>
    );
  };

  // Field bị khóa khi là Banner
  const LockedField = ({ label, icon }) => (
    <div className="mb-3">
      <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
        {icon} {label}
      </label>
      <div className="form-control bg-light border-0 py-2 d-flex align-items-center gap-2 text-muted">
        <FaLock size={11} className="opacity-50" />
        <span className="small opacity-50">Không dùng cho Banner</span>
      </div>
    </div>
  );

  const banner = isBanner(form.type);

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">
            Tạo bài đăng mới
          </h4>
          <p className="text-muted small mb-0">
            {banner
              ? "Tạo banner ảnh hiển thị nổi bật"
              : "Bài sẽ được lưu ở trạng thái Nháp"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          {/* CỘT TRÁI */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div
                  className={`p-2 rounded-3 ${banner ? "bg-warning-subtle text-warning" : "bg-primary-subtle text-primary"}`}
                >
                  {banner ? (
                    <FaBullhorn size={18} />
                  ) : (
                    <FaNewspaper size={18} />
                  )}
                </div>
                <h6
                  className={`fw-bold mb-0 ${banner ? "text-warning-emphasis" : "text-primary"}`}
                >
                  {banner ? "Thông tin Banner" : "Nội dung bài đăng"}
                </h6>
              </div>

              {/* Tiêu đề */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">
                  {banner ? "TÊN BANNER" : "TIÊU ĐỀ"}{" "}
                  <span className="text-danger">*</span>
                  {banner && (
                    <span className="fw-normal ms-1 text-muted">
                      — dùng để quản lý nội bộ
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className={`form-control bg-light border-0 py-2 ${errors.title ? "is-invalid border-danger" : ""}`}
                  placeholder={
                    banner
                      ? "vd: Banner Khuyến mãi Tháng 5..."
                      : "Nhập tiêu đề bài đăng..."
                  }
                  value={form.title}
                  onChange={handleTitleChange}
                />
                {renderError("title")}
              </div>

              {/* Slug — chỉ hiện khi ARTICLE */}
              {!banner ? (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <FaLink size={11} /> SLUG (URL)
                    <span className="fw-normal text-muted ms-1">
                      — tự sinh từ tiêu đề
                    </span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 text-muted small">
                      /tin-tuc/
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-0 py-2 font-monospace"
                      placeholder="slug-tu-dong-tu-tieu-de"
                      value={form.slug}
                      onChange={handleSlugChange}
                      style={{ fontSize: "0.875rem" }}
                    />
                    {slugManual && (
                      <button
                        type="button"
                        className="btn btn-light border-0 text-muted small"
                        title="Tự sinh lại từ tiêu đề"
                        onClick={() => {
                          setSlugManual(false);
                          setForm((prev) => ({
                            ...prev,
                            slug: generateSlug(prev.title),
                          }));
                        }}
                      >
                        ↺
                      </button>
                    )}
                  </div>
                  <small className="text-muted d-flex align-items-center gap-1 mt-1">
                    <FaInfoCircle size={10} />
                    Chỉ dùng chữ thường, số và dấu gạch ngang
                  </small>
                </div>
              ) : (
                <LockedField label="SLUG (URL)" icon={<FaLink size={11} />} />
              )}

              {/* Link đích — chỉ hiện khi BANNER */}
              {banner && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <FaExternalLinkAlt size={11} /> LINK KHI CLICK
                    <span className="fw-normal ms-1 text-muted">
                      — để trống nếu không cần
                    </span>
                  </label>
                  <input
                    type="url"
                    className="form-control bg-light border-0 py-2"
                    placeholder="https://..."
                    value={form.targetUrl}
                    onChange={handleChange("targetUrl")}
                  />
                </div>
              )}

              {/* Thứ tự — chỉ hiện khi BANNER */}
              {banner && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <FaSortNumericDown size={11} /> THỨ TỰ HIỂN THỊ
                    <span className="fw-normal ms-1 text-muted">
                      — số nhỏ lên trước
                    </span>
                  </label>
                  <input
                    type="number"
                    className="form-control bg-light border-0 py-2"
                    placeholder="1"
                    min={0}
                    value={form.displayOrder}
                    onChange={handleChange("displayOrder")}
                    style={{ maxWidth: 160 }}
                  />
                </div>
              )}

              {/* Tóm tắt — khóa khi BANNER */}
              {!banner ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaAlignLeft className="me-1" size={11} /> TÓM TẮT
                  </label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn (dùng cho preview / SEO)..."
                    value={form.summary}
                    onChange={handleChange("summary")}
                  />
                </div>
              ) : (
                <LockedField label="TÓM TẮT" icon={<FaAlignLeft size={11} />} />
              )}

              {/* Nội dung — khóa khi BANNER */}
              {!banner ? (
                <div className="mb-0">
                  <label className="form-label small fw-bold text-muted">
                    NỘI DUNG
                  </label>
                  <textarea
                    className="form-control bg-light border-0 font-monospace"
                    rows={16}
                    placeholder={
                      "Nhập nội dung bài đăng...\n\n(Hỗ trợ HTML hoặc Markdown)"
                    }
                    value={form.content}
                    onChange={handleChange("content")}
                    style={{ fontSize: "0.85rem", lineHeight: 1.6 }}
                  />
                  <small className="text-muted d-flex align-items-center gap-1 mt-1">
                    <FaInfoCircle size={10} />
                    Có thể tích hợp editor như TinyMCE hoặc Quill vào đây
                  </small>
                </div>
              ) : (
                <div className="mb-0">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <FaLock size={11} /> NỘI DUNG
                  </label>
                  <div
                    className="rounded-3 bg-light d-flex flex-column align-items-center justify-content-center text-muted"
                    style={{ height: 120, border: "2px dashed #dee2e6" }}
                  >
                    <FaLock size={16} className="opacity-25 mb-2" />
                    <span className="small opacity-50">
                      Không dùng cho Banner
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="col-lg-4">
            {/* Phân loại */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info">
                  <FaTag size={16} />
                </div>
                <h6 className="fw-bold mb-0 text-info">Phân loại</h6>
              </div>

              {/* Loại bài */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">
                  LOẠI BÀI <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  {[
                    {
                      value: "ARTICLE",
                      label: "Tin tức",
                      icon: <FaNewspaper size={13} />,
                    },
                    {
                      value: "BANNER",
                      label: "Banner",
                      icon: <FaBullhorn size={13} />,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`d-flex align-items-center gap-2 border rounded-3 px-3 py-2 flex-fill ${
                        form.type === opt.value
                          ? "border-primary bg-primary-subtle text-primary fw-semibold"
                          : "border-light bg-light text-muted"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="d-none"
                        value={opt.value}
                        checked={form.type === opt.value}
                        onChange={handleChange("type")}
                      />
                      {opt.icon}
                      <span className="small">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {renderError("type")}
              </div>

              {/* Danh mục — khóa khi BANNER */}
              {!banner ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    DANH MỤC
                  </label>
                  <select
                    className="form-select bg-light border-0"
                    value={form.categoryId}
                    onChange={handleChange("categoryId")}
                  >
                    <option value="">— Không có danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    DANH MỤC
                  </label>
                  <div className="form-select bg-light border-0 text-muted d-flex align-items-center gap-2 pe-none opacity-50">
                    <FaLock size={11} /> Không dùng cho Banner
                  </div>
                </div>
              )}

              {/* Ghim */}
              <div className="form-check p-0">
                <label
                  className={`d-flex align-items-center gap-2 border rounded-3 px-3 py-2 ${
                    form.pinned
                      ? "border-danger bg-danger-subtle"
                      : "border-light bg-light"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={form.pinned}
                    onChange={handleChange("pinned")}
                  />
                  <FaThumbtack
                    size={12}
                    className={form.pinned ? "text-danger" : "text-muted"}
                  />
                  <span
                    className={`small fw-semibold ${form.pinned ? "text-danger" : "text-muted"}`}
                  >
                    Ghim lên đầu
                  </span>
                </label>
              </div>
            </div>

            {/* === ẢNH (khi tạo mới) === */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-3">
                <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                  <FaImage size={16} />
                </div>
                <h6 className="fw-bold mb-0 text-warning-emphasis">
                  Ảnh {banner ? "Banner" : "đại diện"}
                </h6>
                <span className="badge bg-light text-muted fw-normal ms-auto small">
                  Tuỳ chọn
                </span>
              </div>

              {/* Preview */}
              {imagePreview ? (
                <div className="position-relative mb-3">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-100 rounded-3"
                    style={{ height: 160, objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-1 lh-1"
                    title="Xóa ảnh"
                    onClick={handleRemoveImage}
                  >
                    <FaTimesCircle size={12} />
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-3 bg-light d-flex flex-column align-items-center justify-content-center text-muted mb-3"
                  style={{
                    height: 120,
                    border: "2px dashed #dee2e6",
                    cursor: "pointer",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaImage size={24} className="opacity-25 mb-2" />
                  <span className="small opacity-50">Nhấn để chọn ảnh</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="form-control form-control-sm bg-light border-0 mb-2"
                onChange={handleFileSelect}
              />

              {imageFile && (
                <>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light border-0 mb-2"
                    placeholder="Alt text (mô tả ảnh, SEO)..."
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                  />
                  <label
                    className={`d-flex align-items-center gap-2 border rounded-3 px-3 py-2 ${
                      imageIsPrimary
                        ? "border-warning bg-warning-subtle"
                        : "border-light bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={imageIsPrimary}
                      onChange={(e) => setImageIsPrimary(e.target.checked)}
                    />
                    <FaStar
                      size={11}
                      className={imageIsPrimary ? "text-warning" : "text-muted"}
                    />
                    <span className="small fw-semibold">
                      Đặt làm ảnh đại diện
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Nút lưu */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave size={13} />
                      {banner ? "Tạo Banner" : "Tạo bài (Nháp)"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-light border-0 fw-bold"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
              </div>
              <p className="text-muted small text-center mt-3 mb-0">
                {banner ? (
                  <>
                    Sau khi tạo, vào <strong>Chỉnh sửa</strong> để thay ảnh
                    banner.
                  </>
                ) : (
                  <>
                    Bài tạo xong sẽ ở trạng thái <strong>Nháp</strong>. Vào Chi
                    tiết để xuất bản.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsPostForm;
