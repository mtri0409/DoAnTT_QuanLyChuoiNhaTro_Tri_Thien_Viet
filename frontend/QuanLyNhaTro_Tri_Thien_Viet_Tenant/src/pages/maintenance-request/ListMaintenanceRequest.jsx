import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaTools,
  FaEye,
  FaBan,
  FaFilter,
  FaClock,
  FaHome,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import CreateRequestModal from "./CreateRequestModal";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../utils/swalUtils";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
  },
  PROCESSING: {
    label: "Đang xử lý",
    badge: "bg-primary-subtle text-primary",
    dot: "#3b82f6",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-success-subtle text-success",
    dot: "#22c55e",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
  },
};

const FILTER_OPTIONS = [
  { key: "ALL", label: "Tất cả", dot: "#cbd5e1" },
  { key: "PENDING", label: "Chờ xử lý", dot: "#f59e0b" },
  { key: "PROCESSING", label: "Đang xử lý", dot: "#3b82f6" },
  { key: "COMPLETED", label: "Hoàn thành", dot: "#22c55e" },
  { key: "CANCELLED", label: "Đã hủy", dot: "#94a3b8" },
];

const formatDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

function ActionBtn({
  icon,
  label,
  onClick,
  variant = "secondary",
  to,
  disabled,
}) {
  const cls = {
    primary: "btn-primary-subtle text-primary",
    danger: "btn-danger-subtle text-danger",
    secondary: "btn-secondary-subtle text-secondary",
  };
  const base = `btn btn-sm d-inline-flex align-items-center gap-2 rounded-3 fw-medium ${cls[variant] ?? cls.secondary}`;

  if (to)
    return (
      <Link
        to={to}
        className={base}
        style={{ textDecoration: "none", opacity: disabled ? 0.6 : 1 }}
      >
        {icon} {label}
      </Link>
    );
  return (
    <button className={base} onClick={onClick} disabled={disabled}>
      {icon} {label}
    </button>
  );
}

