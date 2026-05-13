import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaFileInvoiceDollar,
  FaTools,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaInfoCircle,
  FaSync,
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";

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

/**
 * Xây dựng URL đầy đủ để load ảnh bằng chứng.
 *
 * Backend có thể trả evidenceUrl theo 3 dạng:
 *   1. Tên file thô:   "Screenshot 2026-05-07.png"
 *   2. Path tương đối: "/api/admin/expenses/evidence/uuid.jpg"
 *   3. URL đầy đủ:     "https://..."
 *
 * Endpoint GET ảnh: GET /api/admin/expenses/evidence/{fileName}
 */
const buildEvidenceUrl = (evidenceUrl) => {
  if (!evidenceUrl) return "";

  // Dạng 3: URL đầy đủ → dùng luôn
  if (/^https?:\/\//i.test(evidenceUrl)) return evidenceUrl;

  // Lấy origin của backend từ axiosInstance baseURL
  // VD baseURL = "http://localhost:8080/api" → origin = "http://localhost:8080"
  const base = (axiosInstance.defaults.baseURL || "").replace(/\/+$/, "");
  const originMatch = base.match(/^(https?:\/\/[^/]+)/);
  const origin = originMatch ? originMatch[1] : "";

  // Dạng 2: path có sẵn /api/... → ghép origin + path
  if (evidenceUrl.startsWith("/api/")) {
    return `${origin}${evidenceUrl}`;
  }

  // Dạng 2 khác: path tương đối bắt đầu bằng /
  if (evidenceUrl.startsWith("/")) {
    return `${origin}${evidenceUrl}`;
  }

  // Dạng 1: tên file thô → build đường dẫn chuẩn đến endpoint evidence
  // GET /api/admin/expenses/evidence/{fileName}
  return `${origin}/api/admin/expenses/evidence/${encodeURIComponent(evidenceUrl)}`;
};

/**
 * Kiểm tra evidenceUrl có phải ảnh không.
 * Hỗ trợ: tên file thô, path /evidence/..., URL đầy đủ.
 */
const isImageUrl = (url) =>
  /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url) ||
  url.includes("/evidence/");

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

// ── EvidenceViewer ─────────────────────────────────────────────────────────────
// Fetch ảnh qua axiosInstance để đảm bảo đúng auth header & base URL.
// evidenceUrl có thể là: tên file thô, path /api/..., hoặc URL đầy đủ.
const EvidenceViewer = ({ evidenceUrl }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"

  useEffect(() => {
    if (!evidenceUrl) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    const load = async () => {
      setStatus("loading");
      setBlobUrl(null);
      try {
        let axiosPath;
        if (/^https?:\/\//i.test(evidenceUrl)) {
          // URL đầy đủ → fetch trực tiếp
          const res = await fetch(evidenceUrl);
          if (!res.ok) throw new Error("fetch failed");
          const blob = await res.blob();
          if (!cancelled) {
            objectUrl = URL.createObjectURL(blob);
            setBlobUrl(objectUrl);
            setStatus("ok");
          }
          return;
        } else if (evidenceUrl.startsWith("/api/")) {
          // Path có /api prefix → bỏ /api vì baseURL đã có sẵn
          axiosPath = evidenceUrl.replace(/^\/api/, "");
        } else if (evidenceUrl.startsWith("/")) {
          axiosPath = evidenceUrl;
        } else {
          // Tên file thô → build path đến endpoint evidence
          axiosPath = `/admin/expenses/evidence/${encodeURIComponent(evidenceUrl)}`;
        }

        const res = await axiosInstance.get(axiosPath, {
          responseType: "blob",
        });
        const blob = res.data || res;
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [evidenceUrl]);

  if (!evidenceUrl) return null;

  if (status === "loading") {
    return (
      <div
        className="rounded-3 border d-flex align-items-center justify-content-center gap-2 mt-2"
        style={{ height: 120, background: "#f8fafc", color: "#94a3b8" }}
      >
        <span className="spinner-border spinner-border-sm" />
        <span className="small">Đang tải ảnh...</span>
      </div>
    );
  }

  if (status === "ok" && blobUrl) {
    return (
      <div className="mt-2">
        <img
          src={blobUrl}
          alt="Bằng chứng"
          className="rounded-3 border"
          style={{
            width: "100%",
            maxHeight: 480,
            objectFit: "contain",
            display: "block",
            background: "#f8fafc",
            cursor: "zoom-in",
          }}
          onClick={() => window.open(blobUrl, "_blank")}
          title="Nhấn để xem full size"
        />
        <div
          className="text-muted mt-1 d-flex align-items-center gap-1"
          style={{ fontSize: 11 }}
        >
          <FaExternalLinkAlt size={9} />
          Nhấn vào ảnh để xem full size
        </div>
      </div>
    );
  }

  // Fallback khi không load được
  const fallbackUrl = buildEvidenceUrl(evidenceUrl);
  return (
    <div className="mt-2">
      <div
        className="rounded-3 border d-flex flex-column align-items-center justify-content-center gap-2 py-4"
        style={{ background: "#f8fafc", color: "#94a3b8" }}
      >
        <FaExternalLinkAlt size={18} />
        <span className="small text-muted">
          Không thể hiển thị ảnh trực tiếp
        </span>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
        >
          <FaExternalLinkAlt size={10} /> Xem bằng chứng
        </a>
      </div>
    </div>
  );
};

// ══ Trang chính ═══════════════════════════════════════════════════════════════
const DetailExpense = () => {
  const { expenseId: id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
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
      toast.success("Xóa thành công!");
      navigate("/expenses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa");
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-light border d-flex align-items-center gap-2"
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
            onClick={() => navigate(`/expenses/${expense.expenseId}/edit`)}
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
        {/* Cột trái */}
        <div className="col-12 col-lg-8">
          {/* Tổng tiền */}
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
                  <EvidenceViewer evidenceUrl={expense.evidenceUrl} />
                </InfoRow>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: liên kết */}
        <div className="col-12 col-lg-4">
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
    </div>
  );
};

export default DetailExpense;
