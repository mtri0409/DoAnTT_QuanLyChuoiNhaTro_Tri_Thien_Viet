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
  FaExclamationTriangle,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  DRAFT: { label: "Nháp", color: "#94a3b8", bg: "#f1f5f9" },
  PENDING: { label: "Chờ thanh toán", color: "#f59e0b", bg: "#fef3c7" },
  PARTIAL: { label: "Thanh toán một phần", color: "#f97316", bg: "#ffedd5" },
  PAID: { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  REFUNDED: { label: "Đã hoàn cọc", color: "#8b5cf6", bg: "#ede9fe" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
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

// Tab cấu hình: value null = tất cả, "NEED_PAY" = PENDING+PARTIAL
const TABS = [
  { key: "NEED_PAY", label: "Cần thanh toán", urgent: true },
  { key: "", label: "Tất cả" },
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

// Resolve tab key → status param cho API
const tabToStatusParam = (tabKey) => {
  if (tabKey === "NEED_PAY") return undefined; // sẽ fetch 2 lần hoặc dùng filter phía FE
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
  const [activeTab, setActiveTab] = useState("NEED_PAY"); // mặc định tab "Cần thanh toán"
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [urgentCount, setUrgentCount] = useState(0);

  // Fetch danh sách — khi tab là NEED_PAY, fetch PENDING rồi merge PARTIAL
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "NEED_PAY") {
        // Fetch PENDING + PARTIAL song song
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
      } else {
        const res = await apiInvoice.getMyInvoices(
          {
            status: tabToStatusParam(activeTab),
            year: yearFilter || undefined,
          },
          pageNumber,
          8,
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

  // Fetch badge count cho tab "Cần thanh toán"
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
      console.log(e)
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
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{ maxWidth: 1100 }}
    >
      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40, background: "#eff6ff" }}
          >
            <FaFileInvoiceDollar style={{ color: "#3b82f6", fontSize: 18 }} />
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

        {/* Year selector */}
        <select
          className="form-select form-select-sm rounded-3"
          style={{ width: "auto", fontSize: 13, borderColor: "#e2e8f0" }}
          value={yearFilter}
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
      </div>

      {/* ── Urgent Banner (chỉ hiện khi có hóa đơn cần thanh toán và đang ở tab khác) ── */}
      {urgentCount > 0 && activeTab !== "NEED_PAY" && (
        <div
          className="d-flex align-items-center justify-content-between rounded-3 p-3 mb-3"
          style={{
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            cursor: "pointer",
          }}
          onClick={() => handleTabChange("NEED_PAY")}
        >
          <div className="d-flex align-items-center gap-2">
            <FaBell style={{ color: "#d97706" }} />
            <span className="small fw-semibold" style={{ color: "#92400e" }}>
              Bạn có <strong>{urgentCount}</strong> hóa đơn cần thanh toán
            </span>
          </div>
          <span
            className="small text-decoration-underline"
            style={{ color: "#d97706" }}
          >
            Xem ngay →
          </span>
        </div>
      )}

      {/* ── Tabs ── */}
      <div
        className="d-flex gap-2 mb-4 p-1 rounded-3"
        style={{
          background: "#f1f5f9",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className="btn btn-sm rounded-2 d-flex align-items-center gap-2 flex-shrink-0"
              style={{
                background: isActive ? "#fff" : "transparent",
                color: isActive
                  ? tab.urgent
                    ? "#d97706"
                    : "#1e293b"
                  : "#64748b",
                border: "none",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                padding: "6px 14px",
                fontSize: 13,
                transition: "all 0.15s",
              }}
            >
              {tab.urgent && (
                <FaExclamationTriangle size={11} style={{ color: "#f59e0b" }} />
              )}
              {tab.label}
              {tab.urgent && urgentCount > 0 && (
                <span
                  className="rounded-pill px-2"
                  style={{
                    background: "#f59e0b",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "18px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {urgentCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: 28, height: 28 }}
          />
          <p className="text-muted mt-3 small">Đang tải hóa đơn...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-5">
          <FaClipboardList size={36} className="text-muted mb-3" />
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            {activeTab === "NEED_PAY"
              ? "Không có hóa đơn nào cần thanh toán 🎉"
              : "Không có hóa đơn nào"}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {invoices.map((inv) => {
            const sm = STATUS_META[inv.status] || STATUS_META.DRAFT;
            const tm = TYPE_META[inv.type] || {
              label: inv.type,
              icon: <FaClipboardList />,
              color: "#6366f1",
            };
            const overdue = isOverdue(inv.dueDate, inv.status);
            const dueSoon = isDueSoon(inv.dueDate);
            const needPay = ["PENDING", "PARTIAL"].includes(inv.status);

            return (
              <div className="col-12 col-md-6 col-xl-4" key={inv.invoiceId}>
                <div
                  className="card h-100 rounded-4"
                  style={{
                    border: overdue
                      ? "1.5px solid #fca5a5"
                      : needPay
                        ? "1.5px solid #fcd34d"
                        : "1.5px solid #e2e8f0",
                    boxShadow: needPay
                      ? "0 2px 12px rgba(245,158,11,0.1)"
                      : "0 1px 4px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onClick={() => navigate(`/user/bills/${inv.invoiceId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = needPay
                      ? "0 2px 12px rgba(245,158,11,0.1)"
                      : "0 1px 4px rgba(0,0,0,0.06)";
                  }}
                >
                  <div className="card-body p-3">
                    {/* Type + Status */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span
                        className="d-flex align-items-center gap-2"
                        style={{
                          color: tm.color,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {tm.icon} {tm.label}
                      </span>
                      <span
                        className="rounded-pill px-2 py-1"
                        style={{
                          background: sm.bg,
                          color: sm.color,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.2px",
                        }}
                      >
                        {sm.label}
                      </span>
                    </div>

                    {/* Amount */}
                    <div
                      className="fw-bold mb-2"
                      style={{
                        fontSize: 22,
                        color: "#1e293b",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {fmt(inv.totalAmount)}
                    </div>

                    {/* Partial progress */}
                    {inv.status === "PARTIAL" && inv.paidAmount > 0 && (
                      <div className="mb-3">
                        <div
                          className="d-flex justify-content-between mb-1"
                          style={{ fontSize: 11 }}
                        >
                          <span className="text-success fw-semibold">
                            Đã nộp: {fmt(inv.paidAmount)}
                          </span>
                          <span className="text-danger fw-semibold">
                            Còn: {fmt(inv.totalAmount - inv.paidAmount)}
                          </span>
                        </div>
                        <div
                          className="progress rounded-pill"
                          style={{ height: 4 }}
                        >
                          <div
                            className="progress-bar bg-success rounded-pill"
                            style={{
                              width: `${Math.min(100, (inv.paidAmount / inv.totalAmount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Due date */}
                    <div
                      className="d-flex align-items-center gap-1 mb-1"
                      style={{ fontSize: 12 }}
                    >
                      <FaCalendarAlt className="text-muted" size={10} />
                      <span className="text-muted">Hạn:</span>
                      <span
                        className="fw-semibold"
                        style={{
                          color: overdue
                            ? "#ef4444"
                            : dueSoon
                              ? "#f59e0b"
                              : "#475569",
                        }}
                      >
                        {fmtDate(inv.dueDate)}
                      </span>
                      {overdue && (
                        <span
                          className="rounded-pill ms-1 px-2"
                          style={{
                            background: "#fef2f2",
                            color: "#ef4444",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          Quá hạn
                        </span>
                      )}
                      {dueSoon && !overdue && (
                        <span
                          className="rounded-pill ms-1 px-2"
                          style={{
                            background: "#fef3c7",
                            color: "#d97706",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          Sắp hết hạn
                        </span>
                      )}
                    </div>

                    {/* Period for MONTHLY */}
                    {inv.type === "MONTHLY" && inv.periodMonth && (
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        Kỳ: Tháng {inv.periodMonth}/{inv.periodYear}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-3 pb-3">
                    <button
                      className="btn btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                      style={{
                        background: needPay ? "#f59e0b" : "#f8fafc",
                        color: needPay ? "#fff" : "#475569",
                        border: needPay ? "none" : "1px solid #e2e8f0",
                        fontWeight: 600,
                        fontSize: 12,
                        padding: "7px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/bills/${inv.invoiceId}`);
                      }}
                    >
                      {needPay ? (
                        <>💳 Thanh toán ngay</>
                      ) : (
                        <>
                          <FaEye size={11} /> Xem chi tiết
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination (ẩn khi NEED_PAY vì dùng merge local) ── */}
      {totalPages > 1 && activeTab !== "NEED_PAY" && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle"
            style={{ width: 34, height: 34 }}
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            <FaChevronLeft size={11} />
          </button>
          <span style={{ fontSize: 13 }} className="text-muted">
            Trang <strong className="text-dark">{pageNumber}</strong> /{" "}
            {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle"
            style={{ width: 34, height: 34 }}
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            <FaChevronRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
