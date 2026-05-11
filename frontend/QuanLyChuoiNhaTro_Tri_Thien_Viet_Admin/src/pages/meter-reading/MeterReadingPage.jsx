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
  FaTimesCircle,
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
import ImageCapture from "../../components/WaterImageCapture";

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const SERVICES = [
  {
    id: 1,
    label: "Điện",
    icon: <FaBolt />,
    colorClass: "text-warning",
    bgClass: "bg-warning-subtle",
    borderColor: "#fbbf24",
    unit: "kWh",
  },
  {
    id: 2,
    label: "Nước",
    icon: <FaTint />,
    colorClass: "text-primary",
    bgClass: "bg-primary-subtle",
    borderColor: "#3b82f6",
    unit: "m³",
  },
];

const STATUS_CONFIG = {
  done:    { label: "✓ Đã xong", badge: "bg-success-subtle text-success" },
  partial: { label: "~ Ghi dở",  badge: "bg-warning-subtle text-warning" },
  pending: { label: "Chưa ghi",  badge: "bg-secondary-subtle text-secondary" },
};

/* ══ TRANG CHÍNH ══ */
export default function MeterReadingPage() {
  const navigate = useNavigate();

  const [branches, setBranches]           = useState([]);
  const [floors, setFloors]               = useState([]);
  const [rooms, setRooms]                 = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedFloor, setSelectedFloor]   = useState("");
  const [searchRoom, setSearchRoom]         = useState("");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear]   = useState(CURRENT_YEAR);

  const [readings, setReadings]           = useState({});
  const [contracts, setContracts]         = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [loadingRooms, setLoadingRooms]   = useState(false);
  const [invoiceModal, setInvoiceModal]   = useState(null);
  const [lightbox, setLightbox]           = useState(null);

  /* ── Load branches ── */
  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res.content || res || []))
      .catch(() => setBranches([]));
  }, []);

  /* ── Load floors khi đổi chi nhánh ── */
  useEffect(() => {
    setSelectedFloor("");
    setFloors([]);
    setRooms([]);
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    if (!selectedBranch) return;

    apiFloor
      .getAllFloors()
      .then((res) => {
        let all = [];
        if (Array.isArray(res)) all = res;
        else if (Array.isArray(res?.content)) all = res.content;
        else if (Array.isArray(res?.data))    all = res.data;

        all = all.map((f) => ({
          ...f,
          floorId:   f.floorId ?? f.id,
          floorName: f.floorName ?? f.name ?? f.floorNumber ?? `Tầng ${f.floorId ?? f.id}`,
        }));

        setFloors(all.filter((f) => String(f.branchId) === String(selectedBranch)));
      })
      .catch(() => setFloors([]));
  }, [selectedBranch]);

  /* ── Load rooms ── */
  useEffect(() => {
    if (!selectedBranch) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    apiRoom
      .getAllRooms(0, 100, "roomName", "asc", selectedFloor || null, selectedBranch || null, searchRoom)
      .then((res) => setRooms(res.content || []))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom]);

  /* ── Reset khi đổi kỳ ── */
  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
  }, [month, year]);

  /* ── Load dữ liệu 1 phòng ── */
  const loadRoomData = useCallback(
    async (roomId) => {
      const initReadings = {};
      SERVICES.forEach((svc) => {
        initReadings[svc.id] = {
          newValue:     "",
          oldValue:     0,
          image:        null,
          imagePreview: null,
          status:       "idle",
          savedValue:   null,
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
              newValue:     String(r.newValue ?? ""),
              oldValue:     r.oldValue ?? 0,
              savedValue:   r.newValue,
              status:       "saved",
              image:        null,
              imagePreview: null,
            };
          }
        });
      }

      await Promise.allSettled(
        SERVICES.filter((svc) => initReadings[svc.id].status !== "saved").map(
          async (svc) => {
            try {
              const prev = await apiMeterReading.getPrevious(roomId, svc.id, month, year);
              if (prev) initReadings[svc.id].oldValue = prev.newValue ?? 0;
            } catch { /* không có kỳ trước */ }
          },
        ),
      );

      setReadings((prev) => ({ ...prev, [roomId]: initReadings }));

      if (contractRes.status === "fulfilled") {
        const list   = Array.isArray(contractRes.value) ? contractRes.value : contractRes.value?.content || [];
        const active = list.find((c) => c.status === "ACTIVE") || list[0] || null;
        setContracts((prev) => ({ ...prev, [roomId]: active }));
      } else {
        setContracts((prev) => ({ ...prev, [roomId]: null }));
      }
    },
    [month, year],
  );

  const toggleRoom = async (roomId) => {
    const next = !expandedRooms[roomId];
    setExpandedRooms((prev) => ({ ...prev, [roomId]: next }));
    if (next) loadRoomData(roomId);
  };

  const updateReading = (roomId, serviceId, field, value, preview = undefined) => {
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
  };

  const handleSave = async (roomId, serviceId) => {
    const r   = readings[roomId]?.[serviceId];
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
          [serviceId]: { ...prev[roomId][serviceId], status: "saved", savedValue: val },
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

  const filteredRooms = rooms.filter(
    (r) => !searchRoom || r.roomName?.toLowerCase().includes(searchRoom.toLowerCase()),
  );

  const getRoomStatus = (roomId) => {
    const r = readings[roomId];
    if (!r) return "pending";
    const statuses = SERVICES.map((svc) => r[svc.id]?.status);
    if (statuses.every((s) => s === "saved")) return "done";
    if (statuses.some((s) => s === "saved"))  return "partial";
    return "pending";
  };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="container-fluid py-4">
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

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <FaCalculator className="text-warning" />
            <h4 className="fw-bold text-dark mb-0">Ghi Chỉ Số Điện – Nước</h4>
          </div>
          <p className="text-muted small mb-0">
            Chọn chi nhánh → mở phòng → nhập chỉ số → tạo hóa đơn
          </p>
        </div>
        <button
          className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
          onClick={() => setInvoiceModal({ contractId: "", roomName: "" })}
        >
          <FaPlus size={14} /> Tạo hóa đơn thủ công
        </button>
      </div>

      {/* ── Toolbar: filters + kỳ ── */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Bộ lọc */}
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Chi nhánh */}
            <div className="input-group input-group-sm" style={{ width: 200 }}>
              <span className="input-group-text bg-light border-0">
                <FaBuilding className="text-muted" size={12} />
              </span>
              <select
                className="form-select form-select-sm border-0 bg-light"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                ))}
              </select>
            </div>

            {/* Tầng */}
            <div className="input-group input-group-sm" style={{ width: 160 }}>
              <span className="input-group-text bg-light border-0">
                <FaLayerGroup className="text-muted" size={12} />
              </span>
              <select
                className="form-select form-select-sm border-0 bg-light"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                disabled={!selectedBranch || floors.length === 0}
              >
                <option value="">Tất cả tầng</option>
                {floors.map((f) => (
                  <option key={f.floorId} value={f.floorId}>{f.floorName}</option>
                ))}
              </select>
            </div>

            {/* Tìm phòng */}
            <div className="input-group input-group-sm" style={{ width: 220 }}>
              <span className="input-group-text bg-light border-0">
                <FaSearch size={12} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm tên phòng..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
              />
              {searchRoom && (
                <button className="btn btn-light border-0" onClick={() => setSearchRoom("")}>
                  <FaTimesCircle className="text-muted" size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Kỳ tháng/năm */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold">Kỳ:</span>
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 110 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}</option>
              ))}
            </select>
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 90 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {selectedBranch && (
        <div className="d-flex gap-4 mb-4">
          {[
            { label: "Tổng phòng", val: filteredRooms.length,                                                           color: "text-primary"   },
            { label: "Đã xong",    val: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "done").length,    color: "text-success"   },
            { label: "Ghi dở",     val: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "partial").length, color: "text-warning"   },
            { label: "Chưa ghi",   val: filteredRooms.filter((r) => getRoomStatus(r.roomId) === "pending").length, color: "text-danger"    },
          ].map((s) => (
            <div key={s.label} className="d-flex align-items-center gap-2">
              <span className={`fw-bold fs-5 ${s.color}`}>{s.val}</span>
              <span className="text-muted small">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Nội dung chính ── */}
      {!selectedBranch ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <FaBuilding size={36} className="text-secondary opacity-25 mb-3 d-block mx-auto" />
            <p className="text-muted small mb-0">Chọn chi nhánh để bắt đầu ghi chỉ số</p>
          </div>
        </div>
      ) : loadingRooms ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <div className="spinner-border spinner-border-sm text-secondary me-2" />
            <span className="text-muted small">Đang tải phòng...</span>
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <FaDoorOpen size={28} className="text-secondary opacity-25 mb-2 d-block mx-auto" />
            <p className="text-muted small mb-0">Không tìm thấy phòng nào</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredRooms.map((room) => {
            const expanded   = expandedRooms[room.roomId];
            const roomStatus = getRoomStatus(room.roomId);
            const statusCfg  = STATUS_CONFIG[roomStatus];
            const contract   = contracts[room.roomId];

            return (
              <div
                key={room.roomId}
                className={`card border-0 shadow-sm rounded-3 overflow-hidden ${expanded ? "border border-primary" : ""}`}
                style={{ transition: "all 0.18s" }}
              >
                {/* ── Room header ── */}
                <button
                  className="btn btn-white w-100 d-flex align-items-center gap-3 p-3 border-0 bg-white text-start"
                  onClick={() => toggleRoom(room.roomId)}
                >
                  <div
                    className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${expanded ? "bg-primary-subtle text-primary" : "bg-light text-secondary"}`}
                    style={{ width: 40, height: 40 }}
                  >
                    <FaDoorOpen size={16} />
                  </div>

                  <div className="flex-fill">
                    <div className="fw-bold text-dark small">{room.roomName}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {room.floorName} · {room.branchName}
                      {contract && (
                        <span className="text-primary ms-2 fw-semibold">
                          HĐ #{contract.contractId}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`badge rounded-pill fw-semibold ${statusCfg.badge}`} style={{ fontSize: 11 }}>
                    {statusCfg.label}
                  </span>

                  <FaChevronRight
                    size={11}
                    className="text-muted flex-shrink-0"
                    style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </button>

                {/* ── Expanded content ── */}
                {expanded && (
                  <div className="border-top px-3 pb-3 pt-2">
                    {!readings[room.roomId] ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-secondary me-2" />
                        <span className="text-muted small">Đang tải chỉ số...</span>
                      </div>
                    ) : (
                      <>
                        {/* Service cards */}
                        <div className="row g-3 mt-1">
                          {SERVICES.map((svc) => {
                            const rd        = readings[room.roomId]?.[svc.id] || {};
                            const usage     = rd.newValue && !isNaN(Number(rd.newValue))
                              ? Math.max(0, Number(rd.newValue) - (rd.oldValue || 0))
                              : null;
                            const isSaved   = rd.status === "saved";
                            const isLoading = rd.status === "loading";
                            const hasError  = rd.status === "error";

                            return (
                              <div key={svc.id} className="col-md-6">
                                <div
                                  className={`rounded-3 p-3 ${svc.bgClass}`}
                                  style={{
                                    border: `1.5px solid ${isSaved ? svc.borderColor + "80" : svc.borderColor + "30"}`,
                                  }}
                                >
                                  {/* Service header */}
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <span className={svc.colorClass}>{svc.icon}</span>
                                    <span className="fw-bold small">{svc.label}</span>
                                    {isSaved && (
                                      <span className="badge bg-success-subtle text-success ms-auto d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                                        <FaCheck size={9} /> Đã lưu
                                      </span>
                                    )}
                                  </div>

                                  {/* Kỳ trước / tiêu thụ */}
                                  <div className="d-flex justify-content-between mb-3">
                                    <div>
                                      <div className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 10 }}>Kỳ trước</div>
                                      <div className="fw-bold fs-5 text-secondary">
                                        {rd.oldValue ?? 0} <span className="small fw-normal">{svc.unit}</span>
                                      </div>
                                    </div>
                                    {usage !== null && (
                                      <div className="text-end">
                                        <div className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: 10 }}>Tiêu thụ</div>
                                        <div className={`fw-bold fs-5 ${svc.colorClass}`}>
                                          +{usage} <span className="small fw-normal">{svc.unit}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Input chỉ số mới */}
                                  <div className="mb-2">
                                    <label className="form-label small fw-semibold text-muted mb-1">
                                      Chỉ số mới ({svc.unit})
                                    </label>
                                    <div className="d-flex gap-2">
                                      <input
                                        type="number"
                                        min={rd.oldValue || 0}
                                        className={`form-control form-control-sm fw-bold ${hasError ? "is-invalid" : isSaved ? "border-success bg-success-subtle" : ""}`}
                                        value={rd.newValue || ""}
                                        onChange={(e) => updateReading(room.roomId, svc.id, "newValue", e.target.value)}
                                        placeholder="Nhập chỉ số..."
                                        disabled={isSaved}
                                      />
                                      <button
                                        className={`btn btn-sm fw-bold d-flex align-items-center gap-1 flex-shrink-0 ${isSaved ? "btn-success" : "btn-dark"}`}
                                        onClick={() => handleSave(room.roomId, svc.id)}
                                        disabled={!rd.newValue || isSaved || isLoading}
                                      >
                                        {isLoading ? (
                                          <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                        ) : isSaved ? (
                                          <FaCheck size={11} />
                                        ) : (
                                          "Lưu"
                                        )}
                                      </button>
                                    </div>
                                    {hasError && (
                                      <div className="text-danger small mt-1">
                                        <FaInfoCircle className="me-1" /> {rd.errMsg}
                                      </div>
                                    )}
                                  </div>

                                  {/* ImageCapture (OCR + upload) */}
                                  <ImageCapture
                                    serviceColor={svc.borderColor}
                                    imagePreview={rd.imagePreview}
                                    imageName={rd.image?.name}
                                    imageSize={rd.image?.size}
                                    isSaved={isSaved}
                                    serviceId={svc.id}
                                    onFile={({ file, preview }) => handleImageFile(room.roomId, svc.id, { file, preview })}
                                    onRemove={() => removeImage(room.roomId, svc.id)}
                                    onOCRComplete={(value) => handleOCRValue(room.roomId, svc.id, value)}
                                  />

                                  {/* Xem ảnh đã lưu (Lightbox) */}
                                  {isSaved && rd.imagePreview && (
                                    <div
                                      className="d-flex align-items-center gap-2 mt-2 p-2 rounded bg-white bg-opacity-50"
                                      style={{ cursor: "zoom-in" }}
                                      onClick={() => setLightbox(rd.imagePreview)}
                                    >
                                      <img
                                        src={rd.imagePreview}
                                        alt="meter"
                                        style={{ width: 40, height: 32, objectFit: "cover" }}
                                        className="rounded"
                                      />
                                      <span className="small text-secondary">Xem ảnh đồng hồ</span>
                                      <FaExpand className="ms-auto text-secondary" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer: hợp đồng + nút tạo hóa đơn */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
                          <div className="small text-muted">
                            {contract ? (
                              <>
                                Hợp đồng{" "}
                                <strong className="text-primary">#{contract.contractId}</strong>{" "}
                                · {contract.status}
                              </>
                            ) : (
                              <span className="text-warning">⚠ Không tìm thấy hợp đồng active</span>
                            )}
                          </div>
                          <button
                            className={`btn btn-sm fw-semibold d-flex align-items-center gap-2 ${roomStatus === "done" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setInvoiceModal({ contractId: contract?.contractId || "", roomName: room.roomName })}
                          >
                            <FaFileInvoiceDollar size={13} />
                            {roomStatus === "done" ? `Tạo hóa đơn T${month}/${year}` : "Tạo hóa đơn (chưa ghi đủ)"}
                            <FaArrowRight size={11} />
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
  );
}