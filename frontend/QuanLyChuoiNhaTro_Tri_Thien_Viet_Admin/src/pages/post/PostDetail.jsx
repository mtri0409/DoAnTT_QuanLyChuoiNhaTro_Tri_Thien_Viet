import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUsers,
  FaBuilding,
  FaBed,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaExclamationTriangle,
  FaRedo,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang mở",
    badgeClass: "bg-success text-white",
    cardBorder: "border-success",
    icon: <FaCheckCircle />,
    alertClass: "alert-success",
    description: "Bài đăng đang hiển thị và chấp nhận liên hệ.",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "bg-secondary text-white",
    cardBorder: "border-secondary",
    icon: <FaBan />,
    alertClass: "alert-secondary",
    description: "Bài đăng đã được đóng bởi chủ bài.",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-danger text-white",
    cardBorder: "border-danger",
    icon: <FaClock />,
    alertClass: "alert-danger",
    description: "Bài đăng đã hết hạn sau 30 ngày.",
  },
};

const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="d-flex align-items-start py-3 border-bottom">
    <div
      className="text-primary me-3 mt-1"
      style={{ width: 18, flexShrink: 0 }}
    >
      {icon}
    </div>
    <div className="flex-grow-1">
      <div className="text-muted small mb-1">{label}</div>
      <div
        className={`fw-semibold ${highlight ? "text-primary" : "text-dark"}`}
      >
        {value || "—"}
      </div>
    </div>
  </div>
);

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: "", status: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchPost = async () => {
    setLoading(true);
    try {
      // Thử lấy public trước; nếu 404 thì bài không active
      const res = await apiPost.getPostById(postId);
      setPost(res);
      setEditForm({ description: res.description, status: res.status });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không tìm thấy bài đăng hoặc bài đã không còn hiển thị.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa bài đăng #${postId}? Thao tác này không thể hoàn tác!`,
      )
    )
      return;
    try {
      await apiPost.adminDeletePost(postId);
      alert("Xóa bài đăng thành công!");
      navigate("/posts");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa!");
    }
  };

  const handleSave = async () => {
    if (editForm.description.trim().length < 20) {
      setEditError("Mô tả phải có ít nhất 20 ký tự.");
      return;
    }
    try {
      setSaving(true);
      setEditError("");
      await apiPost.adminUpdatePost(postId, {
        description: editForm.description,
        status: editForm.status,
      });
      await fetchPost();
      setIsEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleRepost = async () => {
    if (!window.confirm("Bạn muốn đăng lại bài này?")) return;
    try {
      await apiPost.repost(postId);
      alert("Đăng lại thành công! Bài mới đã được tạo.");
      navigate("/posts");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đăng lại!");
    }
  };

  const formatDateTime = (str) => {
    if (!str) return "N/A";
    return new Date(str).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysLeft = () => {
    if (!post?.expiresAt) return null;
    return Math.ceil(
      (new Date(post.expiresAt) - new Date()) / (1000 * 60 * 60 * 24),
    );
  };

  // ── LOADING ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: 300 }}
        >
          <div className="text-center text-muted">
            <div className="spinner-border text-primary mb-3" />
            <div className="small">Đang tải bài đăng...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────

  if (error || !post) {
    return (
      <div className="container-fluid py-4">
        <button
          className="btn btn-light mb-4 d-flex align-items-center gap-2"
          onClick={() => navigate("/posts")}
        >
          <FaArrowLeft size={13} /> Quay lại danh sách
        </button>
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
          <FaExclamationTriangle
            size={48}
            className="text-warning mx-auto mb-3"
          />
          <h5 className="fw-bold text-dark mb-2">Không thể tải bài đăng</h5>
          <p className="text-muted small">{error}</p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.ACTIVE;
  const daysLeft = getDaysLeft();

  // ── MAIN ──────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      {/* BREADCRUMB / BACK */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <button
          className="btn btn-light shadow-sm d-flex align-items-center gap-2 rounded-3"
          onClick={() => navigate("/posts")}
        >
          <FaArrowLeft size={13} /> Quay lại danh sách
        </button>
        <div className="d-flex gap-2">
          {/* Repost nếu không active */}
          {post.status !== "ACTIVE" && (
            <button
              className="btn btn-outline-success d-flex align-items-center gap-2 rounded-3"
              onClick={handleRepost}
            >
              <FaRedo size={13} /> Đăng lại
            </button>
          )}
          {!isEditing ? (
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit size={13} /> Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                className="btn btn-light d-flex align-items-center gap-2 rounded-3"
                onClick={() => {
                  setIsEditing(false);
                  setEditError("");
                }}
              >
                <FaTimes size={13} /> Hủy
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2 rounded-3"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FaSave size={13} />
                )}{" "}
                Lưu
              </button>
            </>
          )}
          <button
            className="btn btn-outline-danger d-flex align-items-center gap-2 rounded-3"
            onClick={handleDelete}
          >
            <FaTrash size={13} /> Xóa bài
          </button>
        </div>
      </div>

      {/* STATUS ALERT */}
      <div
        className={`alert ${statusCfg.alertClass} d-flex align-items-center gap-3 rounded-3 border-0 mb-4`}
      >
        <span className="fs-5">{statusCfg.icon}</span>
        <div>
          <strong>Trạng thái: {statusCfg.label}</strong>
          <span className="ms-2 text-muted small">
            — {statusCfg.description}
          </span>
          {post.status === "ACTIVE" && daysLeft !== null && (
            <span
              className={`ms-3 badge rounded-pill ${daysLeft <= 3 ? "bg-danger" : daysLeft <= 7 ? "bg-warning text-dark" : "bg-light text-dark border"}`}
            >
              Còn {daysLeft} ngày
            </span>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT: Thông tin chính */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaUsers className="text-primary" /> Bài đăng #{post.postId}
              </h6>
              <span
                className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${statusCfg.badgeClass}`}
              >
                {statusCfg.icon} {statusCfg.label}
              </span>
            </div>
            <div className="card-body px-4 pb-4">
              {/* Mô tả */}
              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-2 d-block">
                  MÔ TẢ BÀI ĐĂNG
                </label>
                {isEditing ? (
                  <>
                    {editError && (
                      <div className="alert alert-danger py-2 small rounded-3 mb-2">
                        {editError}
                      </div>
                    )}
                    <textarea
                      className="form-control bg-light border-0 rounded-3"
                      rows={6}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="text-end mt-1">
                      <small
                        className={`text-muted ${editForm.description.length < 20 ? "text-danger" : ""}`}
                      >
                        {editForm.description.length} ký tự
                      </small>
                    </div>
                  </>
                ) : (
                  <div
                    className="bg-light rounded-3 p-3 text-dark"
                    style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
                  >
                    {post.description}
                  </div>
                )}
              </div>

              {/* Trạng thái (chỉ hiện khi edit) */}
              {isEditing && (
                <div className="mb-2">
                  <label className="text-muted small fw-semibold mb-2 d-block">
                    TRẠNG THÁI
                  </label>
                  <select
                    className="form-select bg-light border-0 rounded-3"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">ACTIVE – Đang mở</option>
                    <option value="CLOSED">CLOSED – Đóng bài</option>
                  </select>
                </div>
              )}

              {/* Thông tin phòng */}
              <div className="mt-4">
                <label className="text-muted small fw-semibold mb-3 d-block">
                  THÔNG TIN PHÒNG
                </label>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="bg-primary-subtle rounded-3 p-3 d-flex align-items-center gap-3">
                      <FaBed size={20} className="text-primary" />
                      <div>
                        <div className="text-muted small">Tên phòng</div>
                        <div className="fw-bold">
                          {post.roomName || `#${post.roomId}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="bg-info-subtle rounded-3 p-3 d-flex align-items-center gap-3">
                      <FaBuilding size={20} className="text-info" />
                      <div>
                        <div className="text-muted small">Chi nhánh</div>
                        <div className="fw-bold">{post.branchName || "—"}</div>
                      </div>
                    </div>
                  </div>
                  {post.branchAddress && (
                    <div className="col-12">
                      <div className="bg-light rounded-3 p-3 text-muted small">
                        <strong>Địa chỉ:</strong> {post.branchAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Thông tin phụ */}
        <div className="col-lg-4">
          {/* Tác giả */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaUser className="text-primary" /> Tác giả
              </h6>
            </div>
            <div className="card-body px-4 py-0">
              <InfoRow
                icon={<FaUser size={14} />}
                label="Họ tên"
                value={post.authorName}
              />
              <InfoRow
                icon={<FaPhone size={14} />}
                label="Số điện thoại"
                value={post.authorPhone}
                highlight
              />
            </div>
          </div>

          {/* Thời gian */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Thời gian
              </h6>
            </div>
            <div className="card-body px-4 py-0">
              <InfoRow
                icon={<FaCalendarAlt size={14} />}
                label="Ngày đăng"
                value={formatDateTime(post.createdAt)}
              />
              <InfoRow
                icon={<FaEdit size={14} />}
                label="Cập nhật lần cuối"
                value={formatDateTime(post.updatedAt)}
              />
              <InfoRow
                icon={<FaClock size={14} />}
                label="Hết hạn"
                value={
                  post.status === "ACTIVE" && daysLeft !== null
                    ? `${formatDateTime(post.expiresAt)} (còn ${daysLeft} ngày)`
                    : formatDateTime(post.expiresAt)
                }
                highlight={
                  post.status === "ACTIVE" && daysLeft !== null && daysLeft <= 7
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
