import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaEye, FaTrash, FaSearch, FaPlus, 
  FaTimesCircle, FaGlobe, FaUserLock, FaTools, FaFileInvoiceDollar
} from 'react-icons/fa';
import apiNotification from '../../api/apiNotification'; // Giả định bạn đã có file api này
import Pagination from '../../components/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import { confirmAction } from '../../utils/swalUtils';
import { toast } from 'react-toastify';

const ListNotification = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // Mặc định sắp xếp theo ngày tạo
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      if (appliedSearch.trim()) {
        // response = await apiNotification.searchNotifications(appliedSearch, currentPage, 10, sortBy, sortOrder);
      } else {
        response = await apiNotification.getAllNotifications(currentPage, 10, sortBy, sortOrder);
        console.log("Data notify :",response);
      }
      setData(response);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, sortBy, sortOrder, appliedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    const result = await confirmAction({
    title: 'Xóa thông báo',
    text: "Bạn có chắc muốn xóa thông báo này?",
    icon: 'info'
  });
    if (result.isConfirmed) {
      try {
        await apiNotification.deleteNotification(id);
        toast.success("Xóa thành công!");
        fetchNotifications();
      } catch (err) {
        toast.error("Không thể xóa thông báo này!");
      }
    }
  };

  // Hàm helper hiển thị Icon dựa trên Type
  const getTypeBadge = (type) => {
    switch (type) {
      case 'MAINTENANCE': return <span className="badge bg-warning-subtle text-warning"><FaTools /> Bảo trì</span>;
      case 'INVOICE': return <span className="badge bg-primary-subtle text-primary"><FaFileInvoiceDollar /> Hóa đơn</span>;
      case 'CONTRACT': return <span className="badge bg-primary-subtle text-primary"><FaFileInvoiceDollar /> Họp đồng</span>;
      
      default: return <span className="badge bg-info-subtle text-info"><FaBell /> Chung</span>;
    }
  };

  if(!data) {
    return;
  }
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ THÔNG BÁO</h4>
          <p className="text-muted small mb-0">Gửi thông báo tới người thuê phòng</p>
        </div>
        <Link to="/notifications/create" className="btn btn-primary shadow-sm"><FaPlus /> Tạo thông báo mới</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px', flex: 1 }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><FaSearch /></span>
              <input 
                type="text" className="form-control bg-light border-0 small" 
                placeholder="Tìm tiêu đề, nội dung..." 
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
            <select className="form-select form-select-sm border-0 bg-light" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Ngày tạo</option>
              <option value="title">Tiêu đề</option>
              <option value="type">Loại tin</option>
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
                <th className="ps-4 py-3">Đối tượng</th>
                <th>Nội dung</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">Đang tải...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.notificationId} className={item.isRead ? 'opacity-75' : 'fw-bold'}>
                    <td className="ps-4">
                      {item.userId === null ? (
                        <div className="d-flex align-items-center text-primary">
                          <FaGlobe className="me-2" /> <span>Tất cả</span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center text-dark">
                          <FaUserLock className="me-2 text-secondary" /> <span>{item.userName}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '250px' }} title={item.content}>
                        {item.title && <div className="small text-dark fw-bold">{item.title}</div>}
                        <span className="text-muted small fw-normal">{item.content}</span>
                      </div>
                    </td>
                    <td>{getTypeBadge(item.type)}</td>
                    <td>
                      <span className={`badge rounded-pill ${item.isRead ? 'bg-light text-muted' : 'bg-danger'}`}>
                        {item.isRead ? 'Đã xem' : 'Chưa xem'}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn btn-sm btn-light border-0" 
                          title='Xem chi tiết'
                          onClick={() => navigate(`/notifications/${item.notificationId}/detail`)}
                        >
                          <FaEye className="text-info"/>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-0"
                          title='Xóa'
                          onClick={() => handleDelete(item.notificationId)}
                        >
                          <FaTrash className="text-danger"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Không có thông báo nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng: {data.totalElements}</small>
          <Pagination 
            currentPage={data.pageNumber} 
            totalPages={data.totalPages} 
            onPageChange={(page) => setCurrentPage(page + 1)} 
          />
        </div>
      </div>
    </div>
  );
};

export default ListNotification;