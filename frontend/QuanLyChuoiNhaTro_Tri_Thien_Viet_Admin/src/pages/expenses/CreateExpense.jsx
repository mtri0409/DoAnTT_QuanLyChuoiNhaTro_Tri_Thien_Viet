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
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";
import apiBranch from "../../api/apiBranches";

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

const CreateExpense = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);
  const [evidenceFile, setEvidenceFile] = useState(null); // File object
  const [evidencePreview, setEvidencePreview] = useState(""); // ObjectURL để preview
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

  // Xử lý chọn file ảnh bằng chứng
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke URL cũ để tránh memory leak
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

    if (!form.payer) return setError("Vui lòng chọn loại chi phí.");
    if (!form.amount || Number(form.amount) <= 0)
      return setError("Số tiền phải lớn hơn 0.");
    if (form.payer === "TENANT_FAULT" && !form.maintenanceRequestId)
      return setError("Lỗi khách cần nhập mã yêu cầu sửa chữa.");
    if (form.payer === "OWNER_COST" && !form.branchId)
      return setError("Chi phí trọ cần chọn chi nhánh.");

    setSaving(true);
    try {
      // Nếu có file: upload lên server/storage trước rồi lấy URL
      // Hiện tại dùng tên file làm evidenceUrl tạm — thay bằng API upload thật của dự án
      let evidenceUrl = undefined;
      if (evidenceFile) {
        // TODO: thay đoạn này bằng API upload file thật của dự án
        // Ví dụ: const uploadRes = await apiUpload.upload(evidenceFile);
        //         evidenceUrl = uploadRes.url;
        evidenceUrl = evidenceFile.name; // placeholder
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
      alert("Tạo chi phí thành công!");
      navigate("/expenses");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
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
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={() => navigate("/expenses")}
        >
          <FaArrowLeft size={12} /> Quay lại
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0">TẠO CHI PHÍ THỦ CÔNG</h4>
          <p className="text-muted small mb-0">
            Ghi nhận chi phí sửa chữa hoặc vận hành
          </p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          {/* Chọn loại chi phí */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
              <h6 className="fw-bold text-dark mb-0">Loại chi phí *</h6>
              <p className="text-muted small mb-0">
                Chọn đối tượng chịu chi phí
              </p>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                {/* OWNER_COST */}
                <div className="col-6">
                  <div
                    className={`p-3 rounded-3 border-2 cursor-pointer ${
                      form.payer === "OWNER_COST"
                        ? "border border-success bg-success-subtle"
                        : "border border-light bg-light"
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
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaBuilding
                        size={16}
                        color={
                          form.payer === "OWNER_COST" ? "#16a34a" : "#94a3b8"
                        }
                      />
                      <span
                        className="fw-bold small"
                        style={{
                          color:
                            form.payer === "OWNER_COST" ? "#16a34a" : "#374151",
                        }}
                      >
                        Chi phí trọ
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Chi phí vận hành nội bộ
                    </div>
                  </div>
                </div>
                {/* TENANT_FAULT */}
                <div className="col-6">
                  <div
                    className={`p-3 rounded-3 border-2 cursor-pointer ${
                      form.payer === "TENANT_FAULT"
                        ? "border border-primary bg-primary-subtle"
                        : "border border-light bg-light"
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
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaFileInvoiceDollar
                        size={16}
                        color={
                          form.payer === "TENANT_FAULT" ? "#3b82f6" : "#94a3b8"
                        }
                      />
                      <span
                        className="fw-bold small"
                        style={{
                          color:
                            form.payer === "TENANT_FAULT"
                              ? "#3b82f6"
                              : "#374151",
                        }}
                      >
                        Lỗi khách
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      Phát sinh hóa đơn sửa chữa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form chi tiết */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-0 pt-4 pb-2 px-4">
              <h6 className="fw-bold text-dark mb-0">Thông tin chi phí</h6>
            </div>
            <div className="card-body px-4 pb-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Danh mục */}
                  <div className="col-12 col-md-6">
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

                  {/* Số tiền */}
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted text-uppercase">
                      Số tiền (VNĐ) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-light border-0"
                      placeholder="VD: 500000"
                      value={form.amount}
                      onChange={f("amount")}
                      min={1}
                    />
                  </div>

                  {/* Tên thợ */}
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted text-uppercase">
                      Tên thợ / Đơn vị
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light border-0"
                      placeholder="VD: Thợ điện Minh Tuấn"
                      value={form.payeeName}
                      onChange={f("payeeName")}
                    />
                  </div>

                  {/* Ngày thanh toán */}
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

                  {/* Trường động theo loại */}
                  {isTenantFault ? (
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted text-uppercase">
                        Mã yêu cầu sửa chữa{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-0 text-primary">
                          <FaTools size={11} />
                        </span>
                        <input
                          type="number"
                          className="form-control bg-light border-0"
                          placeholder="Nhập ID yêu cầu bảo trì..."
                          value={form.maintenanceRequestId}
                          onChange={f("maintenanceRequestId")}
                          min={1}
                        />
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                        Hệ thống sẽ tự tạo hóa đơn REPAIR cho khách thuê.
                      </div>
                    </div>
                  ) : (
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted text-uppercase">
                        Chi nhánh <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-0 text-success">
                          <FaBuilding size={11} />
                        </span>
                        <select
                          className="form-select bg-light border-0"
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

                  {/* Upload bằng chứng */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-muted text-uppercase">
                      Bằng chứng (ảnh / hóa đơn)
                    </label>

                    {/* Khu vực upload */}
                    {!evidenceFile ? (
                      <div
                        className="rounded-3 border-2 d-flex flex-column align-items-center justify-content-center gap-2 py-4"
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
                        <FaCloudUploadAlt size={28} className="text-muted" />
                        <div className="small text-muted">
                          Kéo thả hoặc{" "}
                          <span className="text-primary fw-semibold">
                            chọn file
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          JPG, PNG, PDF — tối đa 10MB
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rounded-3 border p-3 d-flex align-items-center gap-3"
                        style={{ background: "#f8fafc" }}
                      >
                        {/* Preview ảnh nếu là image */}
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
                          <div className="text-muted" style={{ fontSize: 11 }}>
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
                          title="Xóa file"
                        >
                          <FaTimesCircle className="text-danger" size={14} />
                        </button>
                      </div>
                    )}

                    {/* Input file ẩn */}
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
                    <label className="form-label small fw-semibold text-muted text-uppercase">
                      Ghi chú / Mô tả
                    </label>
                    <textarea
                      rows={3}
                      className="form-control form-control-sm bg-light border-0"
                      placeholder="Mô tả nội dung công việc..."
                      value={form.description}
                      onChange={f("description")}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="col-12">
                      <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-0">
                        <FaExclamationCircle size={14} />
                        <span className="small">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="col-12 d-flex gap-2 pt-2">
                    <button
                      type="button"
                      className="btn btn-light flex-fill"
                      onClick={() => navigate("/expenses")}
                      disabled={saving}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <FaCheck size={12} />
                      )}
                      {saving ? "Đang lưu..." : "Tạo chi phí"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExpense;
