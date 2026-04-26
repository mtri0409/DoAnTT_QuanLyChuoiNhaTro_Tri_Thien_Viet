import React, { useState, useEffect, useRef } from "react";
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
  FaExternalLinkAlt,
  FaCloudUploadAlt,
  FaTimesCircle,
  FaImage,
} from "react-icons/fa";
import apiMaintenance from "../../api/apiMaintenance";
import apiExpenses from "../../api/apiExpenses";
import { imgURL } from "../../api/config";

/* ── Status config ── */
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    bg: "#fef9ec",
    color: "#92400e",
    dot: "#d97706",
  },
  PROCESSING: {
    label: "Đang xử lý",
    bg: "#eff6ff",
    color: "#1e40af",
    dot: "#3b82f6",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "#f0fdf4",
    color: "#166534",
    dot: "#22c55e",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#f3f4f6",
    color: "#6b7280",
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

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || {
    label: status,
    bg: "#f3f4f6",
    color: "#374151",
    dot: "#9ca3af",
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "5px 14px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }}
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
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          style={{
            position: "absolute",
            left: 20,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          style={{
            position: "absolute",
            right: 20,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

const InfoRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      gap: 0,
      borderBottom: "1px solid #f3f4f6",
      padding: "10px 0",
    }}
  >
    <div
      style={{
        width: 140,
        flexShrink: 0,
        fontSize: 12,
        color: "#9ca3af",
        fontWeight: 500,
        paddingTop: 1,
      }}
    >
      {label}
    </div>
    <div style={{ flex: 1, fontSize: 13, color: "#111", fontWeight: 500 }}>
      {children}
    </div>
  </div>
);

/* ══ ExpenseForm ══ */
const ExpenseForm = ({ request, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [payer, setPayer] = useState("TENANT_FAULT");
  const [form, setForm] = useState({
    expenseCategory: "",
    amount: "",
    payeeName: "",
    description: "",
  });
  // ── File upload state ──
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState("");
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // ── Xử lý chọn file ──
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
      return setErr(
        "Không tìm thấy chi nhánh của phòng này. Vui lòng bổ sung branchId vào MaintenanceRequestDTO.",
      );

    setErr("");
    setSubmitting(true);
    try {
      // TODO: thay bằng API upload file thật của dự án để lấy URL
      // Ví dụ: const uploadRes = await apiUpload.upload(evidenceFile);
      //        evidenceUrl = uploadRes.url;
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
    handleRemoveFile();
    setPayer("TENANT_FAULT");
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#111",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600,
    marginBottom: 5,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        marginTop: 12,
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaMoneyBillWave color="#16a34a" size={14} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              Ghi nhận chi phí xử lý
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
              Tạo chi phí và hóa đơn liên quan
            </div>
          </div>
        </div>
        <FaChevronDown
          size={12}
          color="#9ca3af"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f3f4f6" }}>
          {result ? (
            /* ── Kết quả thành công ── */
            <div style={{ marginTop: 16 }}>
              {result.payer === "TENANT_FAULT" ? (
                /* TENANT_FAULT: hiện cảnh báo DRAFT, yêu cầu admin xác nhận trước khi gửi khách */
                <div>
                  {/* Bước 1: Đã tạo chi phí */}
                  <div
                    style={{
                      background: "#f0fdf4",
                      borderRadius: 10,
                      padding: "12px 16px",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <FaCheck color="#16a34a" size={13} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#166534",
                      }}
                    >
                      Đã ghi nhận chi phí #{result.expenseId}
                    </span>
                  </div>

                  {/* Bước 2: Cảnh báo hóa đơn đang ở DRAFT */}
                  {result.invoiceId && (
                    <div
                      style={{
                        background: "#fffbeb",
                        borderRadius: 10,
                        padding: "14px 16px",
                        border: "1px solid #fde68a",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#92400e",
                              marginBottom: 3,
                            }}
                          >
                            Hóa đơn #{result.invoiceId} đang ở trạng thái DRAFT
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#78350f",
                              lineHeight: 1.5,
                            }}
                          >
                            Hóa đơn <strong>chưa được gửi cho khách</strong>.
                            Vui lòng vào xem hóa đơn, kiểm tra thông tin rồi bấm{" "}
                            <strong>"Gửi hóa đơn"</strong> để khách nhận được
                            yêu cầu thanh toán.
                          </div>
                        </div>
                      </div>
                      <a
                        href={`/invoice/${result.invoiceId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#f59e0b",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 12,
                          padding: "8px 14px",
                          borderRadius: 7,
                          textDecoration: "none",
                          transition: "opacity 0.15s",
                        }}
                      >
                        <FaFileInvoiceDollar size={12} />
                        Xem &amp; Gửi hóa đơn #{result.invoiceId}
                        <FaExternalLinkAlt size={9} />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* OWNER_COST: thành công bình thường */
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: 10,
                    padding: "16px 18px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <FaCheck color="#16a34a" size={14} />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#166534",
                      }}
                    >
                      Đã ghi nhận chi phí vận hành nội bộ
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#374151" }}>
                    Chi phí #{result.expenseId}
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#6b7280",
                  background: "none",
                  border: "1px solid #e5e7eb",
                  borderRadius: 7,
                  padding: "7px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaPlus size={10} /> Thêm chi phí khác
              </button>
            </div>
          ) : (
            <>
              {/* ── Chọn loại ── */}
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <label style={labelStyle}>Loại chi phí</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setPayer("TENANT_FAULT")}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `2px solid ${payer === "TENANT_FAULT" ? "#3b82f6" : "#e5e7eb"}`,
                      background:
                        payer === "TENANT_FAULT" ? "#eff6ff" : "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 2,
                      }}
                    >
                      <FaFileInvoiceDollar
                        size={12}
                        color={payer === "TENANT_FAULT" ? "#2563eb" : "#9ca3af"}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            payer === "TENANT_FAULT" ? "#1e40af" : "#374151",
                        }}
                      >
                        Lỗi do khách
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        lineHeight: 1.4,
                      }}
                    >
                      Tạo hóa đơn REPAIR → khách thanh toán
                    </div>
                  </button>
                  <button
                    onClick={() => setPayer("OWNER_COST")}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `2px solid ${payer === "OWNER_COST" ? "#16a34a" : "#e5e7eb"}`,
                      background:
                        payer === "OWNER_COST" ? "#f0fdf4" : "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 2,
                      }}
                    >
                      <FaBuilding
                        size={12}
                        color={payer === "OWNER_COST" ? "#16a34a" : "#9ca3af"}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: payer === "OWNER_COST" ? "#166534" : "#374151",
                        }}
                      >
                        Lỗi do trọ
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        lineHeight: 1.4,
                      }}
                    >
                      Ghi vào chi phí vận hành nội bộ
                    </div>
                  </button>
                </div>

                {payer === "OWNER_COST" && !resolveBranchId() && (
                  <div
                    style={{
                      marginTop: 8,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 7,
                      padding: "8px 12px",
                      fontSize: 11,
                      color: "#92400e",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <span>⚠️</span>
                    <span>
                      Backend chưa trả về <code>branchId</code>. Vui lòng bổ
                      sung field <code>branchId</code> vào{" "}
                      <code>MaintenanceRequestDTO</code>.
                    </span>
                  </div>
                )}
              </div>

              {/* ── Fields ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label style={labelStyle}>
                    Danh mục <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={form.expenseCategory}
                    onChange={f("expenseCategory")}
                    style={{ ...inputStyle, appearance: "none" }}
                  >
                    <option value="">Chọn danh mục...</option>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Số tiền (VNĐ) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 500000"
                    value={form.amount}
                    onChange={f("amount")}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Tên thợ / đơn vị</label>
                  <input
                    type="text"
                    placeholder="Thợ điện Nguyễn A..."
                    value={form.payeeName}
                    onChange={f("payeeName")}
                    style={inputStyle}
                  />
                </div>

                {/* ── Upload bằng chứng ── */}
                <div>
                  <label style={labelStyle}>Bằng chứng (ảnh / hóa đơn)</label>

                  {!evidenceFile ? (
                    <div
                      style={{
                        border: "2px dashed #d1d5db",
                        borderRadius: 8,
                        background: "#f9fafb",
                        padding: "16px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
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
                      <FaCloudUploadAlt size={22} color="#9ca3af" />
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Kéo thả hoặc{" "}
                        <span style={{ color: "#2563eb", fontWeight: 600 }}>
                          chọn file
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        JPG, PNG, PDF — tối đa 10MB
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#f9fafb",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Preview */}
                      {evidenceFile.type.startsWith("image/") ? (
                        <img
                          src={evidencePreview}
                          alt="preview"
                          style={{
                            width: 52,
                            height: 52,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 6,
                            background: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FaImage size={20} color="#9ca3af" />
                        </div>
                      )}
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {evidenceFile.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 2,
                          }}
                        >
                          {(evidenceFile.size / 1024).toFixed(1)} KB
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            fontSize: 11,
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            marginTop: 2,
                          }}
                        >
                          Đổi file khác
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          flexShrink: 0,
                        }}
                        title="Xóa file"
                      >
                        <FaTimesCircle size={16} color="#ef4444" />
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

                <div>
                  <label style={labelStyle}>Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả chi tiết công việc sửa chữa..."
                    value={form.description}
                    onChange={f("description")}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
                  />
                </div>

                {err && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 7,
                      padding: "9px 12px",
                      fontSize: 12,
                      color: "#b91c1c",
                    }}
                  >
                    {err}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    background:
                      payer === "TENANT_FAULT" ? "#2563eb" : "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "opacity 0.15s",
                  }}
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
              </div>
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
      navigate(-1);
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
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
          },
        ],
        PROCESSING: [
          {
            status: "COMPLETED",
            label: "Đánh dấu hoàn thành",
            icon: <FaCheck size={13} />,
            color: "#166534",
            bg: "#f0fdf4",
            border: "#bbf7d0",
          },
          {
            status: "CANCELLED",
            label: "Hủy yêu cầu",
            icon: <FaBan size={13} />,
            color: "#b91c1c",
            bg: "#fef2f2",
            border: "#fecaca",
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
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div
      style={{ background: "#f5f6fa", minHeight: "100vh", paddingBottom: 48 }}
    >
      {lightbox.open && request?.images?.length > 0 && (
        <Lightbox
          images={request.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      {/* Top bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 0",
        }}
      >
        <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
          <button
            className="btn btn-sm btn-light d-flex align-items-center gap-2 rounded-3"
            style={{ fontSize: 12 }}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={11} /> Quay lại danh sách
          </button>
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Yêu cầu #{request?.requestId}
            </span>
            <button
              className="btn btn-sm d-flex align-items-center gap-2 rounded-3"
              style={{
                fontSize: 12,
                background: "#fff",
                border: "1px solid #fca5a5",
                color: "#dc2626",
              }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: 12, height: 12 }}
                />
              ) : (
                <FaTrash size={11} />
              )}
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-fluid px-4 mt-4" style={{ maxWidth: 1100 }}>
        <div className="row g-3">
          {/* ── Cột trái ── */}
          <div className="col-12 col-lg-8">
            {/* Card chính */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#fef9ec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaTools color="#d97706" size={16} />
                  </div>
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, color: "#111" }}
                    >
                      Yêu cầu sửa chữa
                    </div>
                    <div className="d-flex align-items-center gap-3 mt-1">
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FaHome size={10} /> {request?.roomName}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FaUser size={10} /> {request?.creatorName || "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={request?.status} />
              </div>

              <div style={{ padding: "16px 20px" }}>
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Mô tả sự cố
                  </div>
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: "#111",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    {request?.description}
                  </div>
                </div>
                <div>
                  <InfoRow label="Ngày gửi">
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <FaCalendarAlt size={11} color="#d97706" />
                      {formatDate(request?.createdAt)}
                    </span>
                  </InfoRow>
                  {request?.updatedAt && (
                    <InfoRow label="Cập nhật lúc">
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FaCalendarAlt size={11} color="#9ca3af" />
                        {formatDate(request?.updatedAt)}
                      </span>
                    </InfoRow>
                  )}
                  {request?.assetName && (
                    <InfoRow label="Tài sản liên quan">
                      {request.assetName}
                    </InfoRow>
                  )}
                </div>
              </div>
            </div>

            {/* Ảnh đính kèm */}
            {request?.images?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  padding: "16px 20px",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    fontWeight: 600,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FaImages size={11} /> Ảnh đính kèm ({request.images.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {request.images.map((img, i) => (
                    <div
                      key={img.imageId}
                      onClick={() => setLightbox({ open: true, index: i })}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "1px solid #e5e7eb",
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
            )}

            {/* Form ghi nhận chi phí */}
            {showExpenseForm && (
              <ExpenseForm request={request} onSuccess={() => {}} />
            )}
          </div>

          {/* ── Cột phải ── */}
          <div className="col-12 col-lg-4">
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Cập nhật trạng thái
              </div>

              {canTransition ? (
                <div className="d-flex flex-column gap-2">
                  {nextActions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => handleStatusChange(action.status)}
                      disabled={updating}
                      style={{
                        background: action.bg,
                        color: action.color,
                        border: `1px solid ${action.border}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: updating ? 0.6 : 1,
                        transition: "opacity 0.15s",
                      }}
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
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: 8,
                    padding: "12px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 12,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  Yêu cầu đã kết thúc
                </div>
              )}

              {request?.status === "PROCESSING" && (
                <div
                  style={{
                    marginTop: 14,
                    background: "#fefce8",
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: "1px solid #fef08a",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#854d0e",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    💡 Gợi nhắc
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#713f12", lineHeight: 1.5 }}
                  >
                    Đừng quên ghi nhận chi phí xử lý bên dưới sau khi hoàn tất
                    sửa chữa.
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div
                style={{
                  marginTop: 24,
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  Tiến trình
                </div>
                {["PENDING", "PROCESSING", "COMPLETED"].map((s, i) => {
                  const statuses = [
                    "PENDING",
                    "PROCESSING",
                    "COMPLETED",
                    "CANCELLED",
                  ];
                  const currentIdx = statuses.indexOf(request?.status);
                  const stepIdx = [
                    "PENDING",
                    "PROCESSING",
                    "COMPLETED",
                  ].indexOf(s);
                  const isCancelled = request?.status === "CANCELLED";
                  const isDone = !isCancelled && currentIdx > stepIdx;
                  const isCurrent = !isCancelled && request?.status === s;
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: i < 2 ? 10 : 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: isDone
                              ? cfg.dot
                              : isCurrent
                                ? cfg.bg
                                : "#f3f4f6",
                            border: `2px solid ${isCurrent ? cfg.dot : isDone ? cfg.dot : "#e5e7eb"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
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
                      <div style={{ paddingTop: 2 }}>
                        <p
                          style={{
                            fontSize: 12,
                            marginBottom: 0,
                            fontWeight: isCurrent ? 600 : 400,
                            color: isCurrent
                              ? cfg.color
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
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: STATUS_CONFIG.CANCELLED.bg,
                        border: `2px solid ${STATUS_CONFIG.CANCELLED.dot}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaBan size={9} color={STATUS_CONFIG.CANCELLED.dot} />
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: STATUS_CONFIG.CANCELLED.color,
                          marginBottom: 0,
                        }}
                      >
                        Đã hủy
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
