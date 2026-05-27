import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaBed,
  FaFileSignature,
  FaBuilding,
  FaLayerGroup,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaFilter,
} from "react-icons/fa";
import apiRoom from "../../api/apiRoom";
import apiFloor from "../../api/apiFloor";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";

const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
);

const css = `
  .rl-root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f4f6fb; min-height: 100vh; }
  .rl-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
  .rl-btn { display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;
    font-family:inherit;font-weight:600;font-size:13px;padding:8px 16px;cursor:pointer;transition:.15s; }
  .rl-btn-primary { background:#4361ee;color:#fff; }
  .rl-btn-primary:hover { background:#3451d1; }
  .rl-btn-outline { background:transparent;color:#4361ee;border:1.5px solid #c7d0f8; }
  .rl-btn-outline:hover { background:#eef0fd; }
  .rl-btn-ghost { background:transparent;color:#64748b;border:1.5px solid #e2e8f0; }
  .rl-btn-ghost:hover { background:#f8fafc; }
  .rl-btn-danger-ghost { background:transparent;color:#ef4444;border:none;padding:4px 7px;border-radius:7px; }
  .rl-btn-danger-ghost:hover { background:#fee2e2; }
  .rl-btn-icon { padding:7px;border-radius:9px;font-size:14px; }
  .rl-tag { display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;
    font-size:12px;font-weight:600; }
  .rl-tag-available { background:#dcfce7;color:#16a34a; }
  .rl-tag-occupied  { background:#fef9c3;color:#b45309; }
  .rl-tag-maintenance { background:#fee2e2;color:#dc2626; }
  .rl-tag-deposit { background:#ede9fe;color:#7c3aed; }
  .rl-tag-shared { background:#dbeafe;color:#2563eb; }
  .rl-tag-other { background:#f1f5f9;color:#64748b; }
  .rl-input { background:#f4f6fb;border:1.5px solid transparent;border-radius:10px;
    font-family:inherit;font-size:13px;padding:8px 12px;outline:none;transition:.15s; }
  .rl-input:focus { border-color:#4361ee;background:#fff; }
  .rl-table th { font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
    color:#94a3b8;padding:12px 16px;background:#f8fafc;border-bottom:1px solid #f1f5f9; }
  .rl-table td { padding:14px 16px;border-bottom:1px solid #f8fafc;font-size:13.5px;vertical-align:middle; }
  .rl-table tr:hover td { background:#fafbff; }
  .rl-table tr:last-child td { border-bottom:none; }
  .branch-pill { cursor:pointer;padding:6px 14px;border-radius:20px;font-size:12.5px;
    font-weight:600;border:1.5px solid transparent;transition:.15s; }
  .branch-pill.active { background:#4361ee;color:#fff;border-color:#4361ee; }
  .branch-pill.inactive { background:#f1f5f9;color:#475569;border-color:#e2e8f0; }
  .branch-pill.inactive:hover { border-color:#c7d0f8;color:#4361ee; }
  .floor-chip { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;
    font-size:12px;font-weight:600;cursor:pointer;transition:.15s;background:#eef0fd;color:#4361ee;
    border:1.5px solid transparent; }
  .floor-chip.active { background:#4361ee;color:#fff; }
  .floor-chip:hover { border-color:#a5b4fc; }
  .floor-panel { background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:10px; }
  .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;
    display:flex;align-items:center;justify-content:center; }
  .rl-modal { background:#fff;border-radius:20px;width:420px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.15); }
  .rl-modal h2 { font-size:17px;font-weight:700;margin:0 0 20px; }
  .rl-label { font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
    color:#64748b;display:block;margin-bottom:6px; }
  .rl-select { width:100%;background:#f4f6fb;border:1.5px solid transparent;border-radius:10px;
    font-family:inherit;font-size:13px;padding:9px 12px;outline:none;transition:.15s;cursor:pointer; }
  .rl-select:focus { border-color:#4361ee;background:#fff; }
  .rl-filter-box { display:flex;align-items:flex-end;gap:10px;margin-left:auto;flex-wrap:wrap; }
  .rl-filter-item { display:flex;flex-direction:column;gap:5px; }
  .rl-filter-title { font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a3b8; }
  .people-filter { display:flex;align-items:center;background:#f4f6fb;border-radius:10px;border:1.5px solid transparent;overflow:hidden;transition:.15s;height:36px; }
  .people-filter:focus-within { border-color:#4361ee;background:#fff; }
  .people-btn { width:32px;height:34px;border:none;background:transparent;color:#4361ee;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit; }
  .people-btn:hover { background:#eef0fd; }
  .people-input { width:54px;height:34px;border:none;background:transparent;text-align:center;outline:none;font-family:inherit;font-size:13px;font-weight:700;color:#0f172a; }
  .people-input::-webkit-inner-spin-button,
  .people-input::-webkit-outer-spin-button { -webkit-appearance:none;margin:0; }
  .action-icon { background:transparent;border:none;padding:6px 8px;border-radius:8px;cursor:pointer;transition:.15s; }
  .action-icon:hover.view  { background:#eff6ff; }
  .action-icon:hover.edit  { background:#f0fdf4; }
  .action-icon:hover.sign  { background:#faf5ff; }
  .action-icon:hover.del   { background:#fef2f2; }
  .money { font-weight:600;color:#1e293b; }
  .deposit-badge { background:#fef9c3;color:#92400e;padding:3px 8px;border-radius:6px;
    font-size:12px;font-weight:600; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .rl-row-in { animation:fadeIn .2s ease; }
  .empty-state { text-align:center;padding:56px 0;color:#94a3b8; }
  .empty-icon { font-size:40px;margin-bottom:12px;opacity:.3; }
`;

/* ─── Add/Edit Floor Modal ──────────────────────────────────── */
const FloorModal = ({
  mode,
  floorData,
  branches,
  onConfirm,
  onClose,
  loading,
}) => {
  const [data, setData] = useState(floorData);
  const isEdit = mode === "edit";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rl-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "✏️ Sửa tầng" : "➕ Thêm tầng mới"}</h2>
        <div style={{ marginBottom: 16 }}>
          <label className="rl-label">
            Số tầng <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            className="rl-input"
            style={{ width: "100%", boxSizing: "border-box" }}
            type="number"
            min="0"
            placeholder="VD: 1, 2, 3…"
            value={data.floorNumber}
            onChange={(e) => setData({ ...data, floorNumber: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="rl-label">
            Chi nhánh <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            className="rl-select"
            value={data.branchId}
            disabled={isEdit}
            onChange={(e) => setData({ ...data, branchId: e.target.value })}
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName}
              </option>
            ))}
          </select>
          {isEdit && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>
              Chi nhánh không thể thay đổi
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            className="rl-btn rl-btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="rl-btn rl-btn-primary"
            onClick={() => onConfirm(data)}
            disabled={loading}
          >
            {loading ? "⏳" : isEdit ? "Cập nhật" : "Thêm tầng"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const RoomList = () => {
  const navigate = useNavigate();
  const PAGE_SIZE = 8;

  const STATUS_OPTIONS = [
    { value: "AVAILABLE", label: "Có sẵn" },
    { value: "OCCUPIED", label: "Đã thuê" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "DEPOSITED", label: "Đã đặt cọc" },
    { value: "SHARED", label: "Ở ghép" },
  ];

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
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [maxPeopleFilter, setMaxPeopleFilter] = useState("");

  const [floors, setFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deletingRoom, setDeletingRoom] = useState(null);

  /* floor panel visibility */
  const [showFloorPanel, setShowFloorPanel] = useState(false);

  /* floor modal */
  const [floorModal, setFloorModal] = useState(null); // { mode:'add'|'edit', data:{} }
  const [savingFloor, setSavingFloor] = useState(false);

  /* ── API calls ── */
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
        selectedStatus === "all" ? null : selectedStatus,
        maxPeopleFilter || null,
      );

      const d = res.data || res;
      setData(
        d || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 },
      );
    } catch {
      setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [floorRes, branchRes] = await Promise.all([
        apiFloor.getAllFloors(),
        apiBranches.getAllBranches(1, 100),
      ]);
      setFloors(
        Array.isArray(floorRes.data || floorRes)
          ? floorRes.data || floorRes
          : [],
      );
      const bl = (branchRes.data || branchRes)?.content || [];
      setBranches(bl);
    } catch {
      setBranches([]);
      setFloors([]);
    }
  };

  const getStatus = (r) => (r.Status || r.status || "").toUpperCase();
  const isAvailable = (r) => getStatus(r) === "AVAILABLE";

  const getStatusLabel = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "AVAILABLE") return "Có sẵn";
    if (s === "OCCUPIED") return "Đã thuê";
    if (s === "MAINTENANCE") return "Bảo trì";
    if (s === "DEPOSIT" || s === "DEPOSITED") return "Đã đặt cọc";
    if (s === "SHARED") return "Ở ghép";
    return s || "N/A";
  };

  const getStatusClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "AVAILABLE") return "rl-tag-available";
    if (s === "OCCUPIED") return "rl-tag-occupied";
    if (s === "MAINTENANCE") return "rl-tag-maintenance";
    if (s === "DEPOSIT" || s === "DEPOSITED") return "rl-tag-deposit";
    if (s === "SHARED") return "rl-tag-shared";
    return "rl-tag-other";
  };

  const handleMaxPeopleChange = (value) => {
    const onlyNumber = value.replace(/[^\d]/g, "");
    setMaxPeopleFilter(onlyNumber);
  };

  const decreaseMaxPeople = () => {
    if (maxPeopleFilter === "") return;
    const next = Math.max(1, Number(maxPeopleFilter) - 1);
    setMaxPeopleFilter(String(next));
  };

  const increaseMaxPeople = () => {
    const next = Number(maxPeopleFilter || 0) + 1;
    setMaxPeopleFilter(String(next));
  };

  const handleDeleteRoom = async (roomId, roomName) => {
    if (!window.confirm(`Xóa phòng "${roomName}"?`)) return;
    setDeletingRoom(roomId);

    try {
      await apiRoom.deleteRoom(roomId);
      fetchRooms();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setDeletingRoom(null);
    }
  };

  /* floor crud */
  const handleSaveFloor = async (d) => {
    if (!d.floorNumber || (!d.branchId && floorModal.mode === "add")) {
      alert("Điền đầy đủ!");
      return;
    }
    setSavingFloor(true);
    try {
      if (floorModal.mode === "add") {
        await apiFloor.createFloor({
          floorNumber: +d.floorNumber,
          branchId: +d.branchId,
        });
      } else {
        await apiFloor.updateFloor(floorModal.data.floorId, {
          floorNumber: +d.floorNumber,
          branchId: +d.branchId,
        });
      }
      await fetchFilters();
      setFloorModal(null);
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setSavingFloor(false);
    }
  };

  const handleDeleteFloor = async (floor) => {
    if (!window.confirm(`Xóa tầng ${floor.floorNumber}?`)) return;
    try {
      await apiFloor.deleteFloor(floor.floorId);
      await fetchFilters();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  /* effects */
  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (selectedBranch === "all") setFilteredFloors(floors);
    else {
      setFilteredFloors(
        floors.filter((f) => f.branchId === parseInt(selectedBranch)),
      );
      setSelectedFloor("");
    }
  }, [selectedBranch, floors]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, selectedFloor, selectedBranch, selectedStatus, maxPeopleFilter]);

  useEffect(() => {
    fetchRooms();
  }, [
    currentPage,
    search,
    selectedFloor,
    selectedBranch,
    selectedStatus,
    maxPeopleFilter,
  ]);

  const getFloorLabel = (id) => {
    if (!id || !floors.length) return "—";
    const f = floors.find((f) => f.floorId === id);
    return f ? `Tầng ${f.floorNumber}` : "—";
  };

  const branchName = (id) => {
    const b = branches.find((b) => String(b.branchId) === String(id));
    return b?.branchName || "";
  };

  /* navigate to create contract with room pre-filled */
  const handleCreateContract = (room) => {
    const branch = branches.find((b) => {
      const fl = floors.find((f) => f.floorId === room.floorId);
      return fl && String(b.branchId) === String(fl.branchId);
    });
    navigate("/contracts/create", { state: { room, branch } });
  };

  /* ── Render ── */
  return (
    <>
      <style>{css}</style>
      <FontLink />

      {floorModal && (
        <FloorModal
          mode={floorModal.mode}
          floorData={floorModal.data}
          branches={branches}
          onConfirm={handleSaveFloor}
          onClose={() => setFloorModal(null)}
          loading={savingFloor}
        />
      )}

      <div className="rl-root" style={{ padding: "28px 24px" }}>
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "#4361ee",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaBed color="#fff" size={17} />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-.02em",
                }}
              >
                Quản lý phòng
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
              Danh sách toàn bộ phòng trong hệ thống
            </p>
          </div>
          <Link
            to="/rooms/create"
            className="rl-btn rl-btn-primary"
            style={{ textDecoration: "none" }}
          >
            <FaPlus size={12} /> Thêm phòng
          </Link>
        </div>

        {/* ── Filter card ── */}
        <div className="rl-card" style={{ padding: 20, marginBottom: 16 }}>
          {/* Row 1: Search + status + maxPeople */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {/* Search */}
            <div
              style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}
            >
              <FaSearch
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              />
              <input
                className="rl-input"
                style={{
                  paddingLeft: 34,
                  width: "100%",
                  boxSizing: "border-box",
                }}
                placeholder="Tìm tên phòng…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Right filters */}
            <div className="rl-filter-box">
              <div className="rl-filter-item">
                <span className="rl-filter-title">Trạng thái</span>
                <select
                  className="rl-select"
                  style={{ width: 150, height: 36, padding: "7px 10px" }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rl-filter-item">
                <span className="rl-filter-title">Số người tối đa</span>
                <div className="people-filter">
                  <button
                    type="button"
                    className="people-btn"
                    onClick={decreaseMaxPeople}
                  >
                    -
                  </button>
                  <input
                    className="people-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Tất cả"
                    value={maxPeopleFilter}
                    onChange={(e) => handleMaxPeopleChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="people-btn"
                    onClick={increaseMaxPeople}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Branch pills */}
          <div
            style={{
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: selectedBranch !== "all" ? 14 : 0,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 600,
                marginRight: 2,
              }}
            >
              Chi nhánh:
            </span>
            <button
              className={`branch-pill ${selectedBranch === "all" ? "active" : "inactive"}`}
              onClick={() => {
                setSelectedBranch("all");
                setShowFloorPanel(false);
              }}
            >
              Tất cả
            </button>
            {branches.map((b) => (
              <button
                key={b.branchId}
                className={`branch-pill ${String(selectedBranch) === String(b.branchId) ? "active" : "inactive"}`}
                onClick={() => {
                  const id = String(b.branchId);
                  setSelectedBranch(id);
                  setShowFloorPanel(
                    String(selectedBranch) !== id ? true : !showFloorPanel,
                  );
                }}
              >
                <FaBuilding size={10} /> {b.branchName}
              </button>
            ))}
          </div>

          {/* Row 3: Floor chips (only when branch selected) */}
          {selectedBranch !== "all" && (
            <div
              style={{
                display: "flex",
                gap: 7,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                Tầng:
              </span>
              <button
                className={`floor-chip ${selectedFloor === "" ? "active" : ""}`}
                onClick={() => setSelectedFloor("")}
              >
                Tất cả
              </button>
              {filteredFloors.map((f) => (
                <button
                  key={f.floorId}
                  className={`floor-chip ${String(selectedFloor) === String(f.floorId) ? "active" : ""}`}
                  onClick={() =>
                    setSelectedFloor(
                      String(f.floorId) === String(selectedFloor)
                        ? ""
                        : String(f.floorId),
                    )
                  }
                >
                  T.{f.floorNumber}
                </button>
              ))}

              {/* Toggle floor management */}
              <button
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "#4361ee",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onClick={() => setShowFloorPanel((v) => !v)}
              >
                <FaLayerGroup size={12} />
                Quản lý tầng
                {showFloorPanel ? (
                  <FaChevronDown size={10} />
                ) : (
                  <FaChevronRight size={10} />
                )}
              </button>
            </div>
          )}

          {/* Floor management panel */}
          {selectedBranch !== "all" && showFloorPanel && (
            <div className="floor-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}
                >
                  Tầng — {branchName(selectedBranch)}
                </span>
                <button
                  className="rl-btn rl-btn-primary"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() =>
                    setFloorModal({
                      mode: "add",
                      data: { floorNumber: "", branchId: selectedBranch },
                    })
                  }
                >
                  <FaPlus size={10} /> Thêm tầng
                </button>
              </div>

              {filteredFloors.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  Chưa có tầng nào trong chi nhánh này
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {filteredFloors.map((floor) => (
                    <div
                      key={floor.floorId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff",
                        borderRadius: 10,
                        padding: "8px 14px",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        Tầng {floor.floorNumber}
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 7px",
                            borderRadius: 7,
                            color: "#4361ee",
                            fontSize: 12,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#eef0fd")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                          onClick={() =>
                            setFloorModal({
                              mode: "edit",
                              data: { ...floor, branchId: floor.branchId },
                            })
                          }
                          title="Sửa tầng"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 7px",
                            borderRadius: 7,
                            color: "#ef4444",
                            fontSize: 12,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fee2e2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                          onClick={() => handleDeleteFloor(floor)}
                          title="Xóa tầng"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Table card ── */}
        <div className="rl-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              className="rl-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tầng</th>
                  <th>Giá thuê</th>
                  <th>Tiền cọc</th>
                  <th>Người thuê</th>
                  <th>Mô tả</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
                  <th style={{ textAlign: "right", paddingRight: 20 }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "56px 0",
                        color: "#94a3b8",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: 28,
                          height: 28,
                          border: "3px solid #e2e8f0",
                          borderTopColor: "#4361ee",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </td>
                  </tr>
                ) : data.content?.length > 0 ? (
                  data.content.map((item) => {
                    const available = isAvailable(item);
                    const status = getStatus(item);

                    return (
                      <tr key={item.roomId} className="rl-row-in">
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: available ? "#dcfce7" : "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FaBed
                                color={available ? "#16a34a" : "#94a3b8"}
                                size={15}
                              />
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: 14,
                              }}
                            >
                              {item.roomName}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {getFloorLabel(item.floorId)}
                        </td>
                        <td>
                          <span className="money">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price)}
                          </span>
                        </td>
                        <td>
                          {item.depositAmount ? (
                            <span className="deposit-badge">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.depositAmount)}
                            </span>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          >
                            {item.currentPeople}
                            <span style={{ color: "#cbd5e1", fontWeight: 400 }}>
                              /{item.maxPeople}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 12.5,
                              color: "#94a3b8",
                              display: "block",
                              maxWidth: 140,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={item.description}
                          >
                            {item.description || "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`rl-tag ${getStatusClass(status)}`}>
                            {available ? (
                              <>
                                <FaCheck size={9} /> {getStatusLabel(status)}
                              </>
                            ) : (
                              getStatusLabel(status)
                            )}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", paddingRight: 20 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 4,
                            }}
                          >
                            {available && (
                              <button
                                className="action-icon sign"
                                title="Tạo hợp đồng"
                                style={{ color: "#7c3aed" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f5f3ff")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                                onClick={() => handleCreateContract(item)}
                              >
                                <FaFileSignature size={14} />
                              </button>
                            )}
                            <Link
                              to={`/rooms/${item.roomId}/detail`}
                              className="action-icon view"
                              title="Xem chi tiết"
                              style={{
                                color: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#eff6ff")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <FaEye size={14} />
                            </Link>
                            <Link
                              to={`/rooms/${item.roomId}/update`}
                              className="action-icon edit"
                              title="Chỉnh sửa"
                              style={{
                                color: "#16a34a",
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f0fdf4")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <FaEdit size={14} />
                            </Link>
                            <button
                              className="action-icon del"
                              title="Xóa"
                              style={{ color: "#ef4444" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#fef2f2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                              disabled={deletingRoom === item.roomId}
                              onClick={() =>
                                handleDeleteRoom(item.roomId, item.roomName)
                              }
                            >
                              {deletingRoom === item.roomId ? (
                                <span
                                  style={{
                                    width: 14,
                                    height: 14,
                                    border: "2px solid #fca5a5",
                                    borderTopColor: "#ef4444",
                                    borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "spin .6s linear infinite",
                                  }}
                                />
                              ) : (
                                <FaTrash size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <div className="empty-icon">🛏️</div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "#475569",
                            marginBottom: 4,
                          }}
                        >
                          Không có phòng nào
                        </p>
                        <p style={{ fontSize: 13, color: "#94a3b8" }}>
                          Thay đổi bộ lọc hoặc thêm phòng mới
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
              Tổng{" "}
              <strong style={{ color: "#0f172a" }}>
                {data.totalElements || 0}
              </strong>{" "}
              phòng
              {" · "}Trang{" "}
              <strong style={{ color: "#0f172a" }}>{currentPage + 1}</strong>/
              {data.totalPages || 1}
            </span>
            {data.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomList;