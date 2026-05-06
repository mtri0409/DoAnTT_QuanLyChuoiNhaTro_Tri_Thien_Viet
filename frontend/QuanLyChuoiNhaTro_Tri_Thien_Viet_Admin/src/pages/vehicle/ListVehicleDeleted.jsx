import React, { useState, useEffect } from "react";
import { 
  FaMotorcycle, FaUndo, FaSearch, FaArrowLeft, 
  FaTimes, FaIdCard, FaDoorOpen, FaUser  
} from "react-icons/fa";
import apiVehicle from "../../api/apiVehicle";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { confirmAction } from "../../utils/swalUtils";
import { toast } from "react-toastify";

const ListVehicleDeleted = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- STATE SEARCH & SORT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sortBy, setSortBy] = useState("vehicleId");
  const [sortOrder, setSortOrder] = useState("desc");

  // 1. Fetch danh sách xe đã bị ẩn (status = false)
  const fetchDeletedVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiVehicle.getAllVehiclesDeleted(
        currentPage, 
        10, 
        sortBy, 
        sortOrder, 
        appliedSearch
      );
      setData(response);
    } catch (err) {
      console.error("Lỗi tải kho lưu trữ xe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedVehicles();
  }, [currentPage, sortBy, sortOrder, appliedSearch]);

  // 2. Xử lý Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  // 3. Hàm Khôi phục xe (Restore)
  const handleRestore = async (id, licensePlate) => {

    const result = await confirmAction({
    title: 'Khôi phục xe',
    text: `Bạn có chắc muốn khôi phục xe biển số [${licensePlate}]?`,
    icon: 'info'
  });
    if (result.isConfirmed ) {
      try {
        setLoading(true);
        // Gọi API cập nhật status = true
        await apiVehicle.restoreVehicle(id); 
        toast.success("Khôi phục phương tiện thành công!");
        
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchDeletedVehicles();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi khôi phục xe!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-white shadow-sm rounded-circle p-2 border-0"
            title="Quay lại"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-secondary mb-0 text-uppercase">Kho lưu trữ phương tiện</h4>
            <p className="text-muted small mb-0">Danh sách xe đã xóa hoặc hủy đăng ký</p>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Toolbar */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Tìm biển số, chủ xe đã xóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {appliedSearch && (
              <button type="button" className="btn btn-light border-0" onClick={handleClearSearch}>
                <FaTimes className="text-muted" />
              </button>
            )}
            <button type="submit" className="btn btn-secondary px-3">Tìm</button>
          </form>

          <div className="d-flex gap-2">
            <select className="form-select form-select-sm border-0 bg-light" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="vehicleId">Sắp xếp: ID</option>
              <option value="licensePlate">Sắp xếp: Biển số</option>
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
            <thead className="table-secondary text-uppercase small text-muted">
              <tr>
                <th className="ps-4 py-3">Phương tiện đã xóa</th>
                <th>Thông tin chủ cũ</th>
                <th>Vị trí phòng</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Đang tải kho lưu trữ...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.vehicleId} className="bg-light-subtle opacity-75">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 bg-secondary-subtle rounded text-secondary">
                          <FaMotorcycle size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-muted text-decoration-line-through text-uppercase">
                            {item.licensePlate || 'KHÔNG BIỂN SỐ'}
                          </div>
                          <small className="text-muted">{item.brand || 'N/A'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-bold text-muted"><FaUser size={10} className="me-1"/> {item.ownerName}</div>
                      <div className="x-small text-muted italic">ID: #{item.ownerId}</div>
                    </td>
                    <td>
                      <span className="badge bg-white text-muted border fw-normal">
                        <FaDoorOpen className="me-1"/> Phòng {item.roomName}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-bold"
                        onClick={() => handleRestore(item.vehicleId, item.licensePlate)}
                      >
                        <FaUndo size={12} /> Khôi phục xe
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    Kho lưu trữ phương tiện trống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng cộng: <strong>{data.totalElements}</strong> xe trong kho</small>
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

export default ListVehicleDeleted;