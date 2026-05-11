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
  DRAFT: { label: "Nháp", cls: "bg-secondary-subtle text-secondary" },
  PENDING: { label: "Chờ thanh toán", cls: "bg-warning-subtle text-warning" },
  PARTIAL: { label: "Thanh toán một phần", cls: "bg-orange text-white" },
  PAID: { label: "Đã thanh toán", cls: "bg-success-subtle text-success" },
  REFUNDED: { label: "Đã hoàn cọc", cls: "bg-purple text-white" },
  CANCELLED: { label: "Đã hủy", cls: "bg-danger-subtle text-danger" },
};

// inline style fallback cho màu không có trong Bootstrap mặc định
const STATUS_STYLE = {
  PARTIAL: { background: "#f97316", color: "#fff" },
  REFUNDED: { background: "#8b5cf6", color: "#fff" },
};

const TYPE_META = {
  MONTHLY: {
    label: "Hàng tháng",
    icon: <FaCalendarAlt />,
    iconCls: "text-info",
  },
  DEPOSIT: {
    label: "Tiền cọc",
    icon: <FaShieldAlt />,
    iconCls: "text-warning",
  },
  REPAIR: { label: "Sửa chữa", icon: <FaWrench />, iconCls: "text-danger" },
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
  if (s.includes("ĐIỆN") || s.includes("DIEN") || s.includes("KWH"))
    return <FaBolt className="text-warning" />;
  if (
    s.includes("NƯỚC") ||
    s.includes("NUOC") ||
    s.includes("M3") ||
    s.includes("M³")
  )
    return <FaTint className="text-primary" />;
  return (
    <FaConciergeBell className="text-purple" style={{ color: "#8b5cf6" }} />
  );
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status,
    cls: "bg-secondary-subtle text-secondary",
  };
  const style = STATUS_STYLE[status] || {};
  return (
    <span
      className={`badge rounded-pill fw-semibold ${meta.cls}`}
      style={style}
    >
      {meta.label}
    </span>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="spinner-border text-primary" />
      </div>
    );

  if (!invoice) return null;

  const isDeposit = invoice.type === "DEPOSIT";
  const isMonthly = invoice.type === "MONTHLY";
  const contractEnded = ["EXPIRED", "TERMINATED"].includes(
    invoice.contractStatus,
  );
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

  const depositPct =
    computedTotal > 0
      ? Math.min(100, Math.round((paidAmount / computedTotal) * 100))
      : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid py-4">
      {/* ── MODAL: Ghi nhận nộp cọc ────────────────────────────────────── */}
      {showDepositModal && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 420 }}
          >
            <div className="modal-content border-0 shadow rounded-4 p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="bg-warning-subtle rounded-3 p-2 text-warning fs-5">
                  <FaHandHoldingUsd />
                </div>
                <h5 className="fw-bold mb-0">Ghi nhận nộp cọc</h5>
              </div>
              <p className="text-muted small mb-1">
                Tổng tiền cọc: <strong>{fmt(computedTotal)}</strong>
              </p>
              {paidAmount > 0 && (
                <p className="small mb-3" style={{ color: "#f59e0b" }}>
                  Đã nộp: <strong>{fmt(paidAmount)}</strong> — Còn lại:{" "}
                  <strong>{fmt(remainAmount)}</strong>
                </p>
              )}
              <label className="form-label small fw-bold text-uppercase text-muted">
                Số tiền nộp lần này (₫)
              </label>
              <input
                type="number"
                className="form-control mb-4"
                placeholder="VD: 500000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
              />
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-warning flex-fill fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleDepositPayment}
                  disabled={depositLoading}
                >
                  <FaHandHoldingUsd />{" "}
                  {depositLoading ? "Đang lưu..." : "Ghi nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/invoice")}
          >
            <FaArrowLeft /> Danh sách
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <FaFileInvoiceDollar className="text-primary fs-5" />
              <h4 className="fw-bold text-dark mb-0">
                Hóa đơn #{invoice.invoiceId}
              </h4>
              {tm.label && (
                <span
                  className={`badge rounded-pill bg-light border fw-normal ${tm.iconCls}`}
                >
                  {tm.icon} {tm.label}
                </span>
              )}
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-muted small mb-0 mt-1">
              {isDeposit
                ? `Tiền cọc hợp đồng · HĐ #${invoice.contractId}`
                : `Kỳ tháng ${invoice.periodMonth}/${invoice.periodYear} · HĐ #${invoice.contractId}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 flex-wrap">
          {invoice.status === "DRAFT" && (
            <>
              {!isDeposit && (
                <button
                  className="btn btn-sm btn-outline-purple d-flex align-items-center gap-2"
                  style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
                  disabled={actionLoading}
                  onClick={() =>
                    handleAction(apiInvoice.recalculate, "Tính lại tổng tiền")
                  }
                >
                  <FaRedo /> Tính lại
                </button>
              )}
              <button
                className="btn btn-sm btn-warning d-flex align-items-center gap-2"
                disabled={actionLoading}
                onClick={() =>
                  handleAction(apiInvoice.send, "Gửi hóa đơn cho khách")
                }
              >
                <FaPaperPlane /> Gửi khách
              </button>
            </>
          )}

          {isMonthly && invoice.status === "PENDING" && (
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-2"
              disabled={actionLoading}
              onClick={() =>
                handleAction(apiInvoice.markPaid, "Xác nhận đã thanh toán")
              }
            >
              <FaCheckDouble /> Đã thu tiền
            </button>
          )}

          {isDeposit && ["PENDING", "PARTIAL"].includes(invoice.status) && (
            <button
              className="btn btn-sm btn-warning d-flex align-items-center gap-2"
              disabled={actionLoading}
              onClick={() => setShowDepositModal(true)}
            >
              <FaHandHoldingUsd /> Nộp cọc
            </button>
          )}

          {isDeposit && invoice.status === "PAID" && contractEnded && (
            <button
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{
                background: "#ede9fe",
                color: "#8b5cf6",
                border: "none",
              }}
              disabled={actionLoading}
              onClick={() =>
                handleAction(
                  (id) => apiInvoice.refund(id, ""),
                  "Hoàn trả tiền cọc",
                )
              }
            >
              <FaUndoAlt /> Hoàn cọc
            </button>
          )}

          {["DRAFT", "PENDING", "PARTIAL"].includes(invoice.status) && (
            <button
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
              disabled={actionLoading}
              onClick={() => handleAction(apiInvoice.cancel, "Hủy hóa đơn")}
            >
              <FaBan /> Hủy
            </button>
          )}

          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
            onClick={() => exportInvoiceToPDF({ invoice })}
          >
            <FaFilePdf /> Xuất PDF
          </button>
        </div>
      </div>

      {/* ── META CARDS ─────────────────────────────────────────────────── */}
      {isDeposit ? (
        <div className="row g-3 mb-4">
          {[
            { label: "Phòng", value: invoice.roomName || "—" },
            { label: "Tổng tiền cọc", value: fmt(computedTotal) },
            {
              label: "Đã nộp",
              value: fmt(paidAmount),
              cls:
                paidAmount >= computedTotal
                  ? "text-success"
                  : paidAmount > 0
                    ? "text-warning"
                    : "text-muted",
            },
            {
              label: "Còn lại",
              value: remainAmount > 0 ? fmt(remainAmount) : "Đã nộp đủ ✓",
              cls: remainAmount > 0 ? "text-danger" : "text-success",
            },
            { label: "Ngày tạo", value: fmtDate(invoice.createdAt) },
          ].map(({ label, value, cls = "" }) => (
            <div className="col-6 col-md-4 col-lg-2" key={label}>
              <MetaCard label={label} value={value} valueCls={cls} />
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {[
            { label: "Phòng", value: invoice.roomName || "—" },
            { label: "Hạn thanh toán", value: fmtDate(invoice.dueDate) },
            { label: "Ngày tạo", value: fmtDate(invoice.createdAt) },
            { label: "Ngày thanh toán", value: fmtDate(paidAt) },
          ].map(({ label, value }) => (
            <div className="col-6 col-md-3" key={label}>
              <MetaCard label={label} value={value} />
            </div>
          ))}
        </div>
      )}

      {/* ── INVOICE CARD ────────────────────────────────────────────────── */}
      <div
        className="card border-0 shadow-sm rounded-3 overflow-hidden"
        id="invoice-print"
      >
        {/* Card header */}
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            {isDeposit ? (
              <FaShieldAlt className="text-warning fs-5" />
            ) : invoice.type === "REPAIR" ? (
              <FaWrench className="text-danger fs-5" />
            ) : (
              <FaHome className="text-primary fs-5" />
            )}
            <div>
              <div className="fw-bold text-dark">
                {isDeposit
                  ? "HÓA ĐƠN TIỀN CỌC"
                  : invoice.type === "REPAIR"
                    ? "HÓA ĐƠN SỬA CHỮA"
                    : "HÓA ĐƠN TIỀN PHÒNG"}
              </div>
              <div className="text-muted small">
                {isDeposit
                  ? `Hợp đồng #${invoice.contractId} · ${invoice.roomName || ""}`
                  : invoice.type === "REPAIR"
                    ? `Phòng ${invoice.roomName || "—"} · HĐ #${invoice.contractId}`
                    : `Kỳ: Tháng ${invoice.periodMonth}/${invoice.periodYear}`}
              </div>
            </div>
          </div>
          <div className="text-end">
            <div
              className="fw-black fs-4"
              style={{ color: isDeposit ? "#f59e0b" : "#6366f1" }}
            >
              #{invoice.invoiceId}
            </div>
            <div className="text-muted small">HĐ #{invoice.contractId}</div>
          </div>
        </div>

        {/* ── DEPOSIT body ──────────────────────────────────────────────── */}
        {isDeposit && (
          <div className="card-body p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Tiến độ nộp cọc</span>
                <strong className="text-dark">{depositPct}%</strong>
              </div>
              <div className="progress" style={{ height: 10 }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${depositPct}%`,
                    background:
                      depositPct >= 100
                        ? "linear-gradient(90deg,#10b981,#059669)"
                        : "linear-gradient(90deg,#f59e0b,#f97316)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted small text-uppercase">
                    <th className="py-2">Hạng mục</th>
                    <th>Mô tả</th>
                    <th className="text-end">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-warning-subtle">
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FaShieldAlt className="text-warning" />
                        <div>
                          <div className="fw-bold">Tiền đặt cọc</div>
                          <div className="text-muted small">
                            Cọc khi ký hợp đồng
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted small">
                      Phòng {invoice.roomName || "—"}
                    </td>
                    <td className="text-end fw-bold">{fmt(computedTotal)}</td>
                  </tr>
                  {invoice.paymentHistory?.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center gap-2 ps-3">
                          <FaHandHoldingUsd className="text-success" />
                          <span className="small text-muted">
                            Lần nộp {i + 1}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted small">
                        {fmtDate(p.paymentDate)}
                      </td>
                      <td className="text-end text-success fw-semibold small">
                        + {fmt(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng kết */}
            <div className="bg-light rounded-3 p-3 mt-3">
              <SummaryRow label="Tổng tiền cọc" value={fmt(computedTotal)} />
              <SummaryRow
                label="Đã nộp"
                value={fmt(paidAmount)}
                valueCls="text-success"
              />
              {remainAmount > 0 && (
                <SummaryRow
                  label="Còn thiếu"
                  value={fmt(remainAmount)}
                  valueCls="text-danger"
                />
              )}
              <hr className="my-2" />
              <div
                className="d-flex justify-content-between align-items-center rounded-3 px-4 py-3"
                style={{
                  background:
                    invoice.status === "PAID" || invoice.status === "REFUNDED"
                      ? "#064e3b"
                      : "#0f172a",
                }}
              >
                <span className="text-secondary fw-semibold small">
                  {invoice.status === "REFUNDED"
                    ? "ĐÃ HOÀN CỌC"
                    : invoice.status === "PAID"
                      ? "ĐÃ NỘP ĐỦ"
                      : "TỔNG CỌC"}
                </span>
                <span className="text-white fw-black fs-5">
                  {fmt(computedTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── REPAIR body ───────────────────────────────────────────────── */}
        {invoice.type === "REPAIR" && (
          <>
            <div className="card-body p-4">
              {invoice.status === "DRAFT" && (
                <div className="alert alert-warning d-flex gap-2 align-items-start py-2 mb-3">
                  <span>⚠️</span>
                  <div>
                    <div className="fw-bold small">
                      Hóa đơn đang ở trạng thái DRAFT — chưa gửi cho khách
                    </div>
                    <div className="small">
                      Kiểm tra thông tin bên dưới. Khi xác nhận đúng, bấm{" "}
                      <strong>"Gửi khách"</strong>.
                    </div>
                  </div>
                </div>
              )}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="text-muted small text-uppercase">
                      <th className="py-2">Hạng mục sửa chữa</th>
                      <th>Mô tả / Nguyên nhân</th>
                      <th>Thợ thực hiện</th>
                      <th className="text-end">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.length > 0 ? (
                      details.map((d, i) => (
                        <tr key={d.invoiceDetailId ?? i}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <FaWrench className="text-danger" />
                              <div>
                                <div className="fw-bold">
                                  {d.expenseCategory || "Sửa chữa"}
                                </div>
                                {d.expenseId && (
                                  <div className="text-muted small">
                                    Chi phí #{d.expenseId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className="small text-muted"
                            style={{ maxWidth: 220, whiteSpace: "pre-wrap" }}
                          >
                            {d.description || (
                              <span className="text-secondary fst-italic">
                                Không có mô tả
                              </span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {d.payeeName || "—"}
                          </td>
                          <td className="text-end fw-bold">
                            {fmt(d.subTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          <div className="text-warning fw-semibold small mb-1">
                            ⚠️ Backend chưa trả về chi tiết hóa đơn sửa chữa
                          </div>
                          <div className="text-muted small">
                            Service cần populate <code>expenseCategory</code>,{" "}
                            <code>description</code>, <code>payeeName</code> vào{" "}
                            <code>invoiceDetails</code>.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <div className="d-flex justify-content-end">
                <div style={{ minWidth: 300 }}>
                  {details.length > 0 && (
                    <SummaryRow
                      label="Tổng chi phí sửa chữa"
                      value={fmt(detailsSum || computedTotal)}
                    />
                  )}
                  <hr className="my-2" />
                  <div
                    className="d-flex justify-content-between align-items-center rounded-3 px-4 py-3"
                    style={{ background: "#7f1d1d" }}
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
                    <span className="text-white fw-black fs-5">
                      {fmt(computedTotal)}
                    </span>
                  </div>
                  {invoice.status === "PENDING" && invoice.dueDate && (
                    <p className="text-end text-warning small mt-2 mb-0">
                      <FaCalendarAlt className="me-1" />
                      Hạn thanh toán: {fmtDate(invoice.dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── MONTHLY body ──────────────────────────────────────────────── */}
        {isMonthly && (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted small text-uppercase">
                    <th className="ps-4 py-3">Hạng mục</th>
                    <th className="text-end">Đơn vị</th>
                    <th className="text-end">Số cũ</th>
                    <th className="text-end">Số mới</th>
                    <th className="text-end">Tiêu thụ</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-end pe-4">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Tiền phòng */}
                  {invoice.roomPrice != null && (
                    <tr className="table-light">
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <FaHome className="text-primary" />
                          <div>
                            <div className="fw-bold">Tiền phòng</div>
                            <div className="text-muted small">
                              Kỳ T{invoice.periodMonth}/{invoice.periodYear}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end text-muted small">tháng</td>
                      <td className="text-end text-muted">—</td>
                      <td className="text-end text-muted">—</td>
                      <td className="text-end fw-semibold">1</td>
                      <td className="text-end text-muted small">
                        {fmt(invoice.roomPrice)}
                      </td>
                      <td className="text-end fw-bold pe-4">
                        {fmt(invoice.roomPrice)}
                      </td>
                    </tr>
                  )}

                  {/* Dịch vụ */}
                  {details.length === 0 && invoice.roomPrice == null ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        Chưa có chi tiết hóa đơn
                      </td>
                    </tr>
                  ) : (
                    details.map((d, i) => (
                      <tr key={d.invoiceDetailId ?? i}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <span>{detailIcon(d.serviceName, d.unit)}</span>
                            <span className="fw-semibold">
                              {d.serviceName || "Dịch vụ"}
                            </span>
                          </div>
                        </td>
                        <td className="text-end text-muted small">
                          {d.unit || "—"}
                        </td>
                        <td className="text-end text-muted small">
                          {d.oldValue != null
                            ? Number(d.oldValue).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="text-end text-muted small">
                          {d.newValue != null
                            ? Number(d.newValue).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="text-end fw-semibold">
                          {d.quantity != null
                            ? Number(d.quantity).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="text-end text-muted small">
                          {fmt(d.unitPrice)}
                        </td>
                        <td className="text-end fw-bold pe-4">
                          {fmt(d.subTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total block */}
            <div className="card-footer bg-light border-0 py-3">
              <div className="d-flex justify-content-end">
                <div style={{ minWidth: 300 }}>
                  {invoice.roomPrice != null && (
                    <SummaryRow
                      label="Tiền phòng"
                      value={fmt(invoice.roomPrice)}
                    />
                  )}
                  {details.length > 0 && (
                    <SummaryRow label="Tiền dịch vụ" value={fmt(detailsSum)} />
                  )}
                  {invoice.discount != null && Number(invoice.discount) > 0 && (
                    <SummaryRow
                      label="Giảm giá"
                      value={`- ${fmt(invoice.discount)}`}
                      valueCls="text-success"
                    />
                  )}
                  <hr className="my-2" />
                  <div
                    className="d-flex justify-content-between align-items-center rounded-3 px-4 py-3"
                    style={{ background: "#0f172a" }}
                  >
                    <span className="text-secondary fw-semibold small">
                      TỔNG CỘNG
                    </span>
                    <span className="text-white fw-black fs-5">
                      {fmt(computedTotal)}
                    </span>
                  </div>
                  {invoice.status === "PENDING" && invoice.dueDate && (
                    <p className="text-end text-warning small mt-2 mb-0">
                      <FaCalendarAlt className="me-1" />
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
        <div className="alert alert-warning mt-3 py-2">
          <strong className="small">Ghi chú:</strong>
          <p className="mb-0 small">{invoice.notes}</p>
        </div>
      )}

      {/* Warning */}
      {hasWarning && (
        <div className="alert alert-warning mt-3 py-2">
          <p className="fw-bold small mb-1">
            ⚠️ Dữ liệu chưa đầy đủ từ backend:
          </p>
          <ul className="mb-0 small">
            {missingCreatedAt && (
              <li>
                <code>createdAt</code> — chưa có ngày tạo hóa đơn
              </li>
            )}
            {missingPaidAt && (
              <li>
                <code>paidAt</code> — hóa đơn PAID nhưng chưa có ngày thanh toán
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
  );
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function MetaCard({ label, value, valueCls = "" }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 h-100">
      <div
        className="text-muted small text-uppercase fw-bold mb-1"
        style={{ fontSize: 11 }}
      >
        {label}
      </div>
      <div className={`fw-bold ${valueCls}`} style={{ fontSize: 15 }}>
        {value}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueCls = "text-muted" }) {
  return (
    <div className="d-flex justify-content-between mb-1 small">
      <span className="text-muted">{label}</span>
      <span className={`fw-semibold ${valueCls}`}>{value}</span>
    </div>
  );
}