export default function ListMaintenanceRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiMaintenanceRequest.getMyRequests({
        pageNumber,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRequests(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCancel = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      await apiMaintenanceRequest.cancelRequest(confirm.requestId);
      setToast("Đã hủy yêu cầu thành công.");
      fetchRequests();
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể hủy yêu cầu");
      setToast(err?.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const countBy = (key) =>
    key === "ALL"
      ? requests.length
      : requests.filter((r) => r.status === key).length;

  const filtered = requests.filter(
    (r) =>
      (filterStatus === "ALL" || r.status === filterStatus) &&
      (!searchText ||
        r.roomName?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchText.toLowerCase())),
  );

  const pendingCount = countBy("PENDING");
  const processingCount = countBy("PROCESSING");

  return (
    /*
     * Outer wrapper: full viewport height, flex column, no overflow
     * so inner parts can each control their own scroll.
     */
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      {/* ── Confirm Modal ── */}
      {confirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,.4)", zIndex: 9999 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-body text-center p-4">
                <div className="fs-1 mb-3">⚠️</div>
                <h6 className="fw-bold mb-2">Hủy yêu cầu này?</h6>
                <p className="text-muted small mb-4">
                  Hành động này không thể hoàn tác.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-secondary btn-sm px-4 rounded-3"
                    onClick={() => setConfirm(null)}
                  >
                    Không
                  </button>
                  <button
                    className="btn btn-danger btn-sm px-4 rounded-3"
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      "Hủy yêu cầu"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 m-3 alert alert-success d-flex align-items-center gap-2 py-2 px-3 small shadow-sm rounded-3 mb-0 border-0"
          style={{ zIndex: 9998, minWidth: 260 }}
        >
          <FaCheckCircle className="text-success flex-shrink-0" />
          <span>{toast}</span>
          <button
            className="btn-close btn-sm ms-auto"
            onClick={() => setToast(null)}
          />
        </div>
      )}

      {/* ══════════════════════════════════
          STICKY HEADER — always visible
      ══════════════════════════════════ */}
      <div
        className="bg-white px-4 py-3 shadow-sm border-bottom"
        style={{ position: "sticky", top: 0, zIndex: 100 }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center bg-warning bg-opacity-10"
              style={{ width: 44, height: 44 }}
            >
              <FaTools className="text-warning" size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">
                Báo hỏng &amp; Sửa chữa
              </h5>
              <p className="mb-0 small text-secondary">
                {requests.length} yêu cầu · {pendingCount} chờ xử lý ·{" "}
                {processingCount} đang xử lý
              </p>
            </div>
          </div>
          <Link
            to="/user/requests/create"
            className="btn btn-warning text-dark d-flex align-items-center gap-2 px-4 rounded-3 shadow-sm fw-semibold"
          >
            <FaPlus size={12} /> Gửi yêu cầu
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════
          BODY ROW — sidebar + list
      ══════════════════════════════════ */}
      <div className="container-fluid flex-grow-1 py-4 px-4">
        <div className="row g-4 align-items-start">
          {/* ── STICKY SIDEBAR ── */}
          <div
            className="col-lg-3 col-md-4"
            style={{ position: "sticky", top: 76, alignSelf: "flex-start" }}
          >
            {/* Search */}
            <div className="card border-0 rounded-4 shadow-sm mb-3">
              <div className="card-body p-3">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3">
                    <FaSearch className="text-muted" size={12} />
                  </span>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Tìm yêu cầu..."
                    className="form-control border-start-0 rounded-end-3 bg-light"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            {/* Filter by status */}
            <div className="card border-0 rounded-4 shadow-sm mb-3">
              <div className="card-body p-3">
                <p
                  className="fw-semibold mb-3 d-flex align-items-center gap-2 text-uppercase text-secondary"
                  style={{ fontSize: 11, letterSpacing: ".05em" }}
                >
                  <FaFilter size={10} /> Trạng thái
                </p>
                {FILTER_OPTIONS.map(({ key, label, dot }) => {
                  const isActive = filterStatus === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`w-100 d-flex align-items-center justify-content-between border-0 rounded-3 px-3 py-2 mb-1 ${
                        isActive
                          ? "bg-warning bg-opacity-10 text-warning-emphasis fw-semibold"
                          : "bg-transparent text-secondary"
                      }`}
                      style={{ fontSize: 13, cursor: "pointer" }}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <span
                          className="rounded-circle flex-shrink-0"
                          style={{
                            width: 8,
                            height: 8,
                            background: dot,
                            display: "inline-block",
                          }}
                        />
                        {label}
                      </span>
                      <span
                        className={`badge rounded-pill ${isActive ? "bg-warning text-dark" : "bg-secondary-subtle text-secondary"}`}
                        style={{ fontSize: 11 }}
                      >
                        {countBy(key)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="card border-0 rounded-4 shadow-sm">
              <div className="card-body p-3">
                <p
                  className="small text-uppercase text-secondary fw-semibold mb-3"
                  style={{ fontSize: 11, letterSpacing: ".05em" }}
                >
                  Tổng quan
                </p>
                {[
                  {
                    label: "Tổng yêu cầu",
                    value: requests.length,
                    bg: "bg-light",
                    color: "text-primary",
                  },
                  {
                    label: "Chờ xử lý",
                    value: pendingCount,
                    bg: "bg-warning bg-opacity-10",
                    color: "text-warning",
                  },
                  {
                    label: "Đang xử lý",
                    value: processingCount,
                    bg: "bg-primary bg-opacity-10",
                    color: "text-primary",
                  },
                  {
                    label: "Hoàn thành",
                    value: countBy("COMPLETED"),
                    bg: "bg-success bg-opacity-10",
                    color: "text-success",
                  },
                ].map(({ label, value, bg, color }) => (
                  <div
                    key={label}
                    className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2 mb-2 ${bg}`}
                  >
                    <span className="small text-secondary">{label}</span>
                    <span className={`fw-bold fs-6 ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SCROLLABLE LIST COLUMN ── */}
          <div className="col-lg-9 col-md-8">
            {error && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 small mb-3">
                {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-auto"
                  onClick={fetchRequests}
                >
                  Thử lại
                </button>
              </div>
            )}

            {loading && (
              <div className="d-flex flex-column gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4 placeholder-glow d-flex flex-column gap-2">
                      <span className="placeholder col-3 rounded" />
                      <span className="placeholder col-10 rounded" />
                      <span className="placeholder col-5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="card-body">
                  <div className="fs-1 mb-3">
                    {searchText || filterStatus !== "ALL" ? "🔍" : "🔧"}
                  </div>
                  <h6 className="fw-semibold mb-1 text-dark">
                    {searchText || filterStatus !== "ALL"
                      ? "Không tìm thấy kết quả"
                      : "Chưa có yêu cầu nào"}
                  </h6>
                  <p className="text-muted small mb-3">
                    {searchText || filterStatus !== "ALL"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Khi có sự cố trong phòng, hãy gửi yêu cầu để được hỗ trợ nhanh chóng."}
                  </p>
                  {!searchText && filterStatus === "ALL" && (
                    <Link
                      to="/user/requests/create"
                      className="btn btn-warning text-dark btn-sm px-4 rounded-3 fw-semibold"
                    >
                      <FaPlus size={11} className="me-1" /> Gửi yêu cầu ngay
                    </Link>
                  )}
                </div>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="d-flex flex-column gap-3">
                {filtered.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] ?? {
                    label: req.status,
                    badge: "bg-light text-dark",
                    dot: "#ccc",
                  };
                  const isHov = hoveredCard === req.requestId;
                  const canCancel = req.status === "PENDING";
                  const isCancelled = req.status === "CANCELLED";

                  return (
                    <div
                      key={req.requestId}
                      className="card border-0 rounded-4 bg-white"
                      onMouseEnter={() => setHoveredCard(req.requestId)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        transition: "box-shadow .2s, transform .2s",
                        boxShadow: isHov
                          ? "0 8px 32px rgba(37,99,235,.13)"
                          : "0 1px 8px rgba(0,0,0,.07)",
                        transform: isHov ? "translateY(-2px)" : "none",
                        opacity: isCancelled ? 0.78 : 1,
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex gap-3 align-items-start">
                          {/* Status dot */}
                          <div className="flex-shrink-0 pt-1">
                            <span
                              className="d-block rounded-circle"
                              style={{
                                width: 10,
                                height: 10,
                                background: cfg.dot,
                                boxShadow:
                                  req.status === "PENDING" ||
                                  req.status === "PROCESSING"
                                    ? `0 0 0 3px ${cfg.dot}30`
                                    : "none",
                                marginTop: 4,
                              }}
                            />
                          </div>
                          {/* Content */}
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span
                                className="fw-semibold text-dark"
                                style={{ fontSize: 14 }}
                              >
                                <FaHome
                                  size={12}
                                  className="me-1 text-warning"
                                />
                                {req.roomName}
                              </span>
                              <span
                                className={`badge rounded-pill ${cfg.badge}`}
                                style={{ fontSize: 11 }}
                              >
                                {cfg.label}
                              </span>
                              {req.images?.length > 0 && (
                                <span
                                  className="badge rounded-pill bg-light text-muted"
                                  style={{ fontSize: 11 }}
                                >
                                  {req.images.length} ảnh
                                </span>
                              )}
                            </div>

                            <p
                              className="text-secondary mb-2"
                              style={{
                                fontSize: 13,
                                lineHeight: 1.65,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {req.description}
                            </p>

                            <div className="d-flex align-items-center gap-3 flex-wrap">
                              <span
                                className="d-flex align-items-center gap-1 text-secondary"
                                style={{ fontSize: 12 }}
                              >
                                <FaClock size={10} />{" "}
                                {formatDate(req.createdAt)}
                              </span>
                              <span
                                className="text-secondary"
                                style={{ fontSize: 11 }}
                              >
                                #REQ-{req.requestId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action bar — slides open on hover */}
                        <div
                          style={{
                            maxHeight: isHov ? 56 : 0,
                            overflow: "hidden",
                            transition:
                              "max-height .22s cubic-bezier(.4,0,.2,1)",
                          }}
                        >
                          <div className="d-flex gap-2 flex-wrap pt-3 mt-3 border-top">
                            <ActionBtn
                              to={`/user/requests/${req.requestId}`}
                              icon={<FaEye size={12} />}
                              label="Xem chi tiết"
                              variant="primary"
                            />
                            {canCancel && (
                              <ActionBtn
                                icon={<FaBan size={12} />}
                                label="Hủy yêu cầu"
                                variant="danger"
                                onClick={() =>
                                  setConfirm({ requestId: req.requestId })
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPageNumber(i + 1)}
                    className={`btn btn-sm px-3 rounded-3 ${
                      i + 1 === pageNumber
                        ? "btn-warning text-dark shadow-sm fw-semibold"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
