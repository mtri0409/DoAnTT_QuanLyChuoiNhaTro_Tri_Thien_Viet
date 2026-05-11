import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaSync,
  FaCloudUploadAlt,
  FaTimesCircle,
  FaImage,
  FaExclamationCircle,
  FaTag,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaExternalLinkAlt,
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";
import axiosInstance from "../../api/axios";

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

// ── SectionHeader (đồng bộ CreateContract) ───────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
    {Icon && (
      <div
        className="d-flex align-items-center justify-content-center rounded-2 bg-light text-secondary flex-shrink-0"
        style={{ width: 30, height: 30 }}
      >
        <Icon size={13} />
      </div>
    )}
    <div>
      <span
        className="text-muted text-uppercase fw-bold d-block"
        style={{ letterSpacing: "0.06em", fontSize: "0.72rem" }}
      >
        {title}
      </span>
      {subtitle && (
        <span className="text-muted" style={{ fontSize: "0.72rem" }}>
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

// ── FieldLabel ────────────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label
    className="form-label small fw-bold text-muted text-uppercase mb-1"
    style={{ letterSpacing: "0.04em" }}
  >
    {children}
    {required && <span className="text-danger ms-1">*</span>}
  </label>
);

// ── MetaBadge (thông tin readonly của expense) ────────────────────────────────
const MetaBadge = ({ label, value, colorClass = "bg-light text-dark" }) => (
  <div
    className={`rounded-3 px-3 py-2 ${colorClass} border d-flex align-items-center gap-2`}
  >
    <span className="text-muted small">{label}:</span>
    <span className="fw-semibold small">{value}</span>
  </div>
);

// ══ EditExpense ════════════════════════════════════════════════════════════════
const EditExpense = () => {
  const { expenseId: id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expense, setExpense] = useState(null);

  const [form, setForm] = useState({
    expenseCategory: "",
    amount: "",
    payeeName: "",
    description: "",
    paymentDate: "",
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const [existingEvidenceUrl, setExistingEvidenceUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await apiExpenses.getById(id);
        const data = res?.data || res;
        setExpense(data);
        setForm({
          expenseCategory: data.expenseCategory || "",
          amount: data.amount || "",
          payeeName: data.payeeName || "",
          description: data.description || "",
          paymentDate: data.paymentDate ? data.paymentDate.slice(0, 16) : "",
        });
        setExistingEvidenceUrl(data.evidenceUrl || "");
      } catch {
        setExpense(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (evidencePreview) URL.revokeObjectURL(evidencePreview);
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
    setExistingEvidenceUrl("");
  };

  const handleRemoveFile = () => {
    if (evidencePreview) URL.revokeObjectURL(evidencePreview);
    setEvidenceFile(null);
    setEvidencePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0)
      return setError("Số tiền không hợp lệ.");

    setSaving(true);
    try {
      let evidenceUrl = existingEvidenceUrl || undefined;
      if (evidenceFile) {
        const formData = new FormData();
        formData.append("file", evidenceFile);
        const uploadRes = await axiosInstance.post(
          "/admin/expenses/upload-evidence",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        evidenceUrl = (uploadRes?.data || uploadRes).url;
      }

      await apiExpenses.update(id, {
        expenseCategory: form.expenseCategory || undefined,
        amount: Number(form.amount),
        paymentDate: form.paymentDate || undefined,
        payeeName: form.payeeName || undefined,
        evidenceUrl,
        description: form.description || undefined,
      });

      alert("Cập nhật chi phí thành công!");
      navigate(`/expenses/${id}/detail`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <button
          onClick={() => navigate(`/expenses/${id}/detail`)}
          className="btn btn-sm btn-light border"
          title="Quay lại"
        >
          <FaArrowLeft size={12} />
        </button>
        <FaMoneyBillWave className="text-secondary fs-5" />
        <div>
          <h4 className="fw-bold text-dark mb-0">
            Chỉnh sửa chi phí{" "}
            <span className="text-muted fw-normal">#{expense.expenseId}</span>
          </h4>
          <p className="text-muted small mb-0">Cập nhật thông tin chi phí</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <div className="row g-4">
              {/* ── CỘT TRÁI: Thông tin readonly ── */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-header bg-white border-0 py-3">
                    <SectionHeader
                      icon={isTenantFault ? FaExternalLinkAlt : FaTag}
                      title="Thông tin không thể sửa"
                      subtitle="Chỉ đọc"
                    />
                  </div>
                  <div className="card-body pt-0 px-4 pb-4 d-flex flex-column gap-3">
                    {/* Payer badge */}
                    <div
                      className={`rounded-3 p-3 text-white text-center`}
                      style={{
                        background: isTenantFault
                          ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                          : "linear-gradient(135deg,#16a34a,#15803d)",
                      }}
                    >
                      <div className="small fw-bold mb-1">
                        {isTenantFault ? "Lỗi khách" : "Chi phí trọ"}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.85 }}>
                        {isTenantFault
                          ? "Phát sinh hóa đơn sửa chữa"
                          : "Vận hành nội bộ"}
                      </div>
                    </div>

                    {expense.branchName && (
                      <MetaBadge label="Chi nhánh" value={expense.branchName} />
                    )}
                    {expense.maintenanceRequestId && (
                      <MetaBadge
                        label="Yêu cầu SC"
                        value={`#${expense.maintenanceRequestId}`}
                      />
                    )}
                    {expense.invoiceId && (
                      <MetaBadge
                        label="Hóa đơn"
                        value={`#${expense.invoiceId}`}
                        colorClass="bg-info-subtle text-dark"
                      />
                    )}

                    <div className="mt-auto pt-2 border-top">
                      <p className="text-muted mb-0" style={{ fontSize: 11 }}>
                        Loại chi phí, chi nhánh và hóa đơn không thể thay đổi
                        sau khi tạo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CỘT PHẢI: Form chỉnh sửa ── */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-header bg-white border-0 py-3">
                    <SectionHeader icon={FaTag} title="Thông tin chi phí" />
                  </div>
                  <div className="card-body pt-0 px-4 pb-4 d-flex flex-column">
                    <div className="row g-3">
                      {/* Danh mục */}
                      <div className="col-12">
                        <FieldLabel>Danh mục</FieldLabel>
                        <select
                          className="form-select bg-light border-0 py-2"
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

                      {/* Số tiền */}
                      <div className="col-12 col-md-6">
                        <FieldLabel required>Số tiền (VNĐ)</FieldLabel>
                        <input
                          type="number"
                          className="form-control bg-light border-0 py-2"
                          value={form.amount}
                          onChange={f("amount")}
                          min={1}
                          placeholder="VD: 500000"
                        />
                        {isTenantFault && expense.invoiceId && (
                          <div
                            className="text-muted mt-1"
                            style={{ fontSize: 11 }}
                          >
                            Thay đổi số tiền sẽ cập nhật hóa đơn #
                            {expense.invoiceId} (nếu còn DRAFT/PENDING).
                          </div>
                        )}
                      </div>

                      {/* Ngày thanh toán */}
                      <div className="col-12 col-md-6">
                        <FieldLabel>Ngày thanh toán</FieldLabel>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaCalendarAlt size={11} className="text-muted" />
                          </span>
                          <input
                            type="datetime-local"
                            className="form-control bg-light border-0 py-2"
                            value={form.paymentDate}
                            onChange={f("paymentDate")}
                          />
                        </div>
                      </div>

                      {/* Tên thợ */}
                      <div className="col-12">
                        <FieldLabel>Tên thợ / Đơn vị thực hiện</FieldLabel>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <FaUser size={11} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control bg-light border-0 py-2"
                            placeholder="VD: Thợ điện Minh Tuấn"
                            value={form.payeeName}
                            onChange={f("payeeName")}
                          />
                        </div>
                      </div>

                      {/* Bằng chứng */}
                      <div className="col-12">
                        <FieldLabel>Bằng chứng (ảnh / hóa đơn)</FieldLabel>

                        {/* Bằng chứng hiện tại */}
                        {existingEvidenceUrl && !evidenceFile && (
                          <div
                            className="rounded-3 border p-3 d-flex align-items-center gap-3 mb-2"
                            style={{ background: "#f8fafc" }}
                          >
                            <div
                              className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: 48,
                                height: 48,
                                background: "#e2e8f0",
                              }}
                            >
                              <FaImage size={20} className="text-muted" />
                            </div>
                            <div className="flex-fill overflow-hidden">
                              <div className="fw-semibold small text-dark">
                                Bằng chứng hiện tại
                              </div>
                              <a
                                href={existingEvidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary small text-decoration-none text-truncate d-block"
                                style={{ fontSize: 11 }}
                              >
                                {existingEvidenceUrl}
                              </a>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border-0 flex-shrink-0"
                              onClick={() => setExistingEvidenceUrl("")}
                              title="Xóa bằng chứng cũ"
                            >
                              <FaTimesCircle
                                className="text-danger"
                                size={14}
                              />
                            </button>
                          </div>
                        )}

                        {/* Upload mới */}
                        {!evidenceFile ? (
                          <div
                            className="rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 py-4"
                            style={{
                              border: "2px dashed #cbd5e1",
                              background: "#f8fafc",
                              cursor: "pointer",
                              transition: "border-color 0.15s",
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                if (evidencePreview)
                                  URL.revokeObjectURL(evidencePreview);
                                setEvidenceFile(file);
                                setEvidencePreview(URL.createObjectURL(file));
                                setExistingEvidenceUrl("");
                              }
                            }}
                          >
                            <FaCloudUploadAlt
                              size={26}
                              className="text-muted"
                            />
                            <div className="small text-muted">
                              Kéo thả hoặc{" "}
                              <span className="text-primary fw-semibold">
                                chọn file mới
                              </span>
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 11 }}
                            >
                              JPG, PNG, PDF — tối đa 10MB
                            </div>
                          </div>
                        ) : (
                          <div
                            className="rounded-3 border p-3 d-flex align-items-center gap-3"
                            style={{ background: "#f8fafc" }}
                          >
                            {evidenceFile.type.startsWith("image/") ? (
                              <img
                                src={evidencePreview}
                                alt="preview"
                                style={{
                                  width: 64,
                                  height: 64,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e2e8f0",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: 64,
                                  height: 64,
                                  background: "#e2e8f0",
                                }}
                              >
                                <FaImage size={24} className="text-muted" />
                              </div>
                            )}
                            <div className="flex-fill overflow-hidden">
                              <div className="fw-semibold small text-dark text-truncate">
                                {evidenceFile.name}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: 11 }}
                              >
                                {(evidenceFile.size / 1024).toFixed(1)} KB
                              </div>
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-primary p-0 mt-1"
                                style={{ fontSize: 11 }}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Đổi file khác
                              </button>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border-0 flex-shrink-0"
                              onClick={handleRemoveFile}
                            >
                              <FaTimesCircle
                                className="text-danger"
                                size={14}
                              />
                            </button>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Ghi chú */}
                      <div className="col-12">
                        <FieldLabel>Ghi chú / Mô tả</FieldLabel>
                        <textarea
                          rows={3}
                          className="form-control bg-light border-0"
                          placeholder="Mô tả nội dung công việc..."
                          value={form.description}
                          onChange={f("description")}
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0 mt-3">
                        <FaExclamationCircle size={14} />
                        <span className="small">{error}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-4">
                      <hr className="text-muted opacity-25 mb-4" />
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-light border px-4 fw-semibold"
                          onClick={() => navigate(`/expenses/${id}/detail`)}
                          disabled={saving}
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn btn-dark px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm" />{" "}
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <FaCheck size={12} /> Lưu thay đổi
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditExpense;
