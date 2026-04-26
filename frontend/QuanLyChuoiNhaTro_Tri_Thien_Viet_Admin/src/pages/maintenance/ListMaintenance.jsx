import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTools,
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaBan,
  FaChevronDown,
} from "react-icons/fa";
import apiMaintenance from "../../api/apiMaintenance";
import apiBranches from "../../api/apiBranches";
import apiFloor from "../../api/apiFloor";
import Pagination from "../../components/Pagination";

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
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}
      />
      {s.label}
    </span>
  );
};

/* ── Status dropdown ── */
const StatusDropdown = ({ current, onSelect, loading }) => {
  const [open, setOpen] = useState(false);
  const options = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].filter(
    (s) => s !== current,
  );

  if (current === "COMPLETED" || current === "CANCELLED")
    return <StatusBadge status={current} />;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <StatusBadge status={current} />
        <FaChevronDown size={9} color="#9ca3af" />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            zIndex: 99,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            padding: 4,
            minWidth: 150,
            border: "1px solid #e5e7eb",
          }}
        >
          {options.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 10px",
                border: "none",
                background: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                color: "#374151",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: STATUS_CONFIG[s]?.dot,
                }}
              />
              {STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Summary strip (compact) ── */
const SummaryStrip = ({ summary }) => (
  <div
    style={{
      display: "flex",
      gap: 1,
      background: "#e5e7eb",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 16,
    }}
  >
    {[
      {
        key: "PENDING",
        label: "Chờ xử lý",
        icon: <FaClock size={13} />,
        color: "#92400e",
        bg: "#fef9ec",
      },
      {
        key: "PROCESSING",
        label: "Đang xử lý",
        icon: <FaCog size={13} />,
        color: "#1e40af",
        bg: "#eff6ff",
      },
      {
        key: "COMPLETED",
        label: "Hoàn thành",
        icon: <FaCheckCircle size={13} />,
        color: "#166534",
        bg: "#f0fdf4",
      },
      {
        key: "CANCELLED",
        label: "Đã hủy",
        icon: <FaBan size={13} />,
        color: "#6b7280",
        bg: "#f9fafb",
      },
    ].map(({ key, label, icon, color, bg }) => (
      <div
        key={key}
        style={{
          flex: 1,
          background: bg,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color }}>{icon}</span>
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111",
              lineHeight: 1,
            }}
          >
            {summary[key]}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            {label}
          </div>
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
        // Hỗ trợ: PageResponse { content: [...] }, array thẳng, hoặc { data: [...] }
        let allFloors = [];
        console.log(res);
        if (Array.isArray(res)) allFloors = res;
        else if (Array.isArray(res?.content)) allFloors = res.content;
        else if (Array.isArray(res?.data)) allFloors = res.data;

        // Chuẩn hóa field name: backend có thể trả floorName hoặc name
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
      } catch(e) {
        console.log("Error :" , e);
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
      alert(err?.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Xóa yêu cầu này?")) return;
    try {
      await apiMaintenance.deleteRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể xóa");
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

  // Search client-side; tầng/chi nhánh/trạng thái đã lọc server-side
  const filtered = data.content.filter((r) =>
    appliedSearch
      ? r.description?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.roomName?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        r.creatorName?.toLowerCase().includes(appliedSearch.toLowerCase())
      : true,
  );

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5
            className="fw-bold mb-0 d-flex align-items-center gap-2"
            style={{ color: "#111" }}
          >
            <FaTools size={16} style={{ color: "#d97706" }} />
            Quản lý báo hỏng
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>
            Tiếp nhận và xử lý yêu cầu sửa chữa
          </p>
        </div>
      </div>

      {/* Summary */}
      <SummaryStrip summary={summary} />

      {/* Main card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Toolbar — tất cả trên 1 hàng */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              gap: 6,
              flex: "1 1 220px",
              minWidth: 200,
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <FaSearch
                size={12}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                className="form-control form-control-sm"
                style={{
                  paddingLeft: 30,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                }}
                placeholder="Tìm mô tả, phòng, người gửi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9ca3af",
                  }}
                >
                  <FaTimesCircle size={13} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-sm btn-dark"
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              Tìm
            </button>
          </form>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: "#e5e7eb" }} />

          {/* Lọc trạng thái */}
          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              minWidth: 130,
              fontSize: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
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

          {/* Lọc chi nhánh */}
          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              minWidth: 140,
              fontSize: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
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

          {/* Lọc tầng — thay thế lọc phòng */}
          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              minWidth: 130,
              fontSize: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
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

          {/* Sắp xếp */}
          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              minWidth: 140,
              fontSize: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="createdAt">Sắp xếp: Ngày tạo</option>
            <option value="updatedAt">Sắp xếp: Cập nhật</option>
            <option value="status">Sắp xếp: Trạng thái</option>
          </select>

          <select
            className="form-select form-select-sm"
            style={{
              width: "auto",
              minWidth: 100,
              fontSize: 12,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table
            className="table table-hover align-middle mb-0"
            style={{ fontSize: 13 }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                <th
                  className="ps-4 py-2 fw-semibold border-0"
                  style={{ width: 60 }}
                >
                  #
                </th>
                <th className="py-2 fw-semibold border-0">Mô tả sự cố</th>
                <th className="py-2 fw-semibold border-0">Phòng</th>
                <th className="py-2 fw-semibold border-0">Người gửi</th>
                <th className="py-2 fw-semibold border-0">Trạng thái</th>
                <th className="py-2 fw-semibold border-0">Ngày gửi</th>
                <th className="text-end pe-4 py-2 fw-semibold border-0">
                  Thao tác
                </th>
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
                  <td colSpan={7} className="text-center py-5 text-muted small">
                    <FaTools
                      size={28}
                      className="mb-2 d-block mx-auto"
                      style={{ opacity: 0.2 }}
                    />
                    Không có yêu cầu nào
                  </td>
                </tr>
              ) : (
                filtered.map((req, idx) => (
                  <tr
                    key={req.requestId}
                    style={{ borderTop: "1px solid #f3f4f6" }}
                  >
                    <td className="ps-4 text-muted" style={{ fontSize: 12 }}>
                      #{req.requestId}
                    </td>
                    <td style={{ maxWidth: 300 }}>
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.5,
                          color: "#111",
                        }}
                      >
                        {req.description}
                      </div>
                      {req.images?.length > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 2,
                            display: "inline-block",
                          }}
                        >
                          {req.images.length} ảnh đính kèm
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500, color: "#374151" }}>
                      {req.roomName}
                    </td>
                    <td style={{ color: "#6b7280" }}>
                      {req.creatorName || "—"}
                    </td>
                    <td>
                      <StatusDropdown
                        current={req.status}
                        loading={updatingId === req.requestId}
                        onSelect={(status) =>
                          handleStatusChange(req.requestId, status)
                        }
                      />
                    </td>
                    <td style={{ color: "#6b7280", whiteSpace: "nowrap" }}>
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm"
                          title="Xem chi tiết"
                          style={{
                            padding: "3px 8px",
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: 6,
                          }}
                          onClick={() =>
                            navigate(`/maintenance/${req.requestId}/detail`)
                          }
                        >
                          <FaEye size={13} style={{ color: "#374151" }} />
                        </button>
                        <button
                          className="btn btn-sm"
                          title="Xóa"
                          style={{
                            padding: "3px 8px",
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: 6,
                          }}
                          onClick={() => handleDelete(req.requestId)}
                        >
                          <FaTrash size={13} style={{ color: "#dc2626" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer phân trang */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fafafa",
          }}
        >
          <small className="text-muted" style={{ fontSize: 12 }}>
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
