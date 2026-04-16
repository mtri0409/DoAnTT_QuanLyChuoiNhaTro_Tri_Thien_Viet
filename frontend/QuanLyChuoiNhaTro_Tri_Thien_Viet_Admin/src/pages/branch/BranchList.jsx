import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaMapMarkerAlt, FaSearch, FaPlus, FaEdit, FaTrash 
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';

const BranchList = () => {
  const PAGE_SIZE = 5; 
  
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0
  });

  const [currentPage, setCurrentPage] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null); 

  const fetchBranches = async (page = 0, searchText = '') => {
    setLoading(true);
    try {
      const response = await apiBranches.getAllBranches(
        page + 1, 
        PAGE_SIZE,
        'branchName',
        'asc',
        searchText
      );
      
      console.log('Response:', response);
      
      const branchData = response.data || response;
      setData(branchData || {
        content: [],
        pageNumber: 0,
        totalPages: 0,
        totalElements: 0
      });
      
      console.log(' Branches loaded:', branchData.content?.length || 0);
    } catch (err) {
      console.error(' Fetch error:', err);
      setData({
        content: [],
        pageNumber: 0,
        totalPages: 0,
        totalElements: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  useEffect(() => {
    fetchBranches(currentPage, search);
  }, [currentPage, search]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (branchId, branchName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi nhánh "${branchName}"?`)) {
      return;
    }

    setDeleting(branchId);
    try {
      const response = await apiBranches.deleteBranch(branchId);
      console.log(' Delete response:', response);
      
      fetchBranches(currentPage, search);
      alert('Xóa chi nhánh thành công!');
    } catch (err) {
      console.error(' Delete error:', err);
      alert('Lỗi khi xóa chi nhánh: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI NHÁNH</h4>
          <p className="text-muted small mb-0">
            Hệ thống quản lý chi nhánh
          </p>
        </div>

        <Link to="/branches/create" className="btn btn-primary shadow-sm">
          <FaPlus /> Thêm mới
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">

        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group" style={{ maxWidth: '250px' }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch />
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-0 small" 
              placeholder="Tìm kiếm chi nhánh..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Chi nhánh</th>
                <th>Địa chỉ</th>
                <th className="text-center">Số phòng</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <span className="ms-2">Đang tải...</span>
                  </td>
                </tr>
              ) : data.content && data.content.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.branchId}>
                    
                    {/* NAME */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaBuilding className="fs-3 text-secondary me-2" />
                        <span className="fw-bold">
                          {item.branchName}
                        </span>
                      </div>
                    </td>

                    {/* ADDRESS */}
                    <td>
                      <div 
                        className="text-muted small text-truncate"
                        style={{ maxWidth: '200px' }}
                        title={item.address}
                      >
                        <FaMapMarkerAlt className="me-1" />
                        {item.address || '-'}
                      </div>
                    </td>

                    {/* ROOM COUNT */}
                    <td className="text-center">
                      <span className="badge bg-info">
                        {item.roomCount || 0} phòng
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          to={`/branches/${item.branchId}/update`}
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-primary"/>
                        </Link>
                        <button
                          className="btn btn-sm btn-light border-0"
                          onClick={() => handleDelete(item.branchId, item.branchName)}
                          disabled={deleting === item.branchId}
                          title="Xóa"
                        >
                          {deleting === item.branchId ? (
                            <span className="spinner-border spinner-border-sm text-danger" role="status">
                              <span className="visually-hidden">Đang xóa...</span>
                            </span>
                          ) : (
                            <FaTrash className="text-danger"/>
                          )}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    Không tìm thấy chi nhánh nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
          <small className="text-muted">
            Tổng: <strong>{data.totalElements || 0}</strong> chi nhánh | Trang: <strong>{(currentPage + 1)}/{data.totalPages || 1}</strong>
          </small>

          {data.totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default BranchList;