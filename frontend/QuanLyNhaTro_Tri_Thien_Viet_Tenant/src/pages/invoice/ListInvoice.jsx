import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaShieldAlt,
  FaWrench,
  FaClipboardList,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  DRAFT: {
    label: "Nháp",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
  },
  PENDING: {
    label: "Chờ thanh toán",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
  },
  PARTIAL: {
    label: "Thanh toán một phần",
    badge: "bg-orange-subtle text-warning-emphasis",
    dot: "#f97316",
  },
  PAID: {
    label: "Đã thanh toán",
    badge: "bg-success-subtle text-success",
    dot: "#10b981",
  },
  REFUNDED: {
    label: "Đã hoàn cọc",
    badge: "bg-primary-subtle text-primary",
    dot: "#8b5cf6",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-danger-subtle text-danger",
    dot: "#ef4444",
  },
};

const TYPE_META = {
  MONTHLY: {
    label: "Tiền phòng tháng",
    icon: <FaCalendarAlt />,
    color: "#0ea5e9",
  },
  DEPOSIT: { label: "Tiền cọc", icon: <FaShieldAlt />, color: "#f59e0b" },
  REPAIR: { label: "Sửa chữa", icon: <FaWrench />, color: "#ef4444" },
};

const TABS = [
  { key: "NEED_PAY", label: "Cần thanh toán", urgent: true },
  { key: "ALL", label: "Tất cả" },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "CANCELLED", label: "Đã hủy" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";

const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const isDueSoon = (dueDateStr) => {
  if (!dueDateStr) return false;
  const diff = new Date(dueDateStr) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

const isOverdue = (dueDateStr, status) => {
  if (!dueDateStr || ["PAID", "CANCELLED", "REFUNDED"].includes(status))
    return false;
  return new Date(dueDateStr) < new Date();
};

const tabToStatusParam = (tabKey) => {
  if (tabKey === "NEED_PAY" || tabKey === "ALL") return undefined;
  return tabKey || undefined;
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ListInvoice() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState("NEED_PAY");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [urgentCount, setUrgentCount] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "NEED_PAY") {
        const [pendingRes, partialRes] = await Promise.all([
          apiInvoice.getMyInvoices(
            { status: "PENDING", year: yearFilter || undefined },
            1,
            50,
          ),
          apiInvoice.getMyInvoices(
            { status: "PARTIAL", year: yearFilter || undefined },
            1,
            50,
          ),
        ]);
        const pendingData = pendingRes?.data ?? pendingRes;
        const partialData = partialRes?.data ?? partialRes;
        const combined = [
          ...(pendingData?.content || []),
          ...(partialData?.content || []),
        ].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
        setInvoices(combined);
        setTotalPages(1);
        setTotalElements(combined.length);
        setUrgentCount(combined.length);
      } else if (activeTab === "ALL") {
        // Gộp tất cả status: PENDING + PARTIAL + PAID + CANCELLED + REFUNDED
        const statuses = [
          "PENDING",
          "PARTIAL",
          "PAID",
          "CANCELLED",
          "REFUNDED",
        ];
        const results = await Promise.all(
          statuses.map((s) =>
            apiInvoice.getMyInvoices(
              { status: s, year: yearFilter || undefined },
              1,
              50,
            ),
          ),
        );
        const combined = results
          .flatMap((res) => {
            const data = res?.data ?? res;
            return data?.content || [];
          })
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          );
        setInvoices(combined);
        setTotalPages(1);
        setTotalElements(combined.length);
      } else {
        const res = await apiInvoice.getMyInvoices(
          { status: activeTab, year: yearFilter || undefined },
          pageNumber,
          10,
        );
        const data = res?.data ?? res;
        setInvoices(data?.content || []);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, yearFilter, pageNumber]);

  const fetchUrgentCount = useCallback(async () => {
    try {
      const [p, pa] = await Promise.all([
        apiInvoice.getMyInvoices({ status: "PENDING" }, 1, 1),
        apiInvoice.getMyInvoices({ status: "PARTIAL" }, 1, 1),
      ]);
      const pd = p?.data ?? p;
      const pad = pa?.data ?? pa;
      setUrgentCount((pd?.totalElements || 0) + (pad?.totalElements || 0));
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  useEffect(() => {
    fetchUrgentCount();
  }, [fetchUrgentCount]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPageNumber(1);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      <div
        className="container-fluid py-4 px-3 px-md-5"
        style={{ maxWidth: 1400, margin: "0 auto" }}
      >
        {/* ── Header ── */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center bg-primary-subtle"
              style={{ width: 40, height: 40 }}
            >
              <FaFileInvoiceDollar
                className="text-primary"
                style={{ fontSize: 18 }}
              />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ letterSpacing: "-0.3px" }}>
                Hóa đơn của tôi
              </h5>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Quản lý và thanh toán các hóa đơn phòng trọ
              </div>
            </div>
          </div>

          {activeTab !== "ALL" && (
            <select
              className="form-select form-select-sm rounded-3"
              style={{ width: "auto", fontSize: 13 }}
              value={yearFilter ?? currentYear}
              onChange={(e) => {
                setYearFilter(Number(e.target.value));
                setPageNumber(1);
              }}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Urgent Banner ── */}
        {urgentCount > 0 && activeTab !== "NEED_PAY" && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between rounded-3 py-2 px-3 mb-3 small">
            <span className="d-flex align-items-center gap-2">
              <FaBell />
              Bạn có <strong>{urgentCount} hóa đơn</strong> cần thanh toán
            </span>
            <button
              className="btn btn-warning btn-sm rounded-3 fw-semibold"
              style={{ fontSize: 12 }}
              onClick={() => handleTabChange("NEED_PAY")}
            >
              Xem ngay
            </button>
          </div>
        )}

        {/* ── Row: sidebar + list ── */}
        <div className="row g-3">
          {/* Sidebar */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-2">
              <div
                className="small fw-semibold text-uppercase text-muted px-2 pt-1 pb-2"
                style={{ letterSpacing: 1, fontSize: 11 }}
              >
                Lọc theo trạng thái
              </div>
              <div className="d-flex flex-column gap-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`btn btn-sm text-start rounded-3 d-flex align-items-center justify-content-between px-3 py-2 ${
                        isActive
                          ? "btn-primary fw-semibold"
                          : "btn-light text-secondary fw-medium"
                      }`}
                      style={{ fontSize: 13 }}
                    >
                      <span className="d-flex align-items-center gap-2">
                        {tab.urgent && <FaBell size={11} />}
                        {tab.label}
                      </span>
                      {tab.urgent && urgentCount > 0 && (
                        <span
                          className={`badge rounded-pill ${isActive ? "bg-white text-primary" : "bg-danger text-white"}`}
                          style={{ fontSize: 10 }}
                        >
                          {urgentCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="col-12 col-md-9">
            {/* Summary row */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">
                {loading ? "Đang tải..." : `${totalElements} hóa đơn`}
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <div
                  className="spinner-border spinner-border-sm text-primary mb-2"
                  role="status"
                />
                <p className="text-muted small mb-0">Đang tải hóa đơn...</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && invoices.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <FaFileInvoiceDollar
                  size={36}
                  className="text-muted mb-3 mx-auto d-block"
                />
                <p className="text-muted mb-0">Không có hóa đơn nào</p>
              </div>
            )}

            {/* Invoice list */}
            {!loading && invoices.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {invoices.map((inv, idx) => {
                  const sm = STATUS_META[inv.status] || STATUS_META.DRAFT;
                  const tm = TYPE_META[inv.type] || {
                    label: inv.type,
                    icon: <FaClipboardList />,
                    color: "#6366f1",
                  };
                  const overdue = isOverdue(inv.dueDate, inv.status);
                  const dueSoon = isDueSoon(inv.dueDate);
                  const needPay = ["PENDING", "PARTIAL"].includes(inv.status);
                  const isHov = hoveredId === inv.invoiceId;

                  return (
                    <div
                      key={inv.invoiceId}
                      className={`px-4 py-3 ${idx < invoices.length - 1 ? "border-bottom" : ""}`}
                      style={{
                        background: isHov ? "#f8fafc" : "#fff",
                        transition: "background 0.15s",
                        cursor: "pointer",
                        borderLeft: overdue
                          ? "3px solid #ef4444"
                          : needPay
                            ? "3px solid #f59e0b"
                            : "3px solid transparent",
                      }}
                      onMouseEnter={() => setHoveredId(inv.invoiceId)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => navigate(`/user/bills/${inv.invoiceId}`)}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        {/* Status dot */}
                        <div className="flex-shrink-0 pt-1">
                          <span
                            className="d-block rounded-circle"
                            style={{
                              width: 10,
                              height: 10,
                              background: sm.dot,
                              boxShadow: needPay
                                ? `0 0 0 3px ${sm.dot}30`
                                : "none",
                              marginTop: 4,
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1 overflow-hidden">
                          {/* Title row */}
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span
                              className="fw-semibold text-dark"
                              style={{ fontSize: 14 }}
                            >
                              <span
                                className="me-1"
                                style={{ color: tm.color }}
                              >
                                {tm.icon}
                              </span>
                              {tm.label}
                            </span>
                            {inv.type === "MONTHLY" && inv.periodMonth && (
                              <span
                                className="text-secondary"
                                style={{ fontSize: 12 }}
                              >
                                — Tháng {inv.periodMonth}/{inv.periodYear}
                              </span>
                            )}
                            <span
                              className={`badge rounded-pill ${sm.badge}`}
                              style={{ fontSize: 11 }}
                            >
                              {sm.label}
                            </span>
                            {overdue && (
                              <span
                                className="badge rounded-pill bg-danger-subtle text-danger"
                                style={{ fontSize: 11 }}
                              >
                                ⚠ Quá hạn
                              </span>
                            )}
                            {dueSoon && !overdue && (
                              <span
                                className="badge rounded-pill bg-warning-subtle text-warning"
                                style={{ fontSize: 11 }}
                              >
                                ⏰ Sắp hết hạn
                              </span>
                            )}
                          </div>

                          {/* Amount + due */}
                          <div className="d-flex align-items-center gap-3 flex-wrap mb-1">
                            <span
                              className="fw-bold"
                              style={{
                                fontSize: 18,
                                color: "#1e293b",
                                letterSpacing: "-0.5px",
                              }}
                            >
                              {fmt(inv.totalAmount)}
                            </span>
                            {inv.status === "PARTIAL" && inv.paidAmount > 0 && (
                              <span className="text-success small fw-semibold">
                                Đã nộp: {fmt(inv.paidAmount)}
                              </span>
                            )}
                          </div>

                          {/* Partial progress bar */}
                          {inv.status === "PARTIAL" && inv.paidAmount > 0 && (
                            <div
                              className="progress rounded-pill mb-2"
                              style={{ height: 4, maxWidth: 200 }}
                            >
                              <div
                                className="progress-bar bg-success rounded-pill"
                                style={{
                                  width: `${Math.min(100, (inv.paidAmount / inv.totalAmount) * 100)}%`,
                                }}
                              />
                            </div>
                          )}

                          {/* Meta */}
                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <span
                              className="d-flex align-items-center gap-1 text-secondary"
                              style={{ fontSize: 12 }}
                            >
                              <FaCalendarAlt size={10} />
                              Hạn:{" "}
                              <span
                                className={`fw-semibold ms-1 ${overdue ? "text-danger" : dueSoon ? "text-warning" : ""}`}
                              >
                                {fmtDate(inv.dueDate)}
                              </span>
                            </span>
                            <span
                              className="text-secondary"
                              style={{ fontSize: 11 }}
                            >
                              #{inv.invoiceId}
                            </span>
                            {inv.roomName && (
                              <span
                                className="text-secondary"
                                style={{ fontSize: 11 }}
                              >
                                🏠 {inv.roomName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: CTA */}
                        <div className="flex-shrink-0 d-flex flex-column align-items-end justify-content-center gap-2">
                          {needPay ? (
                            <span
                              className="badge bg-warning text-dark rounded-3 px-2 py-1 d-flex align-items-center gap-1"
                              style={{ fontSize: 11, fontWeight: 700 }}
                            >
                              <FaCreditCard size={10} /> Chưa thanh toán
                            </span>
                          ) : inv.status === "PAID" ? (
                            <span
                              className="badge bg-success-subtle text-success rounded-3 px-2 py-1 d-flex align-items-center gap-1"
                              style={{ fontSize: 11 }}
                            >
                              <FaCheckCircle size={10} /> Đã trả
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Action bar — slides on hover */}
                      <div
                        style={{
                          maxHeight: isHov ? 48 : 0,
                          overflow: "hidden",
                          transition: "max-height .22s cubic-bezier(.4,0,.2,1)",
                        }}
                      >
                        <div
                          className="d-flex gap-2 flex-wrap pt-3 mt-2 border-top"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn btn-sm btn-secondary-subtle text-secondary d-inline-flex align-items-center gap-2 rounded-3 fw-medium"
                            onClick={() =>
                              navigate(`/user/bills/${inv.invoiceId}`)
                            }
                          >
                            <FaEye size={12} /> Xem chi tiết
                          </button>
                          {needPay && (
                            <button
                              className="btn btn-sm btn-warning-subtle text-warning-emphasis d-inline-flex align-items-center gap-2 rounded-3 fw-medium"
                              onClick={() =>
                                navigate(`/user/bills/${inv.invoiceId}`)
                              }
                            >
                              <FaCreditCard size={12} /> Thanh toán ngay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && activeTab !== "NEED_PAY" && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPageNumber(i + 1)}
                    className={`btn btn-sm px-3 rounded-3 ${
                      i + 1 === pageNumber
                        ? "btn-primary shadow-sm fw-semibold"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
          {/* /col list */}
        </div>
        {/* /row */}
      </div>
    </div>
  );
}
