import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTools,
  FaEye,
  FaBan,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import CreateRequestModal from "./CreateRequestModal";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../utils/swalUtils";

const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", className: "bg-warning text-dark" },
  PROCESSING: { label: "Đang xử lý", className: "bg-primary text-white" },
  COMPLETED: { label: "Hoàn thành", className: "bg-success text-white" },
  CANCELLED: { label: "Đã hủy", className: "bg-secondary text-white" },
};
const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || {
    label: status,
    className: "bg-light text-dark",
  };
  return (
    <span
      className={`badge rounded-pill px-3 py-2 small fw-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const ListMaintenanceRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phân trang
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Bộ lọc
  const [filterStatus, setFilterStatus] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  // Cancel confirm
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiMaintenanceRequest.getMyRequests({
        pageNumber,
        pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      // Lọc client-side theo status nếu API chưa hỗ trợ filter cho tenant
      const content = filterStatus
        ? res.content.filter((r) => r.status === filterStatus)
        : res.content;
      setRequests(content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancel = async (requestId) => {
    if (cancellingId) return;
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;
    setCancellingId(requestId);
    try {
      await apiMaintenanceRequest.cancelRequest(requestId);
      fetchRequests();
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dt) =>
    dt
      ? new Date(dt).toLocaleString("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaTools className="text-warning" />
            Báo hỏng & Sửa chữa
          </h4>
          <p className="text-muted mb-0 small">
            Gửi và theo dõi các yêu cầu sửa chữa phòng của bạn
          </p>
        </div>
        <button
          className="btn btn-warning text-dark fw-semibold rounded-3 d-flex align-items-center gap-2 px-4"
          onClick={() => setShowCreate(true)}
        >
          <FaPlus size={13} />
          Gửi yêu cầu
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body py-3 px-4">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <FaFilter className="text-muted" size={14} />
            </div>
            {STATUS_OPTIONS.map((opt) => (
              <div className="col-auto" key={opt.value}>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${
                    filterStatus === opt.value
                      ? "btn-dark"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => {
                    setFilterStatus(opt.value);
                    setPageNumber(1);
                  }}
                  style={{ fontSize: 13 }}
                >
                  {opt.label}
                </button>
              </div>
            ))}
            <div className="col-auto ms-auto">
              <small className="text-muted">{totalElements} yêu cầu</small>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      {error && (
        <div className="alert alert-danger rounded-3 small">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
          <p className="text-muted mt-2 small">Đang tải...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5">
          <FaTools size={40} className="text-muted mb-3 opacity-50" />
          <p className="text-muted">Bạn chưa có yêu cầu sửa chữa nào</p>
          <button
            className="btn btn-warning text-dark fw-semibold rounded-3 px-4"
            onClick={() => setShowCreate(true)}
          >
            <FaPlus size={13} className="me-2" />
            Gửi yêu cầu đầu tiên
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="d-none d-md-block">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-0">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th
                        className="ps-4 py-3 fw-semibold small text-muted"
                        style={{ width: 60 }}
                      >
                        #
                      </th>
                      <th className="py-3 fw-semibold small text-muted">
                        Mô tả
                      </th>
                      <th className="py-3 fw-semibold small text-muted">
                        Phòng
                      </th>
                      <th className="py-3 fw-semibold small text-muted">
                        Trạng thái
                      </th>
                      <th className="py-3 fw-semibold small text-muted">
                        Ngày gửi
                      </th>
                      <th className="py-3 fw-semibold small text-muted text-end pe-4">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.requestId}>
                        <td className="ps-4 text-muted small">
                          #{req.requestId}
                        </td>
                        <td>
                          <span
                            className="small"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              maxWidth: 320,
                            }}
                          >
                            {req.description}
                          </span>
                          {req.images?.length > 0 && (
                            <span className="badge bg-light text-muted ms-2 small">
                              {req.images.length} ảnh
                            </span>
                          )}
                        </td>
                        <td className="small">{req.roomName}</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="small text-muted">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm btn-light rounded-3"
                              onClick={() =>
                                navigate(`/user/requests/${req.requestId}`)
                              }
                              title="Xem chi tiết"
                            >
                              <FaEye size={13} className="text-primary" />
                            </button>
                            {req.status === "PENDING" && (
                              <button
                                className="btn btn-sm btn-light rounded-3"
                                onClick={() => handleCancel(req.requestId)}
                                disabled={cancellingId === req.requestId}
                                title="Hủy yêu cầu"
                              >
                                {cancellingId === req.requestId ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    style={{ width: 12, height: 12 }}
                                  />
                                ) : (
                                  <FaBan size={13} className="text-danger" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="d-md-none d-flex flex-column gap-3">
            {requests.map((req) => (
              <div
                key={req.requestId}
                className="card border-0 shadow-sm rounded-4"
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small">
                      #{req.requestId} · {req.roomName}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="small mb-2" style={{ lineHeight: 1.5 }}>
                    {req.description.length > 100
                      ? req.description.slice(0, 100) + "..."
                      : req.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {formatDate(req.createdAt)}
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-3"
                        onClick={() =>
                          navigate(`/user/requests/${req.requestId}`)
                        }
                      >
                        <FaEye size={12} className="me-1" />
                        Chi tiết
                      </button>
                      {req.status === "PENDING" && (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-3"
                          onClick={() => handleCancel(req.requestId)}
                          disabled={cancellingId === req.requestId}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link rounded-3 me-1"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <li
                        key={p}
                        className={`page-item ${p === pageNumber ? "active" : ""}`}
                      >
                        <button
                          className="page-link rounded-3 mx-1"
                          onClick={() => setPageNumber(p)}
                        >
                          {p}
                        </button>
                      </li>
                    ),
                  )}
                  <li
                    className={`page-item ${pageNumber === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link rounded-3 ms-1"
                      onClick={() =>
                        setPageNumber((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateRequestModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setPageNumber(1);
          fetchRequests();
        }}
      />
    </div>
  );
};

export default ListMaintenanceRequest;
