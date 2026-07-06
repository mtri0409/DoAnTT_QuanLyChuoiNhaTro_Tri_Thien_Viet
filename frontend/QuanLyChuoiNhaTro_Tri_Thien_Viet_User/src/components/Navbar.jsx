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
    <nav className="main-nav">
      <style>{`
        .main-nav {
          background: #fff;
          border-top: 1px solid #f0e4d8;
        }

        .main-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
        }

        .main-nav button {
          position: relative;
          border: 0;
          background: transparent;
          padding: 12px 14px;
          color: #6f5f52;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          border-radius: 6px;
        }

        .main-nav button:hover {
          color: #c96523;
          background: #fff4ea;
        }

        .main-nav button.active {
          color: #c96523;
          background: #fff4ea;
        }

        .main-nav button.active::after {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 0;
          height: 2px;
          background: #df7a35;
          border-radius: 2px 2px 0 0;
        }

        @media (max-width: 768px) {
          .main-nav-inner {
            padding: 0 12px;
          }

          .main-nav button {
            padding: 11px 12px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="main-nav-inner">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              className={isActive ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
