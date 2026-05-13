import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTools,
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaTrash,
  FaClock,
  FaCog,
  FaChevronDown,
  FaEdit,
  FaPlus,
} from "react-icons/fa";
import apiMaintenance from "../../api/apiMaintenance";
import apiBranches from "../../api/apiBranches";
import apiFloor from "../../api/apiFloor";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";

/* ── Status config ── */
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    bg: "bg-warning-subtle",
    text: "text-warning",
  },
  PROCESSING: {
    label: "Đang xử lý",
    bg: "bg-primary-subtle",
    text: "text-primary",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "bg-success-subtle",
    text: "text-success",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "bg-secondary-subtle",
    text: "text-secondary",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || {
    label: status,
    bg: "bg-light",
    text: "text-dark",
  };
  return (
    <span
      className={`badge rounded-pill ${s.bg} ${s.text} fw-semibold`}
      style={{ fontSize: 11 }}
    >
      {s.label}
    </span>
  );
};

/* ── Status inline dropdown (only for non-terminal statuses) ── */
const StatusDropdown = ({ current, onSelect, loading }) => {
  const [open, setOpen] = useState(false);
  const options = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].filter(
    (s) => s !== current,
  );

  if (current === "COMPLETED" || current === "CANCELLED")
    return <StatusBadge status={current} />;

  return (
    <div className="position-relative d-inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="btn btn-sm border-0 bg-transparent d-inline-flex align-items-center gap-1 p-0"
      >
        <StatusBadge status={current} />
        <FaChevronDown size={9} className="text-muted" />
      </button>
      {open && (
        <div
          className="position-absolute bg-white rounded-3 shadow border"
          style={{
            top: "110%",
            left: 0,
            zIndex: 99,
            minWidth: 150,
            padding: 4,
          }}
        >
          {options.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
              className="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
              style={{ fontSize: 12, borderRadius: 6 }}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Summary cards (matching profile style) ── */
const SummaryStrip = ({ summary }) => (
  <div className="d-flex gap-4 mb-4">
    {[
      {
        key: "PENDING",
        label: "Chờ xử lý",
        icon: <FaClock size={16} />,
        color: "text-warning",
        bg: "bg-warning-subtle",
      },
      {
        key: "PROCESSING",
        label: "Đang xử lý",
        icon: <FaCog size={16} />,
        color: "text-primary",
        bg: "bg-primary-subtle",
      },
    ].map(({ key, label, icon, color, bg }) => (
      <div key={key} className="d-flex align-items-center gap-3">
        <div
          className={`${bg} ${color} rounded-3 d-flex align-items-center justify-content-center`}
          style={{ width: 44, height: 44, flexShrink: 0 }}
        >
          {icon}
        </div>
        <div>
          <div className="fw-bold fs-5 mb-0">{summary[key]}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    ))}
  </div>
);

/* ══ TRANG CHÍNH ══ */
const ListMaintenance = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
  });
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);

  const [summary, setSummary] = useState({
    PENDING: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  /* ── Load branches ── */
  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res.content || []))
      .catch(() => {});
  }, []);

  /* ── Load floors by branch ── */
  useEffect(() => {
    setFilterFloor("");
    apiFloor
      .getAllFloors()
      .then((res) => {
        let allFloors = [];
        if (Array.isArray(res)) allFloors = res;
        else if (Array.isArray(res?.content)) allFloors = res.content;
        else if (Array.isArray(res?.data)) allFloors = res.data;
        allFloors = allFloors.map((f) => ({
          ...f,
          floorId: f.floorId ?? f.id,
          floorName:
            f.floorName ??
            f.name ??
            f.floorNumber ??
            `Tầng ${f.floorId ?? f.id}`,
        }));
        const branchFloors = filterBranch
          ? allFloors.filter((f) => String(f.branchId) === String(filterBranch))
          : allFloors;
        setFloors(branchFloors);
      })
      .catch(() => {});
  }, [filterBranch]);

  /* ── Fetch requests ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: 10,
        sortBy,
        sortOrder,
        ...(filterStatus && { status: filterStatus }),
        ...(filterBranch && { branchId: filterBranch }),
        ...(filterFloor && { floorId: filterFloor }),
      };
      const res = await apiMaintenance.getAllRequests(params);
      setData(res);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err.response);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterBranch, filterFloor, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Summary counts ── */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const statuses = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
        const results = await Promise.all(
          statuses.map((s) =>
            apiMaintenance.getAllRequests({ status: s, pageSize: 1 }),
          ),
        );
        setSummary({
          PENDING: results[0].totalElements || 0,
          PROCESSING: results[1].totalElements || 0,
          COMPLETED: results[2].totalElements || 0,
          CANCELLED: results[3].totalElements || 0,
        });
      } catch (e) {
        console.log("Error:", e);
      }
    };
    fetchSummary();
  }, []);

  /* ── Handlers ── */
  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await apiMaintenance.updateStatus(requestId, newStatus);
      fetchData();
      setSummary((prev) => {
        const old = data.content.find((r) => r.requestId === requestId)?.status;
        if (!old) return prev;
        return {
          ...prev,
          [old]: Math.max(0, prev[old] - 1),
          [newStatus]: prev[newStatus] + 1,
        };
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (requestId) => {
     const result = await confirmAction({
        title: 'Xóa yêu cầu bảo trì',
        text: `Bạn có xóa yêu cầu này không ?`,
        icon: 'info'
      });
    if(!result.isConfirmed) return;
    try {
      await apiMaintenance.deleteRequest(requestId);
      fetchData();
      toast.success("Xóa yêu cầu thành công !")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page + 1);

  const formatDate = (dt) =>
    dt
      ? new Date(dt).toLocaleString("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";

  const filtered = data.content.filter((r) =>
    appliedSearch
      ? r.description?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.roomName?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.creatorName?.toLowerCase().includes(appliedSearch.toLowerCase())
      : true,
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ BÁO HỎNG</h4>
          <p className="text-muted small mb-0">
            Tiếp nhận và xử lý yêu cầu sửa chữa từ cư dân
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            to="/maintenance/restore"
            className="btn btn-outline-danger shadow-sm d-flex align-items-center gap-2"
          >
            <FaTrash size={14} />{" "}
            <span className="d-none d-md-inline">Danh sách đã xóa</span>
          </Link>
          <Link
            to="/maintenance/create"
            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
          >
            <FaPlus size={14} /> <span>Thêm mới</span>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <SummaryStrip summary={summary} />

      {/* Main card */}
      <div className="card border-0 shadow-sm rounded-3">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: 400, flex: 1 }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch size={13} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm mô tả, phòng, người gửi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button
                  type="button"
                  className="btn btn-light border-0"
                  onClick={handleClearSearch}
                >
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-dark shadow-sm">
              Tìm
            </button>
          </form>

          {/* Filters */}
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm border-0 bg-light"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="updatedAt">Cập nhật</option>
              <option value="status">Trạng thái</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-primary-subtle text-primary fw-bold"
              style={{ width: "180px" }}
              value={filterBranch}
              onChange={(e) => {
                setFilterBranch(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              value={filterFloor}
              onChange={(e) => {
                setFilterFloor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả tầng</option>
              {floors.map((f) => (
                <option key={f.floorId} value={f.floorId}>
                  {f.floorName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">#</th>
                <th>Mô tả sự cố</th>
                <th>Phòng</th>
                <th>Người gửi</th>
                <th className="text-center">Trạng thái</th>
                <th>Ngày gửi</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-secondary me-2" />
                    <span className="text-muted small">Đang tải...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <FaTools
                      size={28}
                      className="mb-2 d-block mx-auto opacity-25"
                    />
                    Không có yêu cầu nào
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.requestId}>
                    <td className="ps-4 text-muted small">#{req.requestId}</td>
                    <td style={{ maxWidth: 300 }}>
                      <div
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: 280 }}
                      >
                        {req.description}
                      </div>
                      {req.images?.length > 0 && (
                        <span className="text-muted" style={{ fontSize: 11 }}>
                          {req.images.length} ảnh đính kèm
                        </span>
                      )}
                    </td>
                    <td className="fw-semibold small">{req.roomName}</td>
                    <td className="text-muted small">
                      {req.creatorName || "—"}
                    </td>
                    <td className="text-center">
                      <StatusDropdown
                        current={req.status}
                        loading={updatingId === req.requestId}
                        onSelect={(status) =>
                          handleStatusChange(req.requestId, status)
                        }
                      />
                    </td>
                    <td className="text-muted small">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xem chi tiết"
                          onClick={() =>
                            navigate(`/maintenance/${req.requestId}/detail`)
                          }
                        >
                          <FaEye className="text-info" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                          onClick={() =>
                            navigate(`/maintenance/${req.requestId}/edit`)
                          }
                        >
                          <FaEdit className="text-primary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xóa"
                          onClick={() => handleDelete(req.requestId)}
                        >
                          <FaTrash className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: <strong>{data.totalElements}</strong> yêu cầu
          </small>
          <Pagination
            currentPage={data.pageNumber - 1}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ListMaintenance;
