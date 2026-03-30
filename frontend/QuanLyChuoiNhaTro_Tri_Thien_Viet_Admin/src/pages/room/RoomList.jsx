import React, { useState, useEffect } from 'react';
import { FaBed, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiRoom from '../../api/apiRoom';
import apiFloor from '../../api/apiFloor';
import apiBranches from '../../api/apiBranches';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';

const RoomList = () => {
    const PAGE_SIZE = 5; // 5 phòng mỗi trang
    
    const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0); // Backend dùng 0-indexed
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('all');

    const [floors, setFloors] = useState([]);
    const [branches, setBranches] = useState([]);

    // fetch rooms
    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await apiRoom.getAllRooms(
                currentPage,        // 0-indexed
                PAGE_SIZE,           // 5 phòng mỗi trang
                'roomName',
                'asc',
                selectedFloor || null,
                selectedBranch === 'all' ? null : selectedBranch,
                search
            );
            console.log('🛏️ Raw response:', res);
            
            const roomData = res.data || res;
            setData(roomData || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
            console.log('✅ Set room data:', roomData);
        } catch (err) {
            console.error('❌ Fetch rooms error:', err);
            setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
        } finally {
            setLoading(false);
        }
    };

    // fetch floors & branches
    const fetchFilters = async () => {
        try {
            // ===== FLOORS =====
            const floorRes = await apiFloor.getAllFloors();
            console.log('🏢 Raw floors response:', floorRes);
            
            const floorData = floorRes.data || floorRes;
            setFloors(Array.isArray(floorData) ? floorData : []);
            console.log('✅ Set floors:', floorData);

            // ===== BRANCHES =====
            const branchRes = await apiBranches.getAllBranches(1, 100);
            console.log('🏪 Raw branches response:', branchRes);
            
            const branchData = branchRes.data || branchRes;
            const branchList = branchData?.content || [];
            console.log('✅ Set branches:', branchList);
            
            setBranches([{ branchId: 'all', branchName: 'Tất cả' }, ...branchList]);

        } catch (err) {
            console.error('❌ Fetch filters error:', err);
            setBranches([{ branchId: 'all', branchName: 'Tất cả' }]);
            setFloors([]);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    // Fetch rooms khi filter thay đổi, RESET về trang 0
    useEffect(() => {
        setCurrentPage(0);
    }, [search, selectedFloor, selectedBranch]);

    // Fetch rooms khi currentPage hoặc filters thay đổi
    useEffect(() => {
        fetchRooms();
    }, [currentPage, search, selectedFloor, selectedBranch]);

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll lên top table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="container-fluid py-4">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">QUẢN LÝ PHÒNG</h4>
                    <p className="text-muted small mb-0">Hệ thống quản lý phòng</p>
                </div>
                <Link to="/admin/rooms/create" className="btn btn-primary shadow-sm">
                    <FaPlus /> Thêm mới
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-3">

                {/* TOOLBAR */}
                <div className="card-header bg-white py-3 border-0">
                    {/* search + floor filter */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div className="input-group" style={{ maxWidth: '250px' }}>
                            <span className="input-group-text bg-light border-0">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-0 small"
                                placeholder="Tìm kiếm..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* floor filter */}
                        <select
                            className="form-select form-select-sm border-0 bg-light"
                            style={{ maxWidth: '180px' }}
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                        >
                            <option value="">Tất cả tầng</option>
                            {Array.isArray(floors) && floors.map(f => (
                                <option key={f.floorId} value={f.floorId}>
                                    Tầng {f.floorNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* branch tabs */}
                    <div className="d-flex gap-2 mb-2 flex-wrap">
                        {Array.isArray(branches) && branches.length > 0 ? (
                            branches.map(b => (
                                <button
                                    key={b.branchId}
                                    className={`btn btn-sm ${
                                        selectedBranch === b.branchId.toString()
                                            ? 'btn-primary'
                                            : 'btn-light border'
                                    }`}
                                    onClick={() => setSelectedBranch(b.branchId.toString())}
                                >
                                    {b.branchName}
                                </button>
                            ))
                        ) : (
                            <small className="text-muted">Đang tải branches...</small>
                        )}
                    </div>

                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-4 py-3">Phòng</th>
                                <th>Giá</th>
                                <th>Mô tả</th>
                                <th>Người</th>
                                <th>Tầng</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                        <span className="ms-2">Đang tải...</span>
                                    </td>
                                </tr>
                            ) : data?.content && data.content.length > 0 ? (
                                data.content.map((item) => (
                                    <tr key={item.roomId}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <FaBed className="fs-3 text-secondary me-2" />
                                                <span className="fw-bold">{item.roomName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(item.price)}
                                        </td>
                                        <td>
                                            <div
                                                className="text-muted small text-truncate"
                                                style={{ maxWidth: '150px' }}
                                                title={item.description}
                                            >
                                                {item.description || '-'}
                                            </div>
                                        </td>
                                        <td className="small">
                                            {item.currentPeople}/{item.maxPeople}
                                        </td>
                                        <td className="small">Tầng {item.floorNumber}</td>
                                        <td className="text-center">
                                            <span
                                                className={`badge rounded-pill ${
                                                    item.status === 'AVAILABLE'
                                                        ? 'bg-success-subtle text-success'
                                                        : 'bg-secondary-subtle text-secondary'
                                                }`}
                                            >
                                                {item.status === 'AVAILABLE' ? '✓ Có sẵn' : 'Không'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Link
                                                    to={`/admin/rooms/${item.roomId}/edit`}
                                                    className="btn btn-sm btn-light border-0"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit className="text-primary" />
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-light border-0"
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
                                                            // Call delete API
                                                        }
                                                    }}
                                                    title="Xóa"
                                                >
                                                    <FaTrash className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        Không tìm thấy phòng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
                    <small className="text-muted">
                        Tổng: <strong>{data?.totalElements || 0}</strong> phòng | Trang: <strong>{(currentPage + 1)}/{data?.totalPages || 1}</strong>
                    </small>
                    {data?.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};

export default RoomList;