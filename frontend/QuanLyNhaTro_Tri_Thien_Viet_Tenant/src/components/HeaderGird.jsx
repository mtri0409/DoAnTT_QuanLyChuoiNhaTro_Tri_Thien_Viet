import React from 'react';
import { 
  FaBell, FaChevronRight, FaInfoCircle, FaFileContract, 
  FaMoneyBillWave, FaTools, FaExclamationTriangle, FaInfo 
} from 'react-icons/fa';

const HeaderGrid = ({ profileData, notifications = [] }) => {

  const getNotificationStyle = (type) => {
    switch (type?.toUpperCase()) {
      case 'CONTRACT': return { color: '#0d6efd', icon: <FaFileContract />, label: 'Hợp đồng' };
      case 'BILL': return { color: '#198754', icon: <FaMoneyBillWave />, label: 'Hóa đơn' };
      case 'OVERDUE': return { color: '#dc3545', icon: <FaExclamationTriangle />, label: 'Quá hạn' };
      case 'MAINTENANCE': return { color: '#ffc107', icon: <FaTools />, label: 'Bảo trì' };
      default: return { color: '#0dcaf0', icon: <FaInfo />, label: 'Thông báo' };
    }
  };

  if (!profileData) return null;

  return (
    <div className="row g-3 mb-4 mt-n3 align-items-stretch"> 
      
      {/* CỘT 1: HỒ SƠ CƯ DÂN (Gọn gàng) */}
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white overflow-hidden">
          <div className="px-4 py-3 border-bottom d-flex align-items-center bg-white">
            <FaInfoCircle className="text-primary me-2" size={16} />
            <h6 className="fw-bold mb-0 text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>Hồ sơ cư dân</h6>
          </div>
          
          <div className="card-body p-4">
            <div className="row g-3">
              {[
                { label: 'HỌ TÊN', value: profileData.fullName },
                { label: 'ĐIỆN THOẠI', value: profileData.phone },
                { label: 'PHÒNG', value: `Phòng ${profileData.roomName}`, isBadge: true },
                { label: 'EMAIL', value: profileData.email || "N/A" },
                { label: 'ĐỊA CHỈ', value: profileData.address, isSuccess: true },
                { label: 'HẾT HẠN HD', value: profileData.contractEndDate || "N/A" },
              ].map((item, idx) => (
                <div key={idx} className="col-sm-6">
                  <div className="p-2 rounded-3 hover-bg-light transition-all">
                    <span className="text-muted d-block mb-0 fw-bold" style={{ fontSize: '0.7rem' }}>{item.label}</span>
                    {item.isBadge ? (
                      <span className="badge bg-primary-subtle text-primary rounded-pill mt-1 px-3" style={{ fontSize: '0.85rem' }}>{item.value}</span>
                    ) : (
                      <span className={`fw-bold d-block mt-1 text-truncate ${item.isSuccess ? 'text-success' : 'text-dark'}`} style={{ fontSize: '0.95rem' }}>
                        {item.value || "---"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CỘT 2: THÔNG BÁO (Hiện ~2 cái, Cao bằng bên trái) */}
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column bg-white overflow-hidden">
          <div className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center bg-light-subtle">
            <h6 className="fw-bold mb-0 small d-flex align-items-center gap-2">
              <FaBell className="text-warning animate-ring" /> NHẮC NHỞ
            </h6>
            <span className="badge rounded-pill bg-danger px-2" style={{ fontSize: '0.75rem' }}>{notifications.length}</span>
          </div>
          
          {/* Ép Max Height để hiện tầm 2 thông báo to */}
          <div className="card-body p-0 overflow-y-auto custom-scrollbar" style={{ height: '240px' }}>
            {notifications.length > 0 ? notifications.map((note) => {
              const style = getNotificationStyle(note.type);
              return (
                <div 
                  key={note.notificationId || note.id} 
                  className="p-3 border-bottom list-group-item-action border-start border-5"
                  style={{ borderColor: style.color }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', color: style.color }}>
                      {style.icon} <span className="text-uppercase">{note.title || style.label}</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{note.createdAt || note.time}</span>
                  </div>

                  <p className="mb-0 text-dark fw-medium mt-1" 
                     style={{ 
                        fontSize: '0.95rem', 
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                     }}>
                    {note.content}
                  </p>
                </div>
              );
            }) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted italic small">Không có nhắc nhở</div>
            )}
          </div>

          <div className="p-2 mt-auto text-center border-top bg-white">
            <a href="/notifications" className="text-primary text-decoration-none fw-bold small d-flex align-items-center justify-content-center gap-1">
              Tất cả <FaChevronRight size={10} />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeaderGrid;