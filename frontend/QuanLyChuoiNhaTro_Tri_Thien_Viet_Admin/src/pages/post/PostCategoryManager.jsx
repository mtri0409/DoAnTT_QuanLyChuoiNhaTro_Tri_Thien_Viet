import React, { useState, useEffect } from "react";
import {
  FaTag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
  FaGripVertical,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";

const PostCategoryManager = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiNewsPost.getAllCategories();
      setCategories(res || []);
    } catch (err) {
      toast.error("Không thể tải danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Xóa danh mục "${cat.name}"?\nCác bài đăng thuộc danh mục này sẽ không còn danh mục.`,
      )
    )
      return;
    try {
      await apiNewsPost.deleteCategory(cat.categoryId);
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa danh mục!");
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await apiNewsPost.updateCategory(cat.categoryId, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        active: !cat.active,
      });
      toast.success(
        !cat.active ? `Đã kích hoạt "${cat.name}"` : `Đã ẩn "${cat.name}"`,
      );
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi khi đổi trạng thái danh mục!");
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate("/news-posts")}
            className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0 text-uppercase">
              Quản lý danh mục
            </h4>
            <p className="text-muted small mb-0">
              Xu hướng, Cảnh báo, Khuyến mãi, v.v.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
          onClick={() => navigate("/post-categories/create")}
        >
          <FaPlus size={13} /> Thêm danh mục
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3" style={{ width: 40 }}></th>
                <th style={{ width: 50 }}>#</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th className="text-center" style={{ width: 80 }}>
                  Thứ tự
                </th>
                <th className="text-center" style={{ width: 100 }}>
                  Trạng thái
                </th>
                <th className="text-end pe-4" style={{ width: 120 }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.categoryId}>
                    <td className="ps-4 text-muted">
                      <FaGripVertical size={12} className="opacity-25" />
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border fw-normal">
                        #{cat.categoryId}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold small">{cat.name}</span>
                    </td>
                    <td>
                      <code className="small text-primary">{cat.slug}</code>
                    </td>
                    <td className="small text-muted">
                      {cat.description || "—"}
                    </td>
                    <td className="text-center small text-muted">
                      {cat.displayOrder ?? "—"}
                    </td>
                    <td className="text-center">
                      <button
                        className={`btn btn-sm btn-link p-0 ${cat.active ? "text-success" : "text-secondary"}`}
                        title={
                          cat.active
                            ? "Đang hiện — nhấn để ẩn"
                            : "Đang ẩn — nhấn để hiện"
                        }
                        onClick={() => handleToggleActive(cat)}
                      >
                        {cat.active ? (
                          <FaToggleOn size={22} />
                        ) : (
                          <FaToggleOff size={22} />
                        )}
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                          onClick={() =>
                            navigate(`/post-categories/${cat.categoryId}/edit`)
                          }
                        >
                          <FaEdit className="text-primary" size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xóa"
                          onClick={() => handleDelete(cat)}
                        >
                          <FaTrash className="text-danger" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted small">
                    <FaTag className="opacity-25 mb-2" size={28} />
                    <br />
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {categories.length > 0 && (
          <div className="card-footer bg-white border-0 py-3 px-4">
            <small className="text-muted">
              Tổng: <strong>{categories.length}</strong> danh mục —{" "}
              <span className="text-success">
                {categories.filter((c) => c.active).length} đang hiện
              </span>
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCategoryManager;
