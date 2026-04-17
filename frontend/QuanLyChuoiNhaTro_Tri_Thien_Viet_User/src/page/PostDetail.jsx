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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #e2e8f0",
            borderTop: "3px solid #1d6cf0",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Đang tải bài đăng...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde047",
            borderRadius: 12,
            padding: "14px 18px",
            color: "#854d0e",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
        <button onClick={() => navigate(-1)} style={outlineBtn}>
          <FaArrowLeft size={11} /> Quay lại
        </button>
      </div>
    );
  }

  // Build image list from roomMedia inside the post DTO
  // The public post DTO may embed roomMedia or it may not — adapt as needed
  const mediaList = post?.roomMedia ?? [];
  const images = [
    ...mediaList.filter((m) => !m.mediaType || m.mediaType.startsWith("image")),
  ].sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));

  const currentImg = images[imgIndex];
  const left = daysLeft(post?.expiresAt);
  const urgent = left !== null && left <= 5;

  const address = post?.branchAddress ?? null;

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "28px 24px 60px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ ...outlineBtn, marginBottom: 20 }}
      >
        <FaArrowLeft size={11} /> Quay lại
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: image carousel + room info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Carousel */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "#f1f4f9",
              position: "relative",
              aspectRatio: "16/10",
            }}
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
                    display: "block",
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIndex(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                      style={carouselBtn("left")}
                    >
                      <FaChevronLeft size={13} />
                    </button>
                    <button
                      onClick={() =>
                        setImgIndex((i) => (i + 1) % images.length)
                      }
                      style={carouselBtn("right")}
                    >
                      <FaChevronRight size={13} />
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 5,
                      }}
                    >
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            border: "none",
                            padding: 0,
                            background:
                              i === imgIndex
                                ? "#fff"
                                : "rgba(255,255,255,0.45)",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 8,
                  color: "#94a3b8",
                }}
              >
                <FaImage size={44} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: 13 }}>Chưa có ảnh phòng</span>
              </div>
            )}
          </div>

          {/* Room info card */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <FaDoorOpen style={{ color: "#1d6cf0" }} size={15} />
              <span style={{ fontWeight: 600, fontSize: 16, color: "#1a2236" }}>
                {post.roomName}
              </span>
              {post.branchName && (
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  — {post.branchName}
                </span>
              )}
            </div>

            {address && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  fontSize: 13,
                  color: "#64748b",
                  marginBottom: 12,
                }}
              >
                <FaMapMarkerAlt
                  size={11}
                  style={{ color: "#ef4444", marginTop: 2, flexShrink: 0 }}
                />
                {address}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {post.price && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaMoneyBillWave style={{ color: "#16a34a" }} size={14} />
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#16a34a",
                      fontSize: 17,
                    }}
                  >
                    {formatPrice(post.price)}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>/tháng</span>
                </div>
              )}
              {post.currentPeople != null && post.maxPeople != null && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  <FaUsers size={13} />
                  {post.currentPeople}/{post.maxPeople} người
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: post details ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "sticky",
            top: 100,
          }}
        >
          {/* Author card */}
          <div style={card}>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 600,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Người đăng
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#e8f0fe",
                  color: "#1d6cf0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <div
                  style={{ fontWeight: 600, fontSize: 15, color: "#1a2236" }}
                >
                  {post.authorName}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <FaUser size={9} /> Thành viên phòng
                </div>
              </div>
            </div>
          </div>

          {/* Time card */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#64748b",
                }}
              >
                <FaClock size={11} />
                Đăng ngày: {formatDate(post.createdAt)}
              </div>
              {left !== null && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontWeight: 600,
                    color: urgent ? "#dc2626" : "#64748b",
                    background: urgent ? "#fee2e2" : "#f1f4f9",
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 12,
                  }}
                >
                  <FaClock size={10} />
                  Còn {left} ngày
                </div>
              )}
            </div>
          </div>

          {/* Description card */}
          <div style={{ ...card, flexGrow: 1 }}>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 600,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Mô tả
            </p>
            <p
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                fontSize: 14,
                color: "#334155",
              }}
            >
              {post.description}
            </p>
          </div>

          {/* Tip */}
          <div
            style={{
              background: "linear-gradient(135deg, #1d6cf0 0%, #1558cc 100%)",
              borderRadius: 14,
              padding: "16px 18px",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              💡 Quan tâm tới phòng này?
            </div>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Liên hệ trực tiếp với người đăng hoặc gọi cho quản lý để biết thêm
              chi tiết về phòng và điều kiện ghép ở.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 2px 16px rgba(29,108,240,0.07)",
  padding: "18px 20px",
  border: "1.5px solid #f1f4f9",
};

const outlineBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 18px",
  borderRadius: 8,
  border: "1.5px solid #e2e8f0",
  background: "#fff",
  color: "#64748b",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const carouselBtn = (side) => ({
  position: "absolute",
  top: "50%",
  [side]: 10,
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});
