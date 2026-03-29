import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, FaUserEdit, FaTrash, FaSearch, FaPlus, 
  FaUserCircle, FaKey, FaIdBadge, FaToggleOn, FaToggleOff, FaShieldAlt 
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

  // 1. Xử lý Đổi trạng thái (Active/Inactive)
  const handleToggleStatus = async (userId) => {
    try {
     const res= await apiUser.changeStatus(userId);
     console.log(res);
      fetchUsers(); // Refresh lại danh sách
    } catch (err) {
      alert("Lỗi khi thay đổi trạng thái người dùng!");
      console.log(err);
    }
  };

  // 2. Xử lý Đặt lại mật khẩu (Reset)
  const handleResetPassword = async (userId) => {
    if (window.confirm("Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi mail cho người dùng này?")) {
      try {
        await apiUser.resetPassword(userId);
        alert("Đã reset mật khẩu thành công! Kiểm tra email người dùng.");
      } catch (err) {
        alert("Lỗi khi reset mật khẩu!");
        console.log(err);
      }
    }
  };

  // 3. Xử lý Xóa tài khoản
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

  const renderRoleBadge = (role) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`badge ${isAdmin ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'} border-0 px-3`}>
        {isAdmin ? 'Quản trị viên' : 'Người dùng'}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">Quản lý tài khoản</h4>
          <p className="text-muted small mb-0">Hệ thống quản lý quyền truy cập cư dân và quản trị viên</p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary shadow-sm px-4">
          <FaPlus size={14} className="me-2"/> Tạo tài khoản
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: '350px' }}>
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control bg-light border-0 small" placeholder="Tìm theo tên đăng nhập..." />
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
                <th className="text-center">Trạng thái</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải dữ liệu...</td></tr>
              ) : (
                data.content?.map((user) => (
                  <tr key={user.userId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary-subtle p-2 rounded-circle text-primary d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                           <FaUserCircle size={24}/>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user.userName}</div>
                          <div className="text-muted" style={{fontSize: '11px'}}>UID: {user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profileId ? (
                        <span className="badge bg-light text-primary border cursor-pointer" onClick={() => navigate(`/profile/${user.profileId}/detail`)}>
                          <FaIdBadge className="me-1"/> PR-{user.profileId}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="text-center">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="text-center">
                      <div 
                        className="cursor-pointer d-flex flex-column align-items-center" 
                        onClick={() => handleToggleStatus(user.userId)}
                        title="Bấm để đổi trạng thái"
                      >
                        {user.isActive ? (
                          <>
                            <FaToggleOn size={24} className="text-success" />
                            <small className="text-success fw-bold" style={{fontSize: '9px'}}>ACTIVE</small>
                          </>
                        ) : (
                          <>
                            <FaToggleOff size={24} className="text-secondary" />
                            <small className="text-secondary fw-bold" style={{fontSize: '9px'}}>LOCKED</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn btn-sm btn-outline-primary border-0"
                          title='Đặt lại mật khẩu'
                          onClick={() => handleResetPassword(user.userId)}
                        >
                          <FaKey size={14}/>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-warning border-0 text-dark"
                          title='Đổi vai trò'
                          onClick={() => navigate(`/admin/users/${user.userId}/role`)}
                        >
                          <FaShieldAlt size={14}/>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-dark border-0"
                          title='Sửa thông tin'
                          onClick={() => navigate(`/admin/users/${user.userId}/edit`)}
                        >
                          <FaUserEdit size={16}/>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger border-0"
                          title='Xóa tài khoản'
                          onClick={() => handleDelete(user.userId)}
                        >
                          <FaTrash size={14}/>
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
          <span className="text-muted small">Hiển thị {data.content?.length} trên tổng số {data.totalElements}</span>
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