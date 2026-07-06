import React, { useState, useEffect, useCallback } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaArchive,
  FaClock,
  FaImage,
  FaStar,
  FaNewspaper,
  FaBullhorn,
  FaThumbtack,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaEye,
  FaLink,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiNewsPost from "../../api/apiNewsPost";
import { imgURL } from "../../api/config";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    cls: "bg-secondary-subtle text-secondary",
    icon: <FaClock size={12} />,
  },
  PUBLISHED: {
    label: "Đã đăng",
    cls: "bg-success-subtle text-success",
    icon: <FaCheckCircle size={12} />,
  },
  ARCHIVED: {
    label: "Lưu trữ",
    cls: "bg-warning-subtle text-warning",
    icon: <FaArchive size={12} />,
  },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${imgURL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const NewsPostDetail = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiNewsPost.getPostById(postId);
      setPost(res); // ✅ interceptor đã unwrap
    } catch (err) {
      toast.error("Không thể tải bài đăng!");
      navigate("/news-posts");
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleStatusAction = async (action) => {
    const actionMap = {
      publish: apiNewsPost.publishPost,
      archive: apiNewsPost.archivePost,
      draft: apiNewsPost.revertToDraft,
    };
    const labelMap = {
      publish: "Xuất bản",
      archive: "Lưu trữ",
      draft: "Về nháp",
    };
    setActionLoading(true);
    try {
      const res = await actionMap[action](postId);
      setPost(res);
      toast.success(`${labelMap[action]} thành công!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài đăng:\n"${post?.title}"?`))
      return;
    setActionLoading(true);
    try {
      await apiNewsPost.deletePost(postId);
      toast.success("Đã xóa bài đăng!");
      navigate("/news-posts");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa!");
      setActionLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary mt-5" />
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[post.publishStatus] || STATUS_CONFIG.DRAFT;
  const primaryImage =
    post.images?.find((img) => img.isPrimary) || post.images?.[0];

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate("/news-posts")}
            className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT BÀI ĐĂNG</h4>
            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <span className="badge bg-light text-dark border fw-normal">
                ID: #NP-{post.postId}
              </span>
              <span
                className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${statusCfg.cls}`}
              >
                {statusCfg.icon} {statusCfg.label}
              </span>
              <span
                className={`badge rounded-pill ${post.type === "BANNER" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info"}`}
              >
                {post.type === "BANNER" ? (
                  <FaBullhorn size={10} className="me-1" />
                ) : (
                  <FaNewspaper size={10} className="me-1" />
                )}
                {post.type === "BANNER" ? "Banner" : "Tin tức"}
              </span>
              {post.pinned && (
                <span className="badge bg-danger-subtle text-danger rounded-pill d-inline-flex align-items-center gap-1">
                  <FaThumbtack size={10} /> Đã ghim
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          {post.publishStatus === "DRAFT" && (
            <button
              className="btn btn-success shadow-sm fw-bold d-flex align-items-center gap-2"
              onClick={() => handleStatusAction("publish")}
              disabled={actionLoading}
            >
              <FaCheckCircle size={13} /> Xuất bản
            </button>
          )}
          {post.publishStatus === "PUBLISHED" && (
            <button
              className="btn btn-warning shadow-sm fw-bold d-flex align-items-center gap-2"
              onClick={() => handleStatusAction("archive")}
              disabled={actionLoading}
            >
              <FaArchive size={13} /> Lưu trữ
            </button>
          )}
          {(post.publishStatus === "PUBLISHED" ||
            post.publishStatus === "ARCHIVED") && (
            <button
              className="btn btn-outline-secondary shadow-sm fw-bold d-flex align-items-center gap-2"
              onClick={() => handleStatusAction("draft")}
              disabled={actionLoading}
            >
              <FaClock size={13} /> Về nháp
            </button>
          )}
          <button
            onClick={() => navigate(`/news-posts/${postId}/edit`)}
            className="btn btn-primary shadow-sm fw-bold d-flex align-items-center gap-2 px-4"
          >
            <FaEdit size={13} /> Chỉnh sửa
          </button>
          <button
            onClick={handleDeletePost}
            className="btn btn-light border-0 shadow-sm"
            disabled={actionLoading}
            title="Xóa bài đăng"
          >
            <FaTrash className="text-danger" />
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI — Nội dung */}
        <div className="col-lg-8">
          {/* Thông tin cơ bản */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
              <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                <FaNewspaper size={18} />
              </div>
              <h6 className="fw-bold mb-0 text-primary">Thông tin bài đăng</h6>
            </div>

            <h5 className="fw-bold text-dark mb-3">{post.title}</h5>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <small className="text-muted text-uppercase fw-bold d-flex align-items-center gap-1 mb-1">
                  <FaUser size={10} /> Tác giả
                </small>
                <span className="small fw-semibold">
                  {post.authorName || "—"}
                </span>
              </div>
              <div className="col-sm-6">
                <small className="text-muted text-uppercase fw-bold d-flex align-items-center gap-1 mb-1">
                  <FaTag size={10} /> Danh mục
                </small>
                <span className="small">
                  {post.categoryName ? (
                    <span className="badge bg-light text-dark border fw-normal">
                      {post.categoryName}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </span>
              </div>
              <div className="col-sm-6">
                <small className="text-muted text-uppercase fw-bold d-flex align-items-center gap-1 mb-1">
                  <FaCalendarAlt size={10} /> Ngày tạo
                </small>
                <span className="small">{formatDate(post.createdAt)}</span>
              </div>
              <div className="col-sm-6">
                <small className="text-muted text-uppercase fw-bold d-flex align-items-center gap-1 mb-1">
                  <FaCheckCircle size={10} /> Ngày đăng
                </small>
                <span className="small text-success">
                  {formatDate(post.publishedAt)}
                </span>
              </div>
              {post.slug && (
                <div className="col-12">
                  <small className="text-muted text-uppercase fw-bold d-flex align-items-center gap-1 mb-1">
                    <FaLink size={10} /> Slug (URL)
                  </small>
                  <code className="small text-primary">
                    /tin-tuc/{post.slug}
                  </code>
                </div>
              )}
            </div>

            {post.summary && (
              <div className="border-top pt-3 mt-1">
                <small className="text-muted text-uppercase fw-bold mb-2 d-block">
                  Tóm tắt
                </small>
                <p className="small text-muted mb-0 fst-italic">
                  {post.summary}
                </p>
              </div>
            )}
          </div>

          {/* Nội dung bài */}
          {post.content && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-secondary-subtle p-2 rounded-3 text-secondary">
                  <FaEye size={16} />
                </div>
                <h6 className="fw-bold mb-0 text-secondary">
                  Nội dung bài đăng
                </h6>
              </div>
              <div
                className="small lh-lg"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}
        </div>

        {/* CỘT PHẢI — Ảnh (chỉ xem) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                  <FaImage size={16} />
                </div>
                <h6 className="fw-bold mb-0 text-warning-emphasis">
                  Ảnh bài đăng ({post.images?.length || 0})
                </h6>
              </div>
              <button
                className="btn btn-sm btn-outline-primary fw-bold"
                onClick={() => navigate(`/news-posts/${postId}/edit`)}
                title="Chỉnh sửa ảnh"
              >
                <FaEdit size={11} className="me-1" /> Quản lý ảnh
              </button>
            </div>

            <div className="card-body p-4">
              {post.images && post.images.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {post.images.map((img) => {
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
                              height: 170,
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/400x170/f8f9fa/adb5bd?text=No+Image";
                            }}
                          />
                        ) : (
                          <div
                            className="w-100 bg-light d-flex align-items-center justify-content-center text-muted small"
                            style={{ height: 170 }}
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

                        {img.altText && (
                          <div className="position-absolute bottom-0 start-0 end-0 px-3 py-2 bg-dark bg-opacity-50">
                            <span
                              className="text-white small text-truncate d-block"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {img.altText}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 text-muted small">
                  <FaImage className="opacity-25 mb-2" size={32} />
                  <br />
                  Chưa có ảnh nào
                  <br />
                  <button
                    className="btn btn-sm btn-outline-warning mt-3 fw-bold"
                    onClick={() => navigate(`/news-posts/${postId}/edit`)}
                  >
                    <FaEdit size={11} className="me-1" /> Thêm ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPostDetail;
