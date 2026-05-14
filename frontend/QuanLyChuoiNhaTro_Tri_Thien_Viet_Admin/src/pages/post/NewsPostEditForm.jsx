import React, { useState, useEffect, useRef, useCallback } from "react";
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
  FaRegStar,
  FaTimesCircle,
  FaCheckCircle,
  FaArchive,
  FaClock,
  FaSpinner,
  FaUndo,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";

// ─── helpers ────────────────────────────────────────────────────────────────

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

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url.startsWith("/") ? "" : "/"}${url}`;
};

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    cls: "bg-secondary-subtle text-secondary border-secondary",
    icon: <FaClock size={11} />,
  },
  PUBLISHED: {
    label: "Đã đăng",
    cls: "bg-success-subtle text-success border-success",
    icon: <FaCheckCircle size={11} />,
  },
  ARCHIVED: {
    label: "Lưu trữ",
    cls: "bg-warning-subtle text-warning border-warning",
    icon: <FaArchive size={11} />,
  },
};

// So sánh form hiện tại với dữ liệu ban đầu để detect thay đổi
const hasChanged = (form, original) => {
  if (!original) return false;
  return Object.keys(form).some(
    (key) => String(form[key]) !== String(original[key] ?? ""),
  );
};

// ─── component ───────────────────────────────────────────────────────────────

const NewsPostEditForm = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [slugManual, setSlugManual] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("DRAFT");

  // Lưu dữ liệu gốc để so sánh và reset
  const [originalForm, setOriginalForm] = useState(null);

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

  // upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // ─── fetch dữ liệu ban đầu ─────────────────────────────────────────────

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, postRes] = await Promise.all([
        apiNewsPost.getAllCategories(),
        apiNewsPost.getPostById(postId),
      ]);

      // getAllCategories có thể trả về mảng thẳng hoặc PageResponse
      const cats = Array.isArray(catRes)
        ? catRes
        : Array.isArray(catRes?.content)
          ? catRes.content
          : [];

      // getPostById có thể trả về object thẳng hoặc wrapped trong .data
      const post = postRes?.postId ? postRes : (postRes?.data ?? postRes);

      setCategories(cats);
      setCurrentStatus(post.publishStatus || "DRAFT");
      setExistingImages(post.images || []);
      setSlugManual(true); // giữ nguyên slug hiện có, không tự sinh lại

      const formData = {
        title: post.title || "",
        slug: post.slug || "",
        summary: post.summary || "",
        content: post.content || "",
        type: post.type || "ARTICLE",
        categoryId: post.category?.categoryId ?? post.categoryId ?? "",
        pinned: post.pinned || false,
        targetUrl: post.targetUrl || "",
        displayOrder: post.displayOrder != null ? post.displayOrder : "",
      };

      setForm(formData);
      setOriginalForm(formData); // lưu snapshot để track changes
    } catch (err) {
      toast.error("Không thể tải bài đăng!");
      console.error(err);
      navigate("/news-posts");
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // ─── validate & submit ────────────────────────────────────────────────

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
      await apiNewsPost.updatePost(postId, payload);
      toast.success("Cập nhật bài đăng thành công!");
      setOriginalForm({ ...form }); // cập nhật snapshot sau khi save thành công
      navigate(`/news-posts/${postId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu bài đăng!");
    } finally {
      setSaving(false);
    }
  };

  // ─── reset về dữ liệu gốc ─────────────────────────────────────────────

  const handleReset = () => {
    if (!originalForm) return;
    if (
      window.confirm(
        "Bạn có chắc muốn hoàn tác tất cả thay đổi và khôi phục dữ liệu ban đầu?",
      )
    ) {
      setForm({ ...originalForm });
      setSlugManual(true);
      setErrors({});
    }
  };

  // ─── field handlers ───────────────────────────────────────────────────

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

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={11} /> {errors[fieldName]}
      </div>
    );
  };

  // Hiển thị indicator nếu field bị thay đổi so với giá trị gốc
  const isFieldChanged = (field) => {
    if (!originalForm) return false;
    return String(form[field]) !== String(originalForm[field] ?? "");
  };

  const changedIndicator = (field) =>
    isFieldChanged(field) ? (
      <span
        className="badge bg-warning-subtle text-warning border border-warning ms-1"
        style={{ fontSize: "0.6rem", verticalAlign: "middle" }}
        title={`Giá trị gốc: "${originalForm[field]}"`}
      >
        Đã sửa
      </span>
    ) : null;

  // ─── image handlers ───────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append("image", uploadFile);
    formData.append("isPrimary", uploadIsPrimary);
    if (uploadAltText) formData.append("altText", uploadAltText);
    setUploading(true);
    try {
      await apiNewsPost.addImage(postId, formData);
      toast.success("Upload ảnh thành công!");
      setUploadFile(null);
      setUploadPreview(null);
      setUploadAltText("");
      setUploadIsPrimary(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Reload danh sách ảnh
      const res = await apiNewsPost.getPostById(postId);
      const post = res?.postId ? res : (res?.data ?? res);
      setExistingImages(post?.images || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      await apiNewsPost.deleteImage(postId, imageId);
      toast.success("Đã xóa ảnh!");
      setExistingImages((prev) =>
        prev.filter((img) => img.imageId !== imageId),
      );
    } catch (err) {
      toast.error("Lỗi khi xóa ảnh!");
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await apiNewsPost.setPrimaryImage(postId, imageId);
      toast.success("Đã đặt làm ảnh đại diện!");
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.imageId === imageId })),
      );
    } catch (err) {
      toast.error("Lỗi khi đổi ảnh đại diện!");
    }
  };

  // ─── sub-components ───────────────────────────────────────────────────

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

  // ─── loading skeleton ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="btn btn-light border-0 shadow-sm rounded-circle p-2 opacity-50">
            <FaArrowLeft className="text-muted" />
          </div>
          <div>
            <div
              className="bg-light rounded mb-1"
              style={{ width: 200, height: 24 }}
            />
            <div
              className="bg-light rounded"
              style={{ width: 140, height: 16 }}
            />
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex justify-content-center py-5 text-muted">
                <FaSpinner className="fa-spin me-2" size={20} />
                <span>Đang tải dữ liệu bài đăng...</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-4"
              style={{ minHeight: 200 }}
            >
              <div className="d-flex justify-content-center py-5 text-muted">
                <FaSpinner className="fa-spin" size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── render ───────────────────────────────────────────────────────────

  const banner = isBanner(form.type);
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.DRAFT;
  const isDirty = hasChanged(form, originalForm);

  return (
    <div className="container-fluid py-4">
      {/* ── HEADER ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => navigate("/news-posts")}
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          title="Quay về danh sách"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h4 className="fw-bold text-dark mb-0">Chỉnh sửa bài đăng</h4>
            <span className="text-muted small">#{postId}</span>
            {/* Badge trạng thái hiện tại */}
            <span
              className={`badge rounded-pill border d-inline-flex align-items-center gap-1 fw-normal ${statusCfg.cls}`}
            >
              {statusCfg.icon} {statusCfg.label}
            </span>
            {/* Badge loại bài */}
            <span
              className={`badge rounded-pill fw-normal ${
                banner
                  ? "bg-primary-subtle text-primary"
                  : "bg-info-subtle text-info"
              }`}
            >
              {banner ? (
                <FaBullhorn size={9} className="me-1" />
              ) : (
                <FaNewspaper size={9} className="me-1" />
              )}
              {banner ? "Banner" : "Tin tức"}
            </span>
            {/* Badge "Có thay đổi chưa lưu" */}
            {isDirty && (
              <span className="badge rounded-pill bg-warning-subtle text-warning border border-warning d-inline-flex align-items-center gap-1 fw-normal">
                <FaExclamationTriangle size={9} /> Chưa lưu
              </span>
            )}
          </div>
          {originalForm && (
            <p className="text-muted small mb-0 mt-1">
              Tiêu đề gốc:{" "}
              <em className="text-dark fw-semibold">
                &ldquo;{originalForm.title}&rdquo;
              </em>
            </p>
          )}
        </div>
      </div>

      {/* ── CẢNH BÁO CÓ THAY ĐỔI CHƯA LƯU ── */}
      {isDirty && (
        <div className="alert alert-warning border-0 rounded-4 d-flex align-items-center gap-2 py-2 px-3 mb-4 shadow-sm">
          <FaExclamationTriangle
            size={13}
            className="text-warning flex-shrink-0"
          />
          <span className="small fw-semibold">
            Bạn có thay đổi chưa được lưu.
          </span>
          <button
            type="button"
            className="btn btn-sm btn-warning fw-bold ms-auto py-1"
            style={{ fontSize: "0.75rem" }}
            onClick={handleReset}
          >
            <FaUndo size={10} className="me-1" /> Hoàn tác
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          {/* ── CỘT TRÁI — nội dung ── */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div
                  className={`p-2 rounded-3 ${
                    banner
                      ? "bg-warning-subtle text-warning"
                      : "bg-primary-subtle text-primary"
                  }`}
                >
                  {banner ? (
                    <FaBullhorn size={18} />
                  ) : (
                    <FaNewspaper size={18} />
                  )}
                </div>
                <h6
                  className={`fw-bold mb-0 ${
                    banner ? "text-warning-emphasis" : "text-primary"
                  }`}
                >
                  {banner ? "Thông tin Banner" : "Nội dung bài đăng"}
                </h6>
              </div>

              {/* Tiêu đề */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">
                  {banner ? "TÊN BANNER" : "TIÊU ĐỀ"}{" "}
                  <span className="text-danger">*</span>
                  {changedIndicator("title")}
                </label>
                {/* Hiển thị giá trị gốc nếu đã thay đổi */}
                {isFieldChanged("title") && (
                  <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                    <FaUndo size={9} className="text-warning" />
                    Gốc: <span className="text-dark">{originalForm.title}</span>
                  </div>
                )}
                <input
                  type="text"
                  className={`form-control bg-light border-0 py-2 ${
                    errors.title ? "is-invalid border-danger" : ""
                  } ${isFieldChanged("title") ? "border border-warning" : ""}`}
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

              {/* Slug — chỉ ARTICLE */}
              {!banner ? (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <FaLink size={11} /> SLUG (URL)
                    <span className="fw-normal text-muted ms-1">
                      — tự sinh từ tiêu đề
                    </span>
                    {changedIndicator("slug")}
                  </label>
                  {isFieldChanged("slug") && (
                    <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                      <FaUndo size={9} className="text-warning" />
                      Gốc:{" "}
                      <span className="text-dark font-monospace">
                        {originalForm.slug}
                      </span>
                    </div>
                  )}
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 text-muted small">
                      /tin-tuc/
                    </span>
                    <input
                      type="text"
                      className={`form-control bg-light border-0 py-2 font-monospace ${
                        isFieldChanged("slug") ? "border border-warning" : ""
                      }`}
                      placeholder="slug-tu-dong-tu-tieu-de"
                      value={form.slug}
                      onChange={handleSlugChange}
                      style={{ fontSize: "0.875rem" }}
                    />
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
                  </div>
                  <small className="text-muted d-flex align-items-center gap-1 mt-1">
                    <FaInfoCircle size={10} /> Chỉ dùng chữ thường, số và dấu
                    gạch ngang
                  </small>
                </div>
              ) : (
                <LockedField label="SLUG (URL)" icon={<FaLink size={11} />} />
              )}

              {/* Banner fields */}
              {banner && (
                <>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                      <FaExternalLinkAlt size={11} /> LINK KHI CLICK
                      <span className="fw-normal ms-1 text-muted">
                        — để trống nếu không cần
                      </span>
                      {changedIndicator("targetUrl")}
                    </label>
                    {isFieldChanged("targetUrl") && (
                      <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                        <FaUndo size={9} className="text-warning" />
                        Gốc:{" "}
                        <span className="text-dark">
                          {originalForm.targetUrl || "(trống)"}
                        </span>
                      </div>
                    )}
                    <input
                      type="url"
                      className={`form-control bg-light border-0 py-2 ${
                        isFieldChanged("targetUrl")
                          ? "border border-warning"
                          : ""
                      }`}
                      placeholder="https://..."
                      value={form.targetUrl}
                      onChange={handleChange("targetUrl")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                      <FaSortNumericDown size={11} /> THỨ TỰ HIỂN THỊ
                      <span className="fw-normal ms-1 text-muted">
                        — số nhỏ lên trước
                      </span>
                      {changedIndicator("displayOrder")}
                    </label>
                    {isFieldChanged("displayOrder") && (
                      <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                        <FaUndo size={9} className="text-warning" />
                        Gốc:{" "}
                        <span className="text-dark">
                          {originalForm.displayOrder !== ""
                            ? originalForm.displayOrder
                            : "(chưa đặt)"}
                        </span>
                      </div>
                    )}
                    <input
                      type="number"
                      className={`form-control bg-light border-0 py-2 ${
                        isFieldChanged("displayOrder")
                          ? "border border-warning"
                          : ""
                      }`}
                      placeholder="1"
                      min={0}
                      value={form.displayOrder}
                      onChange={handleChange("displayOrder")}
                      style={{ maxWidth: 160 }}
                    />
                  </div>
                </>
              )}

              {/* Tóm tắt */}
              {!banner ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaAlignLeft className="me-1" size={11} /> TÓM TẮT
                    {changedIndicator("summary")}
                  </label>
                  {isFieldChanged("summary") && (
                    <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                      <FaUndo size={9} className="text-warning" />
                      Gốc:{" "}
                      <span
                        className="text-dark text-truncate d-inline-block"
                        style={{ maxWidth: 300 }}
                      >
                        {originalForm.summary || "(trống)"}
                      </span>
                    </div>
                  )}
                  <textarea
                    className={`form-control bg-light border-0 ${
                      isFieldChanged("summary") ? "border border-warning" : ""
                    }`}
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn (dùng cho preview / SEO)..."
                    value={form.summary}
                    onChange={handleChange("summary")}
                  />
                </div>
              ) : (
                <LockedField label="TÓM TẮT" icon={<FaAlignLeft size={11} />} />
              )}

              {/* Nội dung */}
              {!banner ? (
                <div className="mb-0">
                  <label className="form-label small fw-bold text-muted">
                    NỘI DUNG {changedIndicator("content")}
                  </label>
                  <textarea
                    className={`form-control bg-light border-0 font-monospace ${
                      isFieldChanged("content") ? "border border-warning" : ""
                    }`}
                    rows={16}
                    placeholder={
                      "Nhập nội dung bài đăng...\n\n(Hỗ trợ HTML hoặc Markdown)"
                    }
                    value={form.content}
                    onChange={handleChange("content")}
                    style={{ fontSize: "0.85rem", lineHeight: 1.6 }}
                  />
                  <small className="text-muted d-flex align-items-center gap-1 mt-1">
                    <FaInfoCircle size={10} /> Có thể tích hợp editor như
                    TinyMCE hoặc Quill vào đây
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

          {/* ── CỘT PHẢI ── */}
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
                  {changedIndicator("type")}
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

              {/* Danh mục */}
              {!banner ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    DANH MỤC {changedIndicator("categoryId")}
                  </label>
                  {isFieldChanged("categoryId") && (
                    <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                      <FaUndo size={9} className="text-warning" />
                      Gốc:{" "}
                      <span className="text-dark">
                        {categories.find(
                          (c) =>
                            String(c.categoryId) ===
                            String(originalForm.categoryId),
                        )?.name || "(không có)"}
                      </span>
                    </div>
                  )}
                  <select
                    className={`form-select bg-light border-0 ${
                      isFieldChanged("categoryId")
                        ? "border border-warning"
                        : ""
                    }`}
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
                  <div className="form-control bg-light border-0 text-muted d-flex align-items-center gap-2 pe-none opacity-50">
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
                  } ${isFieldChanged("pinned") ? "border border-warning" : ""}`}
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
                    className={`small fw-semibold ${
                      form.pinned ? "text-danger" : "text-muted"
                    }`}
                  >
                    Ghim lên đầu
                  </span>
                  {changedIndicator("pinned")}
                </label>
              </div>
            </div>

            {/* Quản lý ảnh */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center gap-2">
                <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                  <FaImage size={16} />
                </div>
                <h6 className="fw-bold mb-0 text-warning-emphasis">
                  Quản lý ảnh ({existingImages.length})
                </h6>
              </div>

              <div className="card-body p-4">
                {/* Danh sách ảnh hiện có */}
                {existingImages.length > 0 ? (
                  <div className="d-flex flex-column gap-3 mb-4">
                    {existingImages.map((img) => {
                      const imgSrc = buildImageUrl(img.imageUrl);
                      return (
                        <div
                          key={img.imageId}
                          className={`border rounded-3 overflow-hidden position-relative ${
                            img.isPrimary
                              ? "border-primary border-2"
                              : "border-light"
                          }`}
                        >
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={img.altText || `Ảnh #${img.imageId}`}
                              className="w-100"
                              style={{
                                height: 150,
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/400x150/f8f9fa/adb5bd?text=No+Image";
                              }}
                            />
                          ) : (
                            <div
                              className="w-100 bg-light d-flex align-items-center justify-content-center text-muted small"
                              style={{ height: 150 }}
                            >
                              <FaImage size={24} className="opacity-25" />
                            </div>
                          )}

                          {img.isPrimary && (
                            <span
                              className="position-absolute top-0 start-0 m-2 badge bg-primary d-flex align-items-center gap-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              <FaStar size={8} /> Đại diện
                            </span>
                          )}

                          <div className="position-absolute bottom-0 start-0 end-0 px-3 py-2 d-flex justify-content-between align-items-center bg-dark bg-opacity-50">
                            <span
                              className="text-white small text-truncate"
                              style={{ maxWidth: 100, fontSize: "0.7rem" }}
                            >
                              {img.altText || `Ảnh #${img.imageId}`}
                            </span>
                            <div className="d-flex gap-1">
                              {!img.isPrimary && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light py-0 px-1"
                                  title="Đặt làm ảnh đại diện"
                                  style={{ fontSize: "0.7rem" }}
                                  onClick={() => handleSetPrimary(img.imageId)}
                                >
                                  <FaRegStar
                                    size={11}
                                    className="text-warning"
                                  />
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-light py-0 px-1"
                                title="Xóa ảnh"
                                style={{ fontSize: "0.7rem" }}
                                onClick={() => handleDeleteImage(img.imageId)}
                              >
                                <FaTimesCircle
                                  size={11}
                                  className="text-danger"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted small mb-3">
                    <FaImage className="opacity-25 mb-2" size={28} />
                    <br />
                    Chưa có ảnh nào
                  </div>
                )}

                {/* Upload ảnh mới */}
                <div className="border-top pt-4">
                  <p className="small fw-bold text-muted mb-3 d-flex align-items-center gap-1">
                    <FaUpload size={11} /> Thêm ảnh mới
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm bg-light border-0 mb-2"
                    onChange={handleFileSelect}
                  />

                  {uploadPreview && (
                    <img
                      src={uploadPreview}
                      alt="preview"
                      className="w-100 rounded-3 mb-2"
                      style={{ maxHeight: 130, objectFit: "cover" }}
                    />
                  )}

                  <input
                    type="text"
                    className="form-control form-control-sm bg-light border-0 mb-2"
                    placeholder="Alt text (mô tả ảnh, SEO)..."
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                  />

                  <label
                    className={`d-flex align-items-center gap-2 border rounded-3 px-3 py-2 mb-3 ${
                      uploadIsPrimary
                        ? "border-warning bg-warning-subtle"
                        : "border-light bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={uploadIsPrimary}
                      onChange={(e) => setUploadIsPrimary(e.target.checked)}
                    />
                    <FaStar
                      size={11}
                      className={
                        uploadIsPrimary ? "text-warning" : "text-muted"
                      }
                    />
                    <span className="small fw-semibold">
                      Đặt làm ảnh đại diện
                    </span>
                  </label>

                  <button
                    type="button"
                    className="btn btn-warning btn-sm w-100 fw-bold"
                    onClick={handleUploadImage}
                    disabled={!uploadFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <FaUpload size={11} className="me-1" />
                        Upload ảnh
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={saving || !isDirty}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave size={13} />
                      {isDirty ? "Lưu thay đổi" : "Không có thay đổi"}
                    </>
                  )}
                </button>

                {isDirty && (
                  <button
                    type="button"
                    className="btn btn-outline-warning fw-bold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    <FaUndo size={11} />
                    Hoàn tác thay đổi
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-light border-0 fw-bold"
                  onClick={() => navigate("/news-posts")}
                  disabled={saving}
                >
                  {isDirty ? "Hủy & Quay về danh sách" : "Quay về danh sách"}
                </button>
              </div>

              <p className="text-muted small text-center mt-3 mb-0">
                Trạng thái bài đăng <strong>không thay đổi</strong> khi lưu. Vào{" "}
                <strong>Chi tiết</strong> để xuất bản / lưu trữ.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsPostEditForm;
