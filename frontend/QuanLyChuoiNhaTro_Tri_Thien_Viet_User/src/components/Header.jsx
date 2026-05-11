import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import userService from "../services/userService";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await userService.getAllRooms(0, 50);
      setRooms(res.content || []);
    };
    fetchRooms();
  }, []);

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

  useEffect(() => {
    const handleClick = () => setShowDropdown(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="site-header">
      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fffaf5;
          border-bottom: 1px solid #eadfd4;
          box-shadow: 0 2px 10px rgba(102, 64, 35, 0.06);
          font-family: inherit;
        }

        .site-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 24px;
          display: grid;
          grid-template-columns: auto minmax(280px, 560px);
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .site-brand {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          min-width: 168px;
        }

        .site-brand-main {
          color: #2f241d;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.3px;
          line-height: 1.15;
        }

        .site-brand-main span {
          color: #d86622;
        }

        .site-brand-sub {
          margin-top: 2px;
          color: #8b7665;
          font-size: 12px;
          font-weight: 500;
        }

        .site-search {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #eadfd4;
          border-radius: 8px;
          padding: 6px;
          transition: border-color .18s, box-shadow .18s;
        }

        .site-search.is-focused {
          border-color: #df7a35;
          box-shadow: 0 0 0 3px rgba(223, 122, 53, .12);
        }

        .site-search input {
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #2f241d;
          font-family: inherit;
          font-size: 14px;
          padding: 9px 10px;
        }

        .site-search input::placeholder {
          color: #a39183;
        }

        .site-search button {
          border: 0;
          border-radius: 6px;
          background: #df7a35;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 16px;
          cursor: pointer;
          white-space: nowrap;
        }

        .site-search button:hover {
          background: #c96523;
        }

        .site-search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          box-shadow: 0 12px 28px rgba(72, 45, 25, .14);
          padding: 8px;
          max-height: 390px;
          overflow-y: auto;
          z-index: 200;
        }

        .site-search-item {
          width: 100%;
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 10px;
          padding: 8px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: #fff !important;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }

        .site-search-item:hover {
          background: #fff !important;
          border-color: #eadfd4;
        }

        .site-search-item img {
          width: 58px;
          height: 58px;
          object-fit: cover;
          border-radius: 6px;
          background: #f3eee9;
        }

        .site-search-title {
          color: #2f241d;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .site-search-desc {
          color: #8b7665;
          font-size: 12px;
          line-height: 1.35;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .site-search-price {
          margin-top: 4px;
          color: #d86622;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .site-header-inner {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 12px 16px;
          }

          .site-brand {
            min-width: 0;
          }

          .site-brand-main {
            font-size: 18px;
          }

          .site-search {
            grid-template-columns: 1fr;
          }

          .site-search button {
            width: 100%;
          }
        }
      `}</style>

      <div className="site-header-inner">
        <a href="/" className="site-brand">
          <div className="site-brand-main">
            Phòng Trọ <span>Rẻ</span>
          </div>
          <div className="site-brand-sub">Tìm phòng nhanh, giá rõ ràng</div>
        </a>

        <div
          className={`site-search ${focused ? "is-focused" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            placeholder="Tìm theo tên phòng, địa chỉ, khu vực..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setFocused(true);
              setShowDropdown(true);
            }}
            onBlur={() => setFocused(false)}
          />
          <button type="button">Tìm kiếm</button>

          {showDropdown && filtered.length > 0 && (
            <div className="site-search-dropdown">
              {filtered.map((room) => (
                <button
                  key={room.roomId}
                  type="button"
                  className="site-search-item"
                  onClick={() =>
                    (window.location.href = `/phong/${room.roomId}/chi-tiet`)
                  }
                >
                  <img src={getImage(room)} alt={room.roomName} />
                  <div>
                    <div className="site-search-title">{room.roomName}</div>
                    <div className="site-search-desc">{room.description}</div>
                    <div className="site-search-price">
                      {room.price?.toLocaleString()} đ
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </header>
  );
}
