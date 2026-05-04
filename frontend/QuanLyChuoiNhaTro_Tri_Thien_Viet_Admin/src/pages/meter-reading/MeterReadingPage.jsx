import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaTint,
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaCheck,
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaChevronRight,
  FaInfoCircle,
  FaCalculator,
  FaFileInvoiceDollar,
  FaPlus,
  FaExpand,
} from "react-icons/fa";
import apiBranches from "../../api/apiBranches";
import apiFloor from "../../api/apiFloor";
import apiRoom from "../../api/apiRoom";
import apiMeterReading from "../../api/apiMeterReading";
import apiInvoice from "../../api/apiInvoice";
import apiContract from "../../api/apiContract";
import Lightbox from "../../components/Lightbox";
import CreateInvoice from "../../components/CreateInvoice";
import ImageCapture from "../../components/WaterImageCapture"; // ← Import ImageCapture

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const SERVICES = [
  { id: 1, label: "Điện", icon: <FaBolt />, color: "#f59e0b", bg: "#fef3c7", unit: "kWh" },
  { id: 2, label: "Nước", icon: <FaTint />, color: "#3b82f6", bg: "#dbeafe", unit: "m³" },
];

export default function MeterReadingPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);

  const [readings, setReadings] = useState({});
  const [contracts, setContracts] = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // Load branches
  useEffect(() => {
    apiBranches.getAllBranches(1, 100).then((res) => setBranches(res.content || res || [])).catch(() => setBranches([]));
  }, []);

  // Load floors
  useEffect(() => {
    if (!selectedBranch) {
      setFloors([]);
      setSelectedFloor("");
      return;
    }
    apiFloor.getAllFloors()
      .then((res) => {
        const all = Array.isArray(res) ? res : res.content || [];
        setFloors(all.filter((f) => String(f.branchId) === String(selectedBranch)));
      })
      .catch(() => setFloors([]));
    setSelectedFloor("");
    setRooms([]);
    setReadings({});
    setContracts({});
    setExpandedRooms({});
  }, [selectedBranch]);

  // Load rooms
  useEffect(() => {
    if (!selectedBranch) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    apiRoom.getAllRooms(0, 100, "roomName", "asc", selectedFloor || null, selectedBranch || null, searchRoom)
      .then((res) => setRooms(res.content || []))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom]);

  // Reset khi đổi tháng/năm
  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
  }, [month, year]);

  // Load dữ liệu phòng
  const loadRoomData = useCallback(async (roomId) => {
    const initReadings = {};
    SERVICES.forEach((svc) => {
      initReadings[svc.id] = {
        newValue: "",
        oldValue: 0,
        image: null,
        imagePreview: null,
        status: "idle",
        savedValue: null,
      };
    });

    const [currentPeriod, contractRes] = await Promise.allSettled([
      apiMeterReading.getByRoomAndPeriod(roomId, month, year),
      apiContract.getContractsByRoom(roomId),
    ]);

    if (currentPeriod.status === "fulfilled") {
      const existing = Array.isArray(currentPeriod.value) ? currentPeriod.value : [];
      existing.forEach((r) => {
        const sid = Number(r.serviceId);
        if (initReadings[sid]) {
          initReadings[sid] = {
            newValue: String(r.newValue ?? ""),
            oldValue: r.oldValue ?? 0,
            savedValue: r.newValue,
            status: "saved",
            image: null,
            imagePreview: null,
          };
        }
      });
    }

    await Promise.allSettled(
      SERVICES.filter((svc) => initReadings[svc.id].status !== "saved").map(async (svc) => {
        try {
          const prev = await apiMeterReading.getPrevious(roomId, svc.id, month, year);
          if (prev) initReadings[svc.id].oldValue = prev.newValue ?? 0;
        } catch {}
      })
    );

    setReadings((prev) => ({ ...prev, [roomId]: initReadings }));

    if (contractRes.status === "fulfilled") {
      const list = Array.isArray(contractRes.value) ? contractRes.value : contractRes.value?.content || [];
      setContracts((prev) => ({ ...prev, [roomId]: list.find((c) => c.status === "ACTIVE") || list[0] || null }));
    } else {
      setContracts((prev) => ({ ...prev, [roomId]: null }));
    }
  }, [month, year]);

  const toggleRoom = async (roomId) => {
    const next = !expandedRooms[roomId];
    setExpandedRooms((prev) => ({ ...prev, [roomId]: next }));
    if (next) loadRoomData(roomId);
  };

  const updateReading = (roomId, serviceId, field, value, preview = null) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: {
          ...prev[roomId]?.[serviceId],
          [field]: value,
          ...(preview !== undefined && { imagePreview: preview }),
          ...(field === "newValue" && { status: "idle" }),
        },
      },
    }));
  };

  const handleImageFile = (roomId, serviceId, { file, preview }) => {
    updateReading(roomId, serviceId, "image", file, preview);
  };

  const removeImage = (roomId, serviceId) => {
    updateReading(roomId, serviceId, "image", null, null);
  };

  const handleOCRValue = (roomId, serviceId, ocrValue) => {
    updateReading(roomId, serviceId, "newValue", String(ocrValue));
    // setTimeout(() => handleSave(roomId, serviceId), 500);
  };

  const handleSave = async (roomId, serviceId) => {
    const r = readings[roomId]?.[serviceId];
    const val = Number(r?.newValue);
    if (!r?.newValue || isNaN(val)) return;

    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: { ...prev[roomId][serviceId], status: "loading" },
      },
    }));

    try {
      await apiMeterReading.saveReading(roomId, serviceId, val, month, year, r.image);
      setReadings((prev) => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [serviceId]: {
            ...prev[roomId][serviceId],
            status: "saved",
            savedValue: val,
          },
        },
      }));
    } catch (err) {
      setReadings((prev) => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [serviceId]: {
            ...prev[roomId][serviceId],
            status: "error",
            errMsg: err.response?.data?.message || "Lỗi lưu chỉ số",
          },
        },
      }));
    }
  };

  const filteredRooms = rooms.filter((r) => !searchRoom || r.roomName?.toLowerCase().includes(searchRoom.toLowerCase()));

  const getRoomStatus = (roomId) => {
    const r = readings[roomId];
    if (!r) return "pending";
    const statuses = SERVICES.map((svc) => r[svc.id]?.status);
    if (statuses.every((s) => s === "saved")) return "done";
    if (statuses.some((s) => s === "saved")) return "partial";
    return "pending";
  };

  const STATUS_COLOR = { done: "#10b981", partial: "#f59e0b", pending: "#94a3b8" };
  const STATUS_LABEL = { done: "✓ Đã xong", partial: "~ Ghi dở", pending: "Chưa ghi" };

  const roomStats = {
    total: filteredRooms.length,
    done: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "done").length,
    partial: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "partial").length,
    pending: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "pending").length,
  };

  return (
    <div className="min-vh-100" style={{ background: "#f0f4f8", fontFamily: "'DM Sans', sans-serif" }}>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      
      {invoiceModal && (
        <CreateInvoice
          defaultContractId={invoiceModal.contractId}
          defaultMonth={month}
          defaultYear={year}
          onClose={() => setInvoiceModal(null)}
          onCreated={() => navigate("/invoice")}
        />
      )}

      {/* Header */}
      <div className="bg-dark text-white" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="rounded p-2" style={{ background: "#f59e0b" }}>
                  <FaCalculator size={20} />
                </div>
                <h1 className="h3 mb-0 fw-bold">Ghi Chỉ Số Điện – Nước</h1>
              </div>
              <p className="text-white-50 small mb-0">Chọn chi nhánh → mở phòng → nhập chỉ số → tạo hóa đơn</p>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
              onClick={() => setInvoiceModal({ contractId: "", roomName: "" })}
            >
              <FaPlus /> Tạo hóa đơn thủ công
            </button>
          </div>

          {/* Period Selector */}
          <div className="mt-3 d-flex gap-2">
            <div className="d-flex align-items-center gap-3 px-3 py-2 rounded" style={{ background: "rgba(255,255,255,0.08)" }}>
              <span className="small fw-bold text-white-50 text-uppercase">Kỳ</span>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent text-white border-0 fw-bold"
                style={{ outline: 'none' }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} className="bg-dark">Tháng {m.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-secondary">/</span>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent text-white border-0 fw-bold"
                style={{ outline: 'none' }}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-dark">{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Filters */}
        <div className="bg-white rounded-4 p-3 mb-4 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="small fw-bold text-secondary text-uppercase d-block mb-1">
                <FaBuilding className="me-1" /> Chi nhánh
              </label>
              <select 
                className="form-select bg-light border-0 py-2"
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((b) => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="small fw-bold text-secondary text-uppercase d-block mb-1">
                <FaLayerGroup className="me-1" /> Tầng
              </label>
              <select 
                className="form-select bg-light border-0 py-2"
                value={selectedFloor} 
                onChange={(e) => setSelectedFloor(e.target.value)}
                disabled={!selectedBranch}
              >
                <option value="">-- Tất cả tầng --</option>
                {floors.map((f) => <option key={f.floorId} value={f.floorId}>{f.floorName}</option>)}
              </select>
            </div>
            <div className="col-12 col-md-5">
              <label className="small fw-bold text-secondary text-uppercase d-block mb-1">
                <FaSearch className="me-1" /> Tìm phòng
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2 ps-4"
                  placeholder="Tên phòng..."
                  value={searchRoom}
                  onChange={(e) => setSearchRoom(e.target.value)}
                />
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={12} />
                {searchRoom && (
                  <button 
                    className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-secondary p-0 me-2"
                    onClick={() => setSearchRoom("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {selectedBranch && (
          <div className="d-flex gap-3 mb-4 flex-wrap">
            <div className="bg-white rounded-3 px-4 py-2 d-flex align-items-center gap-3 shadow-sm">
              <span className="fs-2 fw-bold" style={{ color: "#6366f1" }}>{roomStats.total}</span>
              <span className="small text-secondary">Tổng phòng</span>
            </div>
            <div className="bg-white rounded-3 px-4 py-2 d-flex align-items-center gap-3 shadow-sm">
              <span className="fs-2 fw-bold" style={{ color: "#10b981" }}>{roomStats.done}</span>
              <span className="small text-secondary">Đã ghi xong</span>
            </div>
            <div className="bg-white rounded-3 px-4 py-2 d-flex align-items-center gap-3 shadow-sm">
              <span className="fs-2 fw-bold" style={{ color: "#f59e0b" }}>{roomStats.partial}</span>
              <span className="small text-secondary">Ghi dở</span>
            </div>
            <div className="bg-white rounded-3 px-4 py-2 d-flex align-items-center gap-3 shadow-sm">
              <span className="fs-2 fw-bold" style={{ color: "#ef4444" }}>{roomStats.pending}</span>
              <span className="small text-secondary">Chưa ghi</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!selectedBranch ? (
          <div className="bg-white rounded-4 p-5 text-center shadow-sm">
            <FaBuilding size={48} className="text-secondary mb-3 opacity-50" />
            <p className="text-secondary">Chọn chi nhánh để bắt đầu ghi chỉ số</p>
          </div>
        ) : loadingRooms ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary">Đang tải phòng...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white rounded-4 p-5 text-center shadow-sm">
            <FaDoorOpen size={48} className="text-secondary mb-3 opacity-50" />
            <p className="text-secondary">Không tìm thấy phòng nào</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredRooms.map((room) => {
              const expanded = expandedRooms[room.roomId];
              const roomStatus = getRoomStatus(room.roomId);
              const contract = contracts[room.roomId];

              return (
                <div key={room.roomId} className="bg-white rounded-4 overflow-hidden shadow-sm" style={{ border: `1.5px solid ${expanded ? "#6366f1" : "#e2e8f0"}` }}>
                  {/* Room Header */}
                  <div 
                    className="d-flex align-items-center p-3 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleRoom(room.roomId)}
                  >
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, background: expanded ? "#ede9fe" : "#f1f5f9", color: expanded ? "#6366f1" : "#64748b" }}>
                      <FaDoorOpen />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark">{room.roomName}</div>
                      <div className="small text-secondary">
                        {room.floorName} · {room.branchName}
                        {contract && <span className="badge bg-primary ms-2">HĐ #{contract.contractId}</span>}
                      </div>
                    </div>
                    <span className="badge me-2 px-3 py-2" style={{ background: `${STATUS_COLOR[roomStatus]}18`, color: STATUS_COLOR[roomStatus] }}>
                      {STATUS_LABEL[roomStatus]}
                    </span>
                    <FaChevronRight style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </div>

                  {/* Expanded Content */}
                  {expanded && (
                    <div className="p-3 pt-0 border-top">
                      {!readings[room.roomId] ? (
                        <div className="text-center py-4 text-secondary">Đang tải chỉ số...</div>
                      ) : (
                        <>
                          <div className="row g-3 mt-2">
                            {SERVICES.map((svc) => {
                              const rd = readings[room.roomId]?.[svc.id] || {};
                              const usage = rd.newValue && !isNaN(Number(rd.newValue)) ? Math.max(0, Number(rd.newValue) - (rd.oldValue || 0)) : null;
                              const isSaved = rd.status === "saved";
                              const isLoading = rd.status === "loading";
                              const hasError = rd.status === "error";

                              return (
                                <div key={svc.id} className="col-12 col-md-6">
                                  <div className="card h-100 border-0 shadow-sm" style={{ background: svc.bg }}>
                                    <div className="card-body">
                                      <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                          <span style={{ color: svc.color, fontSize: 20 }}>{svc.icon}</span>
                                          <h6 className="mb-0 fw-bold">{svc.label}</h6>
                                        </div>
                                        {isSaved && (
                                          <span className="badge bg-success d-flex align-items-center gap-1">
                                            <FaCheck size={10} /> Đã lưu
                                          </span>
                                        )}
                                      </div>

                                      <div className="d-flex justify-content-between mb-3">
                                        <div>
                                          <div className="small text-secondary text-uppercase fw-semibold">Kỳ trước</div>
                                          <div className="fs-3 fw-bold text-secondary">{rd.oldValue ?? 0} <span className="small">{svc.unit}</span></div>
                                        </div>
                                        {usage !== null && usage > 0 && (
                                          <div className="text-end">
                                            <div className="small text-secondary text-uppercase fw-semibold">Tiêu thụ</div>
                                            <div className="fs-3 fw-bold" style={{ color: svc.color }}>+{usage} <span className="small">{svc.unit}</span></div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="mb-3">
                                        <label className="small fw-bold text-secondary d-block mb-1">Chỉ số mới ({svc.unit})</label>
                                        <div className="d-flex gap-2">
                                          <input
                                            type="number"
                                            min={rd.oldValue || 0}
                                            className={`form-control bg-white fw-bold ${hasError ? 'is-invalid' : ''}`}
                                            value={rd.newValue || ""}
                                            onChange={(e) => updateReading(room.roomId, svc.id, "newValue", e.target.value)}
                                            placeholder="Nhập chỉ số..."
                                            disabled={isSaved}
                                          />
                                          <button
                                            className="btn text-white fw-semibold px-3"
                                            onClick={() => handleSave(room.roomId, svc.id)}
                                            disabled={!rd.newValue || isSaved || isLoading}
                                            style={{ background: isSaved ? "#10b981" : svc.color }}
                                          >
                                            {isLoading ? <span className="spinner-border spinner-border-sm" /> : isSaved ? <FaCheck /> : "Lưu"}
                                          </button>
                                        </div>
                                        {hasError && (
                                          <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                                            <FaInfoCircle size={12} /> {rd.errMsg}
                                          </div>
                                        )}
                                      </div>

                                      <ImageCapture
                                        serviceColor={svc.color}
                                        imagePreview={rd.imagePreview}
                                        imageName={rd.image?.name}
                                        imageSize={rd.image?.size}
                                        isSaved={isSaved}
                                        serviceId={svc.id}
                                        onFile={({ file, preview }) => handleImageFile(room.roomId, svc.id, { file, preview })}
                                        onRemove={() => removeImage(room.roomId, svc.id)}
                                        onOCRComplete={(value) => handleOCRValue(room.roomId, svc.id, value)}
                                      />

                                      {isSaved && rd.imagePreview && (
                                        <div 
                                          className="d-flex align-items-center gap-2 mt-2 p-2 rounded bg-white bg-opacity-50 cursor-pointer"
                                          style={{ cursor: 'zoom-in' }}
                                          onClick={() => setLightbox(rd.imagePreview)}
                                        >
                                          <img src={rd.imagePreview} alt="meter" style={{ width: 40, height: 32, objectFit: 'cover' }} className="rounded" />
                                          <span className="small text-secondary">Xem ảnh đồng hồ</span>
                                          <FaExpand className="ms-auto text-secondary" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-4 pt-2 flex-wrap gap-2">
                            <div className="small text-secondary">
                              {contract ? (
                                <>Hợp đồng <strong className="text-primary">#{contract.contractId}</strong> · {contract.status}</>
                              ) : (
                                <span className="text-warning">⚠ Không tìm thấy hợp đồng active</span>
                              )}
                            </div>
                            <button
                              className="btn btn-primary d-flex align-items-center gap-2 fw-semibold shadow-sm"
                              onClick={() => setInvoiceModal({ contractId: contract?.contractId || "", roomName: room.roomName })}
                            >
                              <FaFileInvoiceDollar />
                              {roomStatus === "done" ? `Tạo hóa đơn T${month}/${year}` : "Tạo hóa đơn (chưa ghi đủ)"}
                              <FaArrowRight />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}