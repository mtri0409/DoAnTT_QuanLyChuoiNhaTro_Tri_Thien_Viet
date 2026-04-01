import React, { useState, useEffect } from "react";
import {
  FaUndo,
  FaSearch,
  FaUserCircle,
  FaIdBadge,
  FaArrowLeft,
  FaExclamationTriangle,
  FaTimes,
  FaSortAmountDown,
} from "react-icons/fa";
import apiUser from "../../api/apiUser";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

const ListUserDeleted = () => {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE FILTER & SORT ---
  const [searchTerm, setSearchTerm] = useState(""); // Gõ phím
  const [appliedSearch, setAppliedSearch] = useState(""); // Bấm Tìm
  const [sortBy, setSortBy] = useState("userId");
  const [sortOrder, setSortOrder] = useState("desc");

  // 1. Fetch danh sách User đã bị xóa (active = false)
  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      // Đảm bảo hàm này nhận tham số keyword trong apiUser.js
      const response = await apiUser.getAllUsersDeleted(
        currentPage,
        10,
        sortBy,
        sortOrder,
        appliedSearch
      );
      setData(response);
    } catch (err) {
      console.error("Lỗi tải kho lưu trữ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, [currentPage, sortBy, sortOrder, appliedSearch]);

  // 2. Xử lý Tìm kiếm
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

  // 3. Hàm Khôi phục (Restore)
  const handleRestore = async (userId, userName) => {
    if (window.confirm(`Khôi phục quyền truy cập cho tài khoản [${userName}]?`)) {
      try {
        // Sử dụng API đổi trạng thái để bật lại active = true
        await apiUser.changeStatus(userId);
        alert("Đã khôi phục tài khoản thành công!");
        
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchDeletedUsers();
        }
      } catch (err) {
        alert("Lỗi khi khôi phục tài khoản!");
      }
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-white shadow-sm rounded-circle p-2 border-0"
            title="Quay lại"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-secondary mb-0 text-uppercase">Kho lưu trữ tài khoản</h4>
            <p className="text-muted small mb-0">Các tài khoản đã bị khóa (Status: LOCKED)</p>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Toolbar: Search & Sort */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Tìm tài khoản bị khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {appliedSearch && (
              <button type="button" className="btn btn-light border-0" onClick={handleClearSearch}>
                <FaTimes className="text-muted" />
              </button>
            )}
            <button type="submit" className="btn btn-secondary px-3">Tìm</button>
          </form>

          <div className="d-flex gap-2">
            <select 
                className="form-select form-select-sm border-0 bg-light" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="userId">Sắp xếp: ID</option>
              <option value="userName">Sắp xếp: Tên</option>
            </select>
            <select 
                className="form-select form-select-sm border-0 bg-light" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-secondary text-uppercase small text-muted">
              <tr>
                <th className="ps-4 py-3">Tài khoản bị khóa</th>
                <th>Liên kết hồ sơ</th>
                <th className="text-center">Vai trò trước đó</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Đang quét kho dữ liệu...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((user) => (
                  <tr key={user.userId} className="bg-light-subtle">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2 opacity-75">
                        <div className="bg-secondary-subtle p-2 rounded-circle text-secondary">
                          <FaUserCircle size={24} />
                        </div>
                        <div>
                          <div className="fw-bold text-muted text-decoration-line-through">
                            {user.userName}
                          </div>
                          <small className="text-muted">ID: {user.userId}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profileId ? (
                        <span className="badge bg-white text-muted border">
                          <FaIdBadge className="me-1" /> PR-{user.profileId}
                        </span>
                      ) : <small className="text-muted italic">N/A</small>}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary-subtle text-secondary px-3 py-2 uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-bold"
                        onClick={() => handleRestore(user.userId, user.userName)}
                      >
                        <FaUndo size={12} /> Khôi phục
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="text-muted">
                      <FaExclamationTriangle size={30} className="mb-2 opacity-25" />
                      <p className="mb-0">Không tìm thấy tài khoản nào trong kho lưu trữ.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng cộng: <strong>{data.totalElements}</strong> mục đã lưu trữ</small>
          <Pagination
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={(p) => setCurrentPage(p + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default ListUserDeleted;