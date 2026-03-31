import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFileInvoiceDollar, FaUserCircle, FaTools } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';



const NavLinks = () => {
  const {user} = useAuth();
  
  const location = useLocation();
  if (!user || !user.profileId) {
    return null; 
  }
  const isActive = (path) => location.pathname.includes(path);
  const menus = [
    { path: '/user/dashboard', label: 'Tổng quan', icon: <FaHome size={15} /> },
    { path: '/user/bills',     label: 'Hóa đơn',   icon: <FaFileInvoiceDollar size={15} /> },
    { path: '/user/requests',  label: 'Báo hỏng',  icon: <FaTools size={15} /> },
    { path: `/user/profile/${user.profileId}`,   label: 'Hồ sơ',     icon: <FaUserCircle size={15} /> },
  ];
  
  return (
    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
      {menus.map((menu) => (
        <li className="nav-item" key={menu.path}>
          <Link
            className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
              isActive(menu.path)
                ? 'bg-primary bg-opacity-10 text-primary fw-semibold'
                : 'text-secondary'
            }`}
            to={menu.path}
            style={{ transition: 'all 0.15s ease' }}
          >
            {menu.icon}
            <span className="small">{menu.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;