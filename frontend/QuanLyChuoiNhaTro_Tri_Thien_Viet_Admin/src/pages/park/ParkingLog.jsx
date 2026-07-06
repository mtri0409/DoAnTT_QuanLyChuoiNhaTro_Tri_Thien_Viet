import React, { useState, useEffect } from "react";
import {
  FaCar,
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaCheckCircle,
  FaBan,
  FaTrashAlt,
  FaFilter,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";
import apiParkingLog from "../../api/apiParking";

const ListParkingLog = () => {
  const navigate = useNavigate();

  // State dữ liệu phân trang
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Bộ lọc nâng cao (Khớp cấu hình JSON của Spring Boot)
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Tiêu chí sắp xếp mặc định
  const [sortBy] = useState("detectedAt");
  const [sortOrder] = useState("desc");

  // State chứa bộ thông số thống kê mở rộng từ Java Backend
  const [stats, setStats] = useState({
    inCount: 0,
    outCount: 0,
    totalCount: 0,
  });

  // Hàm 1: Gọi API lấy danh sách lịch sử xe kèm bộ lọc động
  const fetchParkingLogs = async () => {
    setLoading(true); // Bật trạng thái loading chặn UI
    try {
      const response = await apiParkingLog.getAllParkingLogs(
        currentPage - 1, // pageNumber (Môi trường Spring Boot chạy từ index 0)
        10, // pageSize
        sortBy, // "detectedAt"
        sortOrder, // "desc"
        appliedSearch || null, // licensePlate
        filterDirection || null, // direction
        null, // isVerified (mặc định để trống)
        fromDate || null, // fromDate
        toDate || null, // toDate
      );
      console.log("Dữ liệu API trả về:", response);
      setData(response);
    } catch (err) {
      console.error("Lỗi tải dữ liệu lịch sử bãi xe:", err);
      toast.error("Không thể tải danh sách xe ra vào");
    } finally {
      setLoading(false); // Tắt loading giải phóng UI
    }
  };

  // Hàm 2: Gọi API thống kê số lượng dựa theo mốc ngày lọc
  const fetchStats = async () => {
    try {
      const response = await apiParkingLog.getTodayStats(
        fromDate || null,
        toDate || null,
      );
      console.log("Dữ liệu thống kê trả về:", response);
      setStats({
        inCount: response.totalIn,
        outCount: response.totalOut,
        totalCount: response.totalLogs,
      });
    } catch (err) {
      console.error("Lỗi tải dữ liệu thống kê:", err);
    }
  };

  // LUỒNG CHẠY DUY NHẤT: Lắng nghe biến động để tải lại dữ liệu đồng bộ
  useEffect(() => {
    fetchParkingLogs();
    fetchStats();
  }, [currentPage, appliedSearch, filterDirection, fromDate, toDate]);

  // Bộ xử lý sự kiện (Handlers)
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

  const handleClearFilters = () => {
    setFilterDirection("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  const handleDelete = async (logId, licensePlate) => {
    const result = await confirmAction({
      title: "Xóa nhật ký",
      text: `Bạn có chắc muốn xóa bản ghi của xe biển số "${licensePlate}"?`,
      icon: "warning",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await apiParkingLog.deleteParkingLog(logId);
        toast.success("Xóa lịch sử xe thành công!");

        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchParkingLogs();
          fetchStats();
        }
      } catch (err) {
        toast.error("Lỗi hệ thống khi xóa bản ghi: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    try {
      return new Date(dateTimeStr).toLocaleString("vi-VN");
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="container-fluid py-4 position-relative">
      {/* HIỆU ỨNG CHẶN MÀN HÌNH KHI ĐANG LOADING KHÔNG CHO CLICK */}
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(255,255,255,0.6)",
            zIndex: 9999,
            pointerEvents: "all",
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FaCar className="text-primary" /> QUẢN LÝ XE RA VÀO
          </h4>
          <p className="text-muted small mb-0">
            Giám sát và lọc lịch sử xe thông qua Camera AI liên tục
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className={`btn ${showFilters ? "btn-primary" : "btn-outline-primary"} shadow-sm d-flex align-items-center gap-2`}
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <FaFilter size={14} /> Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Thẻ Thống kê nhanh */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-success bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted fw-semibold">
                    Lượt xe VÀO
                  </div>
                  <div className="fs-2 fw-bold text-success">
                    {stats.inCount}
                  </div>
                </div>
                <FaSignInAlt className="fs-1 text-success opacity-50" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-danger bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted fw-semibold">Lượt xe RA</div>
                  <div className="fs-2 fw-bold text-danger">
                    {stats.outCount}
                  </div>
                </div>
                <FaSignOutAlt className="fs-1 text-danger opacity-50" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-primary bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted fw-semibold">
                    Tổng lưu lượng trạm
                  </div>
                  <div className="fs-2 fw-bold text-primary">
                    {stats.totalCount}
                  </div>
                </div>
                <FaCar className="fs-1 text-primary opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng điều khiển bộ lọc ẩn hiện */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">
                  Hướng di chuyển
                </label>
                <select
                  className="form-select form-select-sm"
                  value={filterDirection}
                  disabled={loading}
                  onChange={(e) => {
                    setFilterDirection(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả hướng</option>
                  <option value="IN">Vào</option>
                  <option value="OUT">Ra</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={fromDate}
                  disabled={loading}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={toDate}
                  disabled={loading}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  Xóa bộ lọc ngày & hướng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thanh Tìm kiếm biển số */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-white py-3 border-0">
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: "400px" }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Nhập chính xác biển số cần tìm..."
                value={searchTerm}
                disabled={loading}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button
                  type="button"
                  className="btn btn-light border-0"
                  onClick={handleClearSearch}
                  disabled={loading}
                >
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-dark shadow-sm"
              disabled={loading}
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Biển số xe</th>
                <th>Hướng</th>
                <th>Thời gian phát hiện</th>
                <th>Độ tin cậy AI</th>
                <th>Xác thực</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.logId} style={{ opacity: loading ? 0.5 : 1 }}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaCar className="fs-4 text-secondary me-2" />
                        <span className="fw-bold text-uppercase">
                          {item.licensePlate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.direction === "IN" ? "bg-success" : "bg-danger"}`}
                      >
                        {item.direction === "IN" ? "VÀO" : "RA"}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {formatDateTime(item.detectedAt)}
                    </td>
                    <td className="fw-semibold text-dark">
                      {Math.round((item.confidence || 0) * 100)}%
                    </td>
                    <td>
                      {item.isVerified ? (
                        <FaCheckCircle
                          className="text-success"
                          size={18}
                          title="Hệ thống đã xác thực"
                        />
                      ) : (
                        <FaBan
                          className="text-warning"
                          size={18}
                          title="Xe lạ / Chưa xác thực"
                        />
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xem chi tiết ảnh & log thô"
                          disabled={loading}
                          onClick={() =>
                            navigate(`/parking-logs/${item.logId}`)
                          }
                        >
                          <FaEye className="text-info" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xóa bản ghi"
                          disabled={loading}
                          onClick={() =>
                            handleDelete(item.logId, item.licensePlate)
                          }
                        >
                          <FaTrashAlt className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-muted fw-semibold"
                  >
                    {!loading
                      ? "Không tìm thấy dữ liệu xe ra vào phù hợp"
                      : "Đang đồng bộ..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Chân trang phân trang */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted fw-semibold">
            Tổng cộng: {data.totalElements} lượt quét
          </small>
          {!loading && (
            <Pagination
              currentPage={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListParkingLog;
