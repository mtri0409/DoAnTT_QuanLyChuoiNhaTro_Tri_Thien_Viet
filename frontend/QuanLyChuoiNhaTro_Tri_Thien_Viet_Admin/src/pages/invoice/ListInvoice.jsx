import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaFilter,
  FaPaperPlane,
  FaCheckDouble,
  FaBan,
  FaEye,
  FaPlus,
  FaSync,
  FaCalendarAlt,
  FaClipboardList,
  FaRedo,
  FaBuilding,
  FaMoneyBillWave,
  FaShieldAlt,
  FaWrench,
  FaHandHoldingUsd,
  FaUndoAlt,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  {
    value: "",
    label: "Tất cả",
    icon: <FaClipboardList />,
    color: "#6366f1",
    bg: "#eef2ff",
    desc: "Xem toàn bộ hóa đơn",
  },
  {
    value: "MONTHLY",
    label: "Hàng tháng",
    icon: <FaCalendarAlt />,
    color: "#0ea5e9",
    bg: "#e0f2fe",
    desc: "Hóa đơn tiền phòng & dịch vụ theo tháng",
  },
  {
    value: "DEPOSIT",
    label: "Tiền cọc",
    icon: <FaShieldAlt />,
    color: "#f59e0b",
    bg: "#fef3c7",
    desc: "Hóa đơn đặt cọc khi ký hợp đồng",
  },
  {
    value: "REPAIR",
    label: "Sửa chữa",
    icon: <FaWrench />,
    color: "#ef4444",
    bg: "#fee2e2",
    desc: "Hóa đơn chi phí sửa chữa, bảo trì",
  },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái", color: "#64748b", bg: "#f1f5f9" },
  { value: "DRAFT", label: "Nháp", color: "#94a3b8", bg: "#f1f5f9" },
  {
    value: "PENDING",
    label: "Chờ thanh toán",
    color: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    value: "PARTIAL",
    label: "Thanh toán một phần",
    color: "#f97316",
    bg: "#ffedd5",
  },
  { value: "PAID", label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  { value: "REFUNDED", label: "Đã hoàn cọc", color: "#8b5cf6", bg: "#ede9fe" },
  { value: "CANCELLED", label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));
const YEARS = [2024, 2025, 2026, 2027];

// ── Helpers ────────────────────────────────────────────────────────────────────

const typeMeta = (type) =>
  TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0];

