import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaMapMarkerAlt, FaSearch, FaPlus, FaEdit, FaTrash 
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';

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

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI NHÁNH</h4>
          <p className="text-muted small mb-0">
            Hệ thống quản lý chi nhánh
          </p>
        </div>

        <Link className="btn btn-primary shadow-sm">
          <FaPlus /> Thêm mới
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">

        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: '250px' }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch />
            </span>
            <input 
              type="text" 
              className="form-control bg-light border-0 small" 
              placeholder="Tìm kiếm..." 
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
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                data.content?.map((item) => (
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
                        style={{ maxWidth: '150px' }}
                      >
                        {item.address}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn btn-sm btn-light border-0">
                          <FaEdit className="text-primary"/>
                        </button>
                        <button className="btn btn-sm btn-light border-0">
                          <FaTrash className="text-danger"/>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: {data.totalElements}
          </small>

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