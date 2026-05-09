import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaBed,
  FaUsers,
  FaFileInvoiceDollar,
  FaTimes,
  FaCogs,
  FaMotorcycle,
  FaFileContract,
  FaServicestack,
  FaWifi,
  FaCalculator,
  FaBell,
  FaRegNewspaper,
  FaWrench,
  FaBars,
} from "react-icons/fa";
import { useSystemSetting } from "../context/SystemSettingContext";

const NAV_ITEMS = [
  { title: "Dashboard", path: "/", icon: <FaHome /> },
  { title: "Quản lý xe", path: "/vehicles", icon: <FaMotorcycle /> },
  { title: "Người thuê", path: "/profiles", icon: <FaUsers /> },
  { title: "Hợp đồng", path: "/contracts", icon: <FaFileContract /> },
  { title: "Tài khoản", path: "/users", icon: <FaUsers /> },
  { title: "Ghi điện nước", path: "/meter-reading", icon: <FaCalculator /> },
  { title: "Hóa đơn", path: "/invoice", icon: <FaFileInvoiceDollar /> },
  { title: "Báo hỏng", path: "/maintenance", icon: <FaWrench /> },
  { title: "Chi phí", path: "/expenses", icon: <FaFileInvoiceDollar /> },
  { title: "Chi nhánh", path: "/branches/1", icon: <FaBuilding /> },
  { title: "Quản lý Phòng", path: "/rooms/1", icon: <FaBed /> },
  { title: "Quản lý Dịch vụ", path: "/services/1", icon: <FaServicestack /> },
  { title: "Quản lý Tiện ích", path: "/amenities/1", icon: <FaWifi /> },
  { title: "Quản lý Bài đăng", path: "/posts", icon: <FaRegNewspaper /> },
  { title: "Cài đặt", path: "/setting", icon: <FaCogs /> },
  { title: "Thông báo", path: "/notifications", icon: <FaBell /> },
];

const Sidebar = ({ isCollapsed, showMobile, toggleMobile }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  let settings = { name: "TTV" };
  try {
    const context = useSystemSetting();
    settings = context?.settings || { name: "TTV" };
  } catch (error) {
    console.warn("SystemSetting chưa sẵn sàng, dùng giá trị mặc định");
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* CSS ẩn thanh cuộn */}
      <style>{`
        .sidebar-nav {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .sidebar-nav::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .sidebar-link {
          transition: background 0.2s, color 0.2s;
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
        }
        .sidebar-wrapper {
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Overlay mobile */}
      {showMobile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 199 }}
          onClick={toggleMobile}
        />
      )}

      {/* Nút toggle mobile */}
      {isMobile && !showMobile && (
        <button
          className="btn btn-primary position-fixed d-flex align-items-center justify-content-center d-md-none shadow"
          style={{
            bottom: 20,
            right: 20,
            zIndex: 150,
            borderRadius: "50%",
            width: 50,
            height: 50,
          }}
          onClick={toggleMobile}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column sidebar-wrapper"
        style={{
          width: isCollapsed ? "80px" : "270px",
          height: "100vh",
          flexShrink: 0,
          overflow: "hidden",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 200,
          transform: isMobile && !showMobile ? "translateX(-100%)" : "translateX(0)",
          transition:
            "width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Logo */}
        <div
          className="d-flex align-items-center gap-2 px-3 border-bottom border-secondary"
          style={{ minHeight: 72, flexShrink: 0 }}
        >
          <div
            className="rounded-3 bg-primary d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: 36, height: 36, fontSize: 18 }}
          >
            T
          </div>
          <span
            className="fw-bold text-white"
            style={{
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {settings.name || "TTV"}
          </span>
          {isMobile && (
            <button
              className="btn btn-link text-white ms-auto p-0"
              onClick={toggleMobile}
              style={{ opacity: isCollapsed ? 0 : 1 }}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-grow-1 p-2 sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.path}
                className={`sidebar-link d-flex align-items-center gap-3 rounded-3 mb-1 text-decoration-none ${
                  isActive ? "text-primary fw-semibold" : "text-secondary"
                }`}
                style={{
                  padding: "10px 12px",
                  background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                }}
                onClick={() => isMobile && toggleMobile()}
              >
                <span
                  className="flex-shrink-0 text-center"
                  style={{ fontSize: 18, width: 20 }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 14,
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
      </div>
    </>
  );
};

export default Sidebar;