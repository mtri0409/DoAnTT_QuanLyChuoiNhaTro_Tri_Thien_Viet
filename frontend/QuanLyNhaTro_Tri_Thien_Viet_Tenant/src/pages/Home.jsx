import React from 'react';
import QuickActions from '../components/QuickAction';
import HeaderGrid from '../components/HeaderGird';

const Home = () => {
  return (
    <div className="animate__animated animate__fadeIn">
      {/* Tiêu đề trang */}
      <div className="d-flex align-items-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0 text-uppercase">Cổng thông tin người thuê</h4>
            <p className="text-muted small mb-0">Hệ thống Quản lý Chuỗi Nhà trọ - Powered by TRI Pham</p>
          </div>
      </div>

      {/* Dải phía trên (Hồ sơ & Hóa đơn) */}
      <HeaderGrid />

      {/* Dải phía dưới (Chức năng nhanh) */}
      <h5 className="fw-bold text-dark mt-5 mb-3 border-bottom pb-2">Chức năng thường dùng</h5>
      <QuickActions />
    </div>
  );
};

export default Home;