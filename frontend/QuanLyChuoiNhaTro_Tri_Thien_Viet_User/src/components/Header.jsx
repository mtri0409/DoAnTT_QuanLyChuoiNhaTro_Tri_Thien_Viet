import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import userService from "../services/userService";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // load rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await userService.getAllRooms(0, 50);
      setRooms(res.content || []);
    };
    fetchRooms();
  }, []);

  // search
  const handleSearch = (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setFiltered([]);
      return;
    }

    const result = rooms.filter((r) =>
      r.roomName?.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(result);
    setShowDropdown(true);
  };

  // fix image
  const getImage = (room) => {
    if (!room.roomMedia?.length) {
      return "http://localhost:8080/images/default.jpg";
    }

    const valid = room.roomMedia.find(
      (m) => m.url && !m.url.includes("storage.troapp.vn")
    );

    if (!valid) return "http://localhost:8080/images/default.jpg";

    if (valid.url.startsWith("/images")) {
      return `http://localhost:8080${valid.url}`;
    }

    return valid.url;
  };

  // click ngoài
  useEffect(() => {
    const handleClick = () => setShowDropdown(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

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
          justifyContent: "center", // ✅ CHỈ SỬA DÒNG NÀY
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 24px",
          gap: 24,
          flexWrap: "wrap",
          position: "relative", // để dropdown
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            position: "absolute", // ✅ để logo không đẩy layout
            left: 24,
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
            Phòng Trọ <span style={{ color: "#1a2236" }}>Rẻ</span>
          </div>
        </a>

        {/* Search */}
        <div
          onClick={(e) => e.stopPropagation()}
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
            position: "relative", // để dropdown
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
            onChange={(e) => handleSearch(e.target.value)} // ✅ dùng search
            onFocus={() => setShowDropdown(true)}
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

          {/* DROPDOWN */}
          {showDropdown && filtered.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "60px",
                left: 0,
                width: "100%",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                padding: 10,
                zIndex: 200,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {filtered.map((room) => (
                <div
                  key={room.roomId}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    (window.location.href = `/rooms/${room.roomId}/detail`)
                  }
                >
                  <img
                    src={getImage(room)}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {room.roomName}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      {room.description}
                    </div>
                    <div style={{ color: "#1d6cf0", fontWeight: 600 }}>
                      {room.price?.toLocaleString()} đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </header>
  );
}