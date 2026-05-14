import React, { useState, useEffect } from "react";
import {
  FaTag,
  FaSave,
  FaArrowLeft,
  FaLink,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "",
  active: true,
};

const UpdatePostCategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await apiNewsPost.getAllCategories();
        const cat = (res || []).find(
          (c) => String(c.categoryId) === String(categoryId),
        );
        if (!cat) {
          toast.error("Không tìm thấy danh mục!");
          navigate("/post-categories");
          return;
        }
        setForm({
          name: cat.name || "",
          slug: cat.slug || "",
          description: cat.description || "",
          displayOrder: cat.displayOrder ?? "",
          active: cat.active ?? true,
        });
      } catch (err) {
        toast.error("Không thể tải danh mục!");
        navigate("/post-categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId, navigate]);

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
      await apiNewsPost.updateCategory(categoryId, payload);
      toast.success("Cập nhật danh mục thành công!");
      navigate("/post-categories");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu danh mục!");
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center py-5">
        <div className="spinner-border text-primary spinner-border-sm me-2" />
        Đang tải...
      </div>
    );
  }

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
            Chỉnh sửa danh mục
          </h4>
          <p className="text-muted small mb-0">Cập nhật thông tin danh mục</p>
        </div>
      </div>

      {/* FORM */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center gap-2">
          <div className="p-2 rounded-3 bg-warning-subtle text-warning">
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
                  onChange={handleChange("name")}
                />
                {renderError("name")}
              </div>

              {/* Slug */}
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                  <FaLink size={11} /> SLUG{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control bg-light border-0 py-2 font-monospace ${errors.slug ? "is-invalid border-danger" : ""}`}
                  placeholder="vd: xu-huong"
                  value={form.slug}
                  onChange={handleChange("slug")}
                  style={{ fontSize: "0.875rem" }}
                />
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
                  <FaSave size={13} />
                )}
                Lưu thay đổi
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

export default UpdatePostCategory;
