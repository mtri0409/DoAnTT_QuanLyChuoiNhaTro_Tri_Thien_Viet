import React, { useState, useEffect } from "react";
import {
  FaUndo,
  FaSearch,
  FaUserCircle,
  FaIdBadge,
  FaArrowLeft,
  FaTimes,
  FaPhoneAlt,
  FaMapMarkerAlt
} from "react-icons/fa";
import apiProfile from "../../api/apiProfile";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import apiBranches from "../../api/apiBranches";

const ListProfileDeleted = () => {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  // --- STATE QUẢN LÝ SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');      
  const [appliedSearch, setAppliedSearch] = useState(''); 

  // State Sort
  const [sortBy, setSortBy] = useState('profileId');
  const [sortOrder, setSortOrder] = useState('desc');

    const [viewType,setViewType] = useState("TENANT")
  // Hàm gọi API chung cho cả Load All và Search
  const fetchDeletedProfiles = async () => {
    setLoading(true);
    try {
      let response;
      if (appliedSearch.trim()) {
        response = await apiProfile.searchProfiles(appliedSearch, currentPage, 10, sortBy, sortOrder,selectedBranch,false);
      } else {
        // Gọi API GetAll bình thường
        response = await apiProfile.getAllProfiles(currentPage, 10, sortBy, sortOrder,selectedBranch,false);
        console.log(response);
      }
      console.log(response);
      setData(response);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

    const fetchDeletedInternalProfiles = async () => {
    setLoading(true);
    try {
      let response;
      if (appliedSearch.trim()) {
        response = await apiProfile.searchInternalProfiles(appliedSearch, currentPage, 10, sortBy, sortOrder,false);
      } else {
        // Gọi API GetAll bình thường
        response = await apiProfile.getInternalProfile(currentPage, 10, sortBy, sortOrder,false);
        console.log(response);
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
    viewType == "TENANT" ? fetchDeletedProfiles() : fetchDeletedInternalProfiles();
  }, [currentPage, sortBy, sortOrder, appliedSearch,selectedBranch,viewType]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiBranches.getAllBranches(0,10); 
        console.log("branch",response.content);
        setBranches(response.content);
      } catch (err) {
        console.error("Lỗi lấy chi nhánh:", err);
      }
    };
    fetchBranches();
  }, []);
  
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
  // 3. Hàm Khôi phục hồ sơ (Restore)
  const handleRestore = async (id, fullName) => {
    if (window.confirm(`Bạn có chắc muốn khôi phục hồ sơ của khách: ${fullName}?`)) {
      try {
        setLoading(true);
        // Thường là gọi API cập nhật isActive = true
        await apiProfile.restoreProfile(id); 
        alert("Khôi phục hồ sơ thành công!");
        
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchDeletedProfiles();
        }
      } catch (err) {
        alert("Lỗi khi khôi phục hồ sơ!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        {/* Header: Tiêu đề và Nút hành động chính */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 p-3 bg-white rounded-4 shadow-sm border-0">
        {/* Nhóm trái: Nút quay lại + Tiêu đề */}
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-light shadow-sm rounded-circle p-2 border-0 transition-all"
            style={{ width: '40px', height: '40px' }}
            title="Quay lại"
          >
            <FaArrowLeft className="text-secondary" />
          </button>
          
          <div>
            <h5 className="fw-bold text-dark mb-0 letter-spacing-tight">
              {viewType === 'TENANT' ? 'LƯU TRỮ KHÁCH THUÊ' : 'LƯU TRỮ NHÂN SỰ'}
            </h5>
            <p className="text-muted small mb-0 d-none d-sm-block">
              {viewType === 'TENANT' ? 'Quản lý hồ sơ cư dân đã xóa' : 'Quản lý nhân viên/admin đã ẩn'}
            </p>
          </div>
        </div>

        {/* Nhóm phải: Bộ Tabs tinh tế hơn */}
        <div className="bg-light p-1 rounded-pill d-flex border shadow-inner">
          <button 
            className={`btn btn-sm px-4 py-2 rounded-pill transition-all fw-bold ${
              viewType === 'TENANT' ? 'btn-white shadow-sm text-primary' : 'btn-transparent text-muted'
            }`}
            onClick={() => { setViewType('TENANT'); setCurrentPage(1); }}
          >
            Khách thuê
          </button>
          <button 
            className={`btn btn-sm px-4 py-2 rounded-pill transition-all fw-bold ${
              viewType === 'SYSTEM' ? 'btn-white shadow-sm text-primary' : 'btn-transparent text-muted'
            }`}
            onClick={() => { setViewType('SYSTEM'); setCurrentPage(1); }}
          >
            Nhân sự
          </button>
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
              placeholder="Tìm tên, CCCD, SĐT đã xóa..."
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
              <option value="profileId">Sắp xếp: ID</option>
              <option value="fullName">Sắp xếp: Tên</option>
            </select>
            <select className="form-select form-select-sm border-0 bg-light" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
            </select>

             <select 
                className="form-select form-select-sm border-0 bg-primary-subtle text-primary fw-bold" 
                style={{ width: '180px' }}
                value={selectedBranch} 
                onChange={(e) => { setSelectedBranch(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả chi nhánh</option>
                
                {branches.length > 0 ? branches.map(b => (
                  <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
              )) : <option value="">Chưa có chi nhánh nào</option>}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-secondary text-uppercase small text-muted">
              <tr>
                <th className="ps-4 py-3">Khách thuê cũ</th>
                <th>Liên lạc</th>
                <th>CCCD/Định danh</th>
                <th>Địa chỉ cũ</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5">Đang tải kho lưu trữ...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.profileId} className="bg-light-subtle opacity-75">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <FaUserCircle className="fs-3 text-secondary" />
                        <div>
                          <div className="fw-bold text-muted text-decoration-line-through">{item.fullName}</div>
                          <small className="text-muted">ID: {item.profileId}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small text-muted"><FaPhoneAlt size={10} className="me-1"/> {item.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-white text-muted border fw-normal">{item.identityNumber}</span>
                    </td>
                    <td>
                      <div className="text-muted x-small text-truncate" style={{ maxWidth: '150px' }}>
                        <FaMapMarkerAlt size={10} className="me-1"/> {item.address}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 fw-bold"
                        onClick={() => handleRestore(item.profileId, item.fullName)}
                      >
                        <FaUndo size={12} /> Khôi phục hồ sơ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Kho lưu trữ hồ sơ trống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng cộng: <strong>{data.totalElements}</strong> hồ sơ đã lưu trữ</small>
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

export default ListProfileDeleted;