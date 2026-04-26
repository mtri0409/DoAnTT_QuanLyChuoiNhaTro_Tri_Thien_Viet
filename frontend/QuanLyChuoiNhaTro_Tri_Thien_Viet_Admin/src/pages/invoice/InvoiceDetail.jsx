import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaCheckDouble,
  FaBan,
  FaRedo,
  FaBolt,
  FaTint,
  FaHome,
  FaConciergeBell,
  FaFilePdf,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaHandHoldingUsd,
  FaUndoAlt,
  FaWrench,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";
import { exportInvoiceToPDF } from "../../utils/exportInvoice";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STATUS_META = {
  DRAFT: { label: "Nháp", color: "#64748b", bg: "#f1f5f9" },
  PENDING: { label: "Chờ thanh toán", color: "#f59e0b", bg: "#fef9c3" },
  PARTIAL: { label: "Thanh toán một phần", color: "#f97316", bg: "#ffedd5" },
  PAID: { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  REFUNDED: { label: "Đã hoàn cọc", color: "#8b5cf6", bg: "#ede9fe" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const TYPE_META = {
  MONTHLY: {
    label: "Hàng tháng",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: <FaCalendarAlt />,
  },
  DEPOSIT: {
    label: "Tiền cọc",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: <FaShieldAlt />,
  },
  REPAIR: {
    label: "Sửa chữa",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: <FaWrench />,
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

const detailIcon = (serviceName = "", unit = "") => {
  const s = (serviceName + " " + unit).toUpperCase();
  if (
    s.includes("ĐIỆN") ||
    s.includes("DIEN") ||
    s.includes("ELECTRIC") ||
    s.includes("KWH")
  )
    return <FaBolt style={{ color: "#f59e0b" }} />;
  if (
    s.includes("NƯỚC") ||
    s.includes("NUOC") ||
    s.includes("WATER") ||
    s.includes("M³") ||
    s.includes("M3")
  )
    return <FaTint style={{ color: "#3b82f6" }} />;
  return <FaConciergeBell style={{ color: "#8b5cf6" }} />;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // State cho modal nộp cọc
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiInvoice.getById(invoiceId);
      setInvoice(res);
    } catch {
      alert("Không tìm thấy hóa đơn");
      navigate("/invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [invoiceId]);

  const handleAction = async (fn, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(true);
    try {
      const res = await fn(invoiceId);
      setInvoice(res);
    } catch (err) {
      alert(err.response?.data?.message || `Lỗi: ${label}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDepositPayment = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setDepositLoading(true);
    try {
      const res = await apiInvoice.depositPayment(
        invoiceId,
        Number(depositAmount),
      );
      setInvoice(res);
      setShowDepositModal(false);
      setDepositAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi ghi nhận thanh toán cọc");
    } finally {
      setDepositLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #e2e8f0",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!invoice) return null;

  const isDeposit = invoice.type === "DEPOSIT";
  const isMonthly = invoice.type === "MONTHLY";
  const contractEnded =
    invoice.contractStatus === "EXPIRED" ||
    invoice.contractStatus === "TERMINATED";
  const sm = STATUS_META[invoice.status] || {};
  const tm = TYPE_META[invoice.type] || {};
  const details = invoice.invoiceDetails || [];

  const detailsSum = details.reduce(
    (sum, d) => sum + Number(d.subTotal ?? 0),
    0,
  );
  const computedTotal =
    invoice.totalAmount != null
      ? Number(invoice.totalAmount)
      : Number(invoice.roomPrice ?? 0) + detailsSum;

  // Tiền cọc đã nộp / còn lại
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const remainAmount = computedTotal - paidAmount;

  const paidAt =
    invoice.status === "PAID"
      ? (invoice.paidAt ?? invoice.payment?.paymentDate ?? null)
      : null;

  const missingCreatedAt = invoice.createdAt == null;
  const missingPaidAt =
    invoice.status === "PAID" && paidAt == null && !isDeposit;
  const missingRoomName = invoice.roomName == null;
  const hasWarning = missingCreatedAt || missingPaidAt || missingRoomName;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "#f0f4f8",
        paddingBottom: 60,
      }}
    >
      {/* ── DEPOSIT PAYMENT MODAL ──────────────────────────────────────────── */}
      {showDepositModal && (
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
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 4px" }}>
              Tổng tiền cọc: <strong>{fmt(computedTotal)}</strong>
            </p>
            {paidAmount > 0 && (
              <p style={{ color: "#f59e0b", fontSize: 13, margin: "0 0 16px" }}>
                Đã nộp: <strong>{fmt(paidAmount)}</strong> — Còn lại:{" "}
                <strong>{fmt(remainAmount)}</strong>
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
                marginTop: 8,
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
                  setShowDepositModal(false);
                  setDepositAmount("");
                }}
                style={{
                  flex: 1,
                  padding: 10,
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
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
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

      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          padding: "20px 32px",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/invoice")}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <FaArrowLeft /> Danh sách
          </button>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <FaFileInvoiceDollar style={{ fontSize: 20, color: "#6366f1" }} />
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>
                Hóa đơn #{invoice.invoiceId}
              </h2>
              {/* Badge loại hóa đơn */}
              {tm.label && (
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {tm.icon} {tm.label}
                </span>
              )}
              {/* Badge trạng thái */}
              <span
                style={{
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: sm.bg,
                  color: sm.color,
                }}
              >
                {sm.label || invoice.status}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 12 }}>
              {isDeposit
                ? `Tiền cọc hợp đồng · HĐ #${invoice.contractId}`
                : `Kỳ tháng ${invoice.periodMonth}/${invoice.periodYear} · HĐ #${invoice.contractId}`}
            </p>
          </div>

          {/* ── ACTIONS ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* DRAFT: tính lại + gửi (chỉ MONTHLY/REPAIR mới có "gửi") */}
            {invoice.status === "DRAFT" && (
              <>
                {!isDeposit && (
                  <ActionButton
                    icon={<FaRedo />}
                    label="Tính lại"
                    color="#8b5cf6"
                    onClick={() =>
                      handleAction(apiInvoice.recalculate, "Tính lại tổng tiền")
                    }
                    loading={actionLoading}
                  />
                )}
                <ActionButton
                  icon={<FaPaperPlane />}
                  label="Gửi khách"
                  color="#f59e0b"
                  onClick={() =>
                    handleAction(apiInvoice.send, "Gửi hóa đơn cho khách")
                  }
                  loading={actionLoading}
                />
              </>
            )}

            {/* MONTHLY: PENDING → mark paid */}
            {isMonthly && invoice.status === "PENDING" && (
              <ActionButton
                icon={<FaCheckDouble />}
                label="Đã thu tiền"
                color="#10b981"
                onClick={() =>
                  handleAction(apiInvoice.markPaid, "Xác nhận đã thanh toán")
                }
                loading={actionLoading}
              />
            )}

            {/* DEPOSIT: ghi nhận nộp cọc (PENDING hoặc PARTIAL) */}
            {isDeposit && ["PENDING", "PARTIAL"].includes(invoice.status) && (
              <ActionButton
                icon={<FaHandHoldingUsd />}
                label="Nộp cọc"
                color="#f59e0b"
                onClick={() => setShowDepositModal(true)}
                loading={actionLoading}
              />
            )}

            {/* DEPOSIT: hoàn cọc (PAID → REFUNDED) */}
            {isDeposit && invoice.status === "PAID" && contractEnded && (
              <ActionButton
                icon={<FaUndoAlt />}
                label="Hoàn cọc"
                color="#8b5cf6"
                onClick={() =>
                  handleAction(
                    (id) => apiInvoice.refund(id, ""),
                    "Hoàn trả tiền cọc",
                  )
                }
                loading={actionLoading}
              />
            )}

            {/* Hủy — không hủy được PAID / REFUNDED */}
            {["DRAFT", "PENDING", "PARTIAL"].includes(invoice.status) && (
              <ActionButton
                icon={<FaBan />}
                label="Hủy"
                color="#ef4444"
                onClick={() => handleAction(apiInvoice.cancel, "Hủy hóa đơn")}
                loading={actionLoading}
              />
            )}

            <ActionButton
              icon={<FaFilePdf />}
              label="Xuất PDF"
              color="#e11d48"
              onClick={() => exportInvoiceToPDF({ invoice })}
              loading={false}
            />
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "28px auto", padding: "0 16px" }}>
        {/* ── META CARDS ──────────────────────────────────────────────────── */}
        {isDeposit ? (
          /* Deposit: 4 cards riêng — tổng cọc, đã nộp, còn lại, ngày tạo */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <MetaCard label="Phòng" value={invoice.roomName || "—"} />
            <MetaCard
              label="Tổng tiền cọc"
              value={fmt(computedTotal)}
              valueColor="#0f172a"
            />
            <MetaCard
              label="Đã nộp"
              value={fmt(paidAmount)}
              valueColor={
                paidAmount >= computedTotal
                  ? "#10b981"
                  : paidAmount > 0
                    ? "#f97316"
                    : "#94a3b8"
              }
            />
            <MetaCard
              label="Còn lại"
              value={remainAmount > 0 ? fmt(remainAmount) : "Đã nộp đủ ✓"}
              valueColor={remainAmount > 0 ? "#ef4444" : "#10b981"}
            />
            <MetaCard label="Ngày tạo" value={fmtDate(invoice.createdAt)} />
          </div>
        ) : (
          /* Monthly / Repair: 4 cards gốc */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <MetaCard label="Phòng" value={invoice.roomName || "—"} />
            <MetaCard label="Hạn thanh toán" value={fmtDate(invoice.dueDate)} />
            <MetaCard label="Ngày tạo" value={fmtDate(invoice.createdAt)} />
            <MetaCard label="Ngày thanh toán" value={fmtDate(paidAt)} />
          </div>
        )}

        {/* ── INVOICE CARD ──────────────────────────────────────────────── */}
        <div
          id="invoice-print"
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "28px 32px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                {isDeposit ? (
                  <FaShieldAlt style={{ color: "#f59e0b", fontSize: 20 }} />
                ) : invoice.type === "REPAIR" ? (
                  <FaWrench style={{ color: "#ef4444", fontSize: 20 }} />
                ) : (
                  <FaHome style={{ color: "#6366f1", fontSize: 20 }} />
                )}
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {isDeposit
                    ? "HÓA ĐƠN TIỀN CỌC"
                    : invoice.type === "REPAIR"
                      ? "HÓA ĐƠN SỬA CHỮA"
                      : "HÓA ĐƠN TIỀN PHÒNG"}
                </h3>
              </div>
              <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
                {isDeposit
                  ? `Hợp đồng #${invoice.contractId} · ${invoice.roomName || ""}`
                  : invoice.type === "REPAIR"
                    ? `Phòng ${invoice.roomName || "—"} · HĐ #${invoice.contractId}`
                    : `Kỳ: Tháng ${invoice.periodMonth}/${invoice.periodYear}`}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: isDeposit ? "#f59e0b" : "#6366f1",
                }}
              >
                #{invoice.invoiceId}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                HĐ #{invoice.contractId}
              </div>
            </div>
          </div>

          {/* ── DEPOSIT: bảng tiến trình nộp cọc ─────────────────────────── */}
          {isDeposit ? (
            <div style={{ padding: "24px 32px" }}>
              {/* Progress bar */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  <span>Tiến độ nộp cọc</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    {computedTotal > 0
                      ? Math.min(
                          100,
                          Math.round((paidAmount / computedTotal) * 100),
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div
                  style={{
                    background: "#f1f5f9",
                    borderRadius: 99,
                    height: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width:
                        computedTotal > 0
                          ? `${Math.min(100, (paidAmount / computedTotal) * 100)}%`
                          : "0%",
                      background:
                        paidAmount >= computedTotal
                          ? "linear-gradient(90deg,#10b981,#059669)"
                          : "linear-gradient(90deg,#f59e0b,#f97316)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* Bảng tóm tắt tiền cọc */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                    {["Hạng mục", "Mô tả", "Số tiền"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: h === "Số tiền" ? "right" : "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fffbeb",
                    }}
                  >
                    <td style={{ padding: "14px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <FaShieldAlt
                          style={{ color: "#f59e0b", fontSize: 16 }}
                        />
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                              fontSize: 14,
                            }}
                          >
                            Tiền đặt cọc
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            Cọc khi ký hợp đồng
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      Phòng {invoice.roomName || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#0f172a",
                        fontSize: 15,
                      }}
                    >
                      {fmt(computedTotal)}
                    </td>
                  </tr>

                  {/* Lịch sử nộp — nếu backend có trả về */}
                  {invoice.paymentHistory?.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 12px", paddingLeft: 32 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <FaHandHoldingUsd
                            style={{ color: "#10b981", fontSize: 13 }}
                          />
                          <span style={{ color: "#475569", fontSize: 13 }}>
                            Lần nộp {i + 1}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          color: "#94a3b8",
                          fontSize: 12,
                        }}
                      >
                        {fmtDate(p.paymentDate)}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          textAlign: "right",
                          color: "#10b981",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        + {fmt(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tổng kết */}
              <div
                style={{
                  marginTop: 20,
                  padding: "16px 20px",
                  background: "#f8fafc",
                  borderRadius: 10,
                }}
              >
                <SummaryRow label="Tổng tiền cọc" value={fmt(computedTotal)} />
                <SummaryRow
                  label="Đã nộp"
                  value={fmt(paidAmount)}
                  valueColor="#10b981"
                />
                {remainAmount > 0 && (
                  <SummaryRow
                    label="Còn thiếu"
                    value={fmt(remainAmount)}
                    valueColor="#ef4444"
                  />
                )}
                <div
                  style={{ height: 1, background: "#e2e8f0", margin: "8px 0" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    background:
                      invoice.status === "PAID" || invoice.status === "REFUNDED"
                        ? "#064e3b"
                        : "#0f172a",
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ color: "#94a3b8", fontWeight: 600, fontSize: 14 }}
                  >
                    {invoice.status === "REFUNDED"
                      ? "ĐÃ HOÀN CỌC"
                      : invoice.status === "PAID"
                        ? "ĐÃ NỘP ĐỦ"
                        : "TỔNG CỌC"}
                  </span>
                  <span
                    style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}
                  >
                    {fmt(computedTotal)}
                  </span>
                </div>
              </div>
            </div>
          ) : invoice.type === "REPAIR" ? (
            /* ── REPAIR: bảng nguyên nhân + mô tả sửa chữa ─────────────── */
            <>
              <div style={{ padding: "20px 32px" }}>
                {/* Banner nhắc nhở trạng thái DRAFT */}
                {invoice.status === "DRAFT" && (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 10,
                      padding: "12px 16px",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#92400e",
                          marginBottom: 3,
                        }}
                      >
                        Hóa đơn đang ở trạng thái DRAFT — chưa gửi cho khách
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#78350f",
                          lineHeight: 1.5,
                        }}
                      >
                        Kiểm tra thông tin bên dưới. Khi xác nhận đúng, bấm{" "}
                        <strong>"Gửi hóa đơn"</strong> để khách nhận được yêu
                        cầu thanh toán.
                      </div>
                    </div>
                  </div>
                )}

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                      {[
                        "Hạng mục sửa chữa",
                        "Mô tả / Nguyên nhân",
                        "Thợ thực hiện",
                        "Số tiền",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: h === "Số tiền" ? "right" : "left",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {details.length > 0 ? (
                      details.map((d, i) => (
                        <tr
                          key={d.invoiceDetailId ?? i}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: i % 2 === 0 ? "#fff" : "#fafbff",
                          }}
                        >
                          <td style={{ padding: "14px 12px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <FaWrench
                                style={{
                                  color: "#ef4444",
                                  fontSize: 15,
                                  flexShrink: 0,
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    fontSize: 14,
                                  }}
                                >
                                  {d.expenseCategory || "Sửa chữa"}
                                </div>
                                {d.expenseId && (
                                  <div
                                    style={{ fontSize: 11, color: "#94a3b8" }}
                                  >
                                    Chi phí #{d.expenseId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              color: "#475569",
                              fontSize: 13,
                              maxWidth: 220,
                            }}
                          >
                            <div
                              style={{
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.5,
                              }}
                            >
                              {d.description ? (
                                d.description
                              ) : (
                                <span
                                  style={{
                                    color: "#cbd5e1",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Không có mô tả
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {d.payeeName || (
                              <span style={{ color: "#cbd5e1" }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {fmt(d.subTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* invoiceDetails rỗng = backend chưa populate REPAIR details
                         → hiện thông báo rõ ràng thay vì "Không có mô tả" */
                      <tr>
                        <td
                          colSpan={4}
                          style={{ padding: "28px 12px", textAlign: "center" }}
                        >
                          <div
                            style={{
                              color: "#f59e0b",
                              fontSize: 13,
                              fontWeight: 600,
                              marginBottom: 6,
                            }}
                          >
                            ⚠️ Backend chưa trả về chi tiết hóa đơn sửa chữa
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: 12 }}>
                            Service cần populate <code>expenseCategory</code>,{" "}
                            <code>description</code>, <code>payeeName</code> vào{" "}
                            <code>invoiceDetails</code> khi map Invoice REPAIR.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total block REPAIR */}
              <div
                style={{
                  padding: "20px 32px",
                  borderTop: "2px solid #f1f5f9",
                  background: "#fafbff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ minWidth: 300 }}>
                    {details.length > 0 && (
                      <SummaryRow
                        label="Tổng chi phí sửa chữa"
                        value={fmt(detailsSum || computedTotal)}
                      />
                    )}
                    <div
                      style={{
                        height: 1,
                        background: "#e2e8f0",
                        margin: "8px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        background: "#7f1d1d",
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#fca5a5",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        TỔNG SỬA CHỮA
                      </span>
                      <span
                        style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}
                      >
                        {fmt(computedTotal)}
                      </span>
                    </div>
                    {invoice.status === "PENDING" && invoice.dueDate && (
                      <p
                        style={{
                          margin: "10px 0 0",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#f59e0b",
                        }}
                      >
                        <FaCalendarAlt style={{ marginRight: 4 }} />
                        Hạn thanh toán: {fmtDate(invoice.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── MONTHLY: bảng chi tiết dịch vụ gốc ─────────────── */
            <>
              <div style={{ padding: "20px 32px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                      {[
                        "Hạng mục",
                        "Đơn vị",
                        "Số cũ",
                        "Số mới",
                        "Tiêu thụ",
                        "Đơn giá",
                        "Thành tiền",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: h === "Hạng mục" ? "left" : "right",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Tiền phòng */}
                    {invoice.roomPrice != null && (
                      <tr
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: "#fafbff",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <FaHome
                              style={{ color: "#6366f1", fontSize: 16 }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: 14,
                                }}
                              >
                                Tiền phòng
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                Kỳ T{invoice.periodMonth}/{invoice.periodYear}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            color: "#64748b",
                            fontSize: 13,
                          }}
                        >
                          tháng
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            color: "#94a3b8",
                            fontSize: 12,
                          }}
                        >
                          —
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            color: "#94a3b8",
                            fontSize: 12,
                          }}
                        >
                          —
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        >
                          1
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            color: "#64748b",
                            fontSize: 13,
                          }}
                        >
                          {fmt(invoice.roomPrice)}
                        </td>
                        <td
                          style={{
                            padding: "14px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {fmt(invoice.roomPrice)}
                        </td>
                      </tr>
                    )}

                    {/* Dịch vụ */}
                    {details.length === 0 && invoice.roomPrice == null ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          Chưa có chi tiết hóa đơn
                        </td>
                      </tr>
                    ) : (
                      details.map((d, i) => (
                        <tr
                          key={d.invoiceDetailId ?? i}
                          style={{ borderBottom: "1px solid #f8fafc" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fafbff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "14px 12px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <span style={{ fontSize: 16 }}>
                                {detailIcon(d.serviceName, d.unit)}
                              </span>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  fontSize: 14,
                                }}
                              >
                                {d.serviceName || "Dịch vụ"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {d.unit || "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {d.oldValue != null
                              ? Number(d.oldValue).toLocaleString("vi-VN")
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {d.newValue != null
                              ? Number(d.newValue).toLocaleString("vi-VN")
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          >
                            {d.quantity != null
                              ? Number(d.quantity).toLocaleString("vi-VN")
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            {fmt(d.unitPrice)}
                          </td>
                          <td
                            style={{
                              padding: "14px 12px",
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {fmt(d.subTotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total block */}
              <div
                style={{
                  padding: "20px 32px",
                  borderTop: "2px solid #f1f5f9",
                  background: "#fafbff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ minWidth: 300 }}>
                    {invoice.roomPrice != null && (
                      <SummaryRow
                        label="Tiền phòng"
                        value={fmt(invoice.roomPrice)}
                      />
                    )}
                    {details.length > 0 && (
                      <SummaryRow
                        label="Tiền dịch vụ"
                        value={fmt(detailsSum)}
                      />
                    )}
                    {invoice.discount != null &&
                      Number(invoice.discount) > 0 && (
                        <SummaryRow
                          label="Giảm giá"
                          value={`- ${fmt(invoice.discount)}`}
                          valueColor="#10b981"
                        />
                      )}
                    <div
                      style={{
                        height: 1,
                        background: "#e2e8f0",
                        margin: "8px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        background: "#0f172a",
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        TỔNG CỘNG
                      </span>
                      <span
                        style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}
                      >
                        {fmt(computedTotal)}
                      </span>
                    </div>
                    {invoice.status === "PENDING" && invoice.dueDate && (
                      <p
                        style={{
                          margin: "10px 0 0",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#f59e0b",
                        }}
                      >
                        <FaCalendarAlt style={{ marginRight: 4 }} />
                        Hạn thanh toán: {fmtDate(invoice.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              background: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: 10,
              padding: "14px 20px",
              marginTop: 16,
            }}
          >
            <strong style={{ fontSize: 12, color: "#92400e" }}>Ghi chú:</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#78350f" }}>
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Warning */}
        {hasWarning && (
          <div
            style={{
              marginTop: 16,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 10,
              padding: "14px 20px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#92400e",
                fontWeight: 700,
              }}
            >
              ⚠️ Dữ liệu chưa đầy đủ từ backend:
            </p>
            <ul
              style={{
                margin: "6px 0 0 16px",
                fontSize: 12,
                color: "#9a3412",
                lineHeight: 1.8,
              }}
            >
              {missingCreatedAt && (
                <li>
                  <code>createdAt</code> — chưa có ngày tạo hóa đơn
                </li>
              )}
              {missingPaidAt && (
                <li>
                  <code>paidAt</code> — hóa đơn PAID nhưng chưa có ngày thanh
                  toán
                </li>
              )}
              {missingRoomName && (
                <li>
                  <code>roomName</code> — chưa có tên phòng
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function MetaCard({ label, value, valueColor = "#0f172a" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "14px 18px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 700, color: valueColor, fontSize: 15 }}>
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueColor = "#475569" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
        fontSize: 13,
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: `${color}20`,
        color,
        fontWeight: 700,
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 6,
        opacity: loading ? 0.7 : 1,
        transition: "all 0.15s",
      }}
    >
      {icon} {label}
    </button>
  );
}
