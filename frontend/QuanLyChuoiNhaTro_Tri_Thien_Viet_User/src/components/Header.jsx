import { useState } from "react";
import Navbar from "./Navbar";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      style={{
        background: "#fff",
        boxShadow: "0 1px 0 #e2e8f0, 0 2px 16px rgba(29,108,240,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 24px",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#1d6cf0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🏠
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#1d6cf0",
              letterSpacing: "-0.5px",
            }}
          >
            Phòng Trọ{" "}
            <span style={{ color: "#1a2236" }}>Rẻ</span>
          </div>
        </a>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 560,
            display: "flex",
            alignItems: "center",
            background: "#f1f4f9",
            borderRadius: 50,
            padding: "10px 20px",
            gap: 10,
            border: "2px solid transparent",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.cssText +=
              "border-color:#1d6cf0;background:#fff;")
          }
          onBlur={(e) =>
            (e.currentTarget.style.cssText +=
              "border-color:transparent;background:#f1f4f9;")
          }
        >
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên phòng, địa chỉ, khu vực..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              background: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: 15,
              color: "#1a2236",
              width: "100%",
            }}
          />
          <button
            style={{
              background: "#1d6cf0",
              color: "#fff",
              border: "none",
              borderRadius: 50,
              padding: "8px 20px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Tìm kiếm
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button
            style={{
              border: "1.5px solid #1d6cf0",
              color: "#1d6cf0",
              background: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đăng nhập
          </button>
          <button
            style={{
              background: "#1d6cf0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đăng ký
          </button>
        </div>
      </div>

      <Navbar />
    </header>
  );
}