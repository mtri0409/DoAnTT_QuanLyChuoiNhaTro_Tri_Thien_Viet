import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaMapMarkerAlt, FaSearch, FaPlus, FaEdit, FaTrash, FaUser
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import apiProfile from '../../api/apiProfile';
import apiRoom from '../../api/apiRoom';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const BranchList = () => {
  const PAGE_SIZE = 5; 
  
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0
  });

  const [currentPage, setCurrentPage] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [managerMap, setManagerMap] = useState({});   // { profileId: profile }
  const [roomCountMap, setRoomCountMap] = useState({}); // { branchId: totalElements }

  const fetchBranches = async (page = 0, searchText = '') => {
    setLoading(true);
    try {
      const response = await apiBranches.getAllBranches(
        page + 1, PAGE_SIZE, 'branchName', 'asc', searchText
      );
      const branchData = response.data || response;
      setData(branchData || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });

      const branches = branchData?.content || [];

      // ── Fetch manager profiles ──────────────────────────────────
      const managerIds = [...new Set(branches.map(b => b.managerId).filter(Boolean))];
      if (managerIds.length > 0) {
        const results = await Promise.allSettled(
          managerIds.map(id => apiProfile.getProfileById(id))
        );
        const map = {};
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            const p = r.value?.data || r.value;
            map[managerIds[idx]] = p;
          }
        });
        setManagerMap(map);
      }
      const roomCountResults = await Promise.allSettled(
        branches.map(b =>
          apiRoom.getAllRooms(0, 1, 'roomName', 'asc', null, b.branchId, '')
        )
      );
      const countMap = {};
      roomCountResults.forEach((r, idx) => {
        const branchId = branches[idx].branchId;
        if (r.status === 'fulfilled') {
          const d = r.value?.data || r.value;
          countMap[branchId] = d?.totalElements ?? 0;
        } else {
          countMap[branchId] = 0;
        }
      });
      setRoomCountMap(countMap);

    } catch (err) {
      console.error('Fetch error:', err);
      setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCurrentPage(0); }, [search]);
  useEffect(() => { fetchBranches(currentPage, search); }, [currentPage, search]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (branchId, branchName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi nhánh "${branchName}"?`)) return;
    setDeleting(branchId);
    try {
      await apiBranches.deleteBranch(branchId);
      fetchBranches(currentPage, search);
      toast.success('Xóa chi nhánh thành công!');
    } catch (err) {
      toast.error('Lỗi khi xóa chi nhánh: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI NHÁNH</h4>
          <p className="text-muted small mb-0">Hệ thống quản lý chi nhánh</p>
        </div>
        <Link to="/branches/create" className="btn btn-primary shadow-sm">
          <FaPlus /> Thêm mới
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">

        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group" style={{ maxWidth: '250px' }}>
            <span className="input-group-text bg-light border-0"><FaSearch /></span>
            <input 
              type="text" 
              className="form-control bg-light border-0 small" 
              placeholder="Tìm kiếm chi nhánh..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Chi nhánh</th>
                <th>Địa chỉ</th>
                <th>Quản lý</th>
                <th className="text-center">Số phòng</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <span className="ms-2">Đang tải...</span>
                  </td>
                </tr>
              ) : data.content && data.content.length > 0 ? (
                data.content.map((item) => {
                  const manager = item.managerId ? managerMap[item.managerId] : null;
                  const roomCount = roomCountMap[item.branchId] ?? '—';
                  return (
                    <tr key={item.branchId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <FaBuilding className="fs-3 text-secondary me-2" />
                          <span className="fw-bold">{item.branchName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={item.address}>
                          <FaMapMarkerAlt className="me-1" />{item.address || '-'}
                        </div>
                      </td>
                      <td>
                        {manager ? (
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 28, height: 28 }}>
                              <FaUser size={11} className="text-primary" />
                            </div>
                            <span className="small fw-semibold">{manager.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info">{roomCount} phòng</span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <Link to={`/branches/${item.branchId}/update`}
                            className="btn btn-sm btn-light border-0" title="Chỉnh sửa">
                            <FaEdit className="text-primary"/>
                          </Link>
                          <button className="btn btn-sm btn-light border-0"
                            onClick={() => handleDelete(item.branchId, item.branchName)}
                            disabled={deleting === item.branchId} title="Xóa">
                            {deleting === item.branchId
                              ? <span className="spinner-border spinner-border-sm text-danger" role="status">
                                  <span className="visually-hidden">Đang xóa...</span>
                                </span>
                              : <FaTrash className="text-danger"/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Không tìm thấy chi nhánh nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
          <small className="text-muted">
            Tổng: <strong>{data.totalElements || 0}</strong> chi nhánh | Trang: <strong>{(currentPage + 1)}/{data.totalPages || 1}</strong>
          </small>
          {data.totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchList;