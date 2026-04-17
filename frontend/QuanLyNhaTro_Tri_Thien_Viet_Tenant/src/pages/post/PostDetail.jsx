import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaDoorOpen,
  FaClock,
  FaUsers,
  FaMoneyBillWave,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";
import apiRoom from "../../api/apiRoom";
import { imgURL } from "../../api/config";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : null;

const daysLeft = (expiresAt) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000))
    : null;

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${imgURL}${url}`;
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const postData = await apiPost.getPostById(postId);
        const p = postData?.data ?? postData;
        setPost(p);

        if (p?.roomId) {
          try {
            const roomData = await apiRoom.getRoomById(p.roomId);
            setRoomDetail(roomData?.data ?? roomData);
          } catch {
            // Không có chi tiết phòng → vẫn hiện bài
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) setError("Bài đăng không tồn tại hoặc đã hết hạn.");
        else setError("Không thể tải bài đăng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="text-muted mt-2 small">Đang tải bài đăng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <div className="alert alert-warning">{error}</div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-1" /> Quay lại
        </button>
      </div>
    );
  }

  const mediaList = roomDetail?.roomMedia ?? [];
  const images = mediaList.filter(
    (m) => !m.mediaType || m.mediaType.startsWith("image"),
  );
  // Sắp thumbnail lên đầu
  images.sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));

  const currentImg = images[imgIndex];
  const left = daysLeft(post?.expiresAt);

  // Địa chỉ: ưu tiên branchAddress từ post DTO, fallback sang roomDetail
  const address =
    post?.branchAddress || roomDetail?.floor?.branch?.address || null;

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <button
        className="btn btn-link text-decoration-none px-0 mb-3 text-secondary"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-1" /> Quay lại
      </button>

      <div className="row g-4">
        {/* ── Cột trái: ảnh phòng ── */}
        <div className="col-12 col-md-7">
          {/* Carousel ảnh */}
          <div
            className="rounded-3 overflow-hidden bg-secondary bg-opacity-10 position-relative"
            style={{ aspectRatio: "16/10" }}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={getFullImageUrl(currentImg.url)}
                  alt={`Ảnh phòng ${imgIndex + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-1"
                      style={{ opacity: 0.7, width: 32, height: 32 }}
                      onClick={() =>
                        setImgIndex(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                    >
                      <FaChevronLeft size={12} />
                    </button>
                    <button
                      className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-1"
                      style={{ opacity: 0.7, width: 32, height: 32 }}
                      onClick={() =>
                        setImgIndex((i) => (i + 1) % images.length)
                      }
                    >
                      <FaChevronRight size={12} />
                    </button>
                    {/* Dots */}
                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          className="p-0 border-0 rounded-circle"
                          style={{
                            width: 7,
                            height: 7,
                            background:
                              i === imgIndex ? "#fff" : "rgba(255,255,255,0.5)",
                            cursor: "pointer",
                          }}
                          onClick={() => setImgIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted flex-column gap-2">
                <FaImage size={48} className="opacity-25" />
                <span className="small">Chưa có ảnh phòng</span>
              </div>
            )}
          </div>

          {/* Thông tin phòng */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body py-3 px-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaDoorOpen className="text-primary" size={16} />
                <span className="fw-semibold">{post.roomName}</span>
                {post.branchName && (
                  <span className="text-muted small ms-1">
                    — {post.branchName}
                  </span>
                )}
              </div>

              {/* Hiển thị địa chỉ từ branchAddress trong DTO */}
              {address && (
                <div className="d-flex align-items-start gap-2 mb-3 text-muted small">
                  <FaMapMarkerAlt
                    className="text-danger flex-shrink-0 mt-1"
                    size={12}
                  />
                  <span>{address}</span>
                </div>
              )}

              <div className="d-flex flex-wrap gap-4">
                {roomDetail?.price && (
                  <div className="d-flex align-items-center gap-1">
                    <FaMoneyBillWave className="text-success" size={14} />
                    <span
                      className="fw-bold text-success"
                      style={{ fontSize: 16 }}
                    >
                      {formatPrice(roomDetail.price)}
                    </span>
                    <span className="text-muted small">/tháng</span>
                  </div>
                )}
                {roomDetail?.currentPeople != null &&
                  roomDetail?.maxPeople != null && (
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <FaUsers size={13} />
                      {roomDetail.currentPeople}/{roomDetail.maxPeople} người
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cột phải: chi tiết bài ── */}
        <div className="col-12 col-md-5 d-flex flex-column gap-3">
          {/* Thông tin tác giả — CHỈ tên, KHÔNG nút gọi/nhắn tin */}
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3 px-4">
              <p className="text-muted small mb-2 fw-medium">Người đăng</p>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 44, height: 44, fontSize: 18 }}
                >
                  {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="fw-semibold">{post.authorName}</div>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <FaUser size={10} /> Thành viên phòng
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thời hạn */}
          <div className="card border-0 shadow-sm">
            <div className="card-body py-3 px-4">
              <div className="d-flex flex-wrap gap-3 small text-muted">
                <div className="d-flex align-items-center gap-1">
                  <FaClock size={11} />
                  Đăng: {formatDate(post.createdAt)}
                </div>
                {left !== null && (
                  <div
                    className={`d-flex align-items-center gap-1 fw-medium ${left <= 5 ? "text-danger" : "text-muted"}`}
                  >
                    <FaClock size={11} />
                    Còn {left} ngày
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="card border-0 shadow-sm flex-grow-1">
            <div className="card-body py-3 px-4">
              <p className="text-muted small fw-medium mb-2">Mô tả</p>
              <p
                className="mb-0"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  fontSize: 14,
                }}
              >
                {post.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
