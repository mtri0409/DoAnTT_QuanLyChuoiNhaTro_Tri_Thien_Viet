import React from 'react';

const Footer = () => {
  return (
    <footer className="main-footer">
      <strong>
        Copyright &copy; 2026 <a href="/">Hệ thống Quản lý Nhà trọ </a>.
      </strong>
      {" "}Tất cả quyền được bảo lưu.
      <div className="float-right d-none d-sm-inline-block">
        <b>Phiên bản</b> 1.0.0
      </div>
    </footer>
  );
};

export default Footer;