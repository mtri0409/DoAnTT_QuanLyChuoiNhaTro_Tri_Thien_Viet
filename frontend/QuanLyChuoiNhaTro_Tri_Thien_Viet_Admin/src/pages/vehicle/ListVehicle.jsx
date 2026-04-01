import React, { useState, useEffect } from 'react';
import { 
  FaMotorcycle, FaEdit, FaTrash, FaSearch, FaPlus, 
  FaTimesCircle, FaFilter, FaIdCard 
} from 'react-icons/fa';
import apiVehicle from '../../api/apiVehicle';
import Pagination from '../../components/Pagination';
import { useNavigate, Link } from 'react-router-dom';

const ListVehicle = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // --- STATE SORT ---
  const [sortBy, setSortBy] = useState('vehicleId');
  const [sortOrder, setSortOrder] = useState('desc');

  // 1. Hàm Fetch dữ liệu (Tách biệt Load và Search)
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let response;
      if (appliedSearch.trim()) {
        response = await apiVehicle.searchVehicles(appliedSearch, currentPage, 10, sortBy, sortOrder);
      } else {
        response = await apiVehicle.getAllVehicles(currentPage, 10, sortBy, sortOrder);
      }
      setData(response);
    } catch (err) {
      console.error("Lỗi load xe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, sortBy, sortOrder, appliedSearch]);

  // 2. Hàm Xóa xe
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông tin xe này?")) {
      try {
        setLoading(true);
        await apiVehicle.deleteVehicle(id);
        alert("Xóa xe thành công!");
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchVehicles();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Không thể xóa xe này!");
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. Xử lý Search
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

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ XE GỬI</h4>
          <p className="text-muted small mb-0">Danh sách phương tiện của khách thuê</p>
        </div>
        <Link to="/vehicle/create" className="btn btn-primary shadow-sm"><FaPlus /> Đăng ký xe</Link>
        <Link to="/vehicle/restore" className="btn btn-danger shadow-sm"><FaPlus /> Danh sách đã xóa</Link>

      </div>

      <div className="card border-0 shadow-sm rounded-3">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px', flex: 1 }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><FaSearch /></span>
              <input 
                type="text" 
                className="form-control bg-light border-0 small" 
                placeholder="Biển số, chủ xe, số phòng..." 
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
              <option value="vehicleId">Sắp xếp: ID</option>
              <option value="licensePlate">Sắp xếp: Biển số</option>
              <option value="ownerName">Sắp xếp: Chủ xe</option>
            </select>
            <select className="form-select form-select-sm border-0 bg-light" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Phương tiện</th>
                <th>Chủ sở hữu</th>
                <th>Vị trí phòng</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Đang tải dữ liệu...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.vehicleId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="p-2 bg-primary-subtle rounded me-2">
                          <FaMotorcycle className="text-primary" />
                        </div>
                        <span className="fw-bold text-uppercase">{item.licensePlate || 'CHƯA CÓ BS'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold">{item.ownerName}</div>
                      <div className="text-muted x-small">ID Chủ: #{item.ownerId}</div>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info px-3">
                        Phòng {item.roomName}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn btn-sm btn-light border-0" 
                          title='Sửa thông tin xe'
                          onClick={() => navigate(`/vehicle/${item.vehicleId}/update`)}
                        >
                          <FaEdit className="text-primary"/>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-0"
                          title='Xóa xe'
                          onClick={() => handleDelete(item.vehicleId)}
                        >
                          <FaTrash className="text-danger"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy xe nào phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng cộng: {data.totalElements} xe</small>
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

export default ListVehicle;