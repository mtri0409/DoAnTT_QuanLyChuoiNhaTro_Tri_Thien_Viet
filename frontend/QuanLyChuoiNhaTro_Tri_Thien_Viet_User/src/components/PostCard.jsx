import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8080";

const daysLeft = (expiresAt) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000))
    : null;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

/**
 * PostCard
 *
 * Props:
 *   post — post DTO object (required)
 *          Expected fields: postId, description, authorName, createdAt,
 *          expiresAt, roomName, branchName, branchAddress, roomMedia (array)
 */
export default function PostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bai-dang/${post.postId}`);
  };

  // Lấy ảnh thumbnail từ roomMedia (nếu có trong DTO)
  const getImage = () => {
    const media = post.roomMedia;
    if (!media || media.length === 0) return null;
    const thumb = media.find((m) => m.isThumbnail) ?? media[0];
    if (!thumb?.url) return null;
    if (thumb.url.startsWith("http") || thumb.url.startsWith("data:"))
      return thumb.url;
    return `${BASE_URL}${thumb.url}`;
  };

  const imgSrc = getImage();
  const left = daysLeft(post.expiresAt);
  const isExpiringSoon = left !== null && left <= 5;

  return (
    <div
      onClick={handleClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 16px rgba(245,158,11,0.08)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: imgSrc ? "200px 1fr" : "1fr",
        border: "1.5px solid transparent",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,158,11,0.13)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "#fde68a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(245,158,11,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {/* Ảnh thumbnail phòng (nếu có) */}
      {imgSrc && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#f1f4f9",
          }}
        >
          <img
            src={imgSrc}
            alt={post.roomName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
          {/* Badge "Tìm bạn ghép" */}
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 20,
              background: "#f59e0b",
              color: "#fff",
            }}
          >
            🤝 Tìm bạn ghép
          </span>
        </div>
      )}

      {/* Nội dung bài đăng */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Badge (khi không có ảnh) + tên phòng + chi nhánh */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Badge khi không có ảnh */}
            {!imgSrc && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: 20,
                  background: "#fef3c7",
                  color: "#d97706",
                  width: "fit-content",
                }}
              >
                🤝 Tìm bạn ghép
              </span>
            )}
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1a2236",
                lineHeight: 1.3,
              }}
            >
              {post.roomName ?? "Phòng không rõ"}
            </div>
            {post.branchName && (
              <div style={{ fontSize: 13, color: "#64748b" }}>
                🏢 {post.branchName}
              </div>
            )}
            {post.branchAddress && (
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                📍 {post.branchAddress}
              </div>
            )}
          </div>

          {/* Thời hạn còn lại */}
          {left !== null && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                background: isExpiringSoon ? "#fee2e2" : "#f0fdf4",
                color: isExpiringSoon ? "#dc2626" : "#16a34a",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {isExpiringSoon ? "⚠️" : "⏳"} Còn {left} ngày
            </span>
          )}
        </div>

        {/* Mô tả bài đăng */}
        {post.description && (
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.7,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.description}
          </p>
        )}

        {/* Footer: tác giả + ngày đăng + nút xem */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid #f1f5f9",
            marginTop: "auto",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Tác giả + ngày đăng */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {post.authorName && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#e8f0fe",
                    color: "#1d6cf0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, color: "#475569" }}>
                  {post.authorName}
                </span>
              </div>
            )}
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span>🗓 {formatDate(post.createdAt)}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bai-dang/${post.postId}`);
            }}
            style={{
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 16px",
              flexShrink: 0,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Xem chi tiết →
          </button>
        </div>
      </div>
    </div>
  );
}
