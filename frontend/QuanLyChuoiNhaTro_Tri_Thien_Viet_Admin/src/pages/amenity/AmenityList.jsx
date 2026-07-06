import React, { useState, useEffect } from "react";
import { FaToolbox, FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import apiAmenity from "../../api/apiAmenity";
import Pagination from "../../components/Pagination";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";

const AmenityList = () => {
  const PAGE_SIZE = 5;

  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [deletingAmenity, setDeletingAmenity] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmenityData, setNewAmenityData] = useState({
    amenityName: "",
    icon: "",
  });
  const [addingAmenity, setAddingAmenity] = useState(false);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const res = await apiAmenity.getAllAmenities(
        currentPage,
        PAGE_SIZE,
        "amenityName",
        "asc",
      );
      const amenityData = res.data || res;
      setData(
        amenityData || {
          content: [],
          pageNumber: 0,
          totalPages: 0,
          totalElements: 0,
        },
      );
    } catch (err) {
      console.error("Fetch amenities error:", err);
      setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async () => {
    if (!newAmenityData.amenityName.trim()) {
      toast.warning("Vui lòng nhập tên tiện ích!");
      return;
    }
    setAddingAmenity(true);
    try {
      const res = await apiAmenity.createAmenity(newAmenityData);
      fetchAmenities();
      setShowAddModal(false);
      setNewAmenityData({ amenityName: "", icon: "" });
      toast.success("Thêm tiện ích thành công!");
    } catch (err) {
      console.error("❌ Create amenity error:", err);
      toast.error("Lỗi khi thêm tiện ích: " + err.message);
    } finally {
      setAddingAmenity(false);
    }
  };

  // Handle xóa tiện ích
  const handleDeleteAmenity = async (amenityId, amenityName) => {
    const result = await confirmAction({
      title: "Khôi phục hồ sơ",
      text: `Bạn có chắc xóa tiện ích ${amenityName} không ?:`,
      icon: "info",
    });
    if (!result.isConfirmed) return;
    setDeletingAmenity(amenityId);
    try {
      const res = await apiAmenity.deleteAmenity(amenityId);
      console.log(" Amenity deleted:", res);

      fetchAmenities();
      alert("Xóa tiện ích thành công!");
    } catch (err) {
      console.error(" Delete amenity error:", err);
      alert(
        "Lỗi khi xóa tiện ích: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setDeletingAmenity(null);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [currentPage]);

  // Reset page khi search thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  // Fetch lại khi currentPage thay đổi
  useEffect(() => {
    fetchAmenities();
  }, [currentPage, search]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ TIỆN ÍCH</h4>
          <p className="text-muted small mb-0">
            Hệ thống quản lý tiện ích phòng
          </p>
        </div>
        <Link to="/amenities/create" className="btn btn-primary shadow-sm">
          <FaPlus /> Thêm mới
        </Link>
      </div>

      {/* MODAL THÊM TIỆN ÍCH */}
      {showAddModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Thêm tiện ích mới</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    TÊN TIỆN ÍCH <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: WiFi, TV, Điều hòa..."
                    value={newAmenityData.amenityName}
                    onChange={(e) =>
                      setNewAmenityData({
                        ...newAmenityData,
                        amenityName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    ICON (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: wifi, tv, wind..."
                    value={newAmenityData.icon}
                    onChange={(e) =>
                      setNewAmenityData({
                        ...newAmenityData,
                        icon: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingAmenity}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddAmenity}
                  disabled={addingAmenity}
                >
                  {addingAmenity ? "..." : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group" style={{ maxWidth: "250px" }}>
            <span className="input-group-text bg-light border-0">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Tìm kiếm..."
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
                <th className="ps-4 py-3">Tiện ích</th>
                <th>Icon</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <span className="ms-2">Đang tải...</span>
                  </td>
                </tr>
              ) : data?.content && data.content.length > 0 ? (
                data.content.map((item) => (
                  <tr key={item.amenityId}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <FaToolbox className="fs-3 text-secondary me-2" />
                        <span className="fw-bold">{item.amenityName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted small">
                        {item.icon || "-"}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          to={`/amenities/${item.amenityId}/update`}
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-primary" />
                        </Link>
                        <button
                          className="btn btn-sm btn-light border-0"
                          onClick={() =>
                            handleDeleteAmenity(
                              item.amenityId,
                              item.amenityName,
                            )
                          }
                          disabled={deletingAmenity === item.amenityId}
                          title="Xóa"
                        >
                          {deletingAmenity === item.amenityId ? (
                            <span className="spinner-border spinner-border-sm text-danger">
                              <span className="visually-hidden">
                                Đang xóa...
                              </span>
                            </span>
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
                  <td colSpan="3" className="text-center py-5 text-muted">
                    Không tìm thấy tiện ích nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0 flex-wrap gap-2">
          <small className="text-muted">
            Tổng: <strong>{data?.totalElements || 0}</strong> tiện ích | Trang:{" "}
            <strong>
              {currentPage + 1}/{data?.totalPages || 1}
            </strong>
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

export default AmenityList;