const statusMeta = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ListInvoice() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [invoiceType, setInvoiceType] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [contractId, setContractId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Branches
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res?.content || res || []))
      .catch(() => {});
  }, []);

  // Auto-generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);

  // Deposit payment modal
  const [depositModal, setDepositModal] = useState(null); // { invoiceId, totalAmount, paidAmount }
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInvoice.filter(
        {
          type: invoiceType || undefined,
          status: status || undefined,
          month: month || undefined,
          year: year || undefined,
          contractId: contractId || undefined,
          branchId: branchId || undefined,
        },
        currentPage,
        10,
        sortBy,
        sortOrder,
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    invoiceType,
    status,
    month,
    year,
    contractId,
    branchId,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAction = async (invoiceId, action, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(invoiceId);
    try {
      await action(invoiceId);
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || `Lỗi thực hiện: ${label}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDepositPayment = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setDepositLoading(true);
    try {
      await apiInvoice.depositPayment(
        depositModal.invoiceId,
        Number(depositAmount),
      );
      setDepositModal(null);
      setDepositAmount("");
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi ghi nhận thanh toán cọc");
    } finally {
      setDepositLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await apiInvoice.autoGenerate(genMonth, genYear);
      alert(`✅ Đã tạo ${res.length} hóa đơn cho tháng ${genMonth}/${genYear}`);
      setShowGenModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo hóa đơn hàng loạt");
    } finally {
      setGenLoading(false);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page + 1);

  const activeType = typeMeta(invoiceType);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "#f0f4f8",
      }}
    >
      {/* ── Deposit Payment Modal ──────────────────────────────────────────── */}
      {depositModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              width: 400,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: "#fef3c7",
                  borderRadius: 8,
                  padding: "6px 9px",
                  color: "#f59e0b",
                  fontSize: 16,
                }}
              >
                <FaHandHoldingUsd />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                Ghi nhận nộp cọc
              </h3>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px" }}>
              Hóa đơn #{depositModal.invoiceId} — Tổng cọc:{" "}
              <strong>{fmt(depositModal.totalAmount)}</strong>
            </p>
            {depositModal.paidAmount > 0 && (
              <p style={{ color: "#f59e0b", fontSize: 13, margin: "0 0 20px" }}>
                Đã nộp: <strong>{fmt(depositModal.paidAmount)}</strong> — Còn
                lại:{" "}
                <strong>
                  {fmt(depositModal.totalAmount - depositModal.paidAmount)}
                </strong>
              </p>
            )}
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Số tiền nộp lần này (₫)
            </label>
            <input
              type="number"
              placeholder="VD: 500000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 15,
                boxSizing: "border-box",
                marginBottom: 20,
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setDepositModal(null);
                  setDepositAmount("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDepositPayment}
                disabled={depositLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: depositLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: depositLoading ? 0.7 : 1,
                }}
              >
                <FaHandHoldingUsd />{" "}
                {depositLoading ? "Đang lưu..." : "Ghi nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auto-generate Modal ────────────────────────────────────────────── */}
      {showGenModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              width: 380,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{ margin: "0 0 8px", fontWeight: 800, color: "#0f172a" }}
            >
              Tạo hóa đơn hàng loạt
            </h3>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
              Hệ thống sẽ tự động tạo hóa đơn DRAFT cho tất cả hợp đồng đang
              hoạt động theo kỳ đã chọn.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Tháng
                </label>
                <select
                  value={genMonth}
                  onChange={(e) => setGenMonth(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Năm
                </label>
                <select
                  value={genYear}
                  onChange={(e) => setGenYear(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowGenModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleAutoGenerate}
                disabled={genLoading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {genLoading ? (
                  "Đang tạo..."
                ) : (
                  <>
                    <FaSync /> Tạo ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "28px 32px 24px",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  background: "#6366f1",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 18,
                }}
              >
                <FaFileInvoiceDollar />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                }}
              >
                Quản Lý Hóa Đơn
              </h1>
            </div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              {activeType.value ? (
                <>
                  <span style={{ color: activeType.color }}>
                    {activeType.label}
                  </span>{" "}
                  — {activeType.desc}
                </>
              ) : (
                "Theo dõi toàn bộ hóa đơn: Hàng tháng · Tiền cọc · Sửa chữa"
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowGenModal(true)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaSync /> Auto tạo hàng loạt
            </button>
            <button
              onClick={() => navigate("/invoice/create")}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "#6366f1",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaPlus /> Tạo thủ công
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
        {/* ── Type Tabs ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {TYPE_OPTIONS.map((t) => {
            const active = invoiceType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => {
                  setInvoiceType(t.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: active ? `2px solid ${t.color}` : "2px solid #e2e8f0",
                  cursor: "pointer",
                  background: active ? t.bg : "#fff",
                  textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: active
                    ? `0 0 0 3px ${t.color}22`
                    : "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: active ? t.color : "#94a3b8",
                      fontSize: 15,
                    }}
                  >
                    {t.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: active ? t.color : "#0f172a",
                    }}
                  >
                    {t.label}
                  </span>
                </div>
                <div
                  style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}
                >
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Status Tabs ────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "6px",
            display: "flex",
            gap: 4,
            marginBottom: 16,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            flexWrap: "wrap",
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setStatus(s.value);
                setCurrentPage(1);
              }}
              style={{
                flex: "1 1 auto",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background:
                  status === s.value ? s.bg || "#f1f5f9" : "transparent",
                color: status === s.value ? s.color || "#64748b" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          {/* Month — hidden for DEPOSIT type */}
          {invoiceType !== "DEPOSIT" && (
            <div style={{ flex: "1 1 140px" }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Tháng
              </label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#f8fafc",
                }}
              >
                <option value="">-- Tất cả --</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div style={{ flex: "1 1 120px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              Năm
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                background: "#f8fafc",
              }}
            >
              <option value="">-- Tất cả --</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              <FaBuilding style={{ marginRight: 4 }} />
              Chi nhánh
            </label>
            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: branchId
                  ? "1.5px solid #6366f1"
                  : "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                background: branchId ? "#eef2ff" : "#f8fafc",
              }}
            >
              <option value="">-- Tất cả --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              Hợp đồng #
            </label>
            <input
              type="number"
              placeholder="ID hợp đồng..."
              value={contractId}
              onChange={(e) => {
                setContractId(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              Sắp xếp
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#f8fafc",
                }}
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="periodYear">Kỳ</option>
                <option value="totalAmount">Tổng tiền</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  padding: "8px 10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#f8fafc",
                }}
              >
                <option value="desc">↓</option>
                <option value="asc">↑</option>
              </select>
            </div>
          </div>
          <button
            onClick={fetchInvoices}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "#0f172a",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaSearch /> Lọc
          </button>
        </div>

        {/* ── Summary ────────────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Tổng:{" "}
            <strong style={{ color: "#0f172a" }}>{data.totalElements}</strong>{" "}
            hóa đơn
            {invoiceType && (
              <span
                style={{
                  marginLeft: 8,
                  padding: "2px 10px",
                  borderRadius: 20,
                  background: activeType.bg,
                  color: activeType.color,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {activeType.label}
              </span>
            )}
          </span>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1.5px solid #e2e8f0",
                  }}
                >
                  {[
                    "Hợp đồng",
                    "Loại HĐ",
                    "Kỳ / Thời gian",
                    "Tổng tiền",
                    "Trạng thái",
                    "Hạn TT",
                    "Ngày tạo",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: 11,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#94a3b8",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          border: "3px solid #e2e8f0",
                          borderTopColor: "#6366f1",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    </td>
                  </tr>
                ) : data.content?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "60px",
                        color: "#94a3b8",
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>
                        {activeType.icon}
                      </div>
                      Không có hóa đơn{" "}
                      {activeType.value ? activeType.label.toLowerCase() : ""}{" "}
                      nào
                    </td>
                  </tr>
                ) : (
                  data.content.map((inv) => {
                    const sm = statusMeta(inv.status);
                    const tm = typeMeta(inv.type);
                    const isLoading = actionLoading === inv.invoiceId;
                    const isDeposit = inv.type === "DEPOSIT";
                    const isMonthly = inv.type === "MONTHLY";

                    return (
                      <tr
                        key={inv.invoiceId}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: isLoading ? "#f8fafc" : "#fff",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading)
                            e.currentTarget.style.background = "#fafbff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isLoading
                            ? "#f8fafc"
                            : "#fff";
                        }}
                      >
                        {/* Contract */}
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#0f172a",
                            fontWeight: 600,
                          }}
                        >
                          HĐ #{inv.contractId}
                          {inv.roomName && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                fontWeight: 400,
                              }}
                            >
                              {inv.roomName}
                            </div>
                          )}
                        </td>

                        {/* Type badge */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: tm.bg,
                              color: tm.color,
                            }}
                          >
                            {tm.icon} {tm.label}
                          </span>
                        </td>

                        {/* Period */}
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#475569",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isDeposit ? (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              —
                            </span>
                          ) : (
                            <>
                              <FaCalendarAlt
                                style={{ marginRight: 5, color: "#94a3b8" }}
                              />
                              T{inv.periodMonth}/{inv.periodYear}
                            </>
                          )}
                        </td>

                        {/* Amount */}
                        <td
                          style={{
                            padding: "14px 16px",
                            fontWeight: 800,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(inv.totalAmount)}
                          {isDeposit &&
                            inv.paidAmount != null &&
                            inv.paidAmount > 0 && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#10b981",
                                  fontWeight: 500,
                                }}
                              >
                                Đã nộp: {fmt(inv.paidAmount)}
                              </div>
                            )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              background: sm.bg || "#f1f5f9",
                              color: sm.color || "#64748b",
                            }}
                          >
                            {sm.label || inv.status}
                          </span>
                        </td>

                        {/* Due date */}
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDate(inv.dueDate)}
                        </td>

                        {/* Created at */}
                        <td
                          style={{
                            padding: "14px 16px",
                            color: "#94a3b8",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDate(inv.createdAt)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "nowrap",
                            }}
                          >
                            {/* View */}
                            <ActionBtn
                              icon={<FaEye />}
                              title="Xem chi tiết"
                              color="#6366f1"
                              onClick={() =>
                                navigate(`/invoice/${inv.invoiceId}`)
                              }
                            />

                            {/* DRAFT actions (common) */}
                            {inv.status === "DRAFT" && (
                              <>
                                <ActionBtn
                                  icon={<FaPaperPlane />}
                                  title="Gửi hóa đơn"
                                  color="#f59e0b"
                                  loading={isLoading}
                                  onClick={() =>
                                    handleAction(
                                      inv.invoiceId,
                                      apiInvoice.send,
                                      "Gửi hóa đơn cho khách",
                                    )
                                  }
                                />
                                {!isDeposit && (
                                  <ActionBtn
                                    icon={<FaRedo />}
                                    title="Tính lại"
                                    color="#8b5cf6"
                                    loading={isLoading}
                                    onClick={() =>
                                      handleAction(
                                        inv.invoiceId,
                                        apiInvoice.recalculate,
                                        "Tính lại tổng tiền",
                                      )
                                    }
                                  />
                                )}
                              </>
                            )}

                            {/* MONTHLY: PENDING → PAID */}
                            {isMonthly && inv.status === "PENDING" && (
                              <ActionBtn
                                icon={<FaCheckDouble />}
                                title="Xác nhận đã thu"
                                color="#10b981"
                                loading={isLoading}
                                onClick={() =>
                                  handleAction(
                                    inv.invoiceId,
                                    apiInvoice.markPaid,
                                    "Xác nhận đã thanh toán",
                                  )
                                }
                              />
                            )}

                            {/* DEPOSIT: record payment (PENDING or PARTIAL) */}
                            {isDeposit &&
                              ["PENDING", "PARTIAL"].includes(inv.status) && (
                                <ActionBtn
                                  icon={<FaHandHoldingUsd />}
                                  title="Ghi nhận nộp cọc"
                                  color="#f59e0b"
                                  loading={isLoading}
                                  onClick={() =>
                                    setDepositModal({
                                      invoiceId: inv.invoiceId,
                                      totalAmount: inv.totalAmount,
                                      paidAmount: inv.paidAmount || 0,
                                    })
                                  }
                                />
                              )}

                            {/* DEPOSIT: refund (PAID → REFUNDED) */}
                            {isDeposit &&
                              inv.status === "PAID" &&
                              (inv.contractStatus === "EXPIRED" ||
                                inv.contractStatus === "TERMINATED") && (
                                <ActionBtn
                                  icon={<FaUndoAlt />}
                                  title="Hoàn trả cọc"
                                  color="#8b5cf6"
                                  loading={isLoading}
                                  onClick={() =>
                                    handleAction(
                                      inv.invoiceId,
                                      (id) => apiInvoice.refund(id, ""),
                                      "Hoàn trả tiền cọc",
                                    )
                                  }
                                />
                              )}

                            {/* Cancel (DRAFT or PENDING, not DEPOSIT PAID/REFUNDED) */}
                            {["DRAFT", "PENDING", "PARTIAL"].includes(
                              inv.status,
                            ) && (
                              <ActionBtn
                                icon={<FaBan />}
                                title="Hủy hóa đơn"
                                color="#ef4444"
                                loading={isLoading}
                                onClick={() =>
                                  handleAction(
                                    inv.invoiceId,
                                    apiInvoice.cancel,
                                    "Hủy hóa đơn",
                                  )
                                }
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              Trang {data.pageNumber + 1} / {Math.max(1, data.totalPages)}
            </span>
            <Pagination
              currentPage={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ActionBtn({ icon, title, color, onClick, loading }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={loading}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: `${color}15`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        transition: "all 0.15s",
        opacity: loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.background = `${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}15`;
      }}
    >
      {loading ? "⋯" : icon}
    </button>
  );
}
