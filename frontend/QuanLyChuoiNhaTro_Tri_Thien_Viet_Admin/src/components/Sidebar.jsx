import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaBuilding, FaBed, FaUsers, FaFileInvoiceDollar,
  FaTimes, FaCogs, FaMotorcycle, FaFileContract, FaServicestack,
  FaWifi, FaCalculator, FaBell, FaRegNewspaper, FaWrench, FaBars,
  FaChartLine, FaMoneyBillWave, FaUserCog, FaClipboardList, FaBoxes,
  FaChevronDown,
  FaCamera,
} from "react-icons/fa";
import { useSystemSetting } from "../context/SystemSettingContext";
import { useAuth } from "../context/AuthContext";

// =============================================================
// NAV_ITEMS: Cấu hình menu điều hướng kèm phân quyền (roles)
//
// STAFF có quyền truy cập hầu hết, trừ:
//   - Dashboard (trang tổng quan số liệu)
//   - Quản lý tài khoản (/users)
//   - Chi phí (/expenses)
//   - Cài đặt hệ thống (/setting)
//   - Xóa/tạo các danh mục quan trọng (xử lý trong từng trang)
// =============================================================
const NAV_ITEMS = [
  // Tổng quan (Dashboard - chỉ ADMIN & TENANT)
  { title: "Dashboard", path: "/", icon: <FaHome />, group: "main", roles: ["ADMIN", "TENANT"] },

  // ─── Quản lý chính ──────────────────────────────────────────
  { title: "Hợp đồng",    path: "/contracts",    icon: <FaFileContract />,     group: "core", roles: ["ADMIN", "STAFF"] },
  { title: "Người thuê",  path: "/profiles",     icon: <FaUsers />,            group: "core", roles: ["ADMIN", "STAFF"] },
  { title: "Quản lý Phòng", path: "/rooms/1",   icon: <FaBed />,              group: "core", roles: ["ADMIN", "STAFF"] },
  { title: "Quản lý xe",  path: "/vehicles",     icon: <FaMotorcycle />,       group: "core", roles: ["ADMIN", "STAFF"] },

  // ─── Tài chính ──────────────────────────────────────────────
  { title: "Hóa đơn",      path: "/invoice",       icon: <FaFileInvoiceDollar />, group: "finance", roles: ["ADMIN", "STAFF"] },
  { title: "Ghi điện nước", path: "/meter-reading", icon: <FaCalculator />,       group: "finance", roles: ["ADMIN", "STAFF"] },
  { title: "Chi phí",       path: "/expenses",      icon: <FaMoneyBillWave />,     group: "finance", roles: ["ADMIN", "STAFF"] },

  // ─── Dịch vụ & Tiện ích ─────────────────────────────────────
  { title: "Dịch vụ",     path: "/services/1",   icon: <FaServicestack />, group: "service", roles: ["ADMIN", "STAFF"] },
  { title: "Tiện ích",    path: "/amenities/1",  icon: <FaWifi />,         group: "service", roles: ["ADMIN", "STAFF"] },

  // ─── Vận hành ───────────────────────────────────────────────
  { title: "Báo hỏng",        path: "/maintenance", icon: <FaWrench />,        group: "operation", roles: ["ADMIN", "STAFF", "TENANT"] },
  { title: "Bài đăng",        path: "/posts",        icon: <FaRegNewspaper />,  group: "operation", roles: ["ADMIN", "STAFF"] },
  { title: "Tin tức",         path: "/news-posts",   icon: <FaRegNewspaper />,  group: "operation", roles: ["ADMIN", "STAFF"] },

  // ─── Hệ thống (Admin only) ──────────────────────────────────
  { title: "Chi nhánh",   path: "/branches/1",   icon: <FaBuilding />,     group: "system", roles: ["ADMIN", "STAFF"] },
  { title: "Tài khoản",   path: "/users",        icon: <FaUserCog />,      group: "system", roles: ["ADMIN"] },
  { title: "Cài đặt",     path: "/setting",      icon: <FaCogs />,         group: "system", roles: ["ADMIN", "STAFF"] },
  { title: "Thông báo",   path: "/notifications",icon: <FaBell />,         group: "system", roles: ["ADMIN", "STAFF", "TENANT"] },

  // ─── An ninh bãi xe ─────────────────────────────────────────
  { title: "Bãi xe",  path: "/parks",  icon: <FaMotorcycle />, group: "security", roles: ["ADMIN", "STAFF"] },
  { title: "Camera",  path: "/camera", icon: <FaCamera />,     group: "security", roles: ["ADMIN", "STAFF"] },
];

