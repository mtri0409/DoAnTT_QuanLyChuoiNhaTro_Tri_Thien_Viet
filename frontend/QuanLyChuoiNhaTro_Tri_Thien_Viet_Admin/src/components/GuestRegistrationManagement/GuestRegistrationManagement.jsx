import React, { useState, useEffect } from 'react';
import {
  FaList, FaCheckCircle, FaClock, FaTimesCircle,
  FaEye, FaCheck, FaTimes, FaUser, FaPhone,
  FaCalendar, FaIdCard, FaMotorcycle, FaUserCheck
} from 'react-icons/fa';
import apiGuestRegistrationAdmin from '../../api/apiGuestRegistrationAdmin';
import { imgURL } from '../../api/config';
import Pagination from '../Pagination';
import './GuestRegistrationManagement.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const GuestRegistrationManagement = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [pageNumber, pageSize]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await apiGuestRegistrationAdmin.getPendingRegistrations(pageNumber, pageSize);
      setRegistrations(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Lỗi:', error);
      toast.error('Lỗi lấy danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleApproveClick = (registration) => {
    setSelectedRegistration(registration);
    setApprovalAction('approve');
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = (registration) => {
    setSelectedRegistration(registration);
    setApprovalAction('reject');
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRegistration) return;

    try {
      setApprovalLoading(true);
      await apiGuestRegistrationAdmin.approveRegistration(selectedRegistration.memberId);
      toast.success('Đơn được duyệt thành công', 'success');
      setShowApprovalModal(false);
      fetchRegistrations();
    } catch (error) {
      toast.error('Lỗi duyệt đơn', 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration) return;

    if (!rejectionReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }

    try {
      setApprovalLoading(true);
      await apiGuestRegistrationAdmin.rejectRegistration(
        selectedRegistration.memberId,
        rejectionReason
      );
      toast.success('Đơn đã từ chối', 'success');
      setShowApprovalModal(false);
      fetchRegistrations();
    } catch (error) {
      toast.error ('Lỗi từ chối đơn', 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 text-muted">
        <span className="spinner-border spinner-border-sm me-2" /> Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ ĐĂNG KÝ NGƯỜI THÂN</h4>
          <p className="text-muted small mb-0">
            Duyệt và xem danh sách đăng ký người thân ở nhờ hoặc đến chơi của khách thuê
          </p>
        </div>
        <div className="bg-light rounded-3 px-3 py-2 border shadow-sm">
          Tổng đơn chờ duyệt: <strong className="text-primary fs-5">{totalElements}</strong>
        </div>
      </div>

      {/* Nav Tabs: Chuyển đổi đối tượng quản lý */}
      <ul className="nav nav-pills mb-4 bg-white p-1 rounded-3 shadow-sm d-inline-flex border">
        <li className="nav-item">
          <button
            className="nav-link px-4 py-2 fw-semibold text-muted"
            onClick={() => navigate('/profiles', { state: { viewType: 'TENANT' } })}
          >
            Khách thuê phòng
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link px-4 py-2 fw-semibold text-muted"
            onClick={() => navigate('/profiles', { state: { viewType: 'SYSTEM' } })}
          >
            Nhân sự hệ thống
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link px-4 py-2 fw-semibold active"
            disabled
          >
            Khách tạm trú
          </button>
        </li>
      </ul>

      {/* Card Table */}
      <div className="card border-0 shadow-sm rounded-3">
        {registrations.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaClock className="fs-3 mb-2 d-block mx-auto text-secondary" />
            Không có đơn đăng ký nào đang chờ duyệt.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted small text-uppercase">
                    <th className="ps-4 py-3">Tên Người Thân</th>
                    <th>Mối Quan Hệ</th>
                    <th>Phòng / Chi nhánh</th>
                    <th>Loại</th>
                    <th>SĐT</th>
                    <th>CCCD</th>
                    <th>Xe</th>
                    <th>Ngày Đăng Ký</th>
                    <th className="text-end pe-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.memberId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <FaUser className="text-secondary" />
                          <span className="fw-bold">{reg.fullName}</span>
                        </div>
                      </td>
                      <td>{reg.relationship}</td>
                      <td>
                        <div className="room-info">
                          <strong className="text-dark">{reg.roomName || 'N/A'}</strong>
                          <span className="text-muted small d-block">{reg.branchName}</span>
                        </div>
                      </td>
                      <td>
                        {reg.memberType === 'STAYING_WITH' ? (
                          <span className="badge rounded-pill bg-info-subtle text-info fw-normal">Ở nhờ</span>
                        ) : (
                          <span className="badge rounded-pill bg-warning-subtle text-warning fw-normal">Khách chơi</span>
                        )}
                      </td>
                      <td className="small">{reg.phone}</td>
                      <td className="identity-cell small text-muted">{reg.identityNumber}</td>
                      <td>
                        {reg.vehicles && reg.vehicles.length > 0 ? (
                          <span className="badge bg-light text-dark border px-2 py-1 fw-semibold">
                            <FaMotorcycle className="me-1" /> {reg.vehicles.length}
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="small">
                        {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            onClick={() => handleViewDetail(reg)}
                            title="Xem chi tiết"
                          >
                            <FaEye className="text-info" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            onClick={() => handleApproveClick(reg)}
                            title="Duyệt"
                          >
                            <FaCheck className="text-success" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            onClick={() => handleRejectClick(reg)}
                            title="Từ chối"
                          >
                            <FaTimes className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
                <small className="text-muted">Tổng số: {totalElements} đơn</small>
                <Pagination
                  currentPage={pageNumber - 1}
                  totalPages={totalPages}
                  onPageChange={(page) => setPageNumber(page + 1)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow rounded-4 p-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold">Chi Tiết Đơn Đăng Ký</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body py-3">
                {/* Thông tin cá nhân */}
                <h6 className="fw-bold mb-3 border-bottom pb-2 text-secondary">Thông Tin Cá Nhân</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">HỌ TÊN</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.fullName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">MỐI QUAN HỆ</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.relationship}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">PHÒNG ĐĂNG KÝ</label>
                    <p className="fw-bold text-primary mb-0">{selectedRegistration.roomName || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">CHI NHÁNH</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.branchName || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">SỐ ĐIỆN THOẠI</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">EMAIL</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.email || '-'}</p>
                  </div>
                  <div className="col-12">
                    <label className="small text-muted fw-bold d-block mb-1">ĐỊA CHỈ</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.address || '-'}</p>
                  </div>
                </div>

                {/* Giấy tờ tùy thân */}
                <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2 text-secondary">Giấy Tờ Tùy Thân</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">SỐ CCCD</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.identityNumber}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">NƠI CẤP</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.idIssuePlace || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">NGÀY CẤP</label>
                    <p className="fw-semibold mb-0">{selectedRegistration.idIssueDate || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted fw-bold d-block mb-1">HẾT HẠN</label>
                    <p className="fw-semibold text-danger mb-0">{selectedRegistration.idExpirationDate || '-'}</p>
                  </div>
                </div>

                {/* ID Images */}
                <div className="row g-3 mt-3">
                  <div className="col-md-6">
                    <span className="small text-muted fw-bold d-block mb-2 text-uppercase">Mặt trước CCCD</span>
                    {selectedRegistration.idFrontImage ? (
                      <div className="rounded border bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative" style={{ height: '150px' }}>
                        <img
                          src={`${imgURL}/api/v1/public/profile/image/${selectedRegistration.idFrontImage}`}
                          alt="Mặt trước"
                          className="img-fluid h-100 w-100 object-fit-contain"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onClick={() => setZoomedImage(`${imgURL}/api/v1/public/profile/image/${selectedRegistration.idFrontImage}`)}
                          title="Click để phóng to"
                        />
                      </div>
                    ) : (
                      <div className="rounded border bg-light d-flex align-items-center justify-content-center text-muted small" style={{ height: '150px' }}>
                        Chưa tải lên mặt trước
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <span className="small text-muted fw-bold d-block mb-2 text-uppercase">Mặt sau CCCD</span>
                    {selectedRegistration.idBackImage ? (
                      <div className="rounded border bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative" style={{ height: '150px' }}>
                        <img
                          src={`${imgURL}/api/v1/public/profile/image/${selectedRegistration.idBackImage}`}
                          alt="Mặt sau"
                          className="img-fluid h-100 w-100 object-fit-contain"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onClick={() => setZoomedImage(`${imgURL}/api/v1/public/profile/image/${selectedRegistration.idBackImage}`)}
                          title="Click để phóng to"
                        />
                      </div>
                    ) : (
                      <div className="rounded border bg-light d-flex align-items-center justify-content-center text-muted small" style={{ height: '150px' }}>
                        Chưa tải lên mặt sau
                      </div>
                    )}
                  </div>
                </div>

                {/* Xe đăng ký */}
                {selectedRegistration.vehicles && selectedRegistration.vehicles.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3 border-bottom pb-2 text-secondary">Xe Đăng Ký</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedRegistration.vehicles.map((v, idx) => (
                        <div key={idx} className="badge bg-light text-dark border px-3 py-2 fw-semibold">
                          {v.licensePlate} ({v.brand})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 shadow-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRegistration && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
          onClick={() => setShowApprovalModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow rounded-4 p-4">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold">
                  {approvalAction === 'approve' ? 'Duyệt Đơn Đăng Ký' : 'Từ Chối Đơn Đăng Ký'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={approvalLoading}
                />
              </div>
              <div className="modal-body py-3">
                <p className="text-muted small mb-3">
                  {approvalAction === 'approve'
                    ? `Xác nhận duyệt đơn đăng ký của người thân: ${selectedRegistration.fullName}?`
                    : `Xác nhận từ chối đơn đăng ký của người thân: ${selectedRegistration.fullName}?`}
                </p>

                {approvalAction === 'reject' && (
                  <div className="form-group mb-0">
                    <label className="small text-muted fw-bold mb-2">LÝ DO TỪ CHỐI *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối..."
                      required
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={approvalLoading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={`btn flex-fill fw-bold ${approvalAction === 'approve' ? 'btn-success text-white' : 'btn-danger'}`}
                  onClick={approvalAction === 'approve' ? handleApprove : handleReject}
                  disabled={approvalLoading}
                >
                  {approvalLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  {approvalAction === 'approve' ? 'Duyệt' : 'Từ Chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Image Modal */}
      {zoomedImage && (
        <div className="image-zoom-overlay" onClick={() => setZoomedImage(null)}>
          <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Phóng to" className="zoomed-image" />
            <button className="zoom-close-btn" onClick={() => setZoomedImage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRegistrationManagement;
