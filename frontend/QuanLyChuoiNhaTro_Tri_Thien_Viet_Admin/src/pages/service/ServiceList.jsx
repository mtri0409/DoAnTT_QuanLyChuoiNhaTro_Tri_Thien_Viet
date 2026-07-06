import React, { useState, useEffect } from 'react';
import { FaToolbox, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import apiServices from '../../api/apiService';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ServiceList = () => {
    const PAGE_SIZE = 6;

    const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [deletingService, setDeletingService] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await apiServices.getAllServices(
                currentPage,
                PAGE_SIZE,
                'serviceName',
                'asc'
            );

            const serviceData = res.data || res;
            setData(serviceData || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });

        } catch (err) {
            console.error(' Fetch services error:', err);
            setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) return;

        setDeletingService(id);
        try {
            await apiServices.deleteService(id);
            fetchServices();
            toast.success('Xóa dịch vụ thành công!');
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
        } finally {
            setDeletingService(null);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search]);

    useEffect(() => {
        fetchServices();
    }, [currentPage, search]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderStatus = (value) => {
        return value === 1 || value === true
            ? <span className="badge bg-success">Active</span>
            : <span className="badge bg-secondary">Inactive</span>;
    };

    return (
        <div className="container-fluid py-4">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">QUẢN LÝ DỊCH VỤ</h4>
                    <p className="text-muted small mb-0">Hệ thống quản lý dịch vụ</p>
                </div>
                <Link to="/services/create" className="btn btn-primary shadow-sm">
                    <FaPlus /> Thêm mới
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-3">

                {/* TOOLBAR */}
                <div className="card-header bg-white py-3 border-0">
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
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-4 py-3">Service Name</th>
                                <th>Service Type</th>
                                <th>Unit</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                        <span className="ms-2">Đang tải...</span>
                                    </td>
                                </tr>
                            ) : data?.content && data.content.length > 0 ? (
                                data.content.map((item) => (
                                    <tr key={item.serviceId}>
                                        <td className="ps-4 fw-bold">
                                            <FaToolbox className="me-2 text-secondary" />
                                            {item.serviceName}
                                        </td>
                                        <td>{item.serviceType}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.price}</td>
                                        <td>{renderStatus(item.is_active)}</td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-1">
                                                <Link
                                                    to={`/services/${item.serviceId}/update`}
                                                    className="btn btn-sm btn-light border-0"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit className="text-primary" />
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-light border-0"
                                                    onClick={() => handleDeleteService(item.serviceId, item.serviceName)}
                                                    disabled={deletingService === item.serviceId}
                                                >
                                                    {deletingService === item.serviceId ? (
                                                        <span className="spinner-border spinner-border-sm text-danger"></span>
                                                    ) : (
                                                        <FaTrash className="text-danger" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Không có dịch vụ nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
                    <small className="text-muted">
                        Tổng: <strong>{data?.totalElements || 0} Dịch vụ</strong> | Trang: <strong>{(currentPage + 1)}/{data?.totalPages || 1}</strong>
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

export default ServiceList;