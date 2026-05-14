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
  FaChartLine,
  FaMoneyBillWave,
  FaUserCog,
  FaClipboardList,
  FaBoxes,
} from "react-icons/fa";
import { useSystemSetting } from "../context/SystemSettingContext";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    path: "/",
    icon: <FaHome />,
    group: "main",
    priority: 1,
  },
  {
    title: "Hợp đồng",
    path: "/contracts",
    icon: <FaFileContract />,
    group: "core",
    priority: 2,
  },
  {
    title: "Người thuê",
    path: "/profiles",
    icon: <FaUsers />,
    group: "core",
    priority: 2,
  },
  {
    title: "Quản lý Phòng",
    path: "/rooms/1",
    icon: <FaBed />,
    group: "core",
    priority: 2,
  },
  {
    title: "Quản lý xe",
    path: "/vehicles",
    icon: <FaMotorcycle />,
    group: "core",
    priority: 2,
  },
  {
    title: "Hóa đơn",
    path: "/invoice",
    icon: <FaFileInvoiceDollar />,
    group: "finance",
    priority: 3,
  },
  {
    title: "Ghi điện nước",
    path: "/meter-reading",
    icon: <FaCalculator />,
    group: "finance",
    priority: 3,
  },
  {
    title: "Chi phí",
    path: "/expenses",
    icon: <FaMoneyBillWave />,
    group: "finance",
    priority: 3,
  },
  {
    title: "Quản lý Dịch vụ",
    path: "/services/1",
    icon: <FaServicestack />,
    group: "service",
    priority: 4,
  },
  {
    title: "Quản lý Tiện ích",
    path: "/amenities/1",
    icon: <FaWifi />,
    group: "service",
    priority: 4,
  },
  {
    title: "Báo hỏng",
    path: "/maintenance",
    icon: <FaWrench />,
    group: "operation",
    priority: 5,
  },
  {
    title: "Quản lý Bài đăng",
    path: "/posts",
    icon: <FaRegNewspaper />,
    group: "operation",
    priority: 5,
  },
  {
    title: "Chi nhánh",
    path: "/branches/1",
    icon: <FaBuilding />,
    group: "system",
    priority: 6,
  },
  {
    title: "Bài đăng tin tức",
    path: "/news-posts",
    icon: <FaRegNewspaper />,
    group: "operation",
    priority: 5,
  },
  {
    title: "Tài khoản",
    path: "/users",
    icon: <FaUserCog />,
    group: "system",
    priority: 6,
  },
  {
    title: "Cài đặt",
    path: "/setting",
    icon: <FaCogs />,
    group: "settings",
    priority: 7,
  },
  {
    title: "Thông báo",
    path: "/notifications",
    icon: <FaBell />,
    group: "settings",
    priority: 7,
  },
];

const GROUP_CONFIG = {
  main: { label: "TỔNG QUAN", icon: <FaChartLine size={12} /> },
  core: { label: "QUẢN LÝ CHÍNH", icon: <FaClipboardList size={12} /> },
  finance: { label: "TÀI CHÍNH", icon: <FaMoneyBillWave size={12} /> },
  service: { label: "DỊCH VỤ", icon: <FaBoxes size={12} /> },
  operation: { label: "VẬN HÀNH", icon: <FaWrench size={12} /> },
  system: { label: "HỆ THỐNG", icon: <FaBuilding size={12} /> },
  settings: { label: "CÀI ĐẶT", icon: <FaCogs size={12} /> },
};

const Sidebar = ({ isCollapsed, showMobile, toggleMobile }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  let settings = { name: "TTV" };

  try {
    const context = useSystemSetting();
    settings = context?.settings || { name: "TTV" };
  } catch (error) {
    null;
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const groupedItems = {};
  NAV_ITEMS.forEach((item) => {
    if (!groupedItems[item.group]) groupedItems[item.group] = [];
    groupedItems[item.group].push(item);
  });
  const groupOrder = [
    "main",
    "core",
    "finance",
    "service",
    "operation",
    "system",
    "settings",
  ];

  return (
    <>
      <style>{`
        .sidebar {
          background: linear-gradient(180deg, #0f172a 0%, #0f172a 100%);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
        }
        .sidebar-nav {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
        }
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .sidebar-link {
          transition: all 0.2s ease;
          position: relative;
        }
        .sidebar-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: #3b82f6;
          border-radius: 0 4px 4px 0;
          transition: height 0.2s ease;
        }
        .sidebar-link.active::before {
          height: 60%;
        }
        .sidebar-link.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        .sidebar-link:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .sidebar-group-title {
          transition: opacity 0.2s;
          letter-spacing: 0.5px;
        }
        .sidebar-divider {
          margin: 0.75rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .logo-wrapper {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
      `}</style>

      {/* Overlay & Mobile Toggle giữ nguyên */}
      {showMobile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 199 }}
          onClick={toggleMobile}
        />
      )}
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
        className={`sidebar text-white d-flex flex-column ${isCollapsed ? "collapsed" : ""}`}
        style={{
          width: isCollapsed ? "80px" : "280px",
          height: "100vh",
          flexShrink: 0,
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 200,
          transform:
            isMobile && !showMobile ? "translateX(-100%)" : "translateX(0)",
          transition:
            "width 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo */}
        <div
          className="logo-wrapper d-flex align-items-center gap-2 px-3 border-bottom"
          style={{
            minHeight: 72,
            flexShrink: 0,
            borderBottomColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="rounded-3 bg-primary d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0 shadow-lg"
            style={{ width: 40, height: 40, fontSize: 18 }}
          >
            T
          </div>
          <span
            className="fw-bold text-white"
            style={{
              fontSize: 14,
              whiteSpace: "nowrap",
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
        <nav className="flex-grow-1 p-3 sidebar-nav">
          {groupOrder.map((groupKey) => {
            const items = groupedItems[groupKey];
            if (!items?.length) return null;
            const group = GROUP_CONFIG[groupKey];

            return (
              <div key={groupKey}>
                {!isCollapsed && (
                  <div
                    className="sidebar-group-title d-flex align-items-center gap-2 px-2 mb-2"
                    style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}
                  >
                    {group?.icon}
                    <span className="text-uppercase">{group?.label}</span>
                  </div>
                )}
                {isCollapsed && <div className="sidebar-divider" />}

                {items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      to={item.path}
                      key={item.path}
                      className={`sidebar-link d-flex align-items-center gap-3 rounded-lg mb-1 text-decoration-none ${isActive ? "active" : "text-secondary"}`}
                      style={{ padding: "10px 14px", fontSize: 14 }}
                      onClick={() => isMobile && toggleMobile()}
                    >
                      <span
                        className="flex-shrink-0 text-center"
                        style={{ fontSize: 18, width: 22 }}
                      >
                        {item.icon}
                      </span>
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          opacity: isCollapsed ? 0 : 1,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div
            className="px-3 py-3 border-top"
            style={{
              fontSize: 11,
              color: "#475569",
              borderTopColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div>© 2024 TTV System</div>
            <div>Version 1.0.0</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
