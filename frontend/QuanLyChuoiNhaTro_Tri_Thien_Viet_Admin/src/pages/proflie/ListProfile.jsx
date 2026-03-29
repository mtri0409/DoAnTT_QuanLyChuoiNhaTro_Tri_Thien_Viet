import React, { useState, useEffect } from 'react';
import { 
  FaUserCircle, FaEdit, FaTrash, FaIdCard, FaMapMarkerAlt, 
  FaPhoneAlt, FaSearch, FaPlus, FaCheckCircle, FaTimesCircle, FaEye
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
import Pagination from '../../components/Pagination';
import { Link, Route, useNavigate } from 'react-router-dom';

const ListProfile = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // State quản lý Sort đơn giản
  const [sortBy, setSortBy] = useState('profileId');
  const [sortOrder, setSortOrder] = useState('desc'); // Để mới nhất lên đầu

  // const route = useRoutes();
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Gọi API với state hiện tại
      const response = await apiProfile.getAllProfiles(currentPage, 10, sortBy, sortOrder);      
      setData(response); 
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mỗi khi trang, tiêu chí sort hoặc thứ tự đổi thì gọi lại API
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, sortBy, sortOrder]);

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  const handleDelete = async (id) => {
    // 1. Hỏi xác nhận trước khi xóa
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa hồ sơ khách thuê này? Hành động này không thể hoàn tác!");

    if (isConfirmed) {
      try {
        setLoading(true); 
        await apiProfile.deleteProfile(id);
        
        alert("Xóa hồ sơ thành công!");

        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Load lại danh sách tại trang hiện tại
          fetchProfiles();
        }
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        // Hứng lỗi từ Backend (ví dụ: Khách đang có hợp đồng không được xóa)
        const errorMsg = err.response?.data?.message || "Không thể xóa hồ sơ này. Có thể do ràng buộc dữ liệu!";
        alert(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ KHÁCH THUÊ</h4>
          <p className="text-muted small mb-0">Hệ thống quản lý cư dân</p>
        </div>
        <Link to="/profile/create" className="btn btn-primary shadow-sm"><FaPlus /> Thêm mới</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* Toolbar: Search & Sort */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: '250px' }}>
            <span className="input-group-text bg-light border-0"><FaSearch /></span>
            <input type="text" className="form-control bg-light border-0 small" placeholder="Tìm kiếm..." />
          </div>

          <div className="d-flex gap-2">
            {/* SELECT OPTION ĐỂ SORT */}
            <select 
              className="form-select form-select-sm border-0 bg-light" 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            >
              <option value="profileId">Sắp xếp theo ID</option>
              <option value="isActive">Sắp xếp Trạng thái</option>
              <option value="fullName">Sắp xếp theo Tên</option>
            </select>

            <select 
              className="form-select form-select-sm border-0 bg-light" 
              value={sortOrder} 
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Khách hàng</th>
                <th>Điện thoại</th>
                <th>CCCD</th>
                <th className="text-center">Trạng thái</th>
                <th>Địa chỉ</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">Đang tải...</td></tr>
              ) : (
                data.content?.map((item) => (
                  <tr key={item.profileId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaUserCircle className="fs-3 text-secondary me-2" />
                        <span className="fw-bold">{item.fullName}</span>
                      </div>
                    </td>
                    <td className="small">{item.phone}</td>
                    <td><span className="badge bg-light text-dark border fw-normal">{item.identityNumber || 'N/A'}</span></td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${item.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {item.isActive ? 'Active' : 'Unactive'}
                      </span>
                    </td>
                    <td><div className="text-muted small text-truncate" style={{ maxWidth: '150px' }}>{item.address}</div></td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                      <button 
                        className="btn btn-sm btn-light border-0" 
                        title='Xem chi tiết'
                        onClick={() => navigate(`/profile/${item.profileId}/detail`)}
                      >
                        <FaEye className="text-info"/>
                      </button>                        
                      <button 
                        className="btn btn-sm btn-light border-0"
                         title='Sửa'
                         onClick={() => navigate(`/profile/${item.profileId}/update`)}
                        >
                          <FaEdit className="text-primary"/></button>
                       <button 
                          className="btn btn-sm btn-light border-0"
                          title='Xóa'
                          onClick={() => handleDelete(item.profileId)} // Sửa tên hàm cho chuẩn
                        >
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

        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng: {data.totalElements}</small>
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

export default ListProfile;