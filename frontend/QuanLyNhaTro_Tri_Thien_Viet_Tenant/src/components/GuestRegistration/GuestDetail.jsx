import React, { useState, useEffect } from 'react';
import {
  FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaIdCard,
  FaMapMarkerAlt, FaCalendar, FaMotorcycle, FaCheckCircle,
  FaClock, FaTimesCircle, FaDownload, FaImage, FaHome, FaUsers, FaPhoneAlt
} from 'react-icons/fa';
import apiGuestRegistration from '../../api/apiGuestRegistration';
import { notify } from '../../utils/swalUtils';
import { imgURL } from '../../api/config';
import './GuestDetail.css';

const GuestDetail = ({ memberId, onBack }) => {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdFront, setShowIdFront] = useState(false);
  const [showIdBack, setShowIdBack] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [memberId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await apiGuestRegistration.getRegistrationDetail(memberId);
      setGuest(response);
    } catch (error) {
      console.error('Lỗi:', error);
      notify('Lỗi lấy chi tiết', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: {
        label: 'Chờ duyệt',
        color: '#faad14',
        bgColor: '#fffbe6',
        icon: FaClock
      },
      APPROVED: {
        label: 'Đã duyệt',
        color: '#52c41a',
        bgColor: '#f6ffed',
        icon: FaCheckCircle
      },
      REJECTED: {
        label: 'Bị từ chối',
        color: '#ff4d4f',
        bgColor: '#fff1f0',
        icon: FaTimesCircle
      },
      CANCELLED: {
        label: 'Đã hủy',
        color: '#666',
        bgColor: '#f0f0f0',
        icon: FaTimesCircle
      }
    };

    return statusMap[status] || statusMap.PENDING;
  };

  if (loading) {
    return (
      <div className="guest-detail-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="guest-detail-container">
        <div className="error-message">Không tìm thấy dữ liệu</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(guest.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container px-0 text-start">

      {/* Status Banner */}
      <div className="alert border-0 rounded-4 p-3 d-flex align-items-center gap-3 mb-4 shadow-sm" style={{ backgroundColor: statusInfo.bgColor, borderLeft: `4px solid ${statusInfo.color}` }}>
        <StatusIcon style={{ color: statusInfo.color, fontSize: 24 }} />
        <div>
          <h6 className="fw-bold mb-1" style={{ color: statusInfo.color }}>
            Trạng thái: {statusInfo.label}
          </h6>
          <span className="small text-muted" style={{ fontSize: '11px' }}>
            Ngày đăng ký: {guest.createdAt ? new Date(guest.createdAt).toLocaleString('vi-VN') : 'N/A'}
          </span>
        </div>
      </div>

      {/* Grid 2 cột */}
      <div className="row g-4">
        {/* CỘT TRÁI */}
        <div className="col-lg-4">
          {/* CARD THÔNG TIN CÁ NHÂN */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start">
            <div className="text-center pb-4 border-bottom">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <FaUser size={40} />
              </div>
              <h5 className="fw-bold text-dark mb-1">{guest.fullName}</h5>
              <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-1.5 fw-normal small">
                {guest.relationship}
              </span>
            </div>
            
            <div className="py-3 border-bottom">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-success-subtle p-2 rounded-3 text-success"><FaHome /></div>
                <div>
                  <div className="small text-muted">Phòng</div>
                  <div className="fw-bold text-dark">{guest.roomName || 'N/A'}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info"><FaUsers /></div>
                <div>
                  <div className="small text-muted">Loại thành viên</div>
                  <div className="fw-bold text-dark">{guest.memberType === 'STAYING_WITH' ? 'Ở Nhờ' : 'Khách Chơi'}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning-subtle p-2 rounded-3 text-warning"><FaPhoneAlt /></div>
                <div>
                  <div className="small text-muted">Số điện thoại</div>
                  <div className="fw-bold text-dark">{guest.phone}</div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <p className="small text-muted mb-1">Email:</p>
              <p className="small fw-semibold text-dark mb-3">{guest.email || '-'}</p>
              <p className="small text-muted mb-1">Địa chỉ thường trú:</p>
              <p className="small fw-semibold text-dark mb-0">{guest.address || '-'}</p>
            </div>
          </div>

          {/* CARD XE CỘ */}
          {guest.vehicles && guest.vehicles.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 text-start">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <FaMotorcycle className="text-warning"/> Biển số xe đăng ký
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {guest.vehicles.map((v, i) => (
                  <span key={i} className="badge bg-light text-dark border px-3 py-2 fw-semibold">
                    {v.licensePlate} ({v.brand})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2 text-dark">
              <FaIdCard className="text-info"/> Thông tin định danh & CCCD
            </h6>
            
            <div className="row g-3 mb-5">
              <div className="col-md-6">
                <label className="small text-muted fw-bold mb-1">SỐ CCCD / HỘ CHIẾU</label>
                <div className="fs-5 fw-bold text-primary">{guest.identityNumber}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold mb-1">NƠI CẤP</label>
                <div className="fw-semibold text-dark">{guest.idIssuePlace || 'Chưa cập nhật'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold mb-1">NGÀY CẤP</label>
                <div className="fw-semibold text-dark">
                  <FaCalendar className="me-2 text-muted"/>{guest.idIssueDate || 'N/A'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold mb-1">NGÀY HẾT HẠN</label>
                <div className="fw-semibold text-danger">
                  <FaCalendar className="me-2 text-muted"/>{guest.idExpirationDate || 'N/A'}
                </div>
              </div>
            </div>

            <h6 className="fw-bold mb-3 text-secondary">Ảnh giấy tờ tùy thân (CCCD)</h6>
            <div className="row g-4">
              {/* MẶT TRƯỚC */}
              <div className="col-md-6">
                <span className="small text-muted fw-bold d-block mb-2">MẶT TRƯỚC CCCD</span>
                <div 
                  className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" 
                  style={{ height: '220px', cursor: 'pointer' }}
                  onClick={() => setShowIdFront(true)}
                  title="Click để xem ảnh lớn"
                >
                  {guest.idFrontImage ? (
                    <img 
                      src={`${imgURL}/api/v1/public/profile/image/${guest.idFrontImage}`} 
                      className="img-fluid h-100 w-100 object-fit-contain" 
                      alt="Mặt trước" 
                    />
                  ) : (
                    <span className="text-muted small">Trống ảnh mặt trước</span>
                  )}
                </div>
              </div>

              {/* MẶT SAU */}
              <div className="col-md-6">
                <span className="small text-muted fw-bold d-block mb-2">MẶT SAU CCCD</span>
                <div 
                  className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" 
                  style={{ height: '220px', cursor: 'pointer' }}
                  onClick={() => setShowIdBack(true)}
                  title="Click để xem ảnh lớn"
                >
                  {guest.idBackImage ? (
                    <img 
                      src={`${imgURL}/api/v1/public/profile/image/${guest.idBackImage}`} 
                      className="img-fluid h-100 w-100 object-fit-contain" 
                      alt="Mặt sau" 
                    />
                  ) : (
                    <span className="text-muted small">Trống ảnh mặt sau</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ THÔNG TIN PHÊ DUYỆT HOẶC TỪ CHỐI */}
          {guest.approvedAt && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start border-start border-4 border-success">
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FaCheckCircle /> Thông Tin Phê Duyệt
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="small text-muted fw-bold mb-1">DUYỆT BỞI</label>
                  <p className="fw-semibold mb-0 text-dark">{guest.approvedByName || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted fw-bold mb-1">THỜI GIAN DUYỆT</label>
                  <p className="fw-semibold mb-0 text-dark">
                    <FaCalendar className="me-2 text-muted" />
                    {new Date(guest.approvedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {guest.status === 'REJECTED' && guest.rejectionReason && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-start border-start border-4 border-danger">
              <h6 className="fw-bold mb-3 text-danger d-flex align-items-center gap-2">
                <FaTimesCircle /> Lý Do Từ Chối
              </h6>
              <div className="p-3 bg-danger-subtle text-danger rounded-3 fw-medium">
                {guest.rejectionReason}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal - Front */}
      {showIdFront && (
        <div className="image-modal" onClick={() => setShowIdFront(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowIdFront(false)}>
              ✕
            </button>
            <h3 className="mb-3">Ảnh CCCD Mặt Trước</h3>
            <div className="modal-image-wrapper">
              {guest.idFrontImage ? (
                <img
                  src={`${imgURL}/api/v1/public/profile/image/${guest.idFrontImage}`}
                  alt="Mặt trước CCCD"
                  className="img-fluid w-100 object-fit-contain"
                  style={{ maxHeight: '70vh', borderRadius: '6px' }}
                />
              ) : (
                <div className="modal-image">
                  <FaImage />
                  <p>Ảnh không có sẵn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal - Back */}
      {showIdBack && (
        <div className="image-modal" onClick={() => setShowIdBack(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowIdBack(false)}>
              ✕
            </button>
            <h3 className="mb-3">Ảnh CCCD Mặt Sau</h3>
            <div className="modal-image-wrapper">
              {guest.idBackImage ? (
                <img
                  src={`${imgURL}/api/v1/public/profile/image/${guest.idBackImage}`}
                  alt="Mặt sau CCCD"
                  className="img-fluid w-100 object-fit-contain"
                  style={{ maxHeight: '70vh', borderRadius: '6px' }}
                />
              ) : (
                <div className="modal-image">
                  <FaImage />
                  <p>Ảnh không có sẵn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestDetail;
