import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTools,
  FaCalendarAlt,
  FaHome,
  FaUser,
  FaCheck,
  FaCog,
  FaBan,
  FaTrash,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaBuilding,
  FaChevronDown,
  FaPlus,
  FaEdit,
  FaClock,
} from "react-icons/fa";
import apiMaintenance from "../../api/apiMaintenance";
import apiExpenses from "../../api/apiExpenses";
import { imgURL } from "../../api/config";

/* ── Status config ── */
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    badgeBg: "bg-warning-subtle",
    badgeText: "text-warning",
    dot: "#d97706",
  },
  PROCESSING: {
    label: "Đang xử lý",
    badgeBg: "bg-primary-subtle",
    badgeText: "text-primary",
    dot: "#3b82f6",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badgeBg: "bg-success-subtle",
    badgeText: "text-success",
    dot: "#22c55e",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeBg: "bg-secondary-subtle",
    badgeText: "text-secondary",
    dot: "#9ca3af",
  },
};

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

/* ── StatusBadge ── */
const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || {
    label: status,
    badgeBg: "bg-light",
    badgeText: "text-dark",
  };
  return (
    <span
      className={`badge rounded-pill ${s.badgeBg} ${s.badgeText} fw-semibold`}
      style={{ fontSize: 12, padding: "6px 14px" }}
    >
      <span
        className="me-1"
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
        }}
      />
      {s.label}
    </span>
  );
};

/* ── Lightbox ── */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const src = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [images, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onClose}
        className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          width: 40,
          height: 40,
          border: "none",
        }}
      >
        <FaTimes size={16} />
      </button>
      {idx > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx - 1);
          }}
          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{
            position: "absolute",
            left: 20,
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            width: 44,
            height: 44,
            border: "none",
          }}
        >
          <FaChevronLeft size={18} />
        </button>
      )}
      <img
        src={src(images[idx])}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "88vw",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 10,
          boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
        }}
      />
      {idx < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx + 1);
          }}
          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{
            position: "absolute",
            right: 20,
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            width: 44,
            height: 44,
            border: "none",
          }}
        >
          <FaChevronRight size={18} />
        </button>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          {idx + 1} / {images.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {images.map((img, i) => (
            <img
              key={img.imageId}
              src={src(img)}
              alt=""
              onClick={() => setIdx(i)}
              style={{
                width: 44,
                height: 44,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "pointer",
                border: i === idx ? "2px solid #fff" : "2px solid transparent",
                opacity: i === idx ? 1 : 0.4,
                transition: "all 0.15s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── ExpenseForm ── */
const ExpenseForm = ({ request, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [payer, setPayer] = useState("TENANT_FAULT");
  const [form, setForm] = useState({
    expenseCategory: "",
    amount: "",
    payeeName: "",
    description: "",
  });
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const resolveBranchId = () =>
    request.branchId ||
    request.branch?.branchId ||
    request.room?.floor?.branch?.branchId ||
    null;

  const handleSubmit = async () => {
    if (!form.expenseCategory) return setErr("Vui lòng chọn danh mục chi phí");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setErr("Số tiền không hợp lệ");
    if (payer === "OWNER_COST" && !resolveBranchId())
      return setErr("Không tìm thấy chi nhánh của phòng này.");
    setErr("");
    setSubmitting(true);
    try {
      const evidenceUrl = evidenceFile ? evidenceFile.name : undefined;
      const payload = {
        payer,
        expenseCategory: form.expenseCategory,
        amount: Number(form.amount),
        ...(form.payeeName && { payeeName: form.payeeName }),
        ...(evidenceUrl && { evidenceUrl }),
        ...(form.description && { description: form.description }),
        ...(payer === "TENANT_FAULT"
          ? { maintenanceRequestId: request.requestId }
          : { branchId: resolveBranchId() }),
      };
      const data = await apiExpenses.create(payload);
      setResult({
        payer,
        expenseId: data.expenseId,
        invoiceId: data.invoiceId,
      });
      if (onSuccess) onSuccess(data);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Không thể tạo chi phí. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setErr("");
    setForm({
      expenseCategory: "",
      amount: "",
      payeeName: "",
      description: "",
    });
    setEvidenceFile(null);
    setEvidencePreview(null);
    setPayer("TENANT_FAULT");
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-white w-100 d-flex align-items-center justify-content-between p-3 border-0 bg-white"
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center bg-success-subtle"
            style={{ width: 36, height: 36 }}
          >
            <FaMoneyBillWave className="text-success" size={14} />
          </div>
          <div className="text-start">
            <div className="fw-bold small text-dark">
              Ghi nhận chi phí xử lý
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Tạo chi phí và hóa đơn liên quan
            </div>
          </div>
        </div>
        <FaChevronDown
          size={12}
          className="text-muted"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div className="p-3 border-top">
          {result ? (
            <div>
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small">
                <FaCheck size={12} /> Đã ghi nhận chi phí #{result.expenseId}
              </div>
              <button
                onClick={reset}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
              >
                <FaPlus size={10} /> Thêm chi phí khác
              </button>
            </div>
          ) : (
            <>
              {/* Loại chi phí */}
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Loại chi phí
                </label>
                <div className="d-flex gap-2">
                  {[
                    {
                      val: "TENANT_FAULT",
                      icon: <FaFileInvoiceDollar size={12} />,
                      title: "Lỗi do khách",
                      desc: "Tạo hóa đơn REPAIR → khách thanh toán",
                      color: "primary",
                    },
                    {
                      val: "OWNER_COST",
                      icon: <FaBuilding size={12} />,
                      title: "Lỗi do trọ",
                      desc: "Ghi vào chi phí vận hành nội bộ",
                      color: "success",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setPayer(opt.val)}
                      className={`btn btn-sm flex-fill text-start border-2 ${payer === opt.val ? `btn-outline-${opt.color} border-${opt.color}` : "btn-outline-secondary"}`}
                      style={{ padding: "10px 12px" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {opt.icon}
                        <span className="fw-bold" style={{ fontSize: 12 }}>
                          {opt.title}
                        </span>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: 11, lineHeight: 1.4 }}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Danh mục <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-sm"
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
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Số tiền (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm"
                  placeholder="Ví dụ: 500000"
                  value={form.amount}
                  onChange={f("amount")}
                />
              </div>
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Tên thợ / đơn vị
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Thợ điện Nguyễn A..."
                  value={form.payeeName}
                  onChange={f("payeeName")}
                />
              </div>
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Bằng chứng (file ảnh / hóa đơn)
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="form-control form-control-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEvidenceFile(file);
                      if (evidencePreview) URL.revokeObjectURL(evidencePreview);
                      if (file && file.type.startsWith("image/")) {
                        setEvidencePreview(URL.createObjectURL(file));
                      } else {
                        setEvidencePreview(null);
                      }
                    }}
                  />
                  {evidenceFile && (
                    <button
                      type="button"
                      className="btn btn-sm btn-light border-0"
                      onClick={() => {
                        setEvidenceFile(null);
                        if (evidencePreview)
                          URL.revokeObjectURL(evidencePreview);
                        setEvidencePreview(null);
                      }}
                      title="Xóa file"
                    >
                      <FaTimes size={12} className="text-danger" />
                    </button>
                  )}
                </div>
                {evidenceFile && (
                  <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                    {evidenceFile.name} —{" "}
                    {(evidenceFile.size / 1024).toFixed(1)} KB
                  </div>
                )}
                {evidencePreview && (
                  <div className="mt-2">
                    <img
                      src={evidencePreview}
                      alt="Xem trước ảnh bằng chứng"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        objectFit: "contain",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        display: "block",
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold text-uppercase text-muted"
                  style={{ letterSpacing: 0.6 }}
                >
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm"
                  placeholder="Mô tả chi tiết công việc sửa chữa..."
                  value={form.description}
                  onChange={f("description")}
                  style={{ resize: "vertical" }}
                />
              </div>

              {err && (
                <div className="alert alert-danger py-2 px-3 small">{err}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-bold ${payer === "TENANT_FAULT" ? "btn-primary" : "btn-success"}`}
              >
                {submitting ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ width: 13, height: 13 }}
                  />
                ) : (
                  <FaCheck size={12} />
                )}
                {payer === "TENANT_FAULT"
                  ? "Tạo hóa đơn sửa chữa"
                  : "Lưu chi phí vận hành"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ══ Trang chính ══ */
const MaintenanceDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiMaintenance
      .getRequestById(requestId)
      .then(setRequest)
      .catch(() => setError("Không thể tải thông tin yêu cầu"))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleStatusChange = async (newStatus) => {
    if (updating) return;
    setUpdating(true);
    try {
      const updated = await apiMaintenance.updateStatus(requestId, newStatus);
      setRequest(updated);
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể cập nhật");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xóa yêu cầu này vĩnh viễn?")) return;
    setDeleting(true);
    try {
      await apiMaintenance.deleteRequest(requestId);
      navigate("/maintenance");
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể xóa");
      setDeleting(false);
    }
  };

  const imgSrc = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;
  const formatDate = (dt) =>
    dt
      ? new Date(dt).toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const canTransition =
    request && !["COMPLETED", "CANCELLED"].includes(request.status);
  const nextActions = request
    ? {
        PENDING: [
          {
            status: "PROCESSING",
            label: "Tiếp nhận xử lý",
            icon: <FaCog size={13} />,
            btnClass: "btn-outline-primary",
          },
        ],
        PROCESSING: [
          {
            status: "COMPLETED",
            label: "Đánh dấu hoàn thành",
            icon: <FaCheck size={13} />,
            btnClass: "btn-outline-success",
          },
          {
            status: "CANCELLED",
            label: "Hủy yêu cầu",
            icon: <FaBan size={13} />,
            btnClass: "btn-outline-danger",
          },
        ],
      }[request.status] || []
    : [];

  const showExpenseForm =
    request && ["PROCESSING", "COMPLETED"].includes(request.status);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-secondary spinner-border-sm" />
      </div>
    );

  if (error)
    return (
      <div className="container py-5 text-center">
        <p className="text-danger small">{error}</p>
        <button
          className="btn btn-sm btn-light rounded-3"
          onClick={() => navigate("/maintenance")}
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="container-fluid py-4">
      {lightbox.open && request?.images?.length > 0 && (
        <Lightbox
          images={request.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      {/* ── Header (giống ProfileDetail) ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate("/maintenance")}
            className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT BÁO HỎNG</h4>
            <span className="badge bg-primary-subtle text-primary mt-1">
              ID: #MR-{request?.requestId}
            </span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2 px-4"
            onClick={() => navigate(`/maintenance/${requestId}/edit`)}
          >
            <FaEdit size={13} /> Chỉnh sửa
          </button>
          <button
            className="btn btn-outline-danger shadow-sm d-flex align-items-center gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <span
                className="spinner-border spinner-border-sm"
                style={{ width: 13, height: 13 }}
              />
            ) : (
              <FaTrash size={13} />
            )}
            Xóa
          </button>
        </div>
      </div>

      {/* ── Nội dung ── */}
      <div className="row g-3">
        {/* ── Cột trái ── */}
        <div className="col-12 col-lg-8">
          {/* Card chính */}
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-warning-subtle"
                  style={{ width: 44, height: 44, flexShrink: 0 }}
                >
                  <FaTools className="text-warning" size={18} />
                </div>
                <div>
                  <div className="fw-bold">Yêu cầu sửa chữa</div>
                  <div className="d-flex align-items-center gap-3 mt-1">
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <FaHome size={10} /> {request?.roomName}
                    </span>
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <FaUser size={10} /> {request?.creatorName || "—"}
                    </span>
                  </div>
                </div>
              </div>
              <StatusBadge status={request?.status} />
            </div>

            <div className="card-body">
              {/* Mô tả sự cố */}
              <div className="mb-4">
                <p
                  className="text-muted small fw-semibold text-uppercase mb-2"
                  style={{ letterSpacing: 0.8 }}
                >
                  Mô tả sự cố
                </p>
                <div
                  className="bg-light rounded-3 p-3 small"
                  style={{ lineHeight: 1.75, color: "#111" }}
                >
                  {request?.description}
                </div>
              </div>

              {/* Thông tin chi tiết dạng bảng */}
              <table className="table table-borderless table-sm mb-0">
                <tbody>
                  <tr>
                    <td
                      className="text-muted small ps-0"
                      style={{ width: 140 }}
                    >
                      Ngày gửi
                    </td>
                    <td className="small fw-semibold">
                      <FaCalendarAlt size={11} className="text-warning me-1" />
                      {formatDate(request?.createdAt)}
                    </td>
                  </tr>
                  {request?.updatedAt && (
                    <tr>
                      <td className="text-muted small ps-0">Cập nhật lúc</td>
                      <td className="small fw-semibold">
                        <FaCalendarAlt
                          size={11}
                          className="text-secondary me-1"
                        />
                        {formatDate(request?.updatedAt)}
                      </td>
                    </tr>
                  )}
                  {request?.assetName && (
                    <tr>
                      <td className="text-muted small ps-0">
                        Tài sản liên quan
                      </td>
                      <td className="small fw-semibold">{request.assetName}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ảnh đính kèm */}
          {request?.images?.length > 0 && (
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-header bg-white border-0 py-3">
                <span
                  className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-2"
                  style={{ letterSpacing: 0.8 }}
                >
                  <FaImages size={12} /> Ảnh đính kèm ({request.images.length})
                </span>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {request.images.map((img, i) => (
                    <div
                      key={img.imageId}
                      onClick={() => setLightbox({ open: true, index: i })}
                      className="rounded-3 overflow-hidden border"
                      style={{
                        width: 100,
                        height: 100,
                        cursor: "pointer",
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <img
                        src={imgSrc(img)}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.parentElement.style.background = "#f0f0f0";
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form ghi nhận chi phí */}
          {showExpenseForm && (
            <ExpenseForm request={request} onSuccess={() => {}} />
          )}
        </div>

        {/* ── Cột phải ── */}
        <div className="col-12 col-lg-4">
          {/* Cập nhật trạng thái */}
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 py-3">
              <p
                className="text-muted small fw-semibold text-uppercase mb-0"
                style={{ letterSpacing: 0.8 }}
              >
                Cập nhật trạng thái
              </p>
            </div>
            <div className="card-body">
              {canTransition ? (
                <div className="d-flex flex-column gap-2">
                  {nextActions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => handleStatusChange(action.status)}
                      disabled={updating}
                      className={`btn btn-sm ${action.btnClass} d-flex align-items-center gap-2 fw-semibold`}
                    >
                      {updating ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          style={{ width: 13, height: 13 }}
                        />
                      ) : (
                        action.icon
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted small bg-light rounded-3 py-3 px-2">
                  Yêu cầu đã kết thúc
                </div>
              )}

              {request?.status === "PROCESSING" && (
                <div className="alert alert-warning py-2 px-3 mt-3 small mb-0">
                  <div className="fw-bold mb-1">💡 Gợi nhắc</div>
                  Đừng quên ghi nhận chi phí xử lý bên dưới sau khi hoàn tất sửa
                  chữa.
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 py-3">
              <p
                className="text-muted small fw-semibold text-uppercase mb-0"
                style={{ letterSpacing: 0.8 }}
              >
                Tiến trình
              </p>
            </div>
            <div className="card-body pt-2">
              {["PENDING", "PROCESSING", "COMPLETED"].map((s, i) => {
                const statuses = [
                  "PENDING",
                  "PROCESSING",
                  "COMPLETED",
                  "CANCELLED",
                ];
                const currentIdx = statuses.indexOf(request?.status);
                const stepIdx = ["PENDING", "PROCESSING", "COMPLETED"].indexOf(
                  s,
                );
                const isCancelled = request?.status === "CANCELLED";
                const isDone = !isCancelled && currentIdx > stepIdx;
                const isCurrent = !isCancelled && request?.status === s;
                const cfg = STATUS_CONFIG[s];
                return (
                  <div
                    key={s}
                    className="d-flex gap-3"
                    style={{ marginBottom: i < 2 ? 8 : 0 }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 24,
                          height: 24,
                          flexShrink: 0,
                          background: isDone
                            ? cfg.dot
                            : isCurrent
                              ? "#fff"
                              : "#f3f4f6",
                          border: `2px solid ${isCurrent ? cfg.dot : isDone ? cfg.dot : "#e5e7eb"}`,
                        }}
                      >
                        {isDone && <FaCheck size={9} color="#fff" />}
                        {isCurrent && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: cfg.dot,
                              display: "block",
                            }}
                          />
                        )}
                      </div>
                      {i < 2 && (
                        <div
                          style={{
                            width: 2,
                            height: 18,
                            background: isDone ? cfg.dot : "#e5e7eb",
                            marginTop: 2,
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingTop: 3 }}>
                      <p
                        className="mb-0 small"
                        style={{
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent
                            ? cfg.dot
                            : isDone
                              ? "#374151"
                              : "#9ca3af",
                        }}
                      >
                        {cfg.label}
                      </p>
                    </div>
                  </div>
                );
              })}
              {request?.status === "CANCELLED" && (
                <div className="d-flex gap-3 mt-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: 24,
                      height: 24,
                      background: STATUS_CONFIG.CANCELLED.badgeBg,
                      border: `2px solid ${STATUS_CONFIG.CANCELLED.dot}`,
                    }}
                  >
                    <FaBan size={9} color={STATUS_CONFIG.CANCELLED.dot} />
                  </div>
                  <p
                    className="mb-0 small fw-bold"
                    style={{
                      color: STATUS_CONFIG.CANCELLED.dot,
                      paddingTop: 3,
                    }}
                  >
                    Đã hủy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
