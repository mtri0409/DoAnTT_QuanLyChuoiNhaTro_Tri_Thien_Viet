import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaBuilding,
  FaBed,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiPost from "../../api/apiPost";
import apiBranch from "../../api/apiBranches";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang mở",
    badge: "bg-success-subtle text-success",
    icon: <FaCheckCircle size={10} />,
  },
  CLOSED: {
    label: "Đã đóng",
    badge: "bg-secondary-subtle text-secondary",
    icon: <FaBan size={10} />,
  },
  EXPIRED: {
    label: "Hết hạn",
    badge: "bg-danger-subtle text-danger",
    icon: <FaClock size={10} />,
  },
};

const ListPost = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiPost.getActivePosts(
        currentPage - 1,
        10,
        "",
        selectedBranch,
      );
      setData(response);
    } catch (err) {
      console.error("Lỗi tải bài đăng:", err.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedBranch, appliedSearch]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await apiBranch.getAllBranches(0, 50);
        setBranches(res.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranches();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài đăng #${postId}?`)) return;
    try {
      setLoading(true);
      await apiPost.adminDeletePost(postId);
      toast.success("Xóa bài đăng thành công!");
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa!");
    } finally {
      setLoading(false);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = Math.ceil(
      (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  // Sort posts by createdAt
  const sortedContent = [...(data.content || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <FaUsers className="me-2 text-primary" size={20} />
            QUẢN LÝ BÀI ĐĂNG TÌM BẠN GHÉP
          </h4>
          <p className="text-muted small mb-0">
            Hệ thống quản lý bài đăng tìm bạn ghép phòng
          </p>
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
                placeholder="Tìm tên phòng, chi nhánh, tác giả..."
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

          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Sắp xếp */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small d-flex align-items-center gap-1">
                {sortOrder === "newest" ? (
                  <FaSortAmountDown size={13} />
                ) : (
                  <FaSortAmountUp size={13} />
                )}
                Sắp xếp:
              </span>
              <select
                className="form-select form-select-sm border-0 bg-warning-subtle text-warning-emphasis fw-bold"
                style={{ width: "140px" }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            {/* Filter chi nhánh */}
            <select
              className="form-select form-select-sm border-0 bg-primary-subtle text-primary fw-bold"
              style={{ width: "180px" }}
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3" style={{ width: 60 }}>
                  #
                </th>
                <th>Phòng / Chi nhánh</th>
                <th>Tác giả</th>
                <th style={{ maxWidth: 280 }}>Mô tả</th>
                <th className="text-center">Trạng thái</th>
                <th>Hết hạn</th>
                <th>Ngày đăng</th>
                <th className="text-end pe-4">Thao tác</th>
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
              ) : sortedContent.length > 0 ? (
                sortedContent.map((post) => {
                  const statusCfg =
                    STATUS_CONFIG[post.status] || STATUS_CONFIG.ACTIVE;
                  const daysLeft = getDaysLeft(post.expiresAt);
                  return (
                    <tr key={post.postId}>
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border fw-normal">
                          #{post.postId}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold d-flex align-items-center gap-1">
                            <FaBed size={12} className="text-primary" />
                            {post.roomName || `Phòng #${post.roomId}`}
                          </span>
                          {post.branchName && (
                            <small className="text-muted d-flex align-items-center gap-1 mt-1">
                              <FaBuilding size={10} />
                              {post.branchName}
                            </small>
                          )}
                          {post.branchAddress && (
                            <small
                              className="text-muted text-truncate"
                              style={{ maxWidth: 180 }}
                            >
                              {post.branchAddress}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold small">
                            {post.authorName || "N/A"}
                          </span>
                          <small className="text-muted">
                            {post.authorPhone || ""}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div
                          className="text-muted small text-truncate"
                          style={{ maxWidth: 260 }}
                          title={post.description}
                        >
                          {post.description}
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${statusCfg.badge}`}
                        >
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </td>
                      <td>
                        {post.status === "ACTIVE" && daysLeft !== null ? (
                          <span
                            className={`small fw-semibold ${daysLeft <= 3 ? "text-danger" : daysLeft <= 7 ? "text-warning" : "text-muted"}`}
                          >
                            {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Hôm nay"}
                          </span>
                        ) : (
                          <span className="small text-muted">
                            {formatDate(post.expiresAt)}
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem chi tiết"
                            onClick={() =>
                              navigate(`/posts/${post.postId}/detail`)
                            }
                          >
                            <FaEye className="text-info" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xóa"
                            onClick={() => handleDelete(post.postId)}
                          >
                            <FaTrash className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Không có bài đăng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: {data.totalElements} bài đăng
          </small>
          <Pagination
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={(page) => setCurrentPage(page + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default ListPost;
