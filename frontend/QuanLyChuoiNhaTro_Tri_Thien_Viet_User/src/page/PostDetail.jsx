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
import userService from "../services/userService";
import { imgURL } from "../services/userConfig";

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

const postDetailCss = `
  .pd-page {
    min-height: 100vh;
    background: #fffaf5;
    color: #2f241d;
    padding: 28px 24px 60px;
    font-family: "Times New Roman", Times, serif;
  }

  .pd-wrap {
    max-width: 1040px;
    margin: 0 auto;
  }

  .pd-back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #eadfd4;
    background: #fff;
    color: #6f5f52;
    border-radius: 6px;
    padding: 9px 14px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 18px;
  }

  .pd-back:hover {
    background: #fff4ea;
    color: #b85618;
    border-color: #f0d8bd;
  }

  .pd-layout {
    display: grid;
    grid-template-columns: 1fr 330px;
    gap: 20px;
    align-items: start;
  }

  .pd-left,
  .pd-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pd-right {
    position: sticky;
    top: 104px;
  }

  .pd-card,
  .pd-gallery,
  .pd-loading,
  .pd-error {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(102,64,35,.05);
  }

  .pd-card {
    padding: 18px;
  }

  .pd-gallery {
    overflow: hidden;
    position: relative;
    aspect-ratio: 16 / 10;
    background: #f2ebe5;
  }

  .pd-gallery img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pd-empty-img {
    height: 100%;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #9a8776;
  }

  .pd-carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border-radius: 6px;
    border: 1px solid #eadfd4;
    background: rgba(255,255,255,.94);
    color: #3c2d23;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .pd-carousel-btn.left {
    left: 10px;
  }

  .pd-carousel-btn.right {
    right: 10px;
  }

  .pd-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
  }

  .pd-dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    border: 0;
    background: rgba(255,255,255,.55);
    cursor: pointer;
    padding: 0;
  }

  .pd-dot.active {
    width: 22px;
    background: #fff;
  }

  .pd-room-head {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 8px;
  }

  .pd-room-icon {
    color: #df7a35;
    flex-shrink: 0;
  }

  .pd-room-name {
    color: #2f241d;
    font-size: 21px;
    font-weight: 800;
  }

  .pd-branch {
    color: #8b7665;
    font-size: 14px;
  }

  .pd-address {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    color: #6f5f52;
    font-size: 15px;
    line-height: 1.45;
    margin-bottom: 14px;
  }

  .pd-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .pd-price,
  .pd-people {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #f0e4d8;
    background: #fff8f0;
    border-radius: 6px;
    padding: 7px 10px;
    color: #6f5f52;
    font-size: 15px;
    font-weight: 700;
  }

  .pd-price {
    color: #d86622;
    background: #fff0dc;
    border-color: #f0d8bd;
  }

  .pd-card-label {
    color: #8b7665;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .pd-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pd-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #fff0dc;
    color: #b85618;
    border: 1px solid #f0d8bd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 20px;
    flex-shrink: 0;
  }

  .pd-author-name {
    color: #2f241d;
    font-size: 17px;
    font-weight: 800;
  }

  .pd-author-sub {
    color: #8b7665;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 3px;
  }

  .pd-time-list {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .pd-time-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6f5f52;
    background: #fff8f0;
    border: 1px solid #f0e4d8;
    border-radius: 6px;
    padding: 6px 9px;
    font-size: 14px;
    font-weight: 700;
  }

  .pd-time-chip.urgent {
    color: #9b3026;
    background: #f4e5e3;
    border-color: #e7aaa3;
  }

  .pd-desc {
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.75;
    font-size: 16px;
    color: #6f5f52;
  }

  .pd-tip {
    background: #fff0dc;
    border: 1px solid #f0d8bd;
    border-radius: 8px;
    padding: 16px;
    color: #6f5f52;
  }

  .pd-tip-title {
    color: #2f241d;
    font-size: 17px;
    font-weight: 800;
    margin-bottom: 7px;
  }

  .pd-tip p {
    margin: 0;
    font-size: 15px;
    line-height: 1.65;
  }

  .pd-loading,
  .pd-error {
    text-align: center;
    padding: 48px 22px;
  }

  .pd-spinner {
    width: 34px;
    height: 34px;
    border: 3px solid #f0e4d8;
    border-top-color: #df7a35;
    border-radius: 50%;
    animation: pd-spin .8s linear infinite;
    margin: 0 auto 12px;
  }

  .pd-error {
    color: #6f5f52;
  }

  .pd-error-msg {
    background: #fff0dc;
    border: 1px solid #f0d8bd;
    color: #92400e;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 14px;
    font-size: 15px;
    font-weight: 700;
  }

  @keyframes pd-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .pd-layout {
      grid-template-columns: 1fr;
    }

    .pd-right {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .pd-page {
      padding: 20px 14px 44px;
    }

    .pd-gallery {
      aspect-ratio: 4 / 3;
    }

    .pd-card {
      padding: 15px;
    }

    .pd-room-head {
      align-items: flex-start;
    }
  }
`;

