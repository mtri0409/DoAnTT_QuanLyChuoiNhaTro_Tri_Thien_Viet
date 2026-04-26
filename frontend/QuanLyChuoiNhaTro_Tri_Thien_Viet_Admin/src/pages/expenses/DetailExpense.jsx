import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaBuilding,
  FaFileInvoiceDollar,
  FaTools,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaInfoCircle,
  FaSync,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";

const EXPENSE_CATEGORIES = [
  "Sửa điện",
  "Sửa nước",
  "Sửa điều hòa",
  "Sửa cửa / khóa",
  "Sơn tường",
  "Thay thiết bị",
  "Vệ sinh",
  "Chi phí khác",
];

const fmt = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount || 0,
  );

const fmtDate = (dt) =>
  dt
    ? new Date(dt).toLocaleString("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "—";

// ── EditModal (inline trong trang detail) ──────────────────────────────────────
const EditModal = ({ expense, onClose, onSaved }) => {
  const [form, setForm] = useState({
    expenseCategory: expense.expenseCategory || "",
    amount: expense.amount || "",
    payeeName: expense.payeeName || "",
    evidenceUrl: expense.evidenceUrl || "",
    description: expense.description || "",
    paymentDate: expense.paymentDate ? expense.paymentDate.slice(0, 16) : "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0)
      return setErr("Số tiền không hợp lệ");
    setSaving(true);
    try {
      const res = await apiExpenses.update(expense.expenseId, {
        expenseCategory: form.expenseCategory || undefined,
        amount: Number(form.amount),
        paymentDate: form.paymentDate || undefined,
        payeeName: form.payeeName || undefined,
        evidenceUrl: form.evidenceUrl || undefined,
        description: form.description || undefined,
      });
      onSaved(res?.data || res);
    } catch (e) {
      setErr(e?.response?.data?.message || "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: 500, borderRadius: 16 }}
      >
        <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between pt-4 px-4 pb-3">
          <div>
            <h6 className="fw-bold mb-0">Chỉnh sửa chi phí</h6>
            <p className="text-muted small mb-0">#{expense.expenseId}</p>
          </div>
          <button
            className="btn btn-sm btn-light rounded-circle"
            onClick={onClose}
          >
            <FaTimes size={13} />
          </button>
        </div>
        <div className="card-body px-4 pb-4">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Danh mục
              </label>
              <select
                className="form-select form-select-sm bg-light border-0"
                value={form.expenseCategory}
                onChange={f("expenseCategory")}
              >
                <option value="">Chọn danh mục...</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Số tiền (VNĐ) *
              </label>
              <input
                type="number"
                className="form-control form-control-sm bg-light border-0"
                value={form.amount}
                onChange={f("amount")}
                min={1}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Ngày thanh toán
              </label>
              <input
                type="datetime-local"
                className="form-control form-control-sm bg-light border-0"
                value={form.paymentDate}
                onChange={f("paymentDate")}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Tên thợ / Đơn vị
              </label>
              <input
                type="text"
                className="form-control form-control-sm bg-light border-0"
                value={form.payeeName}
                onChange={f("payeeName")}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Link bằng chứng
              </label>
              <input
                type="text"
                className="form-control form-control-sm bg-light border-0"
                value={form.evidenceUrl}
                onChange={f("evidenceUrl")}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold text-muted text-uppercase">
                Ghi chú
              </label>
              <textarea
                rows={2}
                className="form-control form-control-sm bg-light border-0"
                value={form.description}
                onChange={f("description")}
              />
            </div>
            {err && (
              <div className="col-12">
                <div className="alert alert-danger py-2 small mb-0">{err}</div>
              </div>
            )}
            <div className="col-12 d-flex gap-2 pt-1">
              <button
                className="btn btn-light flex-fill"
                onClick={onClose}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FaCheck size={11} />
                )}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── InfoRow ────────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, children }) => (
  <div className="d-flex align-items-start gap-3 py-3 border-bottom">
    <div
      className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: 34, height: 34, background: "#f1f5f9", color: "#64748b" }}
    >
      {icon}
    </div>
    <div className="flex-fill">
      <div
        className="text-muted small text-uppercase fw-semibold mb-1"
        style={{ fontSize: 10, letterSpacing: 0.5 }}
      >
        {label}
      </div>
      <div className="fw-medium text-dark" style={{ fontSize: 14 }}>
        {children}
      </div>
    </div>
  </div>
);

