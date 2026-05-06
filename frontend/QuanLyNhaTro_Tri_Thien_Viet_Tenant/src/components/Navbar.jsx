import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import NavLinks from "./NavLinks";
import { useAuth } from "../context/AuthContext";
import apiNotification from "../api/apiNotification";

/* ─── Navbar ────────────────────────────────────────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const fetchCount = async () => {
      const count = await apiNotification.getUnreadCount(user.userId);
      setUnreadCount(count);
    };
    fetchCount();
  }, []);

  if (!user || !user.userId) {
    return null;
  }
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top py-2"
      style={{ border: "none", boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
    >
      <div className="container-fluid px-lg-5">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="bg-primary rounded-3 text-white d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, flexShrink: 0 }}
          >
            <FaHome size={16} />
          </div>
          <span
            className="fw-bold text-dark text-uppercase"
            style={{ fontSize: 13, letterSpacing: "0.05em" }}
          >
            Hệ thống nhà trọ TTV
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#userNavbarContent"
          aria-controls="userNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Menu content */}
        <div className="collapse navbar-collapse" id="userNavbarContent">
          <NavLinks />

          {/* User actions */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0 pt-3 pt-lg-0 border-top border-lg-0 ms-lg-auto">
            <NotificationBell
              count={unreadCount}
              onNavigate={() => navigate(`/user/notifications/`)}
            />
            <UserProfileDropdown
              user={user}
              onLogout={() => {
                logout();
                navigate("/login");
              }}
            />
          </div>
        </div>
      </div>

      {/* Override Bootstrap's border completely */}
      <style>{`
        .navbar { border-bottom: none !important; }
        @media (min-width: 992px) {
          #userNavbarContent .border-top { border-top: none !important; }
        }
      `}</style>
    </nav>
  );
};

/* ─── Notification Bell ─────────────────────────────────────── */
const NotificationBell = ({ count, onNavigate }) => (
  <button
    onClick={onNavigate}
    className="btn btn-light rounded-circle p-0 position-relative text-secondary border-0"
    style={{
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <FaBell size={16} />
    {count > 0 && (
      <span
        className="position-absolute badge rounded-pill bg-danger"
        style={{
          fontSize: 9,
          top: 2,
          right: 2,
          padding: "2px 4px",
          minWidth: 16,
        }}
      >
        {count}
      </span>
    )}
  </button>
);

/* ─── User Profile Dropdown ─────────────────────────────────── */
const UserProfileDropdown = ({ onLogout, user }) => (
  <div className="dropdown">
    <div
      className="d-flex align-items-center gap-2 rounded-pill px-2 py-1 bg-light"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      style={{ cursor: "pointer" }}
    >
      <span
        className="small fw-semibold text-dark d-none d-md-inline"
        style={{ fontSize: 13 }}
      >
        {user.fullName}
      </span>
      {/* <img
        src="https://ui-avatars.com/api/?name=Tri+Pham&background=0d6efd&color=fff&size=64"
        className="rounded-circle"
        width={32}
        height={32}
        alt="Avatar"
      /> */}
    </div>

    <ul
      className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2"
      style={{ minWidth: 180 }}
    >
      <li>
        <Link
          className="dropdown-item d-flex align-items-center gap-2 py-2"
          to="/login"
        >
          <FaUserCircle size={14} className="text-muted" />
          <span className="small">Đăng nhập</span>
        </Link>
      </li>
      <li>
        <Link
          className="dropdown-item d-flex align-items-center gap-2 py-2"
          to="/user/profile"
        >
          <FaUserCircle size={14} className="text-muted" />
          <span className="small">Cài đặt tài khoản</span>
        </Link>
      </li>
      <li>
        <hr className="dropdown-divider opacity-25 my-1" />
      </li>
      <li>
        <button
          className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
          onClick={onLogout}
        >
          <FaSignOutAlt size={14} />
          <span className="small">Đăng xuất</span>
        </button>
      </li>
    </ul>
  </div>
);

export default Navbar;