const GROUP_CONFIG = {
  main:      { label: "Tổng quan",     icon: <FaChartLine size={14} />,     color: "#60a5fa" },
  core:      { label: "Quản lý chính", icon: <FaClipboardList size={14} />, color: "#34d399" },
  finance:   { label: "Tài chính",     icon: <FaMoneyBillWave size={14} />, color: "#fbbf24" },
  service:   { label: "Dịch vụ",       icon: <FaBoxes size={14} />,         color: "#a78bfa" },
  operation: { label: "Vận hành",      icon: <FaWrench size={14} />,        color: "#fb923c" },
  system:    { label: "Hệ thống",      icon: <FaBuilding size={14} />,      color: "#94a3b8" },
  security:  { label: "An ninh",       icon: <FaCamera size={14} />,        color: "#f87171" },
  settings:  { label: "Cài đặt",       icon: <FaCogs size={14} />,          color: "#94a3b8" },
};

const GROUP_ORDER = ["main", "core", "finance", "service", "operation", "system", "settings", "security"];

const Sidebar = ({ isCollapsed, showMobile, toggleMobile }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();
  const userRole = user?.role || "TENANT";

  // Lọc menu theo role
  const filteredNavItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(userRole));

  const getInitialOpen = () => {
    const activeItem = filteredNavItems.find(i => i.path === location.pathname);
    return activeItem ? { [activeItem.group]: true } : { main: true, core: true };
  };
  const [openGroups, setOpenGroups] = useState(getInitialOpen);

  let settings = { name: "TTV" };
  try {
    const context = useSystemSetting();
    settings = context?.settings || { name: "TTV" };
  } catch (e) { null }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleGroup = (key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedItems = {};
  filteredNavItems.forEach((item) => {
    if (!groupedItems[item.group]) groupedItems[item.group] = [];
    groupedItems[item.group].push(item);
  });

  return (
    <>
      <style>{`
       
      `}</style>

      {showMobile && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 199 }} onClick={toggleMobile} />
      )}
      {isMobile && !showMobile && (
        <button className="btn btn-primary position-fixed d-flex align-items-center justify-content-center d-md-none shadow"
          style={{ bottom: 20, right: 20, zIndex: 150, borderRadius: "50%", width: 50, height: 50 }}
          onClick={toggleMobile}>
          <FaBars size={20} />
        </button>
      )}

      <div className="sidebar text-white d-flex flex-column"
        style={{
          width: isCollapsed ? "68px" : "268px",
          height: "100vh",
          flexShrink: 0,
          position: isMobile ? "fixed" : "sticky",
          top: 0, left: 0, zIndex: 200,
          transform: isMobile && !showMobile ? "translateX(-100%)" : "translateX(0)",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}>

        {/* Logo */}
        <div className="d-flex align-items-center gap-2 px-3"
          style={{ minHeight: 68, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="rounded-3 bg-primary d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: 38, height: 38, fontSize: 17 }}>
            T
          </div>
          <span className="fw-semibold" style={{
            fontSize: 15, color: "#e2e8f0", whiteSpace: "nowrap",
            opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s",
          }}>
            {settings.name || "TTV"}
          </span>
          {isMobile && (
            <button className="btn btn-link ms-auto p-0"
              style={{ color: "#64748b", opacity: isCollapsed ? 0 : 1 }}
              onClick={toggleMobile}>
              <FaTimes />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 sidebar-nav" style={{ padding: "10px 8px" }}>
          {GROUP_ORDER.map((groupKey) => {
            const items = groupedItems[groupKey];
            if (!items?.length) return null;
            const group = GROUP_CONFIG[groupKey];
            const isOpen = !!openGroups[groupKey];
            const hasActive = items.some(i => i.path === location.pathname);

            return (
              <div key={groupKey} style={{ marginBottom: 4 }}>

                {isCollapsed ? (
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 4px 8px" }} />
                ) : (
                  <div className="group-header" onClick={() => toggleGroup(groupKey)}>
                    <span style={{ color: group.color, flexShrink: 0 }}>{group.icon}</span>
                    <span className="group-label" style={{ color: hasActive ? "#e2e8f0" : "#64748b" }}>
                      {group.label}
                    </span>
                    <FaChevronDown className={`group-chevron ${isOpen ? "open" : ""}`} />
                  </div>
                )}

                <div className={`group-items ${isCollapsed || isOpen ? "open" : "closed"}`}>
                  {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        to={item.path}
                        key={item.path}
                        className={`sidebar-link ${isActive ? "active" : ""}`}
                        style={{
                          paddingLeft: isCollapsed ? "10px" : "20px",
                          "--accent": group.color,
                          color: isActive ? "#f1f5f9" : "#94a3b8",
                        }}
                        onClick={() => isMobile && toggleMobile()}
                      >
                        <span style={{
                          fontSize: 16,
                          width: 20,
                          textAlign: "center",
                          flexShrink: 0,
                          color: isActive ? group.color : "#475569",
                          transition: "color 0.15s",
                        }}>
                          {item.icon}
                        </span>
                        <span className="link-label" style={{ opacity: isCollapsed ? 0 : 1 }}>
                          {item.title}
                        </span>
                        {isActive && !isCollapsed && (
                          <span className="active-dot ms-auto" style={{ background: group.color }} />
                        )}
                      </Link>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="px-3 py-3" style={{ fontSize: 12, color: "#334155", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div>© 2024 TTV System</div>
            <div>Version 1.0.0</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
