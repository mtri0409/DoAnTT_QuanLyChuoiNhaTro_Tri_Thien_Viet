// pages/tenant/InvoiceDetail.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaBuilding,
  FaCreditCard,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { fmt, fmtDate, isOverdue, STATUS_META, TYPE_META } from "../../utils/invoiceUtils";
import LoadingSpinner from "../../components/common/LoadingSpiner";
import ErrorState from "../../components/common/ErrorState";
import useInvoiceDetail from "../../../hooks/useInvoiceDetail";
import "../invoice/invoice.css";

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoice, loading } = useInvoiceDetail(invoiceId);
  
  if (loading) return <LoadingSpinner />;
  if (!invoice) return <ErrorState message="Có lỗi trong quá trình tải hóa đơn" />;

  const sm = STATUS_META[invoice.status] || STATUS_META.DRAFT;
  const tm = TYPE_META[invoice.type] || {
    label: invoice.invoiceType,
    icon: <FaClipboardList />,
    color: "#6366f1",
  };

  const overdue = isOverdue(invoice.dueDate, invoice.status);
  const canPay = ["PENDING", "PARTIAL"].includes(invoice.status);
  const remainAmount = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      <div className="container-fluid py-4 px-3 px-md-5" style={{ maxWidth: 1200 }}>
        {/* Back button */}
        <button
          className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-2 small text-decoration-none"
          onClick={() => navigate("/user/bills")}
        >
          <FaArrowLeft size={12} /> Danh sách hóa đơn
        </button>

        <div className="row g-3">
          {/* Left column */}
          <div className="col-12 col-md-8">
            {/* Main card */}
            <div className="card border-0 shadow-sm rounded-4 mb-3 invoice-card">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 fw-semibold mb-1" style={{ color: tm.color, fontSize: 14 }}>
                      {tm.icon}
                      <span>{tm.label}</span>
                    </div>
                    <div className="text-muted small">
                      Mã hóa đơn: <strong className="text-dark">#{invoice.invoiceId}</strong>
                    </div>
                    {invoice.type === "MONTHLY" && invoice.periodMonth && (
                      <div className="text-muted small">
                        Kỳ thanh toán: Tháng {invoice.periodMonth}/{invoice.periodYear}
                      </div>
                    )}
                  </div>

                  <span className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${sm.badge}`}>
                    {sm.icon} {sm.label}
                  </span>
                </div>

                {/* Amount block */}
                <div className="bg-light rounded-3 p-3 mb-4">
                  <div className="text-muted small mb-1">Tổng số tiền</div>
                  <div className="fw-bold invoice-amount-value" style={{ fontSize: 28, color: "#1e293b" }}>
                    {fmt(invoice.totalAmount)}
                  </div>

                  {invoice.status === "PARTIAL" && invoice.paidAmount > 0 && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-success fw-semibold">Đã nộp: {fmt(invoice.paidAmount)}</span>
                        <span className="text-danger fw-semibold">Còn lại: {fmt(remainAmount)}</span>
                      </div>
                      <div className="progress-custom">
                        <div className="progress" style={{ height: 6, borderRadius: 4 }}>
                          <div
                            className="progress-bar bg-success progress-bar-custom"
                            style={{
                              width: `${Math.min(100, (invoice.paidAmount / invoice.totalAmount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {overdue && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small rounded-3">
                      ⚠️ Hóa đơn đã <strong>quá hạn thanh toán</strong> ({fmtDate(invoice.dueDate)}). Vui lòng thanh toán sớm.
                    </div>
                  )}
                </div>

                {/* Info grid - dùng Bootstrap grid */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="small text-muted mb-1">Hạn thanh toán</div>
                    <div className={`fw-semibold small d-flex align-items-center gap-1 ${overdue ? "text-danger" : ""}`}>
                      <FaCalendarAlt size={11} />
                      {fmtDate(invoice.dueDate)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted mb-1">Ngày tạo</div>
                    <div className="fw-semibold small">{fmtDate(invoice.createdAt)}</div>
                  </div>
                  {invoice.roomName && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">Phòng</div>
                      <div className="fw-semibold small d-flex align-items-center gap-1">
                        <FaBuilding size={11} className="text-muted" />
                        {invoice.roomName}
                      </div>
                    </div>
                  )}
                  {invoice.contractId && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">Hợp đồng</div>
                      <div className="fw-semibold small text-truncate">#{invoice.contractId}</div>
                    </div>
                  )}
                  {invoice.status === "PAID" && invoice.paymentMethod && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">Phương thức</div>
                      <div className="fw-semibold small">
                        {invoice.paymentMethod === "VNPAY" ? "💳 VNPay" : invoice.paymentMethod}
                      </div>
                    </div>
                  )}
                  {invoice.status === "PAID" && invoice.paidAt && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">Thời gian thanh toán</div>
                      <div className="fw-semibold small">{fmtDate(invoice.paidAt)}</div>
                    </div>
                  )}
                </div>

                {/* Invoice line items */}
                {invoice.invoiceDetails?.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="small fw-semibold text-uppercase text-muted mb-2">Chi tiết</div>
                    <div className="invoice-details-list">
                      {invoice.invoiceDetails.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <div className="small fw-semibold">
                              {item.description || item.serviceName || `Khoản ${idx + 1}`}
                            </div>
                            {item.quantity && item.unitPrice && (
                              <div className="text-muted" style={{ fontSize: 11 }}>
                                {item.quantity} × {fmt(item.unitPrice)}
                              </div>
                            )}
                          </div>
                          <div className="fw-bold small">{fmt(item.subTotal)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Note */}
                {invoice.note && (
                  <div className="alert alert-light rounded-3 mt-3 small mb-0">
                    <strong>Ghi chú:</strong> {invoice.note}
                  </div>
                )}
              </div>
            </div>

            {/* Status messages */}
            {invoice.status === "PAID" && (
              <div className="alert alert-success d-flex align-items-center gap-2 rounded-4 small">
                <FaCheckCircle /> Hóa đơn này đã được thanh toán đầy đủ.
              </div>
            )}
            {invoice.status === "CANCELLED" && (
              <div className="alert alert-secondary d-flex align-items-center gap-2 rounded-4 small">
                <FaTimesCircle /> Hóa đơn này đã bị hủy.
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="col-12 col-md-4">
            {/* Payment CTA */}
            {canPay && (
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body p-3">
                  <div className="small fw-semibold text-uppercase text-muted mb-3">
                    <FaCreditCard className="me-1" /> Thanh toán
                  </div>

                  <div className="bg-warning bg-opacity-25 rounded-3 p-3 mb-3 text-center">
                    <div className="text-warning-emphasis small fw-semibold mb-1">Số tiền cần thanh toán</div>
                    <div className="fw-bold" style={{ fontSize: 22, color: "#d97706" }}>
                      {fmt(remainAmount)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary fw-semibold w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 mb-2 invoice-payment-button"
                    onClick={() => navigate(`/payment/${invoice.invoiceId}?amount=${remainAmount}`)}
                  >
                    <FaCreditCard size={14} /> Thanh toán qua VNPay
                  </button>

                  <p className="text-muted small text-center mb-0">
                    🔒 Thanh toán an toàn. Cập nhật <strong>tự động</strong> sau giao dịch.
                  </p>
                </div>
              </div>
            )}

            {/* Invoice meta card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <div className="small fw-semibold text-uppercase text-muted mb-3">Thông tin</div>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Trạng thái</span>
                    <span className={`badge rounded-pill ${sm.badge}`} style={{ fontSize: 11 }}>
                      {sm.label}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Loại hóa đơn</span>
                    <span className="small fw-semibold" style={{ color: tm.color }}>
                      {tm.label}
                    </span>
                  </div>
                  {invoice.totalAmount && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Tổng cộng</span>
                      <span className="small fw-bold">{fmt(invoice.totalAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}