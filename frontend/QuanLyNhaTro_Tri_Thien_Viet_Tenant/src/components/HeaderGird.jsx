import React from 'react';
import { FaBell, FaChevronRight, FaInfoCircle, FaCreditCard } from 'react-icons/fa';

const HeaderGrid = ({ profileData, userData }) => {

  const notifications = [
    { id: 1, title: "Thanh toán tiền phòng", content: "Hóa đơn tháng 03/2026 của bạn đã có, vui lòng thanh toán trước ngày 05/04.", type: "danger", time: "2 giờ trước" },
    { id: 2, title: "Thông báo bảo trì", content: "Hệ thống điện sẽ được bảo trì vào lúc 14:00 ngày mai. Vui lòng chuẩn bị.", type: "warning", time: "1 ngày trước" },
    { id: 3, title: "Tin nhắn chủ trọ", content: "Vui lòng cập nhật CCCD mới nhất để làm đăng ký tạm trú.", type: "info", time: "2 ngày trước" }
  ];
//   const p = profileData || {};
  return (
    <div className="row g-3 mb-4">
      
      {/* Cột 1: Thông tin người thuê (Đã bỏ ảnh) */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
          <div className="d-flex align-items-center mb-3 border-bottom pb-2">
            <FaInfoCircle className="text-primary me-2" />
            <h6 className="fw-bold mb-0 text-dark text-uppercase" style={{ letterSpacing: '1px' }}>Thông tin cá nhân</h6>
          </div>
          
          <div className="row g-4">
            <div className="col-sm-6 col-md-4 justify-content-between">
              <span className="small text-muted d-block mb-1">Họ tên:</span>
              <span className="fw-bold text-dark fs-6">{profileData.fullName || "Đang tải..."}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="small text-muted d-block mb-1">Số điện thoại:</span>
              <span className="fw-bold text-dark">{profileData.phone || "Đang tải..."}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="small text-muted d-block mb-1">Phòng đang ở:</span>
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">Phòng {profileData.roomName || "Đang tải"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="small text-muted d-block mb-1">Email:</span>
              <span className="fw-bold text-dark">{profileData.email || "Chưa cập nhập"}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="small text-muted d-block mb-1">Địa chỉ</span>
              <span className="text-success fw-bold">{profileData.address || "chưa cập nhập "}</span>
            </div>
            <div className="col-sm-6 col-md-4">
              <span className="small text-muted d-block mb-1">Ngày hêt hạn:</span>
              <span className="fw-bold text-dark">{profileData.contractEndDate || "Chưa cập nhập"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cột 2: Danh sách thông báo */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column overflow-hidden">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FaBell className="text-warning" /> Nhắc nhở mới
            </h6>
            <span className="badge bg-danger rounded-pill shadow-sm">{notifications.length}</span>
          </div>
          
          <div className="card-body p-0 overflow-y-auto custom-scrollbar" style={{ height: '180px' }}>
            {notifications.map((note) => (
              <div key={note.id} className="p-3 border-bottom list-group-item-action transition-all border-start border-4 border-transparent hover-border-primary">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className={`fw-bold text-${note.type}`} style={{ fontSize: '10px', textTransform: 'uppercase' }}>{note.title}</span>
                  <span className="text-muted" style={{ fontSize: '10px' }}>{note.time}</span>
                </div>
                <p className="small text-muted mb-0 text-truncate-2" style={{ lineHeight: '1.4' }}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>

          <div className="p-2 mt-auto text-center border-top bg-light-subtle">
            <a href="#" className="small text-primary text-decoration-none d-flex align-items-center justify-content-center gap-1 fw-bold p-1">
              Xem chi tiết <FaChevronRight size={10} />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeaderGrid;