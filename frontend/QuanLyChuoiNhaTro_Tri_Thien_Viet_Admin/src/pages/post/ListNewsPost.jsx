import React, { useState, useEffect, useCallback } from "react";
import {
  FaNewspaper,
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaArchive,
  FaFileAlt,
  FaImage,
  FaThumbtack,
  FaBullhorn,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiNewsPost from "../../api/apiNewsPost";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    badge: "bg-secondary-subtle text-secondary",
    icon: <FaClock size={10} />,
  },
  PUBLISHED: {
    label: "Đã đăng",
    badge: "bg-success-subtle text-success",
    icon: <FaCheckCircle size={10} />,
  },
  ARCHIVED: {
    label: "Lưu trữ",
    badge: "bg-warning-subtle text-warning",
    icon: <FaArchive size={10} />,
  },
};

const TYPE_CONFIG = {
  ARTICLE: {
    label: "Tin tức",
    badge: "bg-info-subtle text-info",
    icon: <FaFileAlt size={10} />,
  },
  BANNER: {
    label: "Banner",
    badge: "bg-primary-subtle text-primary",
    icon: <FaImage size={10} />,
  },
};

const ListNewsPost = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: [],
    pageNumber: 1,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiNewsPost
      .getAllCategories()
      .then((res) => setCategories(res || [])) // ✅ interceptor đã unwrap, res chính là mảng
      .catch(console.error);
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder,
        type: filterType,
        status: filterStatus,
        categoryId: filterCategory,
      };
      const page = appliedSearch
        ? await apiNewsPost.searchPosts({ ...params, keyword: appliedSearch })
        : await apiNewsPost.getAllPosts(params);
      // ✅ interceptor đã unwrap response.data, nên res chính là PageResponse
      setData({
        content: page.content ?? page.items ?? [],
        pageNumber: page.pageNumber ?? page.number ?? page.currentPage ?? 1,
        totalPages: page.totalPages ?? 0,
        totalElements: page.totalElements ?? page.totalItems ?? 0,
      });
    } catch (err) {
      console.error("Lỗi tải bài đăng:", err);
      toast.error("Không thể tải danh sách bài đăng");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    sortOrder,
    filterType,
    filterStatus,
    filterCategory,
    appliedSearch,
  ]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài đăng:\n"${title}"?`)) return;
    setActionLoading(postId);
    try {
      await apiNewsPost.deletePost(postId);
      toast.success("Đã xóa bài đăng!");
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa bài đăng!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (postId, action) => {
    const actionMap = {
      publish: apiNewsPost.publishPost,
      archive: apiNewsPost.archivePost,
      draft: apiNewsPost.revertToDraft,
    };
    const labelMap = {
      publish: "xuất bản",
      archive: "lưu trữ",
      draft: "chuyển về nháp",
    };
    setActionLoading(postId);
    try {
      await actionMap[action](postId);
      toast.success(`Đã ${labelMap[action]} bài đăng!`);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStatusActions = (post) => {
    const busy = actionLoading === post.postId;
    const btns = [];
    if (post.publishStatus === "DRAFT")
      btns.push(
        <button
          key="publish"
          className="dropdown-item small text-success"
          onClick={() => handleStatusChange(post.postId, "publish")}
          disabled={busy}
        >
          <FaCheckCircle className="me-2" size={11} /> Xuất bản
        </button>,
      );
    if (post.publishStatus === "PUBLISHED")
      btns.push(
        <button
          key="archive"
          className="dropdown-item small text-warning"
          onClick={() => handleStatusChange(post.postId, "archive")}
          disabled={busy}
        >
          <FaArchive className="me-2" size={11} /> Lưu trữ
        </button>,
      );
    if (post.publishStatus === "PUBLISHED" || post.publishStatus === "ARCHIVED")
      btns.push(
        <button
          key="draft"
          className="dropdown-item small text-secondary"
          onClick={() => handleStatusChange(post.postId, "draft")}
          disabled={busy}
        >
          <FaClock className="me-2" size={11} /> Về nháp
        </button>,
      );
    return btns;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ BÀI ĐĂNG</h4>
          <p className="text-muted small mb-0">
            Tin tức, thông báo và banner hệ thống
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary shadow-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/post-categories")}
          >
            <FaFilter size={13} />{" "}
            <span className="d-none d-md-inline">Danh mục</span>
          </button>
          <button
            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/news-posts/create")}
          >
            <FaPlus size={13} /> <span>Thêm bài đăng</span>
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: "400px", flex: 1 }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm tiêu đề, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button
                  type="button"
                  className="btn btn-light border-0"
                  onClick={handleClearSearch}
                >
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-dark shadow-sm">
              Tìm
            </button>
          </form>

          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select form-select-sm border-0 bg-light"
              value={filterType}
              onChange={handleFilterChange(setFilterType)}
              style={{ width: "130px" }}
            >
              <option value="">Tất cả loại</option>
              <option value="ARTICLE">Tin tức</option>
              <option value="BANNER">Banner</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              value={filterStatus}
              onChange={handleFilterChange(setFilterStatus)}
              style={{ width: "140px" }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Đã đăng</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              value={filterCategory}
              onChange={handleFilterChange(setFilterCategory)}
              style={{ width: "150px" }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm border-0 bg-primary-subtle text-primary fw-bold"
              style={{ width: "120px" }}
              value={sortOrder}
              onChange={handleFilterChange(setSortOrder)}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3" style={{ width: 55 }}>
                  #
                </th>
                <th style={{ minWidth: 200 }}>Tiêu đề</th>
                <th style={{ minWidth: 200 }}>Mô tả ngắn</th>
                <th>Loại</th>
                <th>Danh mục</th>
                <th className="text-center">Trạng thái</th>
                <th>Tác giả</th>
                <th>Ngày tạo</th>
                <th>Đăng lúc</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : data.content.length > 0 ? (
                data.content.map((post) => {
                  const statusCfg =
                    STATUS_CONFIG[post.publishStatus] || STATUS_CONFIG.DRAFT;
                  const typeCfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.ARTICLE;
                  const busy = actionLoading === post.postId;
                  return (
                    <tr key={post.postId} className={busy ? "opacity-50" : ""}>
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border fw-normal">
                          #{post.postId}
                        </span>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <span
                          className="fw-bold small text-truncate d-block"
                          style={{ maxWidth: 200 }}
                          title={post.title}
                        >
                          {post.pinned && (
                            <FaThumbtack
                              className="text-danger me-1"
                              size={10}
                              title="Ghim"
                            />
                          )}
                          {post.title}
                        </span>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        {post.summary ? (
                          <small
                            className="text-muted text-truncate d-block"
                            style={{ maxWidth: 200 }}
                            title={post.summary}
                          >
                            {post.summary}
                          </small>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${typeCfg.badge}`}
                        >
                          {typeCfg.icon} {typeCfg.label}
                        </span>
                      </td>
                      <td>
                        {post.categoryName ? (
                          <span className="badge bg-light text-dark border fw-normal small">
                            {post.categoryName}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="dropdown">
                          <button
                            className={`badge rounded-pill d-inline-flex align-items-center gap-1 border-0 ${statusCfg.badge}`}
                            data-bs-toggle="dropdown"
                            title="Nhấn để đổi trạng thái"
                            style={{ cursor: "pointer" }}
                            disabled={busy}
                          >
                            {busy ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                style={{ width: 10, height: 10 }}
                              />
                            ) : (
                              statusCfg.icon
                            )}{" "}
                            {statusCfg.label}
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 py-1">
                            {renderStatusActions(post)}
                          </ul>
                        </div>
                      </td>
                      <td className="small text-muted">
                        {post.authorName || "—"}
                      </td>
                      <td className="small text-muted">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="small">
                        {post.publishedAt ? (
                          <span className="text-success">
                            {formatDate(post.publishedAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem chi tiết"
                            onClick={() =>
                              navigate(`/news-posts/${post.postId}`)
                            }
                          >
                            <FaEye className="text-info" size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Chỉnh sửa"
                            onClick={() =>
                              navigate(`/news-posts/${post.postId}/edit`)
                            }
                          >
                            <FaEdit className="text-primary" size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xóa"
                            onClick={() =>
                              handleDelete(post.postId, post.title)
                            }
                            disabled={busy}
                          >
                            <FaTrash className="text-danger" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-muted">
                    <FaBullhorn className="mb-2 opacity-25" size={32} />
                    <br />
                    Không có bài đăng nào
                    {appliedSearch && ` với từ khóa "${appliedSearch}"`}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: <strong>{data.totalElements}</strong> bài đăng
          </small>
          <Pagination
            currentPage={data.pageNumber - 1}
            totalPages={data.totalPages}
            onPageChange={(page) => setCurrentPage(page + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default ListNewsPost;
