
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaBed,
  FaUsers,
  FaFileInvoiceDollar,
  FaTimes,
  FaCog,
  FaMotorcycle,
  FaFileContract,
  FaServicestack,
  FaWifi,
  FaCalculator,
} from "react-icons/fa";

const NAV_ITEMS = [
  { title: "Dashboard", path: "/", icon: <FaHome /> },

  { title: "Quản lý xe", path: "/vehicles", icon: <FaMotorcycle /> },
  { title: "Người thuê", path: "/profiles", icon: <FaUsers /> },
  { title: "Hợp đồng", path: "/contracts", icon: <FaFileContract /> },
  { title: "Tài khoản", path: "/users", icon: <FaUsers /> },
  { title: "Ghi điện nước", path: "/meter-reading", icon: <FaCalculator /> },
  { title: "Hóa đơn", path: "/invoice", icon: <FaFileInvoiceDollar /> },
  { title: "Cài đặt", path: "/admin/settings", icon: <FaCog /> },
  { title: "Chi nhánh", path: "/branches/1", icon: <FaBuilding /> },
  { title: "Quản lý Phòng", path: "/rooms/1", icon: <FaBed /> },
  { title: "Quản lý Dịch vụ", path: "/services/1", icon: <FaServicestack /> },
  { title: "Quản lý Tiện ích", path: "/amenities/1", icon: <FaWifi /> },
  { title: "Cài đặt", path: "/admin/settings", icon: <Faog /> },
]
const Sidebar = ({ isCollapsed, showMobile, toggleMobile }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay mobile */}
      {showMobile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 199 }}
          onClick={toggleMobile}
        />
      )}

      <div
        className="bg-dark text-white d-flex flex-column"
        style={{
          width: isCollapsed ? "72px" : "260px",
          height: "100vh",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          overflow: "hidden",
          // Mobile: fixed overlay; Desktop: sticky trong flex
          position: window.innerWidth < 768 ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: window.innerWidth < 768 ? 200 : "auto",
          transform:
            window.innerWidth < 768 && !showMobile
              ? "translateX(-100%)"
              : "translateX(0)",
        }}
      >
        {/* Logo */}
        <div
          className="d-flex align-items-center gap-2 p-3 border-bottom border-secondary"
          style={{ minHeight: 72 }}
        >
          <div
            className="rounded-3 bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 36, height: 36, fontSize: 18 }}
          >
            🏠
          </div>
          <span
            className="fw-bold text-white"
            style={{
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          >
            QL NHÀ TRỌ
          </span>
          <button
            className="btn btn-link text-white ms-auto p-0 d-md-none"
            onClick={toggleMobile}
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 p-2 overflow-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.path}
                className={`d-flex align-items-center gap-3 rounded-3 mb-1 text-decoration-none
                  ${isActive ? "text-primary fw-semibold" : "text-secondary"}
                `}
                style={{
                  padding: "10px 12px",
                  background: isActive
                    ? "rgba(59,130,246,0.15)"
                    : "transparent",
                  transition: "background 0.2s",
                }}
                onClick={() => window.innerWidth < 768 && toggleMobile()}
              >
                <span
                  style={{
                    fontSize: 17,
                    flexShrink: 0,
                    width: 20,
                    textAlign: "center",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    opacity: isCollapsed ? 0 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-top border-secondary">
          <div
            className="d-flex align-items-center gap-2 p-2 rounded-3"
            style={{ background: "rgba(255,255,255,0.04)", cursor: "pointer" }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                fontSize: 13,
              }}
            >
              T
            </div>
            {!isCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <div
                  className="text-white fw-semibold"
                  style={{ fontSize: 13, whiteSpace: "nowrap" }}
                >
                  Tri Admin
                </div>
                <div
                  className="text-secondary"
                  style={{ fontSize: 11, whiteSpace: "nowrap" }}
                >
                  Quản trị viên
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
