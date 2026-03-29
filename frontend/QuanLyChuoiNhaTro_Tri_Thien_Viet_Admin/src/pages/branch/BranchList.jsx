import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaMapMarkerAlt, FaSearch, FaPlus, FaEdit, FaTrash 
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import Pagination from '../../components/Pagination';

const BranchList = () => {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchBranches = async (page) => {
    setLoading(true);
    try {
      const response = await apiBranches.getAllBranches(page);
      setData(response);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI NHÁNH</h4>
          <p className="text-muted small mb-0">Danh sách các chi nhánh trong hệ thống</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <FaPlus size={14} /> Thêm chi nhánh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* Search */}
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-0 small" 
              placeholder="Tìm tên chi nhánh..." 
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Chi nhánh</th>
                <th>Địa chỉ</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                data.content?.map((item) => (
                  <tr key={item.branchId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaBuilding className="fs-4 text-primary me-2" />
                        <span className="fw-bold text-dark">
                          {item.branchName}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div 
                        className="text-muted small text-truncate" 
                        style={{ maxWidth: '300px' }}
                        title={item.address}
                      >
                        <FaMapMarkerAlt className="me-1 text-danger" size={12}/>
                        {item.address}
                      </div>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-primary border-0 bg-light">
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0 bg-light">
                          <FaTrash />
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
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-top-0">
          <span className="text-muted small">
            Tổng số: <strong>{data.totalElements}</strong> chi nhánh
          </span>
          <Pagination 
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BranchList;