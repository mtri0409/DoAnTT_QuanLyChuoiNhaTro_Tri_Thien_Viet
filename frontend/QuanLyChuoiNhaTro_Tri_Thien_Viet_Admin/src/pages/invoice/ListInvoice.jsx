import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar, FaSearch, FaPaperPlane, FaCheckDouble, FaBan, FaEye, 
  FaPlus, FaSync, FaCalendarAlt, FaClipboardList, FaRedo, FaBuilding, 
  FaShieldAlt, FaWrench, FaHandHoldingUsd, FaUndoAlt, FaMailBulk
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";

// ── Constants ──────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: "", label: "Tất cả", icon: <FaClipboardList />, color: "#6366f1", bg: "#eef2ff", desc: "Xem toàn bộ hóa đơn" },
  { value: "MONTHLY", label: "Hàng tháng", icon: <FaCalendarAlt />, color: "#0ea5e9", bg: "#e0f2fe", desc: "Hóa đơn tiền phòng & dịch vụ theo tháng" },
  { value: "DEPOSIT", label: "Tiền cọc", icon: <FaShieldAlt />, color: "#f59e0b", bg: "#fef3c7", desc: "Hóa đơn đặt cọc khi ký hợp đồng" },
  { value: "REPAIR", label: "Sửa chữa", icon: <FaWrench />, color: "#ef4444", bg: "#fee2e2", desc: "Hóa đơn chi phí sửa chữa, bảo trì" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái", color: "#64748b", bg: "#f1f5f9" },
  { value: "DRAFT", label: "Nháp", color: "#94a3b8", bg: "#f1f5f9" },
  { value: "PENDING", label: "Chờ thanh toán", color: "#f59e0b", bg: "#fef3c7" },
  { value: "PARTIAL", label: "Thanh toán một phần", color: "#f97316", bg: "#ffedd5" },
  { value: "PAID", label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  { value: "REFUNDED", label: "Đã hoàn cọc", color: "#8b5cf6", bg: "#ede9fe" },
  { value: "CANCELLED", label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const YEARS = [2024, 2025, 2026, 2027];

// ── Helpers ────────────────────────────────────────────────────────────────────
const typeMeta = (type) => TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0];
const statusMeta = (status) => STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
const fmt = (num) => (num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—");
const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// ── Component Chính ─────────────────────────────────────────────────────────────
export default function ListInvoice() {
  const navigate = useNavigate();

  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [invoiceType, setInvoiceType] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [branchId, setBranchId] = useState("");
  const [contractId, setContractId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Branches
  const [branches, setBranches] = useState([]);
  useEffect(() => {
    apiBranches.getAllBranches(1, 100).then((res) => setBranches(res?.content || res || [])).catch(() => {});
  }, []);

  // Modals
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMonth, setSendMonth] = useState(new Date().getMonth() + 1);
  const [sendYear, setSendYear] = useState(new Date().getFullYear());
  const [sendLoading, setSendLoading] = useState(false);

  const [depositModal, setDepositModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInvoice.filter({
        type: invoiceType || undefined,
        status: status || undefined,
        month: month || undefined,
        year: year || undefined,
        contractId: contractId || undefined,
        branchId: branchId || undefined,
      }, currentPage, 10, sortBy, sortOrder);
      setData(res);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [invoiceType, status, month, year, contractId, branchId, currentPage, sortBy, sortOrder]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleAction = async (invoiceId, action, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(invoiceId);
    try {
      await action(invoiceId);
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || `Lỗi thực hiện: ${label}`);
    } finally { setActionLoading(null); }
  };

  const handleSendAllByPeriod = async () => {
    setSendLoading(true);
    try {
      const res = await apiInvoice.sendAll(sendMonth, sendYear);
      alert(`✅ Thành công! Đã gửi ${res.length} hóa đơn kỳ ${sendMonth}/${sendYear}`);
      setShowSendModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi gửi hóa đơn hàng loạt");
    } finally { setSendLoading(false); }
  };

  const handleAutoGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await apiInvoice.autoGenerate(genMonth, genYear);
      alert(`✅ Đã tạo ${res.length} hóa đơn tháng ${genMonth}/${genYear}`);
      setShowGenModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo hóa đơn");
    } finally { setGenLoading(false); }
  };

  const handlePageChange = (page) => setCurrentPage(page + 1);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f0f4f8" }}>
      
      {/* ── Modal: Ghi nhận nộp cọc ── */}
      {depositModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Ghi nhận nộp cọc</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>HĐ #{depositModal.invoiceId} — Tổng: <strong>{fmt(depositModal.totalAmount)}</strong></p>
            <input type="number" placeholder="Số tiền nộp..." value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} style={{ width: "100%", padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: 8, marginBottom: 20 }} autoFocus />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDepositModal(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>Hủy</button>
              <button onClick={() => {}} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Ghi nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Gửi tất cả ── */}
      {showSendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#fff7ed", borderRadius: 8, padding: "8px", color: "#ea580c" }}><FaMailBulk /></div>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Gửi hóa đơn hàng loạt</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Hệ thống sẽ gửi thông báo cho toàn bộ hóa đơn <b>NHÁP</b> của kỳ đã chọn.</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select value={sendMonth} onChange={(e) => setSendMonth(Number(e.target.value))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid #e2e8f0" }}>
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={sendYear} onChange={(e) => setSendYear(Number(e.target.value))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid #e2e8f0" }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSendModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleSendAllByPeriod} disabled={sendLoading} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{sendLoading ? "Đang gửi..." : "Gửi ngay"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Auto Generate ── */}
      {showGenModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontWeight: 800 }}>Tạo hóa đơn hàng loạt</h3>
            <div style={{ display: "flex", gap: 12, margin: "20px 0" }}>
              <select value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid #e2e8f0" }}>
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={genYear} onChange={(e) => setGenYear(Number(e.target.value))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1.5px solid #e2e8f0" }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowGenModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleAutoGenerate} disabled={genLoading} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{genLoading ? "Đang tạo..." : "Tạo ngay"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "28px 32px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "#6366f1", borderRadius: 8, padding: "6px 10px", fontSize: 18 }}><FaFileInvoiceDollar /></div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Quản Lý Hóa Đơn</h1>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowSendModal(true)} style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><FaPaperPlane /> Gửi hóa đơn theo kỳ</button>
            <button onClick={() => setShowGenModal(true)} style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><FaSync /> Auto tạo hóa đơn</button>
            <button onClick={() => navigate("/invoice/create")} style={{ padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><FaPlus /> Tạo thủ công</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
        {/* Type Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          {TYPE_OPTIONS.map((t) => (
            <button key={t.value} onClick={() => { setInvoiceType(t.value); setCurrentPage(1); }} style={{ padding: "14px 16px", borderRadius: 12, border: invoiceType === t.value ? `2px solid ${t.color}` : "2px solid #e2e8f0", cursor: "pointer", background: invoiceType === t.value ? t.bg : "#fff", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: invoiceType === t.value ? t.color : "#94a3b8" }}>{t.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Tháng</label>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setCurrentPage(1); }} style={{ width: "100%", padding: "8px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
              <option value="">Tất cả</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Năm</label>
            <select value={year} onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }} style={{ width: "100%", padding: "8px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchInvoices} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#0f172a", color: "#fff", fontWeight: 600 }}><FaSearch /> Lọc</button>
        </div>

        {/* Table Hóa Đơn */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                  {["Hợp đồng", "Loại", "Kỳ", "Tổng tiền", "Trạng thái", "Hạn TT", "Ngày tạo", "Thao tác"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", textTransform: "uppercase", fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px" }}><FaSync className="spin" /> Đang tải...</td></tr>
                ) : data.content?.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>Không có hóa đơn nào</td></tr>
                ) : (
                  data.content.map((inv) => (
                    <tr key={inv.invoiceId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>HĐ #{inv.contractId}<div style={{ fontSize: 11, color: "#94a3b8" }}>{inv.roomName}</div></td>
                      <td style={{ padding: "14px 16px" }}><span style={{ padding: "4px 8px", borderRadius: 20, fontSize: 11, background: typeMeta(inv.type).bg, color: typeMeta(inv.type).color }}>{typeMeta(inv.type).label}</span></td>
                      <td style={{ padding: "14px 16px" }}>T{inv.periodMonth}/{inv.periodYear}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{fmt(inv.totalAmount)}</td>
                      <td style={{ padding: "14px 16px" }}><span style={{ padding: "4px 8px", borderRadius: 20, fontSize: 11, background: statusMeta(inv.status).bg, color: statusMeta(inv.status).color }}>{statusMeta(inv.status).label}</span></td>
                      <td style={{ padding: "14px 16px" }}>{fmtDate(inv.dueDate)}</td>
                      <td style={{ padding: "14px 16px" }}>{fmtDate(inv.createdAt)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn icon={<FaEye />} color="#6366f1" onClick={() => navigate(`/invoice/${inv.invoiceId}`)} />
                          {inv.status === "DRAFT" && <ActionBtn icon={<FaPaperPlane />} color="#f59e0b" onClick={() => handleAction(inv.invoiceId, apiInvoice.send, "Gửi hóa đơn")} />}
                          {inv.status === "PENDING" && <ActionBtn icon={<FaCheckDouble />} color="#10b981" onClick={() => handleAction(inv.invoiceId, apiInvoice.markPaid, "Xác nhận đã thu")} />}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Phân trang */}
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Trang {data.pageNumber + 1} / {data.totalPages}</span>
            <Pagination currentPage={data.pageNumber} totalPages={data.totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ActionBtn({ icon, color, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer", background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {loading ? "..." : icon}
    </button>
  );
}