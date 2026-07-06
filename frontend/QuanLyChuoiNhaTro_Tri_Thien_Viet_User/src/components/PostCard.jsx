import { FaClock, FaDoorOpen, FaMapMarkerAlt, FaUser } from "react-icons/fa";

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

export default function PostCard({ post, onClick }) {
  const left = daysLeft(post.expiresAt);
  const urgent = left !== null && left <= 5;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 16px rgba(29,108,240,0.07)",
        padding: "18px 20px",
        cursor: "pointer",
        border: "1.5px solid #f1f4f9",
        transition: "box-shadow 0.18s, border-color 0.18s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(29,108,240,0.16)";
        e.currentTarget.style.borderColor = "#c7d9fc";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(29,108,240,0.07)";
        e.currentTarget.style.borderColor = "#f1f4f9";
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontWeight: 600,
              fontSize: 15,
              color: "#1a2236",
            }}
          >
            <FaDoorOpen style={{ color: "#1d6cf0", flexShrink: 0 }} size={14} />
            {post.roomName}
            {post.branchName && (
              <span style={{ fontWeight: 400, color: "#64748b", fontSize: 13 }}>
                — {post.branchName}
              </span>
            )}
          </div>
          {post.branchAddress && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <FaMapMarkerAlt size={10} style={{ color: "#ef4444" }} />
              {post.branchAddress}
            </div>
          )}
        </div>
        {left !== null && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              background: urgent ? "#fee2e2" : "#f1f4f9",
              color: urgent ? "#dc2626" : "#64748b",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <FaClock size={10} /> Còn {left} ngày
          </span>
        )}
      </div>

      {/* Description preview */}
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: "#475569",
          lineHeight: 1.65,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.description}
      </p>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid #f1f4f9",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#e8f0fe",
              color: "#1d6cf0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <span>{post.authorName}</span>
          <FaUser size={10} style={{ opacity: 0.5 }} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          <FaClock size={10} /> {formatDate(post.createdAt)}
        </div>
      </div>
    </div>
  );
}
