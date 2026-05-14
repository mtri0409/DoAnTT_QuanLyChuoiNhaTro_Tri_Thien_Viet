import React, { useState } from "react";
import {
  FaTag,
  FaPlus,
  FaSave,
  FaArrowLeft,
  FaLink,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "",
  active: true,
};

// Hàm tạo slug từ tên (hỗ trợ tiếng Việt)
const generateSlug = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const CreatePostCategory = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên danh mục không được để trống";
    if (!form.slug.trim()) errs.slug = "Slug không được để trống";
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      errs.slug = "Slug chỉ gồm chữ thường, số, dấu gạch ngang";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      displayOrder:
        form.displayOrder !== "" ? Number(form.displayOrder) : undefined,
      active: form.active,
    };

    setSaving(true);
    try {
      await apiNewsPost.createCategory(payload);
      toast.success("Tạo danh mục thành công!");
      navigate("/post-categories");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu danh mục!");
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManual ? prev.slug : generateSlug(name),
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (e) => {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
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

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/post-categories")}
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">
            Thêm danh mục mới
          </h4>
          <p className="text-muted small mb-0">
            Tạo danh mục cho bài đăng tin tức
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-primary-subtle text-primary">
            <FaTag size={16} />
          </div>
          <h6 className="fw-bold mb-0">Thông tin danh mục</h6>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              {/* Tên */}
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted">
                  TÊN DANH MỤC <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control bg-light border-0 py-2 ${errors.name ? "is-invalid border-danger" : ""}`}
                  placeholder="vd: Xu hướng"
                  value={form.name}
                  onChange={handleNameChange}
                />
                {renderError("name")}
              </div>

              {/* Slug */}
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                  <FaLink size={11} /> SLUG{" "}
                  <span className="text-danger">*</span>
                  <span className="fw-normal ms-1">— tự sinh từ tên</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control bg-light border-0 py-2 font-monospace ${errors.slug ? "is-invalid border-danger" : ""}`}
                    placeholder="vd: xu-huong"
                    value={form.slug}
                    onChange={handleSlugChange}
                    style={{ fontSize: "0.875rem" }}
                  />
                  {slugManual && (
                    <button
                      type="button"
                      className="btn btn-light border-0 text-muted"
                      title="Tự sinh lại"
                      onClick={() => {
                        setSlugManual(false);
                        setForm((prev) => ({
                          ...prev,
                          slug: generateSlug(prev.name),
                        }));
                      }}
                    >
                      ↺
                    </button>
                  )}
                </div>
                {renderError("slug")}
              </div>

              {/* Mô tả */}
              <div className="col-sm-8">
                <label className="form-label small fw-bold text-muted">
                  MÔ TẢ
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
                  placeholder="Mô tả ngắn về danh mục..."
                  value={form.description}
                  onChange={handleChange("description")}
                />
              </div>

              {/* Thứ tự */}
              <div className="col-sm-2">
                <label className="form-label small fw-bold text-muted">
                  THỨ TỰ
                </label>
                <input
                  type="number"
                  className="form-control bg-light border-0 py-2"
                  placeholder="1"
                  min={0}
                  value={form.displayOrder}
                  onChange={handleChange("displayOrder")}
                />
              </div>

              {/* Active */}
              <div className="col-sm-2 d-flex align-items-end">
                <label
                  className={`d-flex align-items-center gap-2 border rounded-3 px-3 py-2 w-100 ${
                    form.active
                      ? "border-success bg-success-subtle"
                      : "border-light bg-light"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={form.active}
                    onChange={handleChange("active")}
                  />
                  <span
                    className={`small fw-semibold ${form.active ? "text-success" : "text-muted"}`}
                  >
                    Kích hoạt
                  </span>
                </label>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary shadow-sm fw-bold d-flex align-items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FaPlus size={13} />
                )}
                Thêm danh mục
              </button>
              <button
                type="button"
                className="btn btn-light border-0 fw-bold"
                onClick={() => navigate("/post-categories")}
                disabled={saving}
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCategory;
