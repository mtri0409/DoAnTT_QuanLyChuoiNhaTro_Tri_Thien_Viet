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
  FaFileAlt,
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
            /* Không có chi tiết phòng → vẫn hiện bài */
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm">
          <div className="btn btn-light border-0 rounded-circle p-2 shadow-sm">
            <FaArrowLeft className="text-muted" />
          </div>
          <h4 className="fw-bold text-dark mb-0">CHI TIẾT BÀI ĐĂNG</h4>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-2 small">Đang tải bài đăng...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <h4 className="fw-bold text-dark mb-0">CHI TIẾT BÀI ĐĂNG</h4>
        </div>
        <div className="alert alert-warning rounded-3">{error}</div>
      </div>
    );
  }

  const mediaList = roomDetail?.roomMedia ?? [];
  const images = mediaList
    .filter((m) => !m.mediaType || m.mediaType.startsWith("image"))
    .sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));

  const currentImg = images[imgIndex];
  const left = daysLeft(post?.expiresAt);
  const address =
    post?.branchAddress || roomDetail?.floor?.branch?.address || null;

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      {/* ── Header Panel ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT BÀI ĐĂNG</h4>
            <span className="badge bg-primary-subtle text-primary">
              Mã số: #POST-{post.postId}
            </span>
          </div>
        </div>
        {left !== null && (
          <div
            className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${left <= 5 ? "bg-danger-subtle text-danger" : "bg-light text-muted"}`}
          >
            <FaClock size={13} />
            <span className="small fw-medium">Còn {left} ngày</span>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* ── Cột trái: Ảnh phòng + Info phòng ── */}
        <div className="col-lg-7">
          {/* Carousel */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div
              className="position-relative bg-secondary bg-opacity-10"
              style={{ aspectRatio: "16/10" }}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={getFullImageUrl(currentImg.url)}
                    alt={`Ảnh phòng ${imgIndex + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-1"
                        style={{ opacity: 0.75, width: 34, height: 34 }}
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
                        style={{ opacity: 0.75, width: 34, height: 34 }}
                        onClick={() =>
                          setImgIndex((i) => (i + 1) % images.length)
                        }
                      >
                        <FaChevronRight size={12} />
                      </button>
                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-1">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            className="p-0 border-0 rounded-circle"
                            style={{
                              width: 8,
                              height: 8,
                              background:
                                i === imgIndex
                                  ? "#fff"
                                  : "rgba(255,255,255,0.5)",
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
          </div>

          {/* Thông tin phòng */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaDoorOpen className="text-primary" /> Thông tin phòng
            </h6>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                <FaDoorOpen size={14} />
              </div>
              <div>
                <div className="fw-semibold">{post.roomName}</div>
                {post.branchName && (
                  <div className="text-muted small">{post.branchName}</div>
                )}
              </div>
            </div>

            {address && (
              <div className="d-flex align-items-start gap-2 mb-3">
                <div className="bg-danger-subtle p-2 rounded-3 text-danger flex-shrink-0">
                  <FaMapMarkerAlt size={13} />
                </div>
                <span className="small text-muted">{address}</span>
              </div>
            )}

            <div className="d-flex flex-wrap gap-4 mt-2">
              {roomDetail?.price && (
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success-subtle p-2 rounded-3 text-success">
                    <FaMoneyBillWave size={13} />
                  </div>
                  <div>
                    <div className="small text-muted">Giá thuê</div>
                    <div className="fw-bold text-success">
                      {formatPrice(roomDetail.price)}
                      <span className="text-muted fw-normal small">
                        {" "}
                        /tháng
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {roomDetail?.currentPeople != null &&
                roomDetail?.maxPeople != null && (
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-info-subtle p-2 rounded-3 text-info">
                      <FaUsers size={13} />
                    </div>
                    <div>
                      <div className="small text-muted">Số người</div>
                      <div className="fw-bold">
                        {roomDetail.currentPeople}/{roomDetail.maxPeople} người
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ── Cột phải: Tác giả + Thời hạn + Mô tả ── */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Tác giả */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaUser className="text-info" /> Người đăng
            </h6>
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{ width: 48, height: 48, fontSize: 20 }}
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

          {/* Thời hạn */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaClock className="text-warning" /> Thời hạn bài đăng
            </h6>
            <div className="row g-3">
              <div className="col-6">
                <div className="small text-muted fw-bold">NGÀY ĐĂNG</div>
                <div className="fw-semibold">{formatDate(post.createdAt)}</div>
              </div>
              {left !== null && (
                <div className="col-6">
                  <div className="small text-muted fw-bold">CÒN LẠI</div>
                  <div
                    className={`fw-semibold ${left <= 5 ? "text-danger" : "text-dark"}`}
                  >
                    {left} ngày
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="card border-0 shadow-sm rounded-4 p-4 flex-grow-1">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaFileAlt className="text-success" /> Mô tả
            </h6>
            <p
              className="mb-0 text-secondary"
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14 }}
            >
              {post.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
