import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, FaUserEdit, FaTrash, FaSearch, FaPlus, 
  FaUserCircle, FaKey, FaIdBadge 
} from 'react-icons/fa';
import apiUser from '../../api/apiUser';
import Pagination from '../../components/Pagination';
import { Link, useNavigate } from 'react-router-dom';

const ListUser = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [sortBy, setSortBy] = useState('userId');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiUser.getAllUsers(currentPage, 10, sortBy, sortOrder);      
      setData(response); 
    } catch (err) {
      console.error("Lỗi tải danh sách user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này? Người dùng sẽ không thể đăng nhập được nữa!")) {
      try {
        await apiUser.deleteUser(id);
        alert("Xóa tài khoản thành công!");
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi khi xóa tài khoản!");
      }
    }
  };

  // Helper để hiển thị Badge cho Role
  const renderRoleBadge = (role) => {
    const isBtnAdmin = role === 'ADMIN';
    return (
      <span className={`badge ${isBtnAdmin ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'} border-0 px-3`}>
        {isBtnAdmin ? 'Quản trị viên' : 'Người dùng'}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ TÀI KHOẢN</h4>
          <p className="text-muted small mb-0">Quản lý quyền truy cập và phân quyền hệ thống</p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary shadow-sm">
          <FaPlus size={14}/> Tạo tài khoản
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control bg-light border-0 small" placeholder="Tìm tên đăng nhập hoặc họ tên..." />
          </div>

          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm border-0 bg-light px-3" 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            >
              <option value="userId">Mới nhất</option>
              <option value="userName">Tên đăng nhập</option>
              <option value="role">Vai trò</option>
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
                <th className="ps-4 py-3">Tài khoản</th>
                <th>Liên kết hồ sơ</th>
                <th className="text-center">Vai trò</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5">Đang tải dữ liệu...</td></tr>
              ) : (
                data.content?.map((user) => (
                  <tr key={user.userId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary-subtle p-2 rounded-circle text-primary d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
                           <FaUserCircle size={20}/>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user.userName}</div>
                          <div className="text-muted" style={{fontSize: '10px'}}>ID: #{user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profileId ? (
                        <span className="text-primary small fw-bold cursor-pointer" onClick={() => navigate(`/profile/${user.profileId}/detail`)}>
                          <FaIdBadge className="me-1"/> PR-{user.profileId}
                        </span>
                      ) : (
                        <span className="text-muted small italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="text-center">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-sm btn-light border-0 text-primary"
                          title='Đổi mật khẩu'
                        >
                          <FaKey size={12}/>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-0 text-dark"
                          title='Sửa quyền'
                          onClick={() => navigate(`/admin/users/${user.userId}/edit`)}
                        >
                          <FaUserEdit size={14}/>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-0 text-danger"
                          title='Xóa tài khoản'
                          onClick={() => handleDelete(user.userId)}
                        >
                          <FaTrash size={12}/>
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
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 rounded-bottom-4">
          <small className="text-muted fw-bold">Tổng cộng: {data.totalElements} tài khoản</small>
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

export default ListUser;