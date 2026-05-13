// pages/admin/BranchList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBuilding, FaPlus, FaEdit, FaTrash, 
  FaSearch, FaTimes 
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 5;

const BranchList = () => {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchBranches = useCallback(async (page, searchText) => {
    setLoading(true);
    try {
      const response = await apiBranches.getAllBranches(
        page + 1,
        PAGE_SIZE,
        'branchName',
        'asc',
        searchText
      );
      setData(response.data || response || {
        content: [],
        pageNumber: 0,
        totalPages: 0,
        totalElements: 0,
      });
    } catch (err) {
      console.error('Fetch branches error:', err);
      setData({
        content: [],
        pageNumber: 0,
        totalPages: 0,
        totalElements: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches(0, '');
  }, [fetchBranches]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(0);
    fetchBranches(0, value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBranches(page, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetSearch = () => {
    setSearch('');
    setCurrentPage(0);
    fetchBranches(0, '');
  };

  const deleteBranch = async (id, branchName) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa chi nhánh "${branchName}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await apiBranches.deleteBranch(id);
      toast.success("Xóa chi nhánh thành công!");
      fetchBranches(currentPage, search);
    } catch (err) {
      console.error('Delete branch error:', err);
      toast.error(err.response?.data?.message || "Không thể xóa chi nhánh");
    } finally {
      setDeletingId(null);
    }
  };

  const { content = [], totalPages = 0, totalElements = 0 } = data;

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI NHÁNH</h4>
          <p className="text-muted small mb-0">
            Quản lý hệ thống chuỗi phòng trọ
          </p>
        </div>
        <Link to="/branches/create" className="btn btn-primary shadow-sm">
          <FaPlus className="me-2" size={12} />
          Thêm chi nhánh
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-3">
                  <FaSearch className="text-muted" size={14} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 rounded-end-3"
                  placeholder="Tìm kiếm theo tên chi nhánh..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-light border-0 rounded-3 ms-2"
                    onClick={resetSearch}
                  >
                    <FaTimes size={12} /> Xóa
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => fetchBranches(currentPage, search)}
              >
                <FaBuilding className="me-1" size={12} />
                Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3" style={{ width: 60 }}>STT</th>
                <th className="py-3">TÊN CHI NHÁNH</th>
                <th className="py-3">ĐỊA CHỈ</th>
                <th className="text-end pe-4 py-3" style={{ width: 120 }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Đang tải...
                  </td>
                </tr>
              )}
              
              {!loading && content.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    {search ? "Không tìm thấy chi nhánh nào" : "Chưa có chi nhánh nào"}
                  </td>
                </tr>
              )}
              
              {!loading && content.map((item, idx) => (
                <tr key={item.branchId}>
                  <td className="ps-4">{currentPage * PAGE_SIZE + idx + 1}</td>
                  <td className="fw-semibold">{item.branchName}</td>
                  <td>{item.address}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex gap-2 justify-content-end">
                      <Link
                        to={`/branches/${item.branchId}/update`}
                        className="btn btn-sm btn-light border-0 rounded-circle"
                        style={{ width: 32, height: 32 }}
                        title="Chỉnh sửa"
                      >
                        <FaEdit className="text-primary" size={14} />
                      </Link>
                      <button
                        className="btn btn-sm btn-light border-0 rounded-circle"
                        style={{ width: 32, height: 32 }}
                        onClick={() => deleteBranch(item.branchId, item.branchName)}
                        disabled={deletingId === item.branchId}
                        title="Xóa"
                      >
                        {deletingId === item.branchId ? (
                          <span className="spinner-border spinner-border-sm text-danger" />
                        ) : (
                          <FaTrash className="text-danger" size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION & FOOTER */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
          <small className="text-muted">
            Tổng: <strong>{totalElements || 0}</strong> chi nhánh | 
            Trang: <strong>{currentPage + 1}/{totalPages || 1}</strong>
          </small>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchList;