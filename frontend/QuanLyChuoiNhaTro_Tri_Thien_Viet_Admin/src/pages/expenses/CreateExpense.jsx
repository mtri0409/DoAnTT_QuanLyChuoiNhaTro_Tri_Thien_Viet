import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaBuilding,
  FaFileInvoiceDollar,
  FaTools,
  FaExclamationCircle,
  FaCloudUploadAlt,
  FaTimesCircle,
  FaImage,
  FaPlus,
  FaTag,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";
import apiBranch from "../../api/apiBranches";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";

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

// ══ CreateExpense ══════════════════════════════════════════════════════════════
const CreateExpense = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    payer: "OWNER_COST",
    expenseCategory: "",
    amount: "",
    paymentDate: "",
    payeeName: "",
    description: "",
    maintenanceRequestId: "",
    branchId: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await apiBranch.getAllBranches(0, 50);
        setBranches(res.content || []);
      } catch {
        /* ignore */
      }
    };
    fetchBranches();
  }, []);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (evidencePreview) URL.revokeObjectURL(evidencePreview);
    setEvidenceFile(file);
    setEvidencePreview(URL.createObjectURL(file));
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
      return setError("Số tiền phải lớn hơn 0.");
    if (form.payer === "TENANT_FAULT" && !form.maintenanceRequestId)
      return setError("Lỗi khách cần nhập mã yêu cầu sửa chữa.");
    if (form.payer === "OWNER_COST" && !form.branchId)
      return setError("Chi phí trọ cần chọn chi nhánh.");

    setSaving(true);
    try {
      let evidenceUrl;
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

      await apiExpenses.create({
        payer: form.payer,
        expenseCategory: form.expenseCategory || undefined,
        amount: Number(form.amount),
        paymentDate: form.paymentDate || undefined,
        payeeName: form.payeeName || undefined,
        evidenceUrl,
        description: form.description || undefined,
        maintenanceRequestId: form.maintenanceRequestId
          ? Number(form.maintenanceRequestId)
          : undefined,
        branchId: form.branchId ? Number(form.branchId) : undefined,
      });
      toast.error("Tạo chi phí thành công!");
      navigate("/expenses");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tạo chi phí. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isTenantFault = form.payer === "TENANT_FAULT";

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/expenses")}
          className="btn btn-sm btn-light border"
          title="Quay lại"
        >
          <FaArrowLeft size={12} />
        </button>
        <FaMoneyBillWave className="text-secondary fs-5" />
        <div>
          <h4 className="fw-bold text-dark mb-0">Tạo chi phí mới</h4>
          <p className="text-muted small mb-0">
            Ghi nhận chi phí sửa chữa hoặc vận hành
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <div className="row g-4">
              {/* ── CỘT TRÁI: Loại chi phí + Đối tượng ── */}
              <div className="col-lg-5">
                {/* Loại chi phí */}
                <div className="card border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-header bg-white border-0 py-3">
                    <SectionHeader
                      icon={FaFileInvoiceDollar}
                      title="Loại chi phí"
                      subtitle="Chọn đối tượng chịu chi phí"
                    />
                  </div>
                  <div className="card-body pt-0 px-4 pb-4">
                    <div className="d-flex flex-column gap-2">
                      {/* OWNER_COST */}
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${
                          form.payer === "OWNER_COST"
                            ? "border-success bg-success-subtle"
                            : "bg-light border-0"
                        }`}
                        style={{ cursor: "pointer", transition: "all 0.15s" }}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            payer: "OWNER_COST",
                            maintenanceRequestId: "",
                          }))
                        }
                      >
                        <div
                          className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                            form.payer === "OWNER_COST"
                              ? "bg-success text-white"
                              : "bg-white border"
                          }`}
                          style={{ width: 22, height: 22 }}
                        >
                          {form.payer === "OWNER_COST" && <FaCheck size={10} />}
                        </div>
                        <FaBuilding
                          size={15}
                          color={
                            form.payer === "OWNER_COST" ? "#16a34a" : "#94a3b8"
                          }
                        />
                        <div>
                          <div
                            className="fw-bold small"
                            style={{
                              color:
                                form.payer === "OWNER_COST"
                                  ? "#16a34a"
                                  : "#374151",
                            }}
                          >
                            Chi phí trọ
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            Vận hành nội bộ
                          </div>
                        </div>
                      </div>

                      {/* TENANT_FAULT */}
                      <div
                        className={`p-3 rounded-3 border d-flex align-items-center gap-3 ${
                          isTenantFault
                            ? "border-primary bg-primary-subtle"
                            : "bg-light border-0"
                        }`}
                        style={{ cursor: "pointer", transition: "all 0.15s" }}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            payer: "TENANT_FAULT",
                            branchId: "",
                          }))
                        }
                      >
                        <div
                          className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                            isTenantFault
                              ? "bg-primary text-white"
                              : "bg-white border"
                          }`}
                          style={{ width: 22, height: 22 }}
                        >
                          {isTenantFault && <FaCheck size={10} />}
                        </div>
                        <FaFileInvoiceDollar
                          size={15}
                          color={isTenantFault ? "#3b82f6" : "#94a3b8"}
                        />
                        <div>
                          <div
                            className="fw-bold small"
                            style={{
                              color: isTenantFault ? "#3b82f6" : "#374151",
                            }}
                          >
                            Lỗi khách
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            Phát sinh hóa đơn sửa chữa
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Đối tượng liên kết */}
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-header bg-white border-0 py-3">
                    <SectionHeader
                      icon={isTenantFault ? FaTools : FaBuilding}
                      title={isTenantFault ? "Yêu cầu sửa chữa" : "Chi nhánh"}
                    />
                  </div>
                  <div className="card-body pt-0 px-4 pb-4">
                    {isTenantFault ? (
                      <div>
                        <FieldLabel required>Mã yêu cầu bảo trì</FieldLabel>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-primary">
                            <FaTools size={11} />
                          </span>
                          <input
                            type="number"
                            className="form-control bg-light border-0 py-2"
                            placeholder="Nhập ID yêu cầu bảo trì..."
                            value={form.maintenanceRequestId}
                            onChange={f("maintenanceRequestId")}
                            min={1}
                          />
                        </div>
                        <div
                          className="text-muted mt-1"
                          style={{ fontSize: 11 }}
                        >
                          Hệ thống sẽ tự tạo hóa đơn REPAIR cho khách thuê.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FieldLabel required>Chi nhánh</FieldLabel>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-success">
                            <FaBuilding size={11} />
                          </span>
                          <select
                            className="form-select bg-light border-0 py-2"
                            value={form.branchId}
                            onChange={f("branchId")}
                          >
                            <option value="">Chọn chi nhánh...</option>
                            {branches.map((b) => (
                              <option key={b.branchId} value={b.branchId}>
                                {b.branchName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── CỘT PHẢI: Thông tin chi tiết ── */}
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-header bg-white border-0 py-3">
                    <SectionHeader icon={FaTag} title="Thông tin chi phí" />
                  </div>
                  <div className="card-body pt-0 px-4 pb-4 d-flex flex-column">
                    <div className="row g-3">
                      {/* Danh mục */}
                      <div className="col-12 col-md-6">
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
                          placeholder="VD: 500000"
                          value={form.amount}
                          onChange={f("amount")}
                          min={1}
                        />
                      </div>

                      {/* Tên thợ */}
                      <div className="col-12 col-md-6">
                        <FieldLabel>Tên thợ / Đơn vị</FieldLabel>
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

                      {/* Upload bằng chứng */}
                      <div className="col-12">
                        <FieldLabel>Bằng chứng (ảnh / hóa đơn)</FieldLabel>
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
                                chọn file
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
                          onClick={() => navigate("/expenses")}
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
                              <FaPlus size={12} /> Tạo chi phí
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

export default CreateExpense;
