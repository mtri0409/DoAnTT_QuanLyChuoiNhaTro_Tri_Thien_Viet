// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHome } from 'react-icons/fa';
import { useSystemSetting } from '../context/SystemSettingContext';
import { imgURL } from '../api/config';

const Footer = () => {
  const { settings, loading } = useSystemSetting();

  // Hiệu ứng loading tinh tế hơn
  if (loading) {
    return (
      <footer className="py-4 mt-auto border-top bg-white">
        <div className="container text-center">
          <div className="spinner-grow spinner-grow-sm text-primary opacity-50" role="status"></div>
        </div>
      </footer>
    );
  }

  // Lấy màu chủ đạo từ settings, nếu không có thì dùng màu mặc định
  const primaryColor = settings.primaryColor || "#0d6efd";

  return (
    <footer className="bg-white pt-5 pb-3 mt-auto border-top">
      <div className="container-fluid px-lg-5">
        <div className="row g-4">
          
          {/* Cột 1: Thương hiệu */}
          <div className="col-lg-4 col-md-12 pr-lg-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              {settings.logo ? (
                <img 
                  src={`${imgURL}/api/v1/public/system/image/${settings.logo}`}
                  alt="Logo" 
                  height="40"
                  style={{ objectFit: "contain" }}
                  onError={(e) => e.target.style.display = "none"}
                />
              ) : (
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white" 
                     style={{ width: 40, height: 40, backgroundColor: primaryColor }}>
                  <FaHome size={20} />
                </div>
              )}
              <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>
                {settings.name || "TTV Rental Management"}
              </h5>
            </div>
            <p className="text-muted mb-4 shadow-none" style={{ fontSize: '14px', maxWidth: '300px', lineHeight: '1.6' }}>
              Giải pháp quản lý nhà trọ và chuỗi phòng trọ thông minh, giúp tối ưu hóa doanh thu và quy trình vận hành.
            </p>
            <div className="d-flex gap-3">
              {settings.facebookLink && (
                <a href={settings.facebookLink} target="_blank" rel="noreferrer" className="social-icon">
                  <FaFacebook size={20} />
                </a>
              )}
              {settings.youtubeLink && (
                <a href={settings.youtubeLink} target="_blank" rel="noreferrer" className="social-icon">
                  <FaYoutube size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="fw-bold text-dark mb-4 uppercase">Hệ thống</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/">Bảng điều khiển</Link></li>
              <li><Link to="/rooms">Quản lý phòng</Link></li>
              <li><Link to="/contracts">Hợp đồng mẫu</Link></li>
              <li><Link to="/reports">Báo cáo thu chi</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="fw-bold text-dark mb-4 uppercase">Hỗ trợ</h6>
            <ul className="list-unstyled footer-links">
              <li><Link to="/user/profile">Tài khoản</Link></li>
              <li><Link to="/help">Hướng dẫn sử dụng</Link></li>
              <li><Link to="/policy">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ trực tiếp */}
          <div className="col-lg-4 col-md-4">
            <h6 className="fw-bold text-dark mb-4 uppercase">Liên hệ</h6>
            <div className="contact-info">
              {settings.address && (
                <div className="d-flex align-items-start gap-3 mb-3">
                  <FaMapMarkerAlt className="mt-1" style={{ color: primaryColor }} />
                  <span className="text-muted small">{settings.address}</span>
                </div>
              )}
              {settings.hotline && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <FaPhone style={{ color: primaryColor }} />
                  <a href={`tel:${settings.hotline}`} className="text-muted text-decoration-none small fw-bold">
                    {settings.hotline}
                  </a>
                </div>
              )}
              {settings.email && (
                <div className="d-flex align-items-center gap-3">
                  <FaEnvelope style={{ color: primaryColor }} />
                  <a href={`mailto:${settings.email}`} className="text-muted text-decoration-none small">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="row mt-5 pt-3 border-top align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              {settings.copyrightText || `© ${new Date().getFullYear()} Trí Thiện Việt. All rights reserved.`}
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
             <span className="badge bg-light text-muted fw-normal">Phiên bản 2.0.1</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-links li {
          margin-bottom: 12px;
        }
        .footer-links a {
          color: #6c757d;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s;
        }
        .footer-links a:hover {
          color: ${primaryColor} !important;
          padding-left: 5px;
        }
        .social-icon {
          color: #adb5bd;
          transition: 0.3s;
        }
        .social-icon:hover {
          color: ${primaryColor} !important;
          transform: translateY(-3px);
        }
        .uppercase {
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;