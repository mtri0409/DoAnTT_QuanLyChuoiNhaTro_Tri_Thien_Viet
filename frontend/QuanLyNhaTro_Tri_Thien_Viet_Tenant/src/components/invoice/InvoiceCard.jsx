// components/invoice/InvoiceCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClipboardList,
  FaEye,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";
import { fmt, fmtDate, isDueSoon, isOverdue, STATUS_META, TYPE_META } from "../../utils/invoiceUtils";

const InvoiceCard = ({ invoice, isHover, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();
  
  const sm = STATUS_META[invoice.status] || STATUS_META.DRAFT;
  const tm = TYPE_META[invoice.type] || {
    label: invoice.type,
    icon: <FaClipboardList />,
    color: "#6366f1",
  };
  const overdue = isOverdue(invoice.dueDate, invoice.status);
  const dueSoon = isDueSoon(invoice.dueDate);
  const needPay = ["PENDING", "PARTIAL"].includes(invoice.status);

  // Determine border-left class
  let borderClass = "";
  if (overdue) borderClass = "invoice-item overdue";
  else if (needPay) borderClass = "invoice-item need-pay";
  else borderClass = "invoice-item";

  return (
    <div
      className={`px-4 py-3 border-bottom ${borderClass}`}
      style={{ backgroundColor: isHover ? "#f8fafc" : "#fff" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => navigate(`/user/bills/${invoice.invoiceId}`)}
    >
      <div className="d-flex gap-3 align-items-start">
        {/* Status dot */}
        <div className="flex-shrink-0 pt-1">
          <span
            className={`invoice-status-dot d-block ${needPay ? "need-pay" : ""}`}
            style={{ backgroundColor: sm.dot }}
          />
        </div>

        {/* Content */}
        <div className="flex-grow-1 overflow-hidden">
          {/* Title row */}
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span className="fw-semibold text-dark small">
              <span className="me-1" style={{ color: tm.color }}>
                {tm.icon}
              </span>
              {tm.label}
            </span>
            {invoice.type === "MONTHLY" && invoice.periodMonth && (
              <span className="text-secondary small">
                — Tháng {invoice.periodMonth}/{invoice.periodYear}
              </span>
            )}
            <span className={`badge rounded-pill ${sm.badge}`}>
              {sm.label}
            </span>
            {overdue && (
              <span className="badge rounded-pill bg-danger-subtle text-danger">
                Quá hạn
              </span>
            )}
            {dueSoon && !overdue && (
              <span className="badge rounded-pill bg-warning-subtle text-warning">
                 Sắp hết hạn
              </span>
            )}
          </div>

          {/* Amount + due */}
          <div className="d-flex align-items-center gap-3 flex-wrap mb-1">
            <span className="fw-bold fs-5 text-dark invoice-amount">
              {fmt(invoice.totalAmount)}
            </span>
            {invoice.status === "PARTIAL" && invoice.paidAmount > 0 && (
              <span className="text-success small fw-semibold">
                Đã nộp: {fmt(invoice.paidAmount)}
              </span>
            )}
          </div>

          {/* Partial progress bar */}
          {invoice.status === "PARTIAL" && invoice.paidAmount > 0 && (
            <div className="progress rounded-pill mb-2" style={{ height: 4, maxWidth: 200 }}>
              <div
                className="progress-bar bg-success rounded-pill"
                style={{
                  width: `${Math.min(100, (invoice.paidAmount / invoice.totalAmount) * 100)}%`,
                }}
              />
            </div>
          )}

          {/* Meta */}
          <div className="d-flex align-items-center gap-3 flex-wrap small">
            <span className="d-flex align-items-center gap-1 text-secondary">
              <FaCalendarAlt size={10} />
              Hạn:{" "}
              <span
                className={`fw-semibold ms-1 ${
                  overdue ? "text-danger" : dueSoon ? "text-warning" : ""
                }`}
              >
                {fmtDate(invoice.dueDate)}
              </span>
            </span>
            <span className="text-secondary">#{invoice.invoiceId}</span>
            {invoice.roomName && (
              <span className="text-secondary">Phòng {invoice.roomName}</span>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex-shrink-0 d-flex flex-column align-items-end justify-content-center gap-2">
          {needPay ? (
            <span className="badge bg-warning text-dark rounded-3 px-2 py-1 d-flex align-items-center gap-1">
              <FaCreditCard size={10} /> Chưa thanh toán
            </span>
          ) : invoice.status === "PAID" ? (
            <span className="badge bg-success-subtle text-success rounded-3 px-2 py-1 d-flex align-items-center gap-1">
              <FaCheckCircle size={10} /> Đã trả
            </span>
          ) : null}
        </div>
      </div>

      {/* Action bar — slides on hover */}
      <div className={`invoice-action-bar ${isHover ? "show" : "hide"}`}>
        <div className="d-flex gap-2 flex-wrap pt-3 mt-2 border-top" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-sm btn-secondary-subtle text-secondary d-inline-flex align-items-center gap-2 rounded-3 fw-medium"
            onClick={() => navigate(`/user/bills/${invoice.invoiceId}`)}
          >
            <FaEye size={12} /> Xem chi tiết
          </button>
          {needPay && (
            <button
              className="btn btn-sm btn-warning-subtle text-warning-emphasis d-inline-flex align-items-center gap-2 rounded-3 fw-medium"
              onClick={() => navigate(`/user/bills/${invoice.invoiceId}`)}
            >
              <FaCreditCard size={12} /> Thanh toán ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;