import React, { useState, useEffect } from 'react';
import {
  FaList, FaCheckCircle, FaClock, FaTimesCircle,
  FaEye, FaTrash, FaMotorcycle, FaUser, FaPhone,
  FaCalendar, FaIdCard
} from 'react-icons/fa';
import apiGuestRegistration from '../../api/apiGuestRegistration';
import { notify } from '../../utils/swalUtils';
import './GuestList.css';

const GuestList = ({ onViewDetail, onRegisterNew }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await apiGuestRegistration.getMyGuests();
      setGuests(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Lỗi lấy danh sách:', error);
      notify('Lỗi lấy danh sách người thân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn này?')) {
      try {
        await apiGuestRegistration.cancelRegistration(memberId);
        notify('Đơn đã hủy', 'success');
        fetchGuests();
      } catch (error) {
        notify('Lỗi hủy đơn', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { cls: 'bg-warning-subtle text-warning', label: 'Chờ duyệt', icon: FaClock },
      APPROVED: { cls: 'bg-success-subtle text-success', label: 'Đã duyệt', icon: FaCheckCircle },
      REJECTED: { cls: 'bg-danger-subtle text-danger', label: 'Bị từ chối', icon: FaTimesCircle },
      CANCELLED: { cls: 'bg-secondary-subtle text-secondary', label: 'Đã hủy', icon: FaTimesCircle }
    };

    const statusInfo = statusMap[status] || statusMap.PENDING;
    const Icon = statusInfo.icon;

    return (
      <span className={`badge rounded-pill fw-normal px-3 py-2 ${statusInfo.cls}`}>
        <Icon className="me-1" /> {statusInfo.label}
      </span>
    );
  };

  const filteredGuests = guests.filter(guest => {
    if (filterStatus === 'all') return true;
    return guest.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 text-muted">
        <span className="spinner-border spinner-border-sm me-2" /> Đang tải...
      </div>
    );
  }

  return (
    <div className="container px-0 py-2 text-start">

      {/* Filter */}
      <ul className="nav nav-pills mb-4 bg-white p-1 rounded-3 shadow-sm d-inline-flex border">
        <li className="nav-item">
          <button
            className={`nav-link px-3 py-2 fw-semibold ${filterStatus === 'all' ? 'active' : 'text-muted bg-transparent border-0'}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả ({guests.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link px-3 py-2 fw-semibold ${filterStatus === 'PENDING' ? 'active' : 'text-muted bg-transparent border-0'}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            Chờ duyệt ({guests.filter(g => g.status === 'PENDING').length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link px-3 py-2 fw-semibold ${filterStatus === 'APPROVED' ? 'active' : 'text-muted bg-transparent border-0'}`}
            onClick={() => setFilterStatus('APPROVED')}
          >
            Đã duyệt ({guests.filter(g => g.status === 'APPROVED').length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link px-3 py-2 fw-semibold ${filterStatus === 'REJECTED' ? 'active' : 'text-muted bg-transparent border-0'}`}
            onClick={() => setFilterStatus('REJECTED')}
          >
            Từ chối ({guests.filter(g => g.status === 'REJECTED').length})
          </button>
        </li>
      </ul>

      {/* Guest Cards Grid */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-5 text-muted bg-white rounded-4 shadow-sm border">
          <FaUser className="fs-3 mb-2 d-block mx-auto text-secondary" />
          Chưa có người thân nào được đăng ký
        </div>
      ) : (
        <div className="row g-4">
          {filteredGuests.map(guest => (
            <div key={guest.memberId} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">{guest.fullName}</h5>
                    <span className="small text-muted fw-semibold">
                      {guest.relationship} — {guest.memberType === 'STAYING_WITH' ? 'Ở nhờ' : 'Khách chơi'}
                    </span>
                  </div>
                  {getStatusBadge(guest.status)}
                </div>

                <div className="text-start border-top pt-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                    <FaPhone className="text-primary" />
                    <span>{guest.phone}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                    <FaIdCard className="text-info" />
                    <span>{guest.identityNumber}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FaCalendar className="text-secondary" />
                    <span>{new Date(guest.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Vehicles */}
                {guest.vehicles && guest.vehicles.length > 0 && (
                  <div className="border-top pt-3 mb-3 text-start">
                    <label className="small text-muted fw-bold mb-2 d-block text-uppercase">Xe Đăng Ký:</label>
                    <div className="d-flex flex-wrap gap-1">
                      {guest.vehicles.map((vehicle, idx) => (
                        <span key={idx} className="badge bg-light text-dark border px-2 py-1 fw-semibold">
                          {vehicle.licensePlate} ({vehicle.brand})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {guest.status === 'REJECTED' && guest.rejectionReason && (
                  <div className="bg-danger-subtle text-danger small p-2 rounded-3 text-start mb-3 border border-danger-subtle">
                    <strong>Lý do từ chối:</strong> {guest.rejectionReason}
                  </div>
                )}

                {/* Approval Info */}
                {guest.approvedAt && (
                  <div className="text-muted small text-start border-top pt-2 mb-3" style={{ fontSize: '11px' }}>
                    Đã duyệt: {new Date(guest.approvedAt).toLocaleString('vi-VN')}
                    {guest.approvedByName && ` bởi ${guest.approvedByName}`}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto d-flex gap-2">
                  <button
                    className="btn btn-sm btn-light border flex-grow-1 py-2 rounded-3 fw-bold"
                    onClick={() => onViewDetail(guest.memberId)}
                  >
                    <FaEye className="me-1 text-primary" /> Chi tiết
                  </button>

                  {guest.status === 'PENDING' && (
                    <button
                      className="btn btn-sm btn-outline-danger flex-grow-1 py-2 rounded-3 fw-bold"
                      onClick={() => handleCancel(guest.memberId)}
                    >
                      <FaTrash className="me-1" /> Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestList;
