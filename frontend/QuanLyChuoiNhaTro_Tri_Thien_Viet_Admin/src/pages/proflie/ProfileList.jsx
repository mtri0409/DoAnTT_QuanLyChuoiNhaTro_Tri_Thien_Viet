import React, { useState, useEffect } from 'react';
import { 
  FaUserCircle, FaEdit, FaTrash, FaIdCard, FaMapMarkerAlt, 
  FaPhoneAlt, FaCalendarAlt, FaSearch, FaPlus 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
import Pagination from '../../components/Pagination';

const ProfileList = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async (page) => {
    setLoading(true);
    try {
      const response = await apiProfile.getAllProfiles(page);
      setData(response); 
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ KHÁCH THUÊ</h4>
          <p className="text-muted small mb-0">Hiển thị thông tin cơ bản của cư dân trong chuỗi nhà trọ</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <FaPlus size={14} /> Thêm khách mới
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* Table Toolbar */}
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted" /></span>
            <input type="text" className="form-control bg-light border-0 small" placeholder="Tìm tên, số điện thoại..." />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Số định danh (CCCD)</th>
                <th>Địa chỉ thường trú</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Đang tải dữ liệu...</td></tr>
              ) : (
                data.content?.map((item) => (
                  <tr key={item.profileId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaUserCircle className="fs-3 text-secondary me-2" />
                        <span className="fw-bold text-dark">{item.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-dark"><FaPhoneAlt className="me-2 text-success" size={12}/>{item.phone}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border fw-normal">
                        <FaIdCard className="me-2 text-primary" size={12}/>
                        {item.identity_number || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '250px' }} title={item.address}>
                        <FaMapMarkerAlt className="me-1 text-danger" size={12}/> {item.address}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-primary border-0 bg-light" title="Sửa">
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0 bg-light" title="Xóa">
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
          <span className="text-muted small">Tổng số: <strong>{data.totalElements}</strong> khách thuê</span>
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

export default ProfileList;