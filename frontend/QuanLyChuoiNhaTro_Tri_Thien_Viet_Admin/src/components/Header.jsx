import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();   
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Nếu có token thì Tri xóa ở đây: localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom px-4 shadow-sm position-relative">
      {/* Nút Toggle Sidebar */}
      <button className="btn btn-light border" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <div className="ms-auto d-flex align-items-center">
        {/* Thông báo (Bell) */}
        <div className="position-relative me-4" style={{ cursor: 'pointer' }}>
          <FaBell className="text-secondary fs-5" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
            3
          </span>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="position-relative" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfile(!showProfile)}
          >
            <span className="me-2 fw-bold text-dark d-none d-md-inline">Admin Tri</span>
            <FaUserCircle className="fs-3 text-secondary" />
          </div>

          {/* Menu thả xuống */}
          {showProfile && (
            <div 
              className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 py-2" 
              style={{ width: '180px', zIndex: 1000 }}
            >
              <button className="dropdown-item d-flex align-items-center px-3 py-2 border-0 bg-transparent w-100">
                <FaUserEdit className="me-2 text-primary" /> 
                <Link  to="/login" className="small fw-semibold">Đăng nhập</Link>
              </button>
              
              <div className="dropdown-divider mx-2"></div>
              
              <button 
                className="dropdown-item d-flex align-items-center px-3 py-2 border-0 bg-transparent w-100 text-danger"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> 
                <span className="small fw-semibold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;