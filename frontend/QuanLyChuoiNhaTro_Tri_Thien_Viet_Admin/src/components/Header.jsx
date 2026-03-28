import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';

const Header = ({ toggleSidebar }) => {
  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom px-4 shadow-sm">
      <button className="btn btn-light border" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <div className="ms-auto d-flex align-items-center">
        <div className="position-relative me-4">
          <FaBell className="text-secondary fs-5" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '10px'}}>
            3
          </span>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2 fw-bold text-dark">Admin Tri</span>
          <FaUserCircle className="fs-3 text-secondary" />
        </div>
      </div>
    </nav>
  );
};

export default Header;