function PostDetailStyles() {
  return <style>{postDetailCss}</style>;
}

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const postData = await userService.getPostById(postId);
        const p = postData?.data ?? postData;
        setPost(p);
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
      <div className="pd-page">
        <PostDetailStyles />
        <div className="pd-wrap">
          <div className="pd-loading">
            <div className="pd-spinner" />
            <p style={{ margin: 0, color: "#8b7665", fontSize: 15 }}>
              Đang tải bài đăng...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-page">
        <PostDetailStyles />
        <div className="pd-wrap">
          <div className="pd-error">
            <div className="pd-error-msg">{error}</div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="pd-back"
            >
              <FaArrowLeft size={12} /> Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mediaList = post?.roomMedia ?? [];
  const images = [
    ...mediaList.filter((m) => !m.mediaType || m.mediaType.startsWith("image")),
  ].sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));

  const currentImg = images[imgIndex];
  const left = daysLeft(post?.expiresAt);
  const urgent = left !== null && left <= 5;

  const address = post?.branchAddress ?? null;

  return (
    <div className="pd-page">
      <PostDetailStyles />

      <div className="pd-wrap">
        <button type="button" onClick={() => navigate(-1)} className="pd-back">
          <FaArrowLeft size={12} /> Quay lại
        </button>

        <div className="pd-layout">
          <div className="pd-left">
            <div className="pd-gallery">
              {images.length > 0 ? (
                <>
                  <img
                    src={getFullImageUrl(currentImg.url)}
                    alt={`Ảnh phòng ${imgIndex + 1}`}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setImgIndex(
                            (i) => (i - 1 + images.length) % images.length,
                          )
                        }
                        className="pd-carousel-btn left"
                      >
                        <FaChevronLeft size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setImgIndex((i) => (i + 1) % images.length)
                        }
                        className="pd-carousel-btn right"
                      >
                        <FaChevronRight size={13} />
                      </button>

                      <div className="pd-dots">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setImgIndex(i)}
                            className={`pd-dot ${i === imgIndex ? "active" : ""}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="pd-empty-img">
                  <FaImage size={44} style={{ opacity: 0.35 }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>
                    Chưa có ảnh phòng
                  </span>
                </div>
              )}
            </div>

            <div className="pd-card">
              <div className="pd-room-head">
                <FaDoorOpen className="pd-room-icon" size={17} />
                <div>
                  <div className="pd-room-name">{post.roomName}</div>
                  {post.branchName && (
                    <div className="pd-branch">{post.branchName}</div>
                  )}
                </div>
              </div>

              {address && (
                <div className="pd-address">
                  <FaMapMarkerAlt
                    size={13}
                    style={{ color: "#df7a35", marginTop: 3, flexShrink: 0 }}
                  />
                  <span>{address}</span>
                </div>
              )}

              <div className="pd-meta-row">
                {post.price && (
                  <div className="pd-price">
                    <FaMoneyBillWave size={14} />
                    <span>{formatPrice(post.price)}</span>
                    <span style={{ color: "#8b7665", fontWeight: 600 }}>
                      /tháng
                    </span>
                  </div>
                )}

                {post.currentPeople != null && post.maxPeople != null && (
                  <div className="pd-people">
                    <FaUsers size={13} />
                    {post.currentPeople}/{post.maxPeople} người
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="pd-right">
            <div className="pd-card">
              <div className="pd-card-label">Người đăng</div>

              <div className="pd-author">
                <div className="pd-avatar">
                  {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>

                <div>
                  <div className="pd-author-name">{post.authorName}</div>
                  <div className="pd-author-sub">
                    <FaUser size={10} /> Thành viên phòng
                  </div>
                </div>
              </div>
            </div>

            <div className="pd-card">
              <div className="pd-time-list">
                <div className="pd-time-chip">
                  <FaClock size={12} />
                  Đăng ngày: {formatDate(post.createdAt)}
                </div>

                {left !== null && (
                  <div className={`pd-time-chip ${urgent ? "urgent" : ""}`}>
                    <FaClock size={12} />
                    Còn {left} ngày
                  </div>
                )}
              </div>
            </div>

            <div className="pd-card">
              <div className="pd-card-label">Mô tả</div>
              <p className="pd-desc">{post.description}</p>
            </div>

            <div className="pd-tip">
              <div className="pd-tip-title">Quan tâm tới phòng này?</div>
              <p>
                Liên hệ trực tiếp với người đăng hoặc gọi cho quản lý để biết
                thêm chi tiết về phòng và điều kiện ghép ở.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
