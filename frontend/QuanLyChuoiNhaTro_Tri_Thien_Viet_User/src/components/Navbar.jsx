
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Tìm phòng", path: "/tim-phong" },
  { label: "Tin tức", path: "/tin-tuc" },
  { label: "Hỗ trợ", path: "/ho-tro" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ borderTop: "1px solid #e2e8f0", background: "#fff" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: "13px 18px",
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#1d6cf0" : "#64748b",
                cursor: "pointer",
                border: "none",
                background: "none",
                fontFamily: "inherit",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {item.label}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 18,
                    right: 18,
                    height: 3,
                    borderRadius: "2px 2px 0 0",
                    background: "#1d6cf0",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}