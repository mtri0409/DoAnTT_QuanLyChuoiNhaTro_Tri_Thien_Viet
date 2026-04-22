import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaBed,
} from "react-icons/fa";
import apiRoom from "../../api/apiRoom";
import apiFloor from "../../api/apiFloor";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";

const RoomList = () => {
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
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");

  const [floors, setFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deletingRoom, setDeletingRoom] = useState(null);

  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [showEditFloorModal, setShowEditFloorModal] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState(null);
  const [newFloorData, setNewFloorData] = useState({
    floorNumber: "",
    branchId: "",
  });
  const [addingFloor, setAddingFloor] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await apiRoom.getAllRooms(
        currentPage,
        PAGE_SIZE,
        "roomName",
        "asc",
        selectedFloor || null,
        selectedBranch === "all" ? null : selectedBranch,
        search,
      );
      console.log("Fetch rooms response:", res.response);
      const roomData = res.data || res;
      setData(
        roomData || {
          content: [],
          pageNumber: 0,
          totalPages: 0,
          totalElements: 0,
        },
      );
    } catch (err) {
      console.error("Fetch rooms error:", err.response);
      setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const floorRes = await apiFloor.getAllFloors();
      const floorData = floorRes.data || floorRes;
      setFloors(Array.isArray(floorData) ? floorData : []);

      const branchRes = await apiBranches.getAllBranches(1, 100);
      const branchData = branchRes.data || branchRes;
      const branchList = branchData?.content || [];
      setBranches([{ branchId: "all", branchName: "Tất cả" }, ...branchList]);
    } catch (err) {
      console.error("Fetch filters error:", err);
      setBranches([{ branchId: "all", branchName: "Tất cả" }]);
      setFloors([]);
    }
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng "${roomName}"?`)) return;
    setDeletingRoom(roomId);
    try {
      await apiRoom.deleteRoom(roomId);
      fetchRooms();
      alert("Xóa phòng thành công!");
    } catch (err) {
      alert(
        "Lỗi khi xóa phòng: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setDeletingRoom(null);
    }
  };

  useEffect(() => {
    if (selectedBranch === "all") {
      setFilteredFloors(floors);
    } else {
      setFilteredFloors(
        floors.filter((f) => f.branchId === parseInt(selectedBranch)),
      );
      setSelectedFloor("");
    }
  }, [selectedBranch, floors]);

  const getFloorNumber = (floorId) => {
    if (!floorId || !Array.isArray(floors)) return "-";
    const floor = floors.find((f) => f.floorId === floorId);
    return floor ? floor.floorNumber : "-";
  };

  const handleAddFloor = async () => {
    if (!newFloorData.floorNumber || !newFloorData.branchId) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setAddingFloor(true);
    try {
      await apiFloor.createFloor({
        floorNumber: parseInt(newFloorData.floorNumber),
        branchId: parseInt(newFloorData.branchId),
      });
      fetchFilters();
      setShowAddFloorModal(false);
      setNewFloorData({ floorNumber: "", branchId: "" });
      alert("Thêm tầng thành công!");
    } catch (err) {
      alert("Lỗi khi thêm tầng: " + err.message);
    } finally {
      setAddingFloor(false);
    }
  };

  const handleEditFloor = async () => {
    if (!newFloorData.floorNumber) {
      alert("Vui lòng nhập số tầng!");
      return;
    }
    setAddingFloor(true);
    try {
      await apiFloor.updateFloor(editingFloorId, {
        floorNumber: parseInt(newFloorData.floorNumber),
        branchId: parseInt(newFloorData.branchId),
      });
      fetchFilters();
      setShowEditFloorModal(false);
      setEditingFloorId(null);
      setNewFloorData({ floorNumber: "", branchId: "" });
      alert("Cập nhật tầng thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật tầng: " + err.message);
    } finally {
      setAddingFloor(false);
    }
  };

  const handleDeleteFloor = async (floorId, floorNumber) => {
    if (!window.confirm(`Xóa tầng ${floorNumber}?`)) return;
    try {
      await apiFloor.deleteFloor(floorId);
      fetchFilters();
      alert("Xóa tầng thành công!");
    } catch (err) {
      alert("Lỗi khi xóa tầng: " + err.message);
    }
  };

  const openEditFloorModal = (floor) => {
    setEditingFloorId(floor.floorId);
    setNewFloorData({
      floorNumber: floor.floorNumber.toString(),
      branchId: floor.branchId.toString(),
    });
    setShowEditFloorModal(true);
  };

  useEffect(() => {
    fetchFilters();
  }, []);
  useEffect(() => {
    setCurrentPage(0);
  }, [search, selectedFloor, selectedBranch]);
  useEffect(() => {
    fetchRooms();
  }, [currentPage, search, selectedFloor, selectedBranch]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ PHÒNG</h4>
          <p className="text-muted small mb-0">Hệ thống quản lý phòng</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary shadow-sm"
            onClick={() => setShowAddFloorModal(true)}
          >
            <FaPlus /> Thêm tầng
          </button>
          <Link to="/rooms/create" className="btn btn-primary shadow-sm">
            <FaPlus /> Thêm phòng
          </Link>
        </div>
      </div>

      {/* MODAL THÊM TẦNG */}
      {showAddFloorModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Thêm tầng mới</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddFloorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    SỐ TẦNG <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: 1, 2, 3..."
                    value={newFloorData.floorNumber}
                    onChange={(e) =>
                      setNewFloorData({
                        ...newFloorData,
                        floorNumber: e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    CHI NHÁNH <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select bg-light border-0 py-2"
                    value={newFloorData.branchId}
                    onChange={(e) =>
                      setNewFloorData({
                        ...newFloorData,
                        branchId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {Array.isArray(branches) &&
                      branches
                        .filter((b) => b.branchId !== "all")
                        .map((b) => (
                          <option key={b.branchId} value={b.branchId}>
                            {b.branchName}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowAddFloorModal(false)}
                  disabled={addingFloor}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddFloor}
                  disabled={addingFloor}
                >
                  {addingFloor ? "..." : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA TẦNG */}
      {showEditFloorModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Sửa tầng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditFloorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    SỐ TẦNG <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: 1, 2, 3..."
                    value={newFloorData.floorNumber}
                    onChange={(e) =>
                      setNewFloorData({
                        ...newFloorData,
                        floorNumber: e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    CHI NHÁNH
                  </label>
                  <select
                    className="form-select bg-light border-0 py-2"
                    value={newFloorData.branchId}
                    disabled
                  >
                    {Array.isArray(branches) &&
                      branches
                        .filter((b) => b.branchId !== "all")
                        .map((b) => (
                          <option key={b.branchId} value={b.branchId}>
                            {b.branchName}
                          </option>
                        ))}
                  </select>
                  <small className="text-muted d-block mt-2">
                    Chi nhánh không thể thay đổi
                  </small>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowEditFloorModal(false)}
                  disabled={addingFloor}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditFloor}
                  disabled={addingFloor}
                >
                  {addingFloor ? "..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="input-group" style={{ maxWidth: "250px" }}>
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm tên phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select bg-light border-0 small"
              style={{ maxWidth: "200px" }}
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="">Tất cả tầng</option>
              {Array.isArray(filteredFloors) &&
                filteredFloors.map((f) => (
                  <option key={f.floorId} value={f.floorId}>
                    Tầng {f.floorNumber}
                  </option>
                ))}
            </select>
          </div>

          <div className="d-flex gap-2 mb-2 flex-wrap">
            {Array.isArray(branches) && branches.length > 0 ? (
              branches.map((b) => (
                <div key={b.branchId} className="position-relative">
                  <button
                    className={`btn btn-sm ${selectedBranch === b.branchId.toString() ? "btn-primary" : "btn-light border"}`}
                    onClick={() => setSelectedBranch(b.branchId.toString())}
                  >
                    {b.branchName}
                  </button>
                  {selectedBranch === b.branchId.toString() &&
                    b.branchId !== "all" && (
                      <div className="d-flex gap-1 ms-2">
                        {filteredFloors.map((floor) => (
                          <div
                            key={floor.floorId}
                            className="d-flex align-items-center gap-1 small"
                          >
                            <span className="text-muted">
                              Tầng {floor.floorNumber}
                            </span>
                            <button
                              className="btn btn-sm btn-link text-primary p-0"
                              onClick={() => openEditFloorModal(floor)}
                              title="Sửa"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() =>
                                handleDeleteFloor(
                                  floor.floorId,
                                  floor.floorNumber,
                                )
                              }
                              title="Xóa"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
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
                <th>Tiền cọc</th>
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
                  <td colSpan="8" className="text-center py-5">
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    />
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
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}
                    </td>
                    <td>
                      {item.depositAmount ? (
                        <span className="badge bg-warning-subtle text-warning fw-semibold">
                          💰{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.depositAmount)}
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      <div
                        className="text-muted small text-truncate"
                        style={{ maxWidth: "150px" }}
                        title={item.description}
                      >
                        {item.description || "-"}
                      </div>
                    </td>
                    <td className="small">
                      {item.currentPeople}/{item.maxPeople}
                    </td>
                    <td className="small">
                      Tầng {getFloorNumber(item.floorId)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge rounded-pill ${
                          item.Status?.toUpperCase() === "AVAILABLE" ||
                          item.status?.toUpperCase() === "AVAILABLE"
                            ? "bg-success-subtle text-success"
                            : item.Status?.toUpperCase() === "OCCUPIED" ||
                                item.status?.toUpperCase() === "OCCUPIED"
                              ? "bg-warning-subtle text-warning"
                              : "bg-secondary-subtle text-secondary"
                        }`}
                      >
                        {item.Status?.toUpperCase() === "AVAILABLE" ||
                        item.status?.toUpperCase() === "AVAILABLE"
                          ? "✓ Có sẵn"
                          : item.Status?.toUpperCase() === "OCCUPIED" ||
                              item.status?.toUpperCase() === "OCCUPIED"
                            ? "📌 Đã cho thuê"
                            : item.Status || item.status || "Chưa xác định"}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          to={`/rooms/${item.roomId}/detail`}
                          className="btn btn-sm btn-light border-0"
                          title="Xem chi tiết"
                        >
                          <FaEye className="text-primary" />
                        </Link>
                        <Link
                          to={`/rooms/${item.roomId}/update`}
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-primary" />
                        </Link>
                        <button
                          className="btn btn-sm btn-light border-0"
                          onClick={() =>
                            handleDeleteRoom(item.roomId, item.roomName)
                          }
                          disabled={deletingRoom === item.roomId}
                          title="Xóa"
                        >
                          {deletingRoom === item.roomId ? (
                            <span className="spinner-border spinner-border-sm text-danger" />
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
                  <td colSpan="8" className="text-center py-5 text-muted">
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
            Tổng: <strong>{data?.totalElements || 0}</strong> phòng | Trang:{" "}
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

export default RoomList;
