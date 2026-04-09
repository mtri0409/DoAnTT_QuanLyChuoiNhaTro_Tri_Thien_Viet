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
    color: "#94a3b8",
    bg: "#f1f5f9",
    icon: <FaClipboardList />,
  },
  PENDING: {
    label: "Chờ thanh toán",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: <FaCreditCard />,
  },
  PARTIAL: {
    label: "Còn nợ một phần",
    color: "#f97316",
    bg: "#ffedd5",
    icon: <FaCreditCard />,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "#10b981",
    bg: "#d1fae5",
    icon: <FaCheckCircle />,
  },
  REFUNDED: {
    label: "Đã hoàn cọc",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: <FaCheckCircle />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#ef4444",
    bg: "#fee2e2",
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2 small">Đang tải hóa đơn...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-5">
        <FaFileInvoiceDollar size={40} className="text-muted mb-3" />
        <p className="text-muted">Không tìm thấy hóa đơn</p>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/user/bills")}
        >
          Quay lại danh sách
        </button>
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
    <div className="container py-4" style={{ maxWidth: 760 }}>
      {/* Back */}
      <button
        className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-2 small"
        onClick={() => navigate("/user/bills")}
      >
        <FaArrowLeft /> Danh sách hóa đơn
      </button>

      {/* ── Card chính ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
            <div>
              <div
                className="d-flex align-items-center gap-2 fw-semibold mb-1"
                style={{ color: tm.color }}
              >
                {tm.icon}
                <span>{tm.label}</span>
              </div>
              <div className="text-muted small">
                Mã hóa đơn:{" "}
                <strong className="text-dark">#{invoice.invoiceId}</strong>
              </div>
              {invoice.type === "MONTHLY" && invoice.periodMonth && (
                <div className="text-muted small">
                  Kỳ thanh toán: Tháng {invoice.periodMonth}/
                  {invoice.periodYear}
                </div>
              )}
            </div>

            <span
              className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1"
              style={{
                background: sm.bg,
                color: sm.color,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {sm.icon} {sm.label}
            </span>
          </div>

          {/* Tổng tiền */}
          <div
            className="rounded-3 p-3 mb-4 text-center"
            style={{ background: "#f8fafc" }}
          >
            <div className="text-muted small mb-1">Tổng số tiền</div>
            <div className="fw-bold" style={{ fontSize: 28, color: "#1e293b" }}>
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
                  style={{ height: 8, borderRadius: 4 }}
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

          {/* Thông tin */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <div className="small text-muted mb-1">Hạn thanh toán</div>
              <div className={`fw-semibold ${overdue ? "text-danger" : ""}`}>
                <FaCalendarAlt className="me-1" size={12} />
                {fmtDate(invoice.dueDate)}
              </div>
            </div>
            <div className="col-6">
              <div className="small text-muted mb-1">Ngày tạo</div>
              <div className="fw-semibold">{fmtDate(invoice.createdAt)}</div>
            </div>
            {invoice.roomName && (
              <div className="col-6">
                <div className="small text-muted mb-1">Phòng</div>
                <div className="fw-semibold d-flex align-items-center gap-1">
                  <FaBuilding size={12} className="text-muted" />
                  {invoice.roomName}
                </div>
              </div>
            )}
            {invoice.contractId && (
              <div className="col-6">
                <div className="small text-muted mb-1">Hợp đồng</div>
                <div className="fw-semibold text-truncate">
                  #{invoice.contractId}
                </div>
              </div>
            )}
            {/* ✅ Hiển thị phương thức thanh toán nếu đã PAID */}
            {invoice.status === "PAID" && invoice.paymentMethod && (
              <div className="col-6">
                <div className="small text-muted mb-1">Phương thức</div>
                <div className="fw-semibold">
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
                <div className="fw-semibold">{fmtDate(invoice.paidAt)}</div>
              </div>
            )}
          </div>

          {/* Chi tiết các dòng hóa đơn */}
          {invoice.invoiceDetails?.length > 0 && (
            <>
              <hr className="my-3" />
              <div
                className="small fw-semibold text-uppercase text-muted mb-2"
                style={{ letterSpacing: 1 }}
              >
                Chi tiết
              </div>
              <div className="d-flex flex-column gap-2">
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

          {invoice.note && (
            <div className="alert alert-light rounded-3 mt-3 small mb-0">
              <strong>Ghi chú:</strong> {invoice.note}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Nút thanh toán — chỉ VNPay, bỏ QR/chuyển khoản */}
      {canPay && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div
              className="small fw-semibold text-uppercase text-muted mb-3"
              style={{ letterSpacing: 1 }}
            >
              <FaCreditCard className="me-2" />
              Thanh toán trực tuyến
            </div>

            <button
              className="btn btn-danger fw-semibold py-2 w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
              onClick={() =>
                navigate(`/payment/${invoice.invoiceId}?amount=${remainAmount}`)
              }
            >
              <FaCreditCard />
              Thanh toán qua VNPay
            </button>

            <p className="text-muted small text-center mt-3 mb-0">
              🔒 Thanh toán an toàn qua cổng VNPay. Trạng thái hóa đơn sẽ được
              cập nhật <strong>tự động</strong> sau khi giao dịch thành công.
            </p>
          </div>
        </div>
      )}

      {invoice.status === "PAID" && (
        <div className="alert alert-success d-flex align-items-center gap-2 rounded-4">
          <FaCheckCircle /> Hóa đơn này đã được thanh toán đầy đủ.
        </div>
      )}

      {invoice.status === "CANCELLED" && (
        <div className="alert alert-secondary d-flex align-items-center gap-2 rounded-4">
          <FaTimesCircle /> Hóa đơn này đã bị hủy.
        </div>
      )}
    </div>
  );
}
