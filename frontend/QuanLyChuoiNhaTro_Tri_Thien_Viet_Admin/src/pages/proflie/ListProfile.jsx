import React, { useState, useEffect } from 'react';
import { 
  FaUserCircle, FaEdit, FaTrash, FaSearch, FaPlus, 
  FaTimesCircle, FaEye, FaUserPlus 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
// import apiUser from '../../api/apiUser';
import Pagination from '../../components/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import apiUser from '../../api/apiUser';

const ListProfile = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');      
  const [appliedSearch, setAppliedSearch] = useState(''); 

  // State Sort
  const [sortBy, setSortBy] = useState('profileId');
  const [sortOrder, setSortOrder] = useState('desc');

  // Hàm gọi API chung cho cả Load All và Search
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let response;
      if (appliedSearch.trim()) {
        // Gọi API Search nếu có từ khóa
        response = await apiProfile.searchProfiles(appliedSearch, currentPage, 10, sortBy, sortOrder);
      } else {
        // Gọi API GetAll bình thường
        response = await apiProfile.getAllProfiles(currentPage, 10, sortBy, sortOrder);
      }
      console.log(response);
      setData(response);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API khi: Trang đổi, Tiêu chí Sort đổi, hoặc khi bấm nút Search (appliedSearch đổi)
  useEffect(() => {
    fetchProfiles();
  }, [currentPage, sortBy, sortOrder, appliedSearch]);

  // Xử lý khi bấm nút Search hoặc Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang 1 khi search mới
    setAppliedSearch(searchTerm);
  };

  // Xử lý khi bấm nút X để xóa search
  const handleClearSearch = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };
  // 2. Hàm Xóa hồ sơ (Có xác nhận)
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này? Hành động này không thể hoàn tác!");
    if (isConfirmed) {
      try {
        setLoading(true); 
        await apiProfile.deleteProfile(id);
        alert("Xóa hồ sơ thành công!");
        
        // Nếu xóa dòng cuối cùng của trang thì lùi về 1 trang
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchProfiles(); // Load lại dữ liệu
        }
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        const errorMsg = err.response?.data?.message || "Lỗi ràng buộc dữ liệu, không thể xóa!";
        alert(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleGenerateAccount = async (profileId, fullName) => {
    if (window.confirm(`Bạn có muốn cấp tài khoản tự động cho khách hàng: ${fullName}?`)) {
      try {
        setLoading(true);
        // Gọi API sinh tài khoản từ profileId
        await apiUser.generareAcount(profileId); 
        alert("Cấp tài khoản thành công! Thông tin đã được gửi đến khách hàng.");
        fetchProfiles(); // Refresh lại danh sách để cập nhật trạng thái (nếu có)
      } catch (err) {
        console.error("Lỗi cấp tài khoản:", err);
        const errorMsg = err.response?.data?.message || "Lỗi! Có thể hồ sơ này đã có tài khoản rồi.";
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
        {/* TOOLBAR: SEARCH & SORT */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          
          {/* Ô Search có nút bấm */}
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px', flex: 1 }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><FaSearch /></span>
              <input 
                type="text" 
                className="form-control bg-light border-0 small" 
                placeholder="Tìm tên, CCCD, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button type="button" className="btn btn-light border-0" onClick={handleClearSearch}>
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-dark shadow-sm">Tìm</button>
          </form>

          <div className="d-flex gap-2">
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

        {/* BẢNG DỮ LIỆU */}
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
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
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
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td><div className="text-muted small text-truncate" style={{ maxWidth: '150px' }}>{item.address}</div></td>
                    <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-1">
                      {/* Nút Cấp tài khoản nhanh */}
                      <button 
                        className="btn btn-sm btn-light border-0" 
                        title='Cấp tài khoản nhanh'
                        onClick={() => handleGenerateAccount(item.profileId, item.fullName)}
                      >
                        <FaUserPlus className="text-success"/>
                      </button>

                      {/* Nút Xem chi tiết */}
                      <button 
                        className="btn btn-sm btn-light border-0" 
                        title='Xem chi tiết'
                        onClick={() => navigate(`/profile/${item.profileId}/detail`)}
                      >
                        <FaEye className="text-info"/>
                      </button> 

                      {/* Nút Chỉnh sửa */}
                      <button 
                        className="btn btn-sm btn-light border-0"
                        title='Sửa'
                        onClick={() => navigate(`/profile/${item.profileId}/update`)}
                      >
                        <FaEdit className="text-primary"/>
                      </button>

                      {/* Nút Xóa */}
                      <button 
                        className="btn btn-sm btn-light border-0"
                        title='Xóa'
                        onClick={() => handleDelete(item.profileId)}
                      >
                        <FaTrash className="text-danger"/>
                      </button>
                    </div>
                  </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy khách hàng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
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