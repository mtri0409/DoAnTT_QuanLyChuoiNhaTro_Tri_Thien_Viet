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
  FaEye,
  FaRedo,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang tìm",
    badge: "bg-success-subtle text-success",
    dot: "#22c55e",
  },
  CLOSED: {
    label: "Đã đóng",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
  },
  EXPIRED: {
    label: "Hết hạn",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
  },
};

const FILTER_OPTIONS = [
  { key: "ALL", label: "Tất cả", dot: "#cbd5e1" },
  { key: "ACTIVE", label: "Đang tìm", dot: "#22c55e" },
  { key: "EXPIRED", label: "Hết hạn", dot: "#f59e0b" },
  { key: "CLOSED", label: "Đã đóng", dot: "#94a3b8" },
];

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

/* ── Reusable action button — Bootstrap only, no JS hover state ── */
function ActionBtn({ icon, label, onClick, variant = "secondary", to }) {
  const variantMap = {
    primary: "btn-primary-subtle text-primary",
    warning: "btn-warning-subtle text-warning-emphasis",
    danger: "btn-danger-subtle text-danger",
    secondary: "btn-secondary-subtle text-secondary",
    success: "btn-success-subtle text-success",
  };
  const cls = `btn btn-sm d-inline-flex align-items-center gap-2 rounded-3 fw-medium ${
    variantMap[variant] ?? variantMap.secondary
  }`;

  if (to)
    return (
      <Link to={to} className={cls} style={{ textDecoration: "none" }}>
        {icon} {label}
      </Link>
    );
  return (
    <button className={cls} onClick={onClick}>
      {icon} {label}
    </button>
  );
}

export default function RoommatePosts() {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(location.state?.success || null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchPosts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost.getMyPosts(pageNum, 20);
      setPosts(res?.content ?? res?.data?.content ?? []);
      setTotalPages(res?.totalPages ?? res?.data?.totalPages ?? 0);
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
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const doAction = (fn) => async () => {
    setActionLoading(true);
    try {
      await fn();
      fetchPosts(page);
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const handleClose = doAction(async () => {
    await apiPost.closePost(confirm.postId);
    setToast("Đã đóng bài đăng.");
  });
  const handleDelete = doAction(async () => {
    await apiPost.deletePost(confirm.postId);
    setToast("Đã xóa bài đăng.");
  });
  const handleRepost = doAction(async () => {
    await apiPost.repost(confirm.postId);
    setToast("Đã đăng lại thành công!");
  });

  const confirmAction =
    confirm?.type === "delete"
      ? handleDelete
      : confirm?.type === "repost"
        ? handleRepost
        : handleClose;

  const filtered = posts.filter(
    (p) =>
      (filterStatus === "ALL" || p.status === filterStatus) &&
      (!searchText ||
        p.roomName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchText.toLowerCase())),
  );

  const countBy = (s) =>
    s === "ALL" ? posts.length : posts.filter((p) => p.status === s).length;

  const urgentCount = posts.filter(
    (p) => p.status === "ACTIVE" && (daysLeft(p.expiresAt) ?? 99) <= 5,
  ).length;

  return (
    /*
     * Outer wrapper: flex-column full-height container.
     * Header is sticky at top; sidebar is sticky below header.
     * Only the list column scrolls naturally with the page.
     */
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      {/* ════════════════════════════════════
          CONFIRM MODAL
      ════════════════════════════════════ */}
      {confirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,.4)", zIndex: 9999 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-body text-center p-4">
                <div className="fs-1 mb-3">
                  {confirm.type === "delete"
                    ? "🗑️"
                    : confirm.type === "repost"
                      ? "🔄"
                      : "🔒"}
                </div>
                <h6 className="fw-bold mb-2">
                  {confirm.type === "delete"
                    ? "Xóa bài đăng?"
                    : confirm.type === "repost"
                      ? "Đăng lại bài?"
                      : "Đóng bài đăng?"}
                </h6>
                <p className="text-muted small mb-4">
                  {confirm.type === "delete"
                    ? "Bài sẽ bị xóa vĩnh viễn, không thể khôi phục."
                    : confirm.type === "repost"
                      ? "Bài mới sẽ được tạo từ nội dung cũ, hiệu lực 30 ngày."
                      : "Bài sẽ chuyển sang Đã đóng, không còn hiển thị công khai."}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-secondary btn-sm px-4 rounded-3"
                    onClick={() => setConfirm(null)}
                  >
                    Hủy
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={confirmAction}
                    className={`btn btn-sm px-4 rounded-3 ${
                      confirm.type === "delete"
                        ? "btn-danger"
                        : confirm.type === "repost"
                          ? "btn-primary"
                          : "btn-warning"
                    }`}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : confirm.type === "delete" ? (
                      "Xóa"
                    ) : confirm.type === "repost" ? (
                      "Đăng lại"
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

      {/* ════════════════════════════════════
          TOAST
      ════════════════════════════════════ */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 m-3 alert alert-success d-flex align-items-center gap-2 py-2 px-3 small shadow-sm rounded-3 mb-0 border-0"
          style={{ zIndex: 9998, minWidth: 260 }}
        >
          <FaCheckCircle className="text-success flex-shrink-0" />
          <span>{toast}</span>
          <button
            className="btn-close btn-sm ms-auto"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* ════════════════════════════════════
          STICKY HEADER
      ════════════════════════════════════ */}
      <div
        className="bg-white px-4 py-3 shadow-sm border-bottom"
        style={{ position: "sticky", top: 0, zIndex: 100 }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
              style={{ width: 44, height: 44 }}
            >
              <FaUsers className="text-primary" size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Bài đăng của tôi</h5>
              <p className="mb-0 small text-secondary">
                {posts.length} bài · {countBy("ACTIVE")} đang tìm bạn ghép phòng
              </p>
            </div>
          </div>
          <Link
            to="/user/posts/create"
            className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3 shadow-sm fw-medium"
          >
            <FaPlus size={12} /> Đăng bài mới
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════
          BODY: SIDEBAR + LIST
      ════════════════════════════════════ */}
      <div className="container-fluid flex-grow-1 py-4 px-4">
        <div className="row g-4 align-items-start">
          {/* ── STICKY SIDEBAR ── */}
          <div
            className="col-lg-3 col-md-4"
            style={{ position: "sticky", top: 76, alignSelf: "flex-start" }}
          >
            {/* Search */}
            <div className="card border-0 rounded-4 shadow-sm mb-3">
              <div className="card-body p-3">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3">
                    <FaSearch className="text-secondary" size={12} />
                  </span>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Tìm bài đăng..."
                    className="form-control border-start-0 bg-light rounded-end-3"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            {/* Filter by status */}
            <div className="card border-0 rounded-4 shadow-sm mb-3">
              <div className="card-body p-3">
                <p
                  className="fw-semibold mb-3 d-flex align-items-center gap-2 text-uppercase text-secondary"
                  style={{ fontSize: 11, letterSpacing: ".05em" }}
                >
                  <FaFilter size={10} /> Trạng thái
                </p>
                {FILTER_OPTIONS.map(({ key, label, dot }) => {
                  const isActive = filterStatus === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`w-100 d-flex align-items-center justify-content-between border-0 rounded-3 px-3 py-2 mb-1 ${
                        isActive
                          ? "bg-primary bg-opacity-10 text-primary fw-semibold"
                          : "bg-transparent text-secondary"
                      }`}
                      style={{ fontSize: 13, cursor: "pointer" }}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <span
                          className="rounded-circle flex-shrink-0"
                          style={{
                            width: 8,
                            height: 8,
                            background: dot,
                            display: "inline-block",
                          }}
                        />
                        {label}
                      </span>
                      <span
                        className={`badge rounded-pill ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-secondary-subtle text-secondary"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {countBy(key)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="card border-0 rounded-4 shadow-sm">
              <div className="card-body p-3">
                <p
                  className="small text-uppercase text-secondary fw-semibold mb-3"
                  style={{ fontSize: 11, letterSpacing: ".05em" }}
                >
                  Tổng quan
                </p>
                {[
                  {
                    label: "Tổng bài đăng",
                    value: posts.length,
                    bg: "bg-light",
                    color: "text-primary",
                  },
                  {
                    label: "Đang hoạt động",
                    value: countBy("ACTIVE"),
                    bg: "bg-success bg-opacity-10",
                    color: "text-success",
                  },
                  {
                    label: "Sắp hết hạn",
                    value: urgentCount,
                    bg: "bg-danger bg-opacity-10",
                    color: "text-danger",
                  },
                ].map(({ label, value, bg, color }) => (
                  <div
                    key={label}
                    className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2 mb-2 ${bg}`}
                  >
                    <span className="small text-secondary">{label}</span>
                    <span className={`fw-bold fs-6 ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SCROLLABLE LIST COLUMN ── */}
          <div className="col-lg-9 col-md-8">
            {/* Error */}
            {error && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 small mb-3">
                {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-auto"
                  onClick={() => fetchPosts(page)}
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="d-flex flex-column gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4 placeholder-glow d-flex flex-column gap-2">
                      <span className="placeholder col-4 rounded" />
                      <span className="placeholder col-12 rounded" />
                      <span className="placeholder col-6 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="card-body">
                  <div className="fs-1 mb-3">
                    {searchText || filterStatus !== "ALL" ? "🔍" : "📋"}
                  </div>
                  <h6 className="fw-semibold mb-1 text-dark">
                    {searchText || filterStatus !== "ALL"
                      ? "Không tìm thấy kết quả"
                      : "Chưa có bài đăng nào"}
                  </h6>
                  <p className="text-muted small mb-3">
                    {searchText || filterStatus !== "ALL"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Hãy đăng bài để tìm người ghép phòng nhé!"}
                  </p>
                  {!searchText && filterStatus === "ALL" && (
                    <Link
                      to="/user/posts/create"
                      className="btn btn-primary btn-sm px-4 rounded-3"
                    >
                      <FaPlus size={11} className="me-1" /> Đăng bài ngay
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Post cards */}
            {!loading && filtered.length > 0 && (
              <div className="d-flex flex-column gap-3">
                {filtered.map((post) => {
                  const left = daysLeft(post.expiresAt);
                  const isActive = post.status === "ACTIVE";
                  const isInactive =
                    post.status === "EXPIRED" || post.status === "CLOSED";
                  const isHov = hoveredCard === post.postId;
                  const cfg = STATUS_CONFIG[post.status];

                  return (
                    <div
                      key={post.postId}
                      className="card border-0 rounded-4 bg-white"
                      onMouseEnter={() => setHoveredCard(post.postId)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        transition: "box-shadow .2s, transform .2s",
                        boxShadow: isHov
                          ? "0 8px 32px rgba(37,99,235,.13)"
                          : "0 1px 8px rgba(0,0,0,.07)",
                        transform: isHov ? "translateY(-2px)" : "none",
                        opacity: isInactive ? 0.82 : 1,
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex gap-3 align-items-start">
                          {/* Status dot */}
                          <div className="flex-shrink-0 pt-1">
                            <span
                              className="d-block rounded-circle"
                              style={{
                                width: 10,
                                height: 10,
                                background: cfg?.dot,
                                boxShadow: isActive
                                  ? `0 0 0 3px ${cfg?.dot}30`
                                  : "none",
                                marginTop: 3,
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1 overflow-hidden">
                            {/* Title row */}
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span
                                className="fw-semibold text-dark"
                                style={{ fontSize: 14 }}
                              >
                                <FaDoorOpen
                                  size={12}
                                  className="me-1 text-primary"
                                />
                                {post.roomName}
                              </span>
                              {post.branchName && (
                                <span
                                  className="text-secondary"
                                  style={{ fontSize: 12 }}
                                >
                                  — {post.branchName}
                                </span>
                              )}
                              <span
                                className={`badge rounded-pill ${cfg?.badge}`}
                                style={{ fontSize: 11 }}
                              >
                                {cfg?.label}
                              </span>
                              {isActive && left !== null && left <= 5 && (
                                <span
                                  className="badge rounded-pill bg-danger-subtle text-danger"
                                  style={{ fontSize: 11 }}
                                >
                                  ⚠ Còn {left} ngày
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p
                              className="text-secondary mb-2"
                              style={{
                                fontSize: 13,
                                lineHeight: 1.65,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {post.description}
                            </p>

                            {/* Meta */}
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                              <span
                                className="d-flex align-items-center gap-1 text-secondary"
                                style={{ fontSize: 12 }}
                              >
                                <FaClock size={10} />{" "}
                                {formatDate(post.createdAt)}
                              </span>
                              {isActive && left !== null && left > 5 && (
                                <span
                                  className="d-flex align-items-center gap-1 text-secondary"
                                  style={{ fontSize: 12 }}
                                >
                                  <FaClock size={10} /> Còn {left} ngày
                                </span>
                              )}
                              <span
                                className="text-secondary"
                                style={{ fontSize: 11 }}
                              >
                                #POST-{post.postId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action bar — slides open on hover */}
                        <div
                          style={{
                            maxHeight: isHov ? 56 : 0,
                            overflow: "hidden",
                            transition:
                              "max-height .22s cubic-bezier(.4,0,.2,1)",
                          }}
                        >
                          <div className="d-flex gap-2 flex-wrap pt-3 mt-3 border-top">
                            {isActive && (
                              <ActionBtn
                                to={`/user/posts/${post.postId}`}
                                icon={<FaEye size={12} />}
                                label="Xem"
                                variant="secondary"
                              />
                            )}
                            {isActive && (
                              <>
                                <ActionBtn
                                  to={`/user/posts/${post.postId}/edit`}
                                  icon={<FaEdit size={12} />}
                                  label="Chỉnh sửa"
                                  variant="primary"
                                />
                                <ActionBtn
                                  icon={<FaTimes size={12} />}
                                  label="Đóng bài"
                                  variant="warning"
                                  onClick={() =>
                                    setConfirm({
                                      type: "close",
                                      postId: post.postId,
                                    })
                                  }
                                />
                              </>
                            )}
                            {isInactive && (
                              <ActionBtn
                                icon={<FaRedo size={12} />}
                                label="Đăng lại"
                                variant="success"
                                onClick={() =>
                                  setConfirm({
                                    type: "repost",
                                    postId: post.postId,
                                  })
                                }
                              />
                            )}
                            <ActionBtn
                              icon={<FaTrash size={12} />}
                              label="Xóa bài"
                              variant="danger"
                              onClick={() =>
                                setConfirm({
                                  type: "delete",
                                  postId: post.postId,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={page === 0}
                  onClick={() => fetchPosts(page - 1)}
                >
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchPosts(i)}
                    className={`btn btn-sm px-3 rounded-3 ${
                      i === page
                        ? "btn-primary shadow-sm fw-semibold"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={page === totalPages - 1}
                  onClick={() => fetchPosts(page + 1)}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
          {/* /col list */}
        </div>
        {/* /row */}
      </div>
      {/* /container */}
    </div>
  );
}
