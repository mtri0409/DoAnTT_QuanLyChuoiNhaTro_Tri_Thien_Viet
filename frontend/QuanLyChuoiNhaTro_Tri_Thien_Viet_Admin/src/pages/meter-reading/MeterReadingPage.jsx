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
  FaExclamationTriangle,
  FaPencilAlt,
} from "react-icons/fa";
import apiBranches from "../../api/apiBranches";
import apiFloor from "../../api/apiFloor";
import apiRoom from "../../api/apiRoom";
import apiMeterReading from "../../api/apiMeterReading";
import apiInvoice from "../../api/apiInvoice";
import apiContract from "../../api/apiContract";
import Lightbox from "../../components/Lightbox";
import CreateInvoice from "../../components/CreateInvoice";
import ImageCapture from "../../components/readings/WaterImageCapture";

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
  done: { label: "✓ Đã xong", badge: "bg-success-subtle text-success" },
  partial: { label: "~ Ghi dở", badge: "bg-warning-subtle text-warning" },
  pending: { label: "Chưa ghi", badge: "bg-secondary-subtle text-secondary" },
};

/* ─────────────────────────────────────────────
   Modal xác nhận lưu chỉ số
───────────────────────────────────────────── */
function ConfirmSaveModal({ data, onConfirm, onCancel }) {
  if (!data) return null;
  const { svcLabel, svcUnit, oldValue, newValue, isInitial } = data;
  const usage = isInitial
    ? null
    : Math.max(0, Number(newValue) - Number(oldValue));
  const isHighUsage = usage !== null && usage > 9999;
  const isNegative = !isInitial && Number(newValue) < Number(oldValue);

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1055 }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4">
            <div className="d-flex align-items-center gap-2">
              {isNegative || isHighUsage ? (
                <span className="text-warning fs-5">
                  <FaExclamationTriangle />
                </span>
              ) : (
                <span className="text-success fs-5">
                  <FaCheck />
                </span>
              )}
              <h6 className="modal-title fw-bold mb-0">
                Xác nhận lưu chỉ số {svcLabel}
              </h6>
            </div>
            <button
              className="btn-close"
              onClick={onCancel}
              style={{ fontSize: 12 }}
            />
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">
            {/* Cảnh báo nếu dữ liệu bất thường */}
            {isNegative && (
              <div
                className="alert alert-danger py-2 px-3 mb-3 d-flex gap-2 align-items-start"
                style={{ fontSize: 12 }}
              >
                <FaExclamationTriangle className="flex-shrink-0 mt-1" />
                <span>
                  <strong>Chỉ số mới nhỏ hơn kỳ trước!</strong> Hãy kiểm tra lại
                  — đồng hồ có thể bị nhập nhầm.
                </span>
              </div>
            )}
            {isHighUsage && (
              <div
                className="alert alert-warning py-2 px-3 mb-3 d-flex gap-2 align-items-start"
                style={{ fontSize: 12 }}
              >
                <FaExclamationTriangle className="flex-shrink-0 mt-1" />
                <span>
                  <strong>
                    Tiêu thụ rất cao ({usage} {svcUnit})!
                  </strong>{" "}
                  Kiểm tra lại trước khi xác nhận.
                </span>
              </div>
            )}

            {isInitial ? (
              /* Xác nhận chỉ số đầu */
              <div className="rounded-3 p-3 bg-info-subtle border border-info-subtle">
                <div
                  className="text-muted small fw-semibold mb-2 text-uppercase"
                  style={{ fontSize: 10 }}
                >
                  Chỉ số gốc (số đầu đồng hồ)
                </div>
                <div className="fw-bold fs-4 text-info">
                  {newValue}{" "}
                  <span className="small fw-normal text-muted">{svcUnit}</span>
                </div>
                <div className="text-muted small mt-1" style={{ fontSize: 11 }}>
                  Đây sẽ là chỉ số kỳ trước khi người thuê đầu tiên vào phòng.
                </div>
              </div>
            ) : (
              /* Xác nhận chỉ số tháng */
              <div className="d-flex gap-3 align-items-center">
                <div className="flex-fill rounded-3 p-3 bg-light text-center">
                  <div
                    className="text-muted small fw-semibold mb-1 text-uppercase"
                    style={{ fontSize: 10 }}
                  >
                    Kỳ trước
                  </div>
                  <div className="fw-bold fs-5 text-secondary">
                    {oldValue ?? 0}{" "}
                    <span className="small fw-normal">{svcUnit}</span>
                  </div>
                </div>

                <div className="text-muted">
                  <FaArrowRight />
                </div>

                <div
                  className="flex-fill rounded-3 p-3 text-center"
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                  }}
                >
                  <div
                    className="text-muted small fw-semibold mb-1 text-uppercase"
                    style={{ fontSize: 10 }}
                  >
                    Chỉ số mới
                  </div>
                  <div className="fw-bold fs-5 text-success">
                    {newValue}{" "}
                    <span className="small fw-normal">{svcUnit}</span>
                  </div>
                </div>
              </div>
            )}

            {!isInitial && usage !== null && !isNegative && (
              <div className="mt-3 text-center">
                <span className="text-muted small">Tiêu thụ kỳ này: </span>
                <span
                  className={`fw-bold ${isHighUsage ? "text-warning" : "text-dark"}`}
                >
                  +{usage} {svcUnit}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-1 gap-2">
            <button
              className="btn btn-light btn-sm flex-fill"
              onClick={onCancel}
            >
              Kiểm tra lại
            </button>
            <button
              className={`btn btn-sm fw-semibold flex-fill ${isNegative ? "btn-danger" : "btn-success"}`}
              onClick={onConfirm}
            >
              <FaCheck size={11} className="me-1" />
              {isNegative ? "Vẫn lưu (tôi chắc chắn)" : "Xác nhận lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Modal xác nhận SỬA LẠI chỉ số đã lưu
───────────────────────────────────────────── */
function ConfirmEditModal({ data, onConfirm, onCancel }) {
  if (!data) return null;
  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1055 }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0 pt-4 px-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-warning fs-5">
                <FaExclamationTriangle />
              </span>
              <h6 className="modal-title fw-bold mb-0">Sửa lại chỉ số?</h6>
            </div>
            <button
              className="btn-close"
              onClick={onCancel}
              style={{ fontSize: 12 }}
            />
          </div>
          <div className="modal-body px-4 py-3">
            <p className="text-muted small mb-2">
              Chỉ số <strong>{data.svcLabel}</strong> đã được lưu là{" "}
              <strong className="text-dark">
                {data.savedValue} {data.svcUnit}
              </strong>
              .
            </p>
            <p className="text-muted small mb-0">
              Nếu bạn sửa lại, chỉ số cũ sẽ bị ghi đè. Hãy chắc chắn trước khi
              tiếp tục.
            </p>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-1 gap-2">
            <button
              className="btn btn-light btn-sm flex-fill"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              className="btn btn-warning btn-sm fw-semibold flex-fill"
              onClick={onConfirm}
            >
              <FaPencilAlt size={11} className="me-1" /> Cho phép sửa lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalRooms, setTotalRooms] = useState(0);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // Cache trạng thái phòng từ server — không cần mở phòng mới biết
  const [roomStatusCache, setRoomStatusCache] = useState({});
  // Cache hợp đồng nhẹ cho tất cả phòng — hiển thị ngay trên header
  const [contractCache, setContractCache] = useState({});

  // Track phòng đã tạo hóa đơn thành công — key: contractId, value: true
  const [createdInvoices, setCreatedInvoices] = useState({});
  // Trạng thái tạo tất cả hóa đơn cho chi nhánh
  const [bulkInvoiceLoading, setBulkInvoiceLoading] = useState(false);
  const [bulkInvoiceResult, setBulkInvoiceResult] = useState(null); // { success, failed }

  // Modal xác nhận lưu
  const [confirmModal, setConfirmModal] = useState(null); // { roomId, serviceId, svcLabel, svcUnit, oldValue, newValue, isInitial }
  // Modal xác nhận sửa lại
  const [editModal, setEditModal] = useState(null); // { roomId, serviceId, svcLabel, svcUnit, savedValue }

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
    setContractCache({});
    setExpandedRooms({});
    setRoomStatusCache({});
    if (!selectedBranch) return;

    apiFloor
      .getAllFloors()
      .then((res) => {
        let all = [];
        if (Array.isArray(res)) all = res;
        else if (Array.isArray(res?.content)) all = res.content;
        else if (Array.isArray(res?.data)) all = res.data;

        all = all.map((f) => ({
          ...f,
          floorId: f.floorId ?? f.id,
          floorName:
            f.floorName ??
            f.name ??
            f.floorNumber ??
            `Tầng ${f.floorId ?? f.id}`,
        }));

        setFloors(
          all.filter((f) => String(f.branchId) === String(selectedBranch)),
        );
      })
      .catch(() => setFloors([]));
  }, [selectedBranch]);

  /* ── Load rooms + fetch trạng thái tất cả phòng ngầm ── */
  useEffect(() => {
    if (!selectedBranch) {
      setRooms([]);
      setCurrentPage(0);
      setHasMorePages(false);
      setTotalRooms(0);
      return;
    }
    setLoadingRooms(true);
    setReadings({});
    setContracts({});
    setContractCache({});
    setExpandedRooms({});
    setRoomStatusCache({});
    setCurrentPage(0);
    setHasMorePages(false);
    setTotalRooms(0);
    setCreatedInvoices({});
    setBulkInvoiceResult(null);

    apiRoom
      .getRoomsPaged(
        0,
        selectedFloor || null,
        selectedBranch || null,
        searchRoom || "",
      )
      .then((res) => {
        const list = res.content || [];
        setRooms(list);
        setHasMorePages(!res.last && res.totalPages > 1);
        setTotalRooms(res.totalElements || list.length);
        fetchAllRoomStatuses(list, month, year);
        fetchAllContracts(list);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom]);

  /* ── Load thêm phòng từ trang tiếp theo ── */
  const loadMoreRooms = useCallback(async () => {
    if (loadingMore || !hasMorePages) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const res = await apiRoom.getRoomsPaged(
        nextPage,
        selectedFloor || null,
        selectedBranch || null,
        searchRoom || "",
      );
      const newList = res.content || [];
      setRooms((prev) => [...prev, ...newList]);
      setCurrentPage(nextPage);
      setHasMorePages(!res.last && nextPage + 1 < res.totalPages);
      fetchAllRoomStatuses(newList, month, year);
      fetchAllContracts(newList);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasMorePages,
    currentPage,
    selectedFloor,
    selectedBranch,
    searchRoom,
    month,
    year,
  ]);

  /* ── Reset + refetch cache khi đổi kỳ ── */
  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    setRoomStatusCache({});
    if (rooms.length > 0) fetchAllRoomStatuses(rooms, month, year);
  }, [month, year]);

  /* Fetch trạng thái nhẹ cho tất cả phòng */
  const fetchAllRoomStatuses = useCallback(async (roomList, m, y) => {
    const results = await Promise.allSettled(
      roomList.map((room) =>
        apiMeterReading.getByRoomAndPeriod(room.roomId, m, y),
      ),
    );

    const newCache = {};
    results.forEach((result, idx) => {
      const roomId = roomList[idx].roomId;
      if (result.status === "fulfilled") {
        const existing = Array.isArray(result.value) ? result.value : [];
        // Chỉ tính bản ghi thật (không phải initial) vào trạng thái
        const realRecords = existing.filter(
          (r) => r.newValue != null && !r.isInitial,
        );
        if (realRecords.length === 0) newCache[roomId] = "pending";
        else if (realRecords.length >= SERVICES.length)
          newCache[roomId] = "done";
        else newCache[roomId] = "partial";
      } else {
        newCache[roomId] = "pending";
      }
    });

    setRoomStatusCache(newCache);
  }, []);

  /* Fetch hợp đồng nhẹ cho tất cả phòng để hiển thị trên header */
  const fetchAllContracts = useCallback(async (roomList) => {
    const results = await Promise.allSettled(
      roomList.map((room) => apiContract.getContractsByRoom(room.roomId)),
    );
    const newCache = {};
    results.forEach((result, idx) => {
      const roomId = roomList[idx].roomId;
      if (result.status === "fulfilled") {
        const list = Array.isArray(result.value)
          ? result.value
          : result.value?.content || [];
        newCache[roomId] = list.find((c) => c.status === "ACTIVE") || null;
      } else {
        newCache[roomId] = null;
      }
    });
    setContractCache((prev) => ({ ...prev, ...newCache }));
  }, []);

  /* ── Load full data 1 phòng khi mở ── */
  const loadRoomData = useCallback(
    async (roomId) => {
      const initReadings = {};
      SERVICES.forEach((svc) => {
        initReadings[svc.id] = {
          newValue: "",
          oldValue: 0,
          initialValue: "",
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

      let activeContract = null;
      if (contractRes.status === "fulfilled") {
        const list = Array.isArray(contractRes.value)
          ? contractRes.value
          : contractRes.value?.content || [];
        activeContract = list.find((c) => c.status === "ACTIVE") || null;
      }
      const hasContract = !!activeContract;

      if (currentPeriod.status === "fulfilled") {
        const existing = Array.isArray(currentPeriod.value)
          ? currentPeriod.value
          : [];

        // Tách bản ghi khởi đầu và bản ghi thật
        const initialRecords = existing.filter((r) => r.isInitial);
        const realRecords = existing.filter((r) => !r.isInitial);

        if (hasContract) {
          // Bước 1: Set oldValue từ bản isInitial TRƯỚC — đây là số đầu đồng hồ
          // khi thêm phòng. Phải làm trước để không bị tính vào tiêu thụ hóa đơn.
          initialRecords.forEach((r) => {
            const sid = Number(r.serviceId);
            if (!initReadings[sid] || r.newValue == null) return;
            initReadings[sid].oldValue = r.newValue;
          });

          // Bước 2: Nếu có bản ghi thật (tháng hiện tại, không phải isInitial),
          // dùng nó — nhưng giữ lại oldValue đã set từ initial ở bước 1
          realRecords.forEach((r) => {
            const sid = Number(r.serviceId);
            if (!initReadings[sid]) return;
            initReadings[sid] = {
              newValue: String(r.newValue ?? ""),
              // r.oldValue từ server, fallback về giá trị đã set từ initial
              oldValue: r.oldValue ?? initReadings[sid].oldValue ?? 0,
              initialValue: "",
              savedValue: r.newValue,
              status: r.newValue != null ? "saved" : "idle",
              image: null,
              imagePreview: null,
            };
          });
        } else {
          // Phòng chưa có HĐ → bản ghi này là chỉ số khởi đầu
          existing.forEach((r) => {
            const sid = Number(r.serviceId);
            if (!initReadings[sid]) return;
            initReadings[sid] = {
              newValue: "",
              oldValue: 0,
              initialValue: String(r.newValue ?? ""),
              savedValue: null,
              status: r.newValue != null ? "initial_saved" : "idle",
              image: null,
              imagePreview: null,
            };
          });
        }
      }

      // Fetch kỳ trước từ server.
      // Trường hợp thêm phòng và người thuê vào CÙNG THÁNG:
      //   getPrevious tìm period < tháng hiện tại → không tìm thấy bản isInitial cùng tháng
      //   → fallback tìm bản isInitial trong getByRoomAndPeriod cùng tháng đó
      //   → lấy newValue của bản isInitial làm oldValue cho kỳ này
      if (hasContract) {
        // Lấy tất cả bản ghi cùng tháng 1 lần — dùng cho fallback bên dưới
        const sameMonthRecords = Array.isArray(currentPeriod.value)
          ? currentPeriod.value
          : [];

        await Promise.allSettled(
          SERVICES.filter((svc) => initReadings[svc.id].status !== "saved").map(
            async (svc) => {
              try {
                const prev = await apiMeterReading.getPrevious(
                  roomId,
                  svc.id,
                  month,
                  year,
                );
                if (prev && prev.newValue != null) {
                  // getPrevious trả về bản kỳ trước (isInitial hoặc thật) — dùng làm oldValue
                  initReadings[svc.id].oldValue = prev.newValue;
                } else {
                  // getPrevious không tìm thấy → thêm phòng & người thuê cùng tháng
                  // Tìm bản isInitial trong cùng tháng để lấy làm oldValue
                  const initialSameMonth = sameMonthRecords.find(
                    (r) => r.isInitial && Number(r.serviceId) === svc.id,
                  );
                  if (initialSameMonth && initialSameMonth.newValue != null) {
                    initReadings[svc.id].oldValue = initialSameMonth.newValue;
                  }
                  // Nếu vẫn không có → oldValue giữ nguyên 0 (phòng hoàn toàn mới)
                }
              } catch {
                /* không có kỳ trước — giữ nguyên oldValue đã set */
              }
            },
          ),
        );
      }

      setReadings((prev) => ({ ...prev, [roomId]: initReadings }));
      setContracts((prev) => ({ ...prev, [roomId]: activeContract }));
    },
    [month, year],
  );

  const toggleRoom = async (roomId) => {
    const next = !expandedRooms[roomId];
    setExpandedRooms((prev) => ({ ...prev, [roomId]: next }));
    if (next) loadRoomData(roomId);
  };

  const updateReading = (
    roomId,
    serviceId,
    field,
    value,
    preview = undefined,
  ) => {
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

  const removeImage = (roomId, serviceId) =>
    updateReading(roomId, serviceId, "image", null, null);

  const handleOCRValue = (roomId, serviceId, ocrValue) =>
    updateReading(roomId, serviceId, "newValue", String(ocrValue));

  /* ── Mở modal xác nhận trước khi lưu ── */
  const handleSaveClick = (roomId, serviceId) => {
    const r = readings[roomId]?.[serviceId];
    const contract = contracts[roomId] ?? contractCache[roomId];
    const hasContract = !!contract;
    const svc = SERVICES.find((s) => s.id === serviceId);

    if (hasContract) {
      const val = Number(r?.newValue);
      if (!r?.newValue || isNaN(val)) return;
      setConfirmModal({
        roomId,
        serviceId,
        svcLabel: svc.label,
        svcUnit: svc.unit,
        oldValue: r.oldValue ?? 0,
        newValue: val,
        isInitial: false,
      });
    } else {
      const val = Number(r?.initialValue);
      if (!r?.initialValue || isNaN(val) || val < 0) return;
      setConfirmModal({
        roomId,
        serviceId,
        svcLabel: svc.label,
        svcUnit: svc.unit,
        oldValue: 0,
        newValue: val,
        isInitial: true,
      });
    }
  };

  /* ── Thực hiện lưu sau khi xác nhận ── */
  const handleSaveConfirmed = async () => {
    const { roomId, serviceId, newValue, isInitial } = confirmModal;
    setConfirmModal(null);

    const r = readings[roomId]?.[serviceId];
    const contract = contracts[roomId];

    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: { ...prev[roomId][serviceId], status: "loading" },
      },
    }));

    try {
      if (!isInitial) {
        // ── Phòng có HĐ: lưu chỉ số tháng bình thường ──
        // Truyền oldValue rõ ràng — backend sẽ dùng thay vì tự tính lại
        // (tránh trường hợp backend tìm không thấy bản isInitial cùng tháng → ra 0)
        const oldValue = confirmModal.oldValue ?? r?.oldValue ?? 0;
        await apiMeterReading.saveReading(
          roomId,
          serviceId,
          newValue,
          month,
          year,
          r.image,
          false, // isInitial = false
          oldValue, // truyền thẳng xuống backend
        );
        setReadings((prev) => {
          const updated = {
            ...prev,
            [roomId]: {
              ...prev[roomId],
              [serviceId]: {
                ...prev[roomId][serviceId],
                status: "saved",
                savedValue: newValue,
              },
            },
          };
          const statuses = SERVICES.map((s) => updated[roomId][s.id]?.status);
          const newStatus = statuses.every((s) => s === "saved")
            ? "done"
            : statuses.some((s) => s === "saved")
              ? "partial"
              : "pending";
          setRoomStatusCache((c) => ({ ...c, [roomId]: newStatus }));
          return updated;
        });
      } else {
        // ── Phòng chưa có HĐ: lưu chỉ số khởi đầu (isInitial = true) ──
        // API cần nhận thêm flag isInitial để phân biệt với chỉ số tháng thật
        await apiMeterReading.saveReading(
          roomId,
          serviceId,
          newValue,
          month,
          year,
          null,
          true, // isInitial flag
        );
        setReadings((prev) => ({
          ...prev,
          [roomId]: {
            ...prev[roomId],
            [serviceId]: {
              ...prev[roomId][serviceId],
              status: "initial_saved",
              initialValue: String(newValue),
            },
          },
        }));
        // Phòng không HĐ không tính vào trạng thái "done"
      }
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

  /* ── Mở modal xác nhận sửa lại ── */
  const handleEditClick = (roomId, serviceId) => {
    const r = readings[roomId]?.[serviceId];
    const svc = SERVICES.find((s) => s.id === serviceId);
    setEditModal({
      roomId,
      serviceId,
      svcLabel: svc.label,
      svcUnit: svc.unit,
      savedValue: r?.savedValue,
    });
  };

  /* ── Cho phép sửa lại sau xác nhận ── */
  const handleEditConfirmed = () => {
    const { roomId, serviceId } = editModal;
    setEditModal(null);
    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: {
          ...prev[roomId][serviceId],
          status: "idle",
          newValue: String(prev[roomId][serviceId].savedValue ?? ""),
        },
      },
    }));
    // Cập nhật lại cache status phòng
    setRoomStatusCache((c) => {
      const roomReadings = readings[roomId];
      const statuses = SERVICES.map((s) =>
        s.id === serviceId ? "idle" : roomReadings?.[s.id]?.status,
      );
      const newStatus = statuses.every((s) => s === "saved")
        ? "done"
        : statuses.some((s) => s === "saved")
          ? "partial"
          : "pending";
      return { ...c, [roomId]: newStatus };
    });
  };

  const filteredRooms = rooms.filter(
    (r) =>
      !searchRoom ||
      r.roomName?.toLowerCase().includes(searchRoom.toLowerCase()),
  );

  /* getRoomStatus ưu tiên readings nếu đã load, fallback về cache từ server */
  const getRoomStatus = (roomId) => {
    const r = readings[roomId];
    if (r) {
      const statuses = SERVICES.map((svc) => r[svc.id]?.status);
      if (statuses.every((s) => s === "saved")) return "done";
      if (statuses.some((s) => s === "saved")) return "partial";
      return "pending";
    }
    return roomStatusCache[roomId] ?? "pending";
  };

  /* ── RENDER ── */
  return (
    <div className="container-fluid py-4">
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

      {/* Modal xác nhận lưu */}
      <ConfirmSaveModal
        data={confirmModal}
        onConfirm={handleSaveConfirmed}
        onCancel={() => setConfirmModal(null)}
      />

      {/* Modal xác nhận sửa lại */}
      <ConfirmEditModal
        data={editModal}
        onConfirm={handleEditConfirmed}
        onCancel={() => setEditModal(null)}
      />

      {invoiceModal && (
        <CreateInvoice
          defaultContractId={invoiceModal.contractId}
          defaultMonth={month}
          defaultYear={year}
          onClose={() => setInvoiceModal(null)}
          onCreated={() => {
            if (invoiceModal.contractId) {
              setCreatedInvoices((prev) => ({
                ...prev,
                [invoiceModal.contractId]: true,
              }));
            }
            setInvoiceModal(null);
          }}
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

      {/* ── Toolbar ── */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex gap-2 flex-wrap align-items-center">
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
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

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
                  <option key={f.floorId} value={f.floorId}>
                    {f.floorName}
                  </option>
                ))}
              </select>
            </div>

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
                <button
                  className="btn btn-light border-0"
                  onClick={() => setSearchRoom("")}
                >
                  <FaTimesCircle className="text-muted" size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold">Kỳ:</span>
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 110 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m < 10 ? `0${m}` : m}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 90 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {selectedBranch && (
        <div className="d-flex gap-4 mb-4">
          {[
            {
              label: "Tổng phòng",
              val: totalRooms,
              color: "text-primary",
            },
            {
              label: "Đã xong",
              val: filteredRooms.filter(
                (r) => getRoomStatus(r.roomId) === "done",
              ).length,
              color: "text-success",
            },
            {
              label: "Ghi dở",
              val: filteredRooms.filter(
                (r) => getRoomStatus(r.roomId) === "partial",
              ).length,
              color: "text-warning",
            },
            {
              label: "Chưa ghi",
              val: filteredRooms.filter(
                (r) => getRoomStatus(r.roomId) === "pending",
              ).length,
              color: "text-danger",
            },
          ].map((s) => (
            <div key={s.label} className="d-flex align-items-center gap-2">
              <span className={`fw-bold fs-5 ${s.color}`}>{s.val}</span>
              <span className="text-muted small">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Nút tạo tất cả hóa đơn cho chi nhánh ── */}
      {selectedBranch &&
        !loadingRooms &&
        filteredRooms.length > 0 &&
        (() => {
          const eligibleRooms = filteredRooms.filter((r) => {
            const c = contracts[r.roomId] ?? contractCache[r.roomId];
            return (
              !!c &&
              !createdInvoices[c.contractId] &&
              getRoomStatus(r.roomId) === "done"
            );
          });
          const doneRooms = filteredRooms.filter((r) => {
            const c = contracts[r.roomId] ?? contractCache[r.roomId];
            return !!c && createdInvoices[c.contractId];
          });
          const allDone = eligibleRooms.length === 0 && doneRooms.length > 0;
          return (
            <div
              className="d-flex align-items-center gap-3 mb-3 p-3 rounded-3"
              style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1" }}
            >
              <div className="flex-fill">
                <div className="fw-semibold small text-dark">
                  Tạo hóa đơn hàng loạt
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {allDone
                    ? `✓ Đã tạo xong ${doneRooms.length} hóa đơn cho chi nhánh này`
                    : `${eligibleRooms.length} phòng đã ghi đủ chỉ số, chưa tạo hóa đơn T${month}/${year}`}
                </div>
                {bulkInvoiceResult && (
                  <div className="mt-1" style={{ fontSize: 12 }}>
                    <span className="text-success fw-semibold">
                      ✓ {bulkInvoiceResult.success} thành công
                    </span>
                    {bulkInvoiceResult.failed > 0 && (
                      <span className="text-danger fw-semibold ms-2">
                        ✗ {bulkInvoiceResult.failed} thất bại
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                className={`btn btn-sm fw-semibold d-flex align-items-center gap-2 flex-shrink-0 ${allDone ? "btn-success disabled" : bulkInvoiceLoading ? "btn-secondary" : "btn-primary"}`}
                disabled={
                  allDone || bulkInvoiceLoading || eligibleRooms.length === 0
                }
                onClick={async () => {
                  if (bulkInvoiceLoading || eligibleRooms.length === 0) return;
                  setBulkInvoiceLoading(true);
                  setBulkInvoiceResult(null);
                  let success = 0,
                    failed = 0;
                  for (const r of eligibleRooms) {
                    const c = contracts[r.roomId] ?? contractCache[r.roomId];
                    if (!c) continue;
                    try {
                      await apiInvoice.createManual(c.contractId, month, year);
                      setCreatedInvoices((prev) => ({
                        ...prev,
                        [c.contractId]: true,
                      }));
                      success++;
                    } catch {
                      failed++;
                    }
                  }
                  setBulkInvoiceLoading(false);
                  setBulkInvoiceResult({ success, failed });
                }}
              >
                {bulkInvoiceLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      style={{ width: 13, height: 13 }}
                    />
                    Đang tạo...
                  </>
                ) : allDone ? (
                  <>
                    <FaCheck size={12} /> Đã tạo tất cả
                  </>
                ) : (
                  <>
                    <FaFileInvoiceDollar size={13} /> Tạo tất cả (
                    {eligibleRooms.length})
                  </>
                )}
              </button>
            </div>
          );
        })()}

      {/* ── Nội dung chính ── */}
      {!selectedBranch ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <FaBuilding
              size={36}
              className="text-secondary opacity-25 mb-3 d-block mx-auto"
            />
            <p className="text-muted small mb-0">
              Chọn chi nhánh để bắt đầu ghi chỉ số
            </p>
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
            <FaDoorOpen
              size={28}
              className="text-secondary opacity-25 mb-2 d-block mx-auto"
            />
            <p className="text-muted small mb-0">Không tìm thấy phòng nào</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredRooms.map((room) => {
            const expanded = expandedRooms[room.roomId];
            const roomStatus = getRoomStatus(room.roomId);
            const statusCfg = STATUS_CONFIG[roomStatus];
            const contract =
              contracts[room.roomId] ?? contractCache[room.roomId];

            return (
              <div
                key={room.roomId}
                className={`card border-0 shadow-sm rounded-3 overflow-hidden ${expanded ? "border border-primary" : ""}`}
                style={{ transition: "all 0.18s" }}
              >
                {/* Room header */}
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

                  <div className="flex-fill" style={{ minWidth: 0 }}>
                    <div className="fw-bold text-dark small">
                      {room.roomName}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {room.floorName} · {room.branchName}
                    </div>
                    {/* Contract badge — always visible */}
                    {contractCache[room.roomId] !== undefined ||
                    contracts[room.roomId] !== undefined ? (
                      contract ? (
                        <div
                          className="mt-1 d-flex align-items-center gap-1"
                          style={{ fontSize: 11 }}
                        >
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              fontSize: 10,
                            }}
                          >
                            HĐ #{contract.contractId}
                          </span>
                          <span className="text-success fw-semibold">
                            · Có hợp đồng
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1" style={{ fontSize: 11 }}>
                          <span className="text-warning fw-semibold">
                            ⚠ Chưa có hợp đồng
                          </span>
                        </div>
                      )
                    ) : (
                      <div
                        className="mt-1"
                        style={{ fontSize: 10, color: "#aaa" }}
                      >
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          style={{ width: 8, height: 8 }}
                        />
                        Đang tải HĐ...
                      </div>
                    )}
                  </div>

                  <span
                    className={`badge rounded-pill fw-semibold flex-shrink-0 ${statusCfg.badge}`}
                    style={{ fontSize: 11 }}
                  >
                    {statusCfg.label}
                  </span>

                  <FaChevronRight
                    size={11}
                    className="text-muted flex-shrink-0"
                    style={{
                      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="border-top px-3 pb-3 pt-2">
                    {!readings[room.roomId] ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-secondary me-2" />
                        <span className="text-muted small">
                          Đang tải chỉ số...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="row g-3 mt-1">
                          {SERVICES.map((svc) => {
                            const rd = readings[room.roomId]?.[svc.id] || {};
                            const hasContract = !!contract;

                            const usage =
                              hasContract &&
                              rd.newValue &&
                              !isNaN(Number(rd.newValue))
                                ? Math.max(
                                    0,
                                    Number(rd.newValue) - (rd.oldValue || 0),
                                  )
                                : null;
                            const isSaved = rd.status === "saved";
                            const isInitialSaved =
                              rd.status === "initial_saved";
                            const isLoading = rd.status === "loading";
                            const hasError = rd.status === "error";

                            return (
                              <div key={svc.id} className="col-md-6">
                                <div
                                  className={`rounded-3 p-3 ${svc.bgClass}`}
                                  style={{
                                    border: `1.5px solid ${isSaved ? svc.borderColor + "80" : isInitialSaved ? svc.borderColor + "60" : svc.borderColor + "30"}`,
                                  }}
                                >
                                  {/* Card header */}
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <span className={svc.colorClass}>
                                      {svc.icon}
                                    </span>
                                    <span className="fw-bold small">
                                      {svc.label}
                                    </span>

                                    {isSaved && (
                                      <span
                                        className="badge bg-success-subtle text-success ms-auto d-flex align-items-center gap-1"
                                        style={{ fontSize: 11 }}
                                      >
                                        <FaCheck size={9} /> Đã lưu
                                      </span>
                                    )}
                                    {isInitialSaved && (
                                      <span
                                        className="badge bg-info-subtle text-info ms-auto d-flex align-items-center gap-1"
                                        style={{ fontSize: 11 }}
                                      >
                                        <FaCheck size={9} /> Đã lưu số đầu
                                      </span>
                                    )}

                                    {/* Nút sửa lại khi đã lưu */}
                                    {isSaved && (
                                      <button
                                        className="btn btn-link btn-sm text-warning p-0 ms-1 d-flex align-items-center gap-1"
                                        style={{ fontSize: 11 }}
                                        title="Sửa lại chỉ số"
                                        onClick={() =>
                                          handleEditClick(room.roomId, svc.id)
                                        }
                                      >
                                        <FaPencilAlt size={10} /> Sửa
                                      </button>
                                    )}
                                  </div>

                                  {!hasContract ? (
                                    /* ── Phòng CHƯA có HĐ: nhập chỉ số khởi đầu ── */
                                    <>
                                      <div
                                        className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2"
                                        style={{ fontSize: 12 }}
                                      >
                                        <FaInfoCircle className="flex-shrink-0" />
                                        <span>
                                          Phòng chưa có hợp đồng. Nhập chỉ số
                                          hiện tại trên đồng hồ để làm{" "}
                                          <strong>số gốc</strong> cho người thuê
                                          tiếp theo.
                                        </span>
                                      </div>
                                      <div className="mb-2">
                                        <label className="form-label small fw-semibold text-muted mb-1">
                                          Chỉ số đồng hồ hiện tại ({svc.unit})
                                        </label>
                                        <div className="d-flex gap-2">
                                          <input
                                            type="number"
                                            min={0}
                                            className={`form-control form-control-sm fw-bold ${hasError ? "is-invalid" : isInitialSaved ? "border-info bg-info-subtle" : ""}`}
                                            value={rd.initialValue || ""}
                                            onChange={(e) =>
                                              updateReading(
                                                room.roomId,
                                                svc.id,
                                                "initialValue",
                                                e.target.value,
                                              )
                                            }
                                            placeholder={`VD: 1234 — số đang hiển thị trên đồng hồ`}
                                            disabled={
                                              isInitialSaved || isLoading
                                            }
                                          />
                                          <button
                                            className={`btn btn-sm fw-bold d-flex align-items-center gap-1 flex-shrink-0 ${isInitialSaved ? "btn-info" : "btn-secondary"}`}
                                            onClick={() =>
                                              handleSaveClick(
                                                room.roomId,
                                                svc.id,
                                              )
                                            }
                                            disabled={
                                              !rd.initialValue ||
                                              isInitialSaved ||
                                              isLoading
                                            }
                                          >
                                            {isLoading ? (
                                              <span
                                                className="spinner-border spinner-border-sm"
                                                style={{
                                                  width: 12,
                                                  height: 12,
                                                }}
                                              />
                                            ) : isInitialSaved ? (
                                              <FaCheck size={11} />
                                            ) : (
                                              "Lưu"
                                            )}
                                          </button>
                                        </div>
                                        {hasError && (
                                          <div className="text-danger small mt-1">
                                            <FaInfoCircle className="me-1" />{" "}
                                            {rd.errMsg}
                                          </div>
                                        )}
                                        {isInitialSaved && (
                                          <div className="text-info small mt-1">
                                            <FaInfoCircle className="me-1" />
                                            Số{" "}
                                            <strong>
                                              {rd.initialValue} {svc.unit}
                                            </strong>{" "}
                                            sẽ là chỉ số kỳ trước khi người thuê
                                            đầu tiên vào.
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    /* ── Phòng CÓ HĐ: nhập chỉ số mới bình thường ── */
                                    <>
                                      <div className="d-flex justify-content-between mb-3">
                                        <div>
                                          <div
                                            className="text-muted text-uppercase fw-semibold mb-1"
                                            style={{ fontSize: 10 }}
                                          >
                                            Kỳ trước
                                          </div>
                                          <div className="fw-bold fs-5 text-secondary">
                                            {rd.oldValue ?? 0}{" "}
                                            <span className="small fw-normal">
                                              {svc.unit}
                                            </span>
                                          </div>
                                        </div>
                                        {usage !== null && (
                                          <div className="text-end">
                                            <div
                                              className="text-muted text-uppercase fw-semibold mb-1"
                                              style={{ fontSize: 10 }}
                                            >
                                              Tiêu thụ
                                            </div>
                                            <div
                                              className={`fw-bold fs-5 ${svc.colorClass}`}
                                            >
                                              +{usage}{" "}
                                              <span className="small fw-normal">
                                                {svc.unit}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>

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
                                            onChange={(e) =>
                                              updateReading(
                                                room.roomId,
                                                svc.id,
                                                "newValue",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Nhập chỉ số..."
                                            disabled={isSaved}
                                          />
                                          <button
                                            className={`btn btn-sm fw-bold d-flex align-items-center gap-1 flex-shrink-0 ${isSaved ? "btn-success" : "btn-dark"}`}
                                            onClick={() =>
                                              handleSaveClick(
                                                room.roomId,
                                                svc.id,
                                              )
                                            }
                                            disabled={
                                              !rd.newValue ||
                                              isSaved ||
                                              isLoading
                                            }
                                          >
                                            {isLoading ? (
                                              <span
                                                className="spinner-border spinner-border-sm"
                                                style={{
                                                  width: 12,
                                                  height: 12,
                                                }}
                                              />
                                            ) : isSaved ? (
                                              <FaCheck size={11} />
                                            ) : (
                                              "Lưu"
                                            )}
                                          </button>
                                        </div>
                                        {hasError && (
                                          <div className="text-danger small mt-1">
                                            <FaInfoCircle className="me-1" />{" "}
                                            {rd.errMsg}
                                          </div>
                                        )}
                                      </div>

                                      <ImageCapture
                                        serviceColor={svc.borderColor}
                                        imagePreview={rd.imagePreview}
                                        imageName={rd.image?.name}
                                        imageSize={rd.image?.size}
                                        isSaved={isSaved}
                                        serviceId={svc.id}
                                        onFile={({ file, preview }) =>
                                          handleImageFile(room.roomId, svc.id, {
                                            file,
                                            preview,
                                          })
                                        }
                                        onRemove={() =>
                                          removeImage(room.roomId, svc.id)
                                        }
                                        onOCRComplete={(value) =>
                                          handleOCRValue(
                                            room.roomId,
                                            svc.id,
                                            value,
                                          )
                                        }
                                        overlayType="rectangle"
                                        aspectRatio={4 / 3}
                                      />

                                      {isSaved && rd.imagePreview && (
                                        <div
                                          className="d-flex align-items-center gap-2 mt-2 p-2 rounded bg-white bg-opacity-50"
                                          style={{ cursor: "zoom-in" }}
                                          onClick={() =>
                                            setLightbox(rd.imagePreview)
                                          }
                                        >
                                          <img
                                            src={rd.imagePreview}
                                            alt="meter"
                                            style={{
                                              width: 40,
                                              height: 32,
                                              objectFit: "cover",
                                            }}
                                            className="rounded"
                                          />
                                          <span className="small text-secondary">
                                            Xem ảnh đồng hồ
                                          </span>
                                          <FaExpand className="ms-auto text-secondary" />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
                          <div className="small text-muted">
                            {contract ? (
                              <>
                                Hợp đồng{" "}
                                <strong className="text-primary">
                                  #{contract.contractId}
                                </strong>{" "}
                                · {contract.status}
                              </>
                            ) : (
                              <span className="text-warning">
                                ⚠ Phòng chưa có hợp đồng — không thể tạo hóa đơn
                              </span>
                            )}
                          </div>
                          {(() => {
                            const invoiceCreated =
                              contract && createdInvoices[contract.contractId];
                            return (
                              <button
                                className={`btn btn-sm fw-semibold d-flex align-items-center gap-2 ${
                                  !contract
                                    ? "btn-secondary opacity-50"
                                    : invoiceCreated
                                      ? "btn-success"
                                      : roomStatus === "done"
                                        ? "btn-primary"
                                        : "btn-secondary"
                                }`}
                                disabled={!contract || invoiceCreated}
                                title={
                                  !contract
                                    ? "Cần có hợp đồng active trước khi tạo hóa đơn"
                                    : invoiceCreated
                                      ? `Đã tạo hóa đơn T${month}/${year}`
                                      : ""
                                }
                                onClick={() =>
                                  !invoiceCreated &&
                                  contract &&
                                  setInvoiceModal({
                                    contractId: contract.contractId,
                                    roomName: room.roomName,
                                  })
                                }
                              >
                                <FaFileInvoiceDollar size={13} />
                                {!contract
                                  ? "Tạo hóa đơn (cần hợp đồng)"
                                  : invoiceCreated
                                    ? `✓ Đã tạo hóa đơn T${month}/${year}`
                                    : roomStatus === "done"
                                      ? `Tạo hóa đơn T${month}/${year}`
                                      : "Tạo hóa đơn (chưa ghi đủ)"}
                                {!invoiceCreated && <FaArrowRight size={11} />}
                              </button>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Nút Xem thêm */}
          {hasMorePages && (
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                style={{
                  background: loadingMore ? "#f1f5f9" : "#fff",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: 12,
                  color: "#64748b",
                  fontSize: 13,
                  transition: "all 0.15s",
                  boxShadow: loadingMore
                    ? "none"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
                onClick={loadMoreRooms}
                disabled={loadingMore}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.borderColor = "#94a3b8";
                    e.currentTarget.style.color = "#334155";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                {loadingMore ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      style={{ width: 14, height: 14 }}
                    />
                    Đang tải thêm...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
                    Xem thêm phòng
                    <span
                      className="badge rounded-pill ms-1"
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {rooms.length}/{totalRooms}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
