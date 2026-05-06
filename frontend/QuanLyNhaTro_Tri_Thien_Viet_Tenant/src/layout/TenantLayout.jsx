import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const TenantLayout = () => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="flex-grow-1 py-4 container-fluid px-lg-5">
        <div className="animate__animated animate__fadeIn">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white py-4 mt-auto text-center text-muted small" style={{ borderTop: 'none' }}>
        <div className="container-fluid px-lg-5">
          <span className="opacity-75">© 2026 Hệ thống Quản Lý Nhà Trọ</span>
          <span className="mx-2 text-primary">|</span>
          <strong>TTV</strong>
        </div>
      </footer>
    </div>
  );
};

export default TenantLayout;