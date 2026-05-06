import React, { useState, useEffect } from "react";
import {
  FaUserShield,
  FaUserEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaUserCircle,
  FaKey,
  FaIdBadge,
  FaToggleOn,
  FaToggleOff,
  FaShieldAlt,
} from "react-icons/fa";
import apiUser from "../../api/apiUser";
import Pagination from "../../components/Pagination";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";

const ListUser = () => {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState("userId");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiUser.getAllUsers(
        currentPage,
        10,
        sortBy,
        sortOrder,
      );
      setData(response);
      console.log("Data user",response)
    } catch (err) {
      console.error("Lỗi tải danh sách user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortBy, sortOrder]);

  // 1. Đổi trạng thái (Active/Locked)
  const handleToggleStatus = async (userId) => {
    try {
      await apiUser.changeStatus(userId);
      fetchUsers();
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi thay đổi trạng thái!");
    }  
  };

  // 2. Cập nhật Vai trò (Role) trực tiếp từ Select
  const handleUpdateRole = async (userId, newRole) => {
    try {
      // Giả sử API của Tri là apiUser.updateRole(userId, roleName)
      await apiUser.updateRole(userId, newRole);
      toast.success(`Đã cập nhật vai trò sang ${newRole} thành công!`);
      fetchUsers();
    } catch (err) {
      toast.error("Lỗi khi cập nhật vai trò!");
      console.log(err);
    }
  };

  // 3. Reset mật khẩu
  const handleResetPassword = async (userId) => {
    const result = await confirmAction({
      title:"Đặt lại mật khẩu",
      text:"Bạn có chắc đặt lại mật khẩu cho tài khoản này ?",
      icon:"info"
    });
    if (
      result.isConfirmed
    ) {
      try {
        await apiUser.resetPassword(userId);
        toast.success("Đã reset mật khẩu thành công");
      } catch (err) {
        console.log(err);
        toast.error("Lỗi khi reset mật khẩu!");
      }
    }
  };

  // 4. Xóa tài khoản (mở lại nếu Tri cần dùng)
  const handleDelete = async (id) => {
  
  const result = await confirmAction({
    title: '',
    text: `Bạn có chắc muốn xóa tài khoản này?`,
    icon: 'info'
  });
    if (result.isConfirmed) {
      try {
        await apiUser.deleteUser(id);
        toast.success("Xóa thành công!");
        fetchUsers();
      } catch (err) {
        console.log(err);
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  // Helper đổi màu Text dựa trên Role được chọn
  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "text-danger fw-bold";
      case "STAFF":
        return "text-warning fw-bold";
      case "TENANT":
        return "text-info fw-bold";
      default:
        return "text-dark";
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h4 className="fw-bold text-dark mb-1">
          QUẢN LÝ TÀI KHOẢN
        </h4>
        <p className="text-muted small mb-0">
         Hệ thống quản lý tài khoản khách hàng và nhân viên hệ thống
        </p>
      </div>
      
      <div className="d-flex gap-2">
        <Link to="/users/restore" className="btn btn-outline-danger shadow-sm d-flex align-items-center gap-2">
          <FaTrash size={14}/> <span className="d-none d-md-inline">Danh sách đã xóa</span>
        </Link>
        <Link to="/users/create" className="btn btn-primary shadow-sm d-flex align-items-center gap-2">
          <FaPlus size={14}/> <span>Thêm mới</span>
        </Link>
      </div>
    </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: "350px" }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Tìm theo tên đăng nhập..."
            />
          </div>

          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm border-0 bg-light px-3"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="userId">Mới nhất</option>
              <option value="userName">Tên đăng nhập</option>
              <option value="role">Vai trò</option>
            </select>
            <select
              className="form-select form-select-sm border-0 bg-light"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
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
                <th className="text-center" style={{ width: "180px" }}>
                  Vai trò
                </th>
                <th className="text-center">Trạng thái</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>{" "}
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                data.content?.map((user) => (
                  <tr key={user.userId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="bg-primary-subtle p-2 rounded-circle text-primary d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <FaUserCircle size={24} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">
                            {user.userName}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            UID: {user.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profileId ? (
                        <span
                          className="badge bg-light text-primary border cursor-pointer"
                          onClick={() =>
                            navigate(`/profile/${user.profileId}/detail`)
                          }
                        >
                          <FaIdBadge className="me-1" /> PR-{user.profileId}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">
                          Chưa liên kết
                        </span>
                      )}
                    </td>

                    {/* Cột Vai trò mới: Select Option */}
                    <td className="text-center px-3">
                      <select
                        className={`form-select form-select-sm border-0 bg-light ${getRoleColor(user.role)}`}
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user.userId, e.target.value)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                        <option value="TENANT">TENANT</option>
                      </select>
                    </td>

                    <td className="text-center">
                      <div
                        className="cursor-pointer d-flex flex-column align-items-center"
                        onClick={() => handleToggleStatus(user.userId)}
                      >
                        {user.actice ? (
                          <>
                            <FaToggleOn size={24} className="text-success" />
                            <small
                              className="text-success fw-bold"
                              style={{ fontSize: "9px" }}
                            >
                              ACTIVE
                            </small>
                          </>
                        ) : (
                          <>
                            <FaToggleOff size={24} className="text-secondary" />
                            <small
                              className="text-secondary fw-bold"
                              style={{ fontSize: "9px" }}
                            >
                              LOCKED
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary border-0"
                          title="Đặt lại mật khẩu"
                          onClick={() => handleResetPassword(user.userId)}
                        >
                          <FaKey size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-dark border-0"
                          title="Sửa thông tin"
                          onClick={() =>
                            navigate(`/admin/users/${user.userId}/edit`)
                          }
                        >
                          <FaUserEdit size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger border-0"
                          title="Xóa tài khoản"
                          onClick={() => handleDelete(user.userId)}
                        >
                          <FaTrash size={14} />
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
          <span className="text-muted small">
            Hiển thị {data.content?.length} trên tổng số {data.totalElements}
          </span>
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
