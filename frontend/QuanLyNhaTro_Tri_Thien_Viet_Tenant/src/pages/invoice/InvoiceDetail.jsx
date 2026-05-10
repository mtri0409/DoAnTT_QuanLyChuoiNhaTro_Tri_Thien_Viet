import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaShieldAlt,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaCreditCard,
  FaBuilding,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  DRAFT: {
    label: "Nháp",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
    icon: <FaClipboardList />,
  },
  PENDING: {
    label: "Chờ thanh toán",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
    icon: <FaCreditCard />,
  },
  PARTIAL: {
    label: "Còn nợ một phần",
    badge: "bg-warning-subtle text-warning-emphasis",
    dot: "#f97316",
    icon: <FaCreditCard />,
  },
  PAID: {
    label: "Đã thanh toán",
    badge: "bg-success-subtle text-success",
    dot: "#10b981",
    icon: <FaCheckCircle />,
  },
  REFUNDED: {
    label: "Đã hoàn cọc",
    badge: "bg-primary-subtle text-primary",
    dot: "#8b5cf6",
    icon: <FaCheckCircle />,
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-danger-subtle text-danger",
    dot: "#ef4444",
    icon: <FaTimesCircle />,
  },
};

const TYPE_META = {
  MONTHLY: {
    label: "Tiền phòng hàng tháng",
    icon: <FaCalendarAlt />,
    color: "#0ea5e9",
  },
  DEPOSIT: { label: "Tiền cọc", icon: <FaShieldAlt />, color: "#f59e0b" },
  REPAIR: { label: "Chi phí sửa chữa", icon: <FaWrench />, color: "#ef4444" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";

const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const isOverdue = (dueDateStr, status) => {
  if (!dueDateStr || ["PAID", "CANCELLED", "REFUNDED"].includes(status))
    return false;
  return new Date(dueDateStr) < new Date();
};

// ── Component ────────────────────────────────────────────────────────────────

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    apiInvoice
      .getById(invoiceId)
      .then((res) => setInvoice(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div
        className="d-flex flex-column bg-light"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="container py-5 text-center"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div
        className="d-flex flex-column bg-light"
        style={{ minHeight: "100vh" }}
      >
        <div className="container py-5 text-center">
          <FaFileInvoiceDollar size={40} className="text-muted mb-3" />
          <p className="text-muted">Không tìm thấy hóa đơn</p>
          <button
            className="btn btn-outline-primary btn-sm rounded-3"
            onClick={() => navigate("/user/bills")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

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
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      <div
        className="container-fluid py-4 px-3 px-md-5"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Back */}
        <button
          className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-2 small"
          style={{ textDecoration: "none" }}
          onClick={() => navigate("/user/bills")}
        >
          <FaArrowLeft size={12} /> Danh sách hóa đơn
        </button>

        <div className="row g-3">
          {/* ── Left: Main invoice card ── */}
          <div className="col-12 col-md-8">
            {/* Main card */}
            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                  <div>
                    <div
                      className="d-flex align-items-center gap-2 fw-semibold mb-1"
                      style={{ color: tm.color, fontSize: 14 }}
                    >
                      {tm.icon}
                      <span>{tm.label}</span>
                    </div>
                    <div className="text-muted small">
                      Mã hóa đơn:{" "}
                      <strong className="text-dark">
                        #{invoice.invoiceId}
                      </strong>
                    </div>
                    {invoice.type === "MONTHLY" && invoice.periodMonth && (
                      <div className="text-muted small">
                        Kỳ thanh toán: Tháng {invoice.periodMonth}/
                        {invoice.periodYear}
                      </div>
                    )}
                  </div>

                  <span
                    className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${sm.badge}`}
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {sm.icon} {sm.label}
                  </span>
                </div>

                {/* Amount block */}
                <div
                  className="rounded-3 p-3 mb-4"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="text-muted small mb-1">Tổng số tiền</div>
                  <div
                    className="fw-bold"
                    style={{
                      fontSize: 28,
                      color: "#1e293b",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {fmt(invoice.totalAmount)}
                  </div>

                  {invoice.status === "PARTIAL" && invoice.paidAmount > 0 && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-success fw-semibold">
                          Đã nộp: {fmt(invoice.paidAmount)}
                        </span>
                        <span className="text-danger fw-semibold">
                          Còn lại: {fmt(remainAmount)}
                        </span>
                      </div>
                      <div
                        className="progress"
                        style={{ height: 6, borderRadius: 4 }}
                      >
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${Math.min(100, (invoice.paidAmount / invoice.totalAmount) * 100)}%`,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {overdue && (
                    <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small rounded-3">
                      ⚠️ Hóa đơn đã <strong>quá hạn thanh toán</strong> (
                      {fmtDate(invoice.dueDate)}). Vui lòng thanh toán sớm.
                    </div>
                  )}
                </div>

                {/* Info grid */}
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="small text-muted mb-1">Hạn thanh toán</div>
                    <div
                      className={`fw-semibold small d-flex align-items-center gap-1 ${overdue ? "text-danger" : ""}`}
                    >
                      <FaCalendarAlt size={11} />
                      {fmtDate(invoice.dueDate)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted mb-1">Ngày tạo</div>
                    <div className="fw-semibold small">
                      {fmtDate(invoice.createdAt)}
                    </div>
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
                      <div className="fw-semibold small text-truncate">
                        #{invoice.contractId}
                      </div>
                    </div>
                  )}
                  {invoice.status === "PAID" && invoice.paymentMethod && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">Phương thức</div>
                      <div className="fw-semibold small">
                        {invoice.paymentMethod === "VNPAY"
                          ? "💳 VNPay"
                          : invoice.paymentMethod}
                      </div>
                    </div>
                  )}
                  {invoice.status === "PAID" && invoice.paidAt && (
                    <div className="col-6">
                      <div className="small text-muted mb-1">
                        Thời gian thanh toán
                      </div>
                      <div className="fw-semibold small">
                        {fmtDate(invoice.paidAt)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice line items */}
                {invoice.invoiceDetails?.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div
                      className="small fw-semibold text-uppercase text-muted mb-2"
                      style={{ letterSpacing: 1 }}
                    >
                      Chi tiết
                    </div>
                    <div className="d-flex flex-column gap-1">
                      {invoice.invoiceDetails.map((item, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-center py-2 border-bottom"
                        >
                          <div>
                            <div className="small fw-semibold">
                              {item.description ||
                                item.serviceName ||
                                `Khoản ${idx + 1}`}
                            </div>
                            {item.quantity && item.unitPrice && (
                              <div
                                className="text-muted"
                                style={{ fontSize: 11 }}
                              >
                                {item.quantity} × {fmt(item.unitPrice)}
                              </div>
                            )}
                          </div>
                          <div className="fw-bold small">
                            {fmt(item.subTotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {invoice.note && (
                  <div className="alert alert-light rounded-3 mt-3 small mb-0">
                    <strong>Ghi chú:</strong> {invoice.note}
                  </div>
                )}
              </div>
            </div>

            {/* PAID / CANCELLED status cards */}
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

          {/* ── Right: Sidebar actions ── */}
          <div className="col-12 col-md-4">
            {/* Payment CTA */}
            {canPay && (
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body p-3">
                  <div
                    className="small fw-semibold text-uppercase text-muted mb-3"
                    style={{ letterSpacing: 1 }}
                  >
                    <FaCreditCard className="me-1" />
                    Thanh toán
                  </div>

                  {/* Remaining amount highlight */}
                  <div
                    className="rounded-3 p-3 mb-3 text-center"
                    style={{ background: "#fef3c7" }}
                  >
                    <div className="text-warning-emphasis small fw-semibold mb-1">
                      Số tiền cần thanh toán
                    </div>
                    <div
                      className="fw-bold"
                      style={{
                        fontSize: 22,
                        color: "#d97706",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {fmt(remainAmount)}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary fw-semibold w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 mb-2"
                    onClick={() =>
                      navigate(
                        `/payment/${invoice.invoiceId}?amount=${remainAmount}`,
                      )
                    }
                  >
                    <FaCreditCard size={14} />
                    Thanh toán qua VNPay
                  </button>

                  <p className="text-muted small text-center mb-0">
                    🔒 Thanh toán an toàn. Cập nhật <strong>tự động</strong> sau
                    giao dịch.
                  </p>
                </div>
              </div>
            )}

            {/* Invoice meta card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <div
                  className="small fw-semibold text-uppercase text-muted mb-3"
                  style={{ letterSpacing: 1 }}
                >
                  Thông tin
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Trạng thái</span>
                    <span
                      className={`badge rounded-pill ${sm.badge}`}
                      style={{ fontSize: 11 }}
                    >
                      {sm.label}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Loại hóa đơn</span>
                    <span
                      className="small fw-semibold"
                      style={{ color: tm.color }}
                    >
                      {tm.label}
                    </span>
                  </div>
                  {invoice.totalAmount && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Tổng cộng</span>
                      <span className="small fw-bold">
                        {fmt(invoice.totalAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* /col sidebar */}
        </div>
        {/* /row */}
      </div>
    </div>
  );
}
