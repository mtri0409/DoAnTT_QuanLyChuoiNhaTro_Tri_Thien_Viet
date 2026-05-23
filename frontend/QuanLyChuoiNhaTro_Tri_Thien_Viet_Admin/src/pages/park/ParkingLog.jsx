import React, { useState, useEffect } from 'react';
import { 
  FaCar, FaSearch, FaTimesCircle, FaEye, 
  FaCheckCircle, FaBan, FaEnvelope, FaTrashAlt,
  FaFilter, FaCalendarAlt, FaSignInAlt, FaSignOutAlt
} from 'react-icons/fa';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmAction } from '../../utils/swalUtils';
import apiParkingLog from '../../api/apiParking';

const ListParkingLog = () => {
  const navigate = useNavigate();
  
  // State
  const [data, setData] = useState({ 
    content: [], 
    pageNumber: 0, 
    totalPages: 0, 
    totalElements: 0 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Sort states
  const [sortBy] = useState('detectedAt');
  const [sortOrder] = useState('desc');
  
  // Stats
  const [stats, setStats] = useState({
    inCount: 0,
    outCount: 0,
    totalCount: 0
  });

  // Fetch functions
  // const fetchStats = async () => {
  //   try {
  //     const response = await apiParkingLog.getTodayStats();
  //     setStats(response);
  //   } catch (err) {
  //     console.error("Loi lay thong ke:", err);
  //   }
  // };

  const fetchParkingLogs = async () => {
    setLoading(true);
    try {
      const response = await apiParkingLog.getAllParkingLogs(
        currentPage - 1, 10, sortBy, sortOrder,
        appliedSearch || null,
        filterDirection || null,
        fromDate || null,
        toDate || null
      );
      setData(response);
    } catch (err) {
      console.error("Loi tai du lieu:", err.response);
      toast.error("Khong the tai danh sach xe ra vao");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchParkingLogs();
    // fetchStats();
  }, [currentPage, sortBy, sortOrder, appliedSearch, filterDirection, fromDate, toDate]);

  // Handlers
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

  const handleClearFilters = () => {
    setFilterDirection('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  const handleDelete = async (logId, licensePlate) => {
    const result = await confirmAction({
      title: 'Xoa log',
      text: `Xoa log xe bien so "${licensePlate}"?`,
      icon: 'warning'
    });
    
    if (result.isConfirmed) {
      try {
        await apiParkingLog.deleteParkingLog(logId);
        toast.success("Xoa log thanh cong!");
        
        if (data.content.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchParkingLogs();
        }
        // fetchStats();
      } catch (err) {
        toast.error("Loi xoa: " + err.message);
      }
    }
  };

  // Format datetime
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
      return new Date(dateTimeStr).toLocaleString('vi-VN');
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FaCar className="text-primary" /> QUAN LY XE RA VAO
          </h4>
          <p className="text-muted small mb-0">
            Giam sat va quan ly xe ra vao khu vuc
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter size={14}/> Bo loc
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-success bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted">Xe vao hom nay</div>
                  <div className="fs-2 fw-bold text-success">{stats.inCount}</div>
                </div>
                <FaSignInAlt className="fs-1 text-success opacity-50" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-danger bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted">Xe ra hom nay</div>
                  <div className="fs-2 fw-bold text-danger">{stats.outCount}</div>
                </div>
                <FaSignOutAlt className="fs-1 text-danger opacity-50" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 bg-primary bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-muted">Tong luot</div>
                  <div className="fs-2 fw-bold text-primary">{stats.totalCount}</div>
                </div>
                <FaCar className="fs-1 text-primary opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">Huong</label>
                <select 
                  className="form-select form-select-sm"
                  value={filterDirection}
                  onChange={(e) => { setFilterDirection(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">Tat ca</option>
                  <option value="IN">Vao</option>
                  <option value="OUT">Ra</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">Tu ngay</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1">Den ngay</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="col-md-3">
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={handleClearFilters}>
                  Xoa bo loc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-header bg-white py-3 border-0">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px' }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><FaSearch /></span>
              <input 
                type="text" 
                className="form-control bg-light border-0 small" 
                placeholder="Tim theo bien so..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
                <button type="button" className="btn btn-light border-0" onClick={handleClearSearch}>
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-dark shadow-sm">Tim</button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Bien so</th>
                <th>Huong</th>
                <th>Thoi gian</th>
                <th>Do tin cay</th>
                <th>Xac thuc</th>
                <th className="text-end pe-4">Thao tac</th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">Dang tai...</td></tr>
              ) : data.content?.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.logId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaCar className="fs-4 text-secondary me-2" />
                        <span className="fw-bold">{item.licensePlate}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.direction === 'IN' ? 'bg-success' : 'bg-danger'}`}>
                        {item.direction === 'IN' ? 'Vao' : 'Ra'}
                      </span>
                    </td>
                    <td className="small">{formatDateTime(item.detectedAt)}</td>
                    <td>{Math.round((item.confidence || 0) * 100)}%</td>
                    <td>
                      {item.isVerified ? (
                        <FaCheckCircle className="text-success" size={18} title="Da xac thuc" />
                      ) : (
                        <FaBan className="text-muted" size={18} title="Chua xac thuc" />
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn btn-sm btn-light border-0"
                          title="Xem chi tiet"
                          onClick={() => navigate(`/parking-logs/${item.logId}`)}
                        >
                          <FaEye className="text-info" />
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-0"
                          title="Xoa"
                          onClick={() => handleDelete(item.logId, item.licensePlate)}
                        >
                          <FaTrashAlt className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Khong co du lieu xe ra vao</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tong: {data.totalElements} luot</small>
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

export default ListParkingLog;