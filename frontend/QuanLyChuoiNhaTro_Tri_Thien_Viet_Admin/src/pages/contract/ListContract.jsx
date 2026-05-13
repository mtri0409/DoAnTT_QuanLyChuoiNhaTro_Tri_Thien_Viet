import React, { useState, useEffect } from "react";
import {
  FaFileContract,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaTimesCircle,
  FaEye,
  FaSyncAlt,
  FaUsers,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Mapping trạng thái sang màu badge
const STATUS_BADGE = {
  ACTIVE: { cls: "bg-success-subtle text-success", label: "Đang hiệu lực" },
  EXPIRED: { cls: "bg-danger-subtle text-danger", label: "Hết hạn" },
  PENDING: { cls: "bg-warning-subtle text-warning", label: "Chờ duyệt" },
  CANCELLED: { cls: "bg-secondary-subtle text-secondary", label: "Đã hủy" },
  TERMINATED: { cls: "bg-danger-subtle text-danger", label: "Đã chấm dứt" },
};

const getStatusBadge = (status) =>
  STATUS_BADGE[status] || { cls: "bg-light text-dark", label: status || "N/A" };

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatCurrency = (amount) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format mã hợp đồng: HD-00001
const formatContractCode = (id) => {
  if (!id) return "N/A";
  return `HD-${String(id).padStart(5, "0")}`;
};

const ListContract = () => {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [currentPage, setCurrentPage] = useState(1); // UI dùng 1-based
  const [loading, setLoading] = useState(false);
  const [autoUpdating, setAutoUpdating] = useState(false);
  const navigate = useNavigate();

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Filter trạng thái
  const [filterStatus, setFilterStatus] = useState("");

  // Filter chi nhánh
  const [branches, setBranches] = useState([]);
  const [filterBranch, setFilterBranch] = useState(""); // branchId dạng string

  // Sort
  const [sortBy, setSortBy] = useState("contractId");
  const [sortOrder, setSortOrder] = useState("desc");

  // ====================== FETCH BRANCHES ======================
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await apiBranches.getAllBranches(
          1,
          1000,
          "branchId",
          "asc",
          "",
        );
        const list =
          res?.content || res?.data?.content || res?.data || res || [];
        setBranches(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Lỗi tải chi nhánh:", err);
        setBranches([]);
      }
    };
    loadBranches();
  }, []);

  // ====================== FETCH DATA ======================
  // [FIX] Toàn bộ logic fetch đều đi qua filterContracts khi có filterBranch hoặc filterStatus.
  // Search vẫn dùng searchContracts riêng (không kết hợp branchId — nếu cần, mở rộng backend sau).
  const fetchContracts = async () => {
    setLoading(true);
    try {
      let response;

      if (appliedSearch.trim()) {
        // Khi search: gọi endpoint search (pageNumber 1-based, backend tự -1)
        response = await apiContract.searchContracts(
          appliedSearch.trim(),
          currentPage,
          10,
          sortBy,
          sortOrder,
        );
      } else if (filterBranch || filterStatus) {
        // [FIX] Khi có filter chi nhánh hoặc trạng thái: gọi endpoint filter backend
        response = await apiContract.filterContracts(
          filterStatus || null,
          filterBranch ? Number(filterBranch) : null,
          currentPage,
          10,
          sortBy,
          sortOrder,
        );
      } else {
        response = await apiContract.getAllContracts(
          currentPage,
          10,
          sortBy,
          sortOrder,
        );
      }

      setData(response);
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
      setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ====================== EFFECTS ======================
  useEffect(() => {
    fetchContracts();
  }, [
    currentPage,
    appliedSearch,
    filterStatus,
    filterBranch,
    sortBy,
    sortOrder,
  ]);

  // ====================== HANDLERS ======================
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm);
    // [FIX] Không tắt filter chi nhánh khi search nữa để UX nhất quán
    // (nếu muốn kết hợp search + branch thì mở rộng backend sau)
    setFilterStatus("");
    setFilterBranch("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setAppliedSearch("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // [FIX] Lọc chi nhánh giờ là server-side, không cần filter client-side nữa
  const handleBranchChange = (e) => {
    setFilterBranch(e.target.value);
    setAppliedSearch("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Pagination component trả về 0-based → +1 để lưu vào currentPage (1-based)
  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác!",
      )
    )
      return;

    try {
      setLoading(true);
      await apiContract.deleteContract(id);
      alert("Xóa hợp đồng thành công!");
      if (data.content.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchContracts();
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      const msg = err.response?.data?.message || "Không thể xóa hợp đồng!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoUpdate = async () => {
    if (!window.confirm("Tự động cập nhật trạng thái tất cả hợp đồng?")) return;
    try {
      setAutoUpdating(true);
      await apiContract.autoUpdateStatus();
      toast.success("Đã cập nhật trạng thái hợp đồng thành công!");
      fetchContracts();
    } catch (err) {
      console.error("Lỗi auto-update:", err);
      toast.error("Có lỗi xảy ra khi tự động cập nhật!");
    } finally {
      setAutoUpdating(false);
    }
  };

  // [FIX] Không còn lọc client-side theo chi nhánh — dữ liệu đã được lọc từ backend
  const displayedContent = data.content || [];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ HỢP ĐỒNG</h4>
          <p className="text-muted small mb-0">Danh sách hợp đồng thuê phòng</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary shadow-sm"
            onClick={handleAutoUpdate}
            disabled={autoUpdating}
            title="Tự động cập nhật trạng thái hợp đồng hết hạn"
          >
            <FaSyncAlt className={autoUpdating ? "spin-icon" : ""} /> Cập nhật
            tự động
          </button>
          <Link to="/contracts/create" className="btn btn-primary shadow-sm">
            <FaPlus /> Thêm mới
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR: SEARCH + FILTER + SORT */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center gap-3 flex-wrap">
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: "420px", flex: 1 }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm theo mã hợp đồng, số phòng..."
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

          {/* Filter & Sort */}
          <div className="d-flex gap-2 flex-nowrap align-items-center flex-wrap">
            {/* [FIX] Lọc theo chi nhánh — gọi backend, không filter client-side */}
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ minWidth: "180px" }}
              value={filterBranch}
              onChange={handleBranchChange}
              title="Lọc theo chi nhánh"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName || b.name || `Chi nhánh #${b.branchId}`}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ minWidth: "160px" }}
              value={filterStatus}
              onChange={handleStatusChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hiệu lực</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="TERMINATED">Đã chấm dứt</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ minWidth: "190px" }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="contractId">Sắp xếp theo ID</option>
              <option value="startDate">Sắp xếp theo Ngày bắt đầu</option>
              <option value="endDate">Sắp xếp theo Ngày kết thúc</option>
              <option value="rentPrice">Sắp xếp theo Giá thuê</option>
              <option value="status">Sắp xếp theo Trạng thái</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ minWidth: "110px" }}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        {/* [FIX] Bỏ cột "Chi nhánh" khỏi bảng — chỉ dùng để lọc */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Mã HĐ</th>
                <th>Phòng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Giá thuê</th>
                <th>Tiền cọc</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    Đang tải...
                  </td>
                </tr>
              ) : displayedContent.length > 0 ? (
                displayedContent.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.contractId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <FaFileContract className="fs-5 text-secondary me-2" />
                          <span className="fw-bold">
                            {formatContractCode(item.contractId)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal">
                          {item.roomName ||
                            (item.roomId ? `Phòng #${item.roomId}` : "N/A")}
                        </span>
                      </td>
                      {/* [FIX] Đã xóa cột Chi nhánh */}
                      <td className="small">{formatDate(item.startDate)}</td>
                      <td className="small">{formatDate(item.endDate)}</td>
                      <td className="small fw-semibold text-dark">
                        {formatCurrency(item.rentPrice)}
                      </td>
                      <td className="small">
                        {formatCurrency(item.depositAmount)}
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem thành viên"
                            onClick={() =>
                              navigate(`/contracts/${item.contractId}/members`)
                            }
                          >
                            <FaUsers className="text-success" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem chi tiết"
                            onClick={() =>
                              navigate(`/contracts/${item.contractId}/detail`)
                            }
                          >
                            <FaEye className="text-info" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Sửa"
                            onClick={() =>
                              navigate(`/contracts/${item.contractId}/update`)
                            }
                          >
                            <FaEdit className="text-primary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Không tìm thấy hợp đồng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: {data.totalElements} hợp đồng
          </small>
          <Pagination
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ListContract;