// ══ Trang chính ═══════════════════════════════════════════════════════════════
const DetailExpense = () => {
  const { expenseId: id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDetail = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiExpenses.getById(id);
      setExpense(res?.data || res);
    } catch {
      setExpense(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm("Xóa chi phí này? Hóa đơn liên kết (nếu có) sẽ bị hủy.")
    )
      return;
    setDeleting(true);
    try {
      await apiExpenses.delete(id);
      alert("Xóa thành công!");
      navigate("/expenses");
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể xóa");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <FaSync
          className="text-muted"
          style={{ animation: "spin 1s linear infinite", fontSize: 24 }}
        />
        <div className="text-muted mt-2 small">Đang tải...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="text-muted mb-3" style={{ fontSize: 40 }}>
          🔍
        </div>
        <h6 className="fw-bold">Không tìm thấy chi phí</h6>
        <p className="text-muted small">
          Chi phí #{id} không tồn tại hoặc đã bị xóa.
        </p>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/expenses")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isTenantFault = expense.payer === "TENANT_FAULT";

  return (
    <div className="container-fluid py-4">
      {editOpen && (
        <EditModal
          expense={expense}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setExpense(updated);
            setEditOpen(false);
          }}
        />
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/expenses")}
          >
            <FaArrowLeft size={12} /> Quay lại
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">
              Chi tiết chi phí{" "}
              <span className="text-muted fw-normal">#{expense.expenseId}</span>
            </h4>
            <p className="text-muted small mb-0">
              Xem và chỉnh sửa thông tin chi phí
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={() => setEditOpen(true)}
          >
            <FaEdit size={12} /> Chỉnh sửa
          </button>
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <span
                className="spinner-border spinner-border-sm"
                style={{ width: 12, height: 12 }}
              />
            ) : (
              <FaTrash size={12} />
            )}
            Xóa
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Cột trái: thông tin chính */}
        <div className="col-12 col-lg-8">
          {/* Tổng tiền nổi bật */}
          <div
            className="card border-0 shadow-sm rounded-3 mb-4 text-white"
            style={{
              background: isTenantFault
                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                : "linear-gradient(135deg, #16a34a, #15803d)",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2 opacity-75">
                {isTenantFault ? <FaFileInvoiceDollar /> : <FaBuilding />}
                <span className="small fw-semibold">
                  {isTenantFault
                    ? "Lỗi khách — Phát sinh hóa đơn sửa chữa"
                    : "Chi phí trọ — Vận hành nội bộ"}
                </span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                {fmt(expense.amount)}
              </div>
              {expense.expenseCategory && (
                <div className="mt-1 opacity-75 small">
                  {expense.expenseCategory}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h6 className="fw-bold text-dark mb-0">Thông tin chi tiết</h6>
            </div>
            <div className="card-body px-4 pb-2">
              <InfoRow icon={<FaTag size={13} />} label="Danh mục">
                {expense.expenseCategory || (
                  <span className="text-muted">Chưa phân loại</span>
                )}
              </InfoRow>
              <InfoRow
                icon={<FaUser size={13} />}
                label="Thợ / Đơn vị thực hiện"
              >
                {expense.payeeName || <span className="text-muted">—</span>}
              </InfoRow>
              <InfoRow
                icon={<FaCalendarAlt size={13} />}
                label="Ngày thanh toán"
              >
                {fmtDate(expense.paymentDate)}
              </InfoRow>
              <InfoRow icon={<FaCalendarAlt size={13} />} label="Ngày tạo">
                {fmtDate(expense.createdAt)}
              </InfoRow>
              {expense.description && (
                <InfoRow
                  icon={<FaInfoCircle size={13} />}
                  label="Ghi chú / Mô tả"
                >
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {expense.description}
                  </span>
                </InfoRow>
              )}
              {expense.evidenceUrl && (
                <InfoRow
                  icon={<FaExternalLinkAlt size={13} />}
                  label="Bằng chứng"
                >
                  <a
                    href={expense.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                  >
                    Xem bằng chứng <FaExternalLinkAlt size={10} />
                  </a>
                </InfoRow>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: liên kết */}
        <div className="col-12 col-lg-4">
          {/* Chi nhánh */}
          {expense.branchName && (
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded-2 p-2 bg-success-subtle">
                    <FaBuilding className="text-success" size={14} />
                  </div>
                  <span className="fw-semibold small text-uppercase text-muted">
                    Chi nhánh
                  </span>
                </div>
                <div className="fw-bold text-dark">{expense.branchName}</div>
                {expense.branchId && (
                  <div className="text-muted small">
                    ID: #{expense.branchId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Yêu cầu bảo trì */}
          {expense.maintenanceRequestId && (
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded-2 p-2 bg-primary-subtle">
                    <FaTools className="text-primary" size={14} />
                  </div>
                  <span className="fw-semibold small text-uppercase text-muted">
                    Yêu cầu sửa chữa
                  </span>
                </div>
                <div className="fw-bold text-dark mb-2">
                  #{expense.maintenanceRequestId}
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={() =>
                    navigate(
                      `/maintenance/${expense.maintenanceRequestId}/detail`,
                    )
                  }
                >
                  <FaExternalLinkAlt size={10} /> Xem yêu cầu
                </button>
              </div>
            </div>
          )}

          {/* Hóa đơn liên kết */}
          {expense.invoiceId && (
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="rounded-2 p-2 bg-info-subtle">
                    <FaFileInvoiceDollar className="text-info" size={14} />
                  </div>
                  <span className="fw-semibold small text-uppercase text-muted">
                    Hóa đơn liên kết
                  </span>
                </div>
                <div className="fw-bold text-dark mb-2">
                  #{expense.invoiceId}
                </div>
                <button
                  className="btn btn-outline-info btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => navigate(`/invoice/${expense.invoiceId}`)}
                >
                  <FaExternalLinkAlt size={10} /> Xem hóa đơn
                </button>
              </div>
            </div>
          )}

          {/* Không có liên kết nào */}
          {!expense.branchName &&
            !expense.maintenanceRequestId &&
            !expense.invoiceId && (
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3 text-center text-muted">
                  <div style={{ fontSize: 28 }} className="mb-2">
                    🔗
                  </div>
                  <div className="small">Không có liên kết</div>
                </div>
              </div>
            )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DetailExpense;
