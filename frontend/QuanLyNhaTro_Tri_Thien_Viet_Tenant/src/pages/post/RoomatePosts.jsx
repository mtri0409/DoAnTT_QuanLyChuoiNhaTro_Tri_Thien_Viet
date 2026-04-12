import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTimes,
  FaTrash,
  FaDoorOpen,
  FaClock,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";

const STATUS_BADGE = {
  ACTIVE: { label: "Đang tìm", cls: "badge bg-success" },
  CLOSED: { label: "Đã đóng", cls: "badge bg-secondary" },
  EXPIRED: { label: "Hết hạn", cls: "badge bg-warning text-dark" },
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const daysLeft = (expiresAt) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000))
    : null;

export default function RoommatePosts() {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [confirm, setConfirm] = useState(null); // { type: "close"|"delete", postId }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(location.state?.success || null);

  /* ── fetch ── */
  const fetchPosts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost.getMyPosts(pageNum, 8);
      setPosts(res.content || []);
      setTotalPages(res.totalPages || 0);
      setPage(pageNum);
    } catch {
      setError("Không thể tải bài đăng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  /* ── toast auto-hide ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── actions ── */
  const handleClose = async () => {
    setActionLoading(true);
    try {
      await apiPost.closePost(confirm.postId);
      setToast("Đã đóng bài đăng thành công.");
      fetchPosts(page);
    } catch {
      setToast("Không thể đóng bài. Thử lại sau.");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await apiPost.deletePost(confirm.postId);
      setToast("Đã xóa bài đăng thành công.");
      fetchPosts(page);
    } catch {
      setToast("Không thể xóa bài. Thử lại sau.");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      {/* ── Confirm Modal ── */}
      {confirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-body text-center p-4">
                <div className="mb-3" style={{ fontSize: 44 }}>
                  {confirm.type === "delete" ? "🗑️" : "🔒"}
                </div>
                <h6 className="fw-bold mb-2">
                  {confirm.type === "delete"
                    ? "Xóa bài đăng?"
                    : "Đóng bài đăng?"}
                </h6>
                <p className="text-muted small mb-4">
                  {confirm.type === "delete"
                    ? "Bài đăng sẽ bị xóa vĩnh viễn và không thể khôi phục."
                    : "Bài sẽ chuyển sang Đã đóng, không hiển thị công khai nữa."}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-secondary btn-sm px-4"
                    onClick={() => setConfirm(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className={`btn btn-sm px-4 ${confirm.type === "delete" ? "btn-danger" : "btn-warning"}`}
                    disabled={actionLoading}
                    onClick={
                      confirm.type === "delete" ? handleDelete : handleClose
                    }
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : confirm.type === "delete" ? (
                      "Xóa"
                    ) : (
                      "Đóng bài"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="alert alert-success alert-dismissible d-flex align-items-center gap-2 py-2 small shadow-sm">
          <FaCheckCircle className="text-success flex-shrink-0" />
          <span>{toast}</span>
          <button
            className="btn-close btn-sm ms-auto"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaUsers className="text-primary" /> Tìm bạn ghép phòng
          </h5>
          <p className="text-muted small mb-0">
            Quản lý bài đăng tìm người ghép phòng của bạn.
          </p>
        </div>
        <Link to="/user/posts/create" className="btn btn-primary btn-sm px-3">
          <FaPlus className="me-1" /> Đăng bài mới
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={() => fetchPosts(page)}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div className="d-flex flex-column gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card border-0 shadow-sm">
              <div className="card-body placeholder-glow d-flex flex-column gap-2">
                <span className="placeholder col-4 rounded" />
                <span className="placeholder col-12 rounded" />
                <span className="placeholder col-7 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: 52 }}>
            📋
          </div>
          <h6 className="text-muted">Bạn chưa có bài đăng nào</h6>
          <p className="text-muted small">
            Đăng bài để tìm người ghép phòng cùng bạn nhé!
          </p>
          <Link
            to="/user/posts/create"
            className="btn btn-primary btn-sm mt-2 px-4"
          >
            <FaPlus className="me-1" /> Đăng bài ngay
          </Link>
        </div>
      )}

      {/* ── Post List ── */}
      {!loading && posts.length > 0 && (
        <>
          <div className="d-flex flex-column gap-3">
            {posts.map((post) => {
              const left = daysLeft(post.expiresAt);
              const isActive = post.status === "ACTIVE";
              return (
                <div key={post.postId} className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                      {/* Info */}
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="fw-semibold small d-flex align-items-center gap-1">
                            <FaDoorOpen className="text-primary" size={13} />
                            {post.roomName}
                          </span>
                          {post.branchName && (
                            <span className="text-muted small">
                              — {post.branchName}
                            </span>
                          )}
                          <span className={STATUS_BADGE[post.status]?.cls}>
                            {STATUS_BADGE[post.status]?.label}
                          </span>
                        </div>

                        <p
                          className="text-secondary small mb-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.description}
                        </p>

                        <div className="d-flex gap-3 flex-wrap">
                          <span
                            className="text-muted d-flex align-items-center gap-1"
                            style={{ fontSize: 12 }}
                          >
                            <FaClock size={10} /> Đăng{" "}
                            {formatDate(post.createdAt)}
                          </span>
                          {isActive && left !== null && (
                            <span
                              className={`d-flex align-items-center gap-1 fw-medium ${left <= 5 ? "text-danger" : "text-muted"}`}
                              style={{ fontSize: 12 }}
                            >
                              <FaClock size={10} /> Còn {left} ngày
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 flex-shrink-0 align-items-start pt-1">
                        {isActive && (
                          <>
                            <Link
                              to={`/user/posts/${post.postId}/edit`}
                              className="btn btn-outline-primary btn-sm px-3"
                            >
                              <FaEdit size={12} className="me-1" /> Sửa
                            </Link>
                            <button
                              className="btn btn-outline-warning btn-sm px-3"
                              onClick={() =>
                                setConfirm({
                                  type: "close",
                                  postId: post.postId,
                                })
                              }
                            >
                              <FaTimes size={12} className="me-1" /> Đóng
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm px-3"
                          onClick={() =>
                            setConfirm({ type: "delete", postId: post.postId })
                          }
                        >
                          <FaTrash size={12} className="me-1" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={page === 0}
                onClick={() => fetchPosts(page - 1)}
              >
                ← Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm px-3 ${i === page ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => fetchPosts(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={page === totalPages - 1}
                onClick={() => fetchPosts(page + 1)}
              >
                Tiếp →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
