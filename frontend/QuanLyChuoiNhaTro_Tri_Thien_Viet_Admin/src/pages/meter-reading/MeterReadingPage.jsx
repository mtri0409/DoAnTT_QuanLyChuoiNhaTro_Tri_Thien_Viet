import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaTint,
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaCamera,
  FaCheck,
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaChevronRight,
  FaInfoCircle,
  FaCalculator,
  FaFileInvoiceDollar,
  FaPlus,
} from "react-icons/fa";
import apiBranches from "../../api/apiBranches";
import apiFloor from "../../api/apiFloor";
import apiRoom from "../../api/apiRoom";
import apiMeterReading from "../../api/apiMeterReading";
import apiInvoice from "../../api/apiInvoice";
import apiContract from "../../api/apiContract";

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const SERVICES = [
  {
    id: 1,
    label: "Điện",
    icon: <FaBolt />,
    color: "#f59e0b",
    bg: "#fef3c7",
    unit: "kWh",
  },
  {
    id: 2,
    label: "Nước",
    icon: <FaTint />,
    color: "#3b82f6",
    bg: "#dbeafe",
    unit: "m³",
  },
];

// ── Modal tạo hóa đơn thủ công ────────────────────────────────────────────────
function CreateInvoiceModal({
  onClose,
  onCreated,
  defaultContractId = "",
  defaultMonth,
  defaultYear,
}) {
  const [contractId, setContractId] = useState(String(defaultContractId));
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!contractId) {
      setError("Vui lòng nhập ID hợp đồng");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiInvoice.createManual(
        Number(contractId),
        month,
        year,
      );
      alert(`✅ Tạo hóa đơn thành công! ID: #${res.invoiceId}`);
      onCreated(res);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Lỗi tạo hóa đơn. Kiểm tra lại contractId và kỳ.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          width: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <FaFileInvoiceDollar style={{ color: "#6366f1", fontSize: 20 }} />
          <h3
            style={{
              margin: 0,
              fontWeight: 800,
              color: "#0f172a",
              fontSize: 17,
            }}
          >
            Tạo hóa đơn thủ công
          </h3>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
          Hệ thống sẽ tạo hóa đơn DRAFT dựa trên chỉ số đã ghi và các dịch vụ
          trong hợp đồng.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 6,
            }}
          >
            ID Hợp đồng *
          </label>
          <input
            type="number"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Nhập contract ID..."
            style={{
              width: "100%",
              padding: "10px 14px",
              border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Tháng
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Năm
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              color: "#dc2626",
              fontSize: 13,
            }}
          >
            <FaInfoCircle style={{ marginRight: 6 }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: 8,
              border: "none",
              background: loading
                ? "#a5b4fc"
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              "Đang tạo..."
            ) : (
              <>
                <FaCheck /> Tạo hóa đơn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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

  // readings[roomId][serviceId] = { newValue, oldValue, image, status, savedValue, errMsg }
  const [readings, setReadings] = useState({});
  // contracts[roomId] = contractObject | null
  const [contracts, setContracts] = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Modal tạo hóa đơn
  const [invoiceModal, setInvoiceModal] = useState(null);

  // Load branches
  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res.content || res || []))
      .catch(() => setBranches([]));
  }, []);

  // Load floors khi đổi chi nhánh
  useEffect(() => {
    if (!selectedBranch) {
      setFloors([]);
      setSelectedFloor("");
      return;
    }
    apiFloor
      .getAllFloors()
      .then((res) => {
        const all = Array.isArray(res) ? res : res.content || [];
        setFloors(
          all.filter((f) => String(f.branchId) === String(selectedBranch)),
        );
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
    apiRoom
      .getAllRooms(
        0,
        100,
        "roomName",
        "asc",
        selectedFloor || null,
        selectedBranch || null,
        searchRoom,
      )
      .then((res) => setRooms(res.content || []))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom]);

  // Khi đổi tháng/năm → reset để force reload khi mở lại
  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
  }, [month, year]);

  // Load dữ liệu khi mở 1 phòng
  // FIX CHÍNH: gọi getByRoomAndPeriod để biết kỳ này đã ghi chưa
  const loadRoomData = useCallback(
    async (roomId) => {
      const initReadings = {};
      SERVICES.forEach((svc) => {
        initReadings[svc.id] = {
          newValue: "",
          oldValue: 0,
          image: null,
          status: "idle",
          savedValue: null,
        };
      });

      // Chạy song song
      const [currentPeriod, contractRes] = await Promise.allSettled([
        apiMeterReading.getByRoomAndPeriod(roomId, month, year),
        apiContract.getContractsByRoom(roomId),
      ]);

      // ── Xử lý chỉ số đã ghi trong kỳ này ──────────────────────────────────
      if (currentPeriod.status === "fulfilled") {
        const existing = Array.isArray(currentPeriod.value)
          ? currentPeriod.value
          : [];
        existing.forEach((r) => {
          // serviceId có thể là number hoặc string tùy backend
          const sid = Number(r.serviceId);
          if (initReadings[sid]) {
            initReadings[sid] = {
              newValue: String(r.newValue ?? ""),
              oldValue: r.oldValue ?? 0,
              savedValue: r.newValue,
              status: "saved", // ← ĐÃ GHI → hiện badge "Đã lưu"
              image: null,
            };
          }
        });
      }

      // ── Với service chưa ghi → load oldValue từ kỳ trước ─────────────────
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
              if (prev) initReadings[svc.id].oldValue = prev.newValue ?? 0;
            } catch {
              /* không có kỳ trước → giữ 0 */
            }
          },
        ),
      );

      setReadings((prev) => ({ ...prev, [roomId]: initReadings }));

      // ── Xử lý contract ────────────────────────────────────────────────────
      if (contractRes.status === "fulfilled") {
        const list = Array.isArray(contractRes.value)
          ? contractRes.value
          : contractRes.value?.content || [];
        const active =
          list.find((c) => c.status === "ACTIVE") || list[0] || null;
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
    // Load mỗi khi mở (kể cả lần 2) để luôn đồng bộ DB
    if (next) loadRoomData(roomId);
  };

  const updateReading = (roomId, serviceId, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: {
          ...prev[roomId]?.[serviceId],
          [field]: value,
          ...(field === "newValue" ? { status: "idle" } : {}),
        },
      },
    }));
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
      await apiMeterReading.saveReading(
        roomId,
        serviceId,
        val,
        month,
        year,
        r.image,
      );
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

  const filteredRooms = rooms.filter(
    (r) =>
      !searchRoom ||
      r.roomName?.toLowerCase().includes(searchRoom.toLowerCase()),
  );

  const getRoomStatus = (roomId) => {
    const r = readings[roomId];
    if (!r) return "pending";
    const statuses = SERVICES.map((s) => r[s.id]?.status);
    if (statuses.every((s) => s === "saved")) return "done";
    if (statuses.some((s) => s === "saved")) return "partial";
    return "pending";
  };

  const STATUS_COLOR = {
    done: "#10b981",
    partial: "#f59e0b",
    pending: "#94a3b8",
  };
  const STATUS_LABEL = {
    done: "✓ Đã xong",
    partial: "~ Ghi dở",
    pending: "Chưa ghi",
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "#f0f4f8",
      }}
    >
      {invoiceModal && (
        <CreateInvoiceModal
          defaultContractId={invoiceModal.contractId}
          defaultMonth={month}
          defaultYear={year}
          onClose={() => setInvoiceModal(null)}
          onCreated={() => navigate("/invoice")}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "24px 32px 20px",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    background: "#f59e0b",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 18,
                  }}
                >
                  <FaCalculator />
                </div>
                <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>
                  Ghi Chỉ Số Điện – Nước
                </h1>
              </div>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                Chọn chi nhánh → mở phòng → nhập chỉ số → tạo hóa đơn
              </p>
            </div>

            {/* Nút tạo hóa đơn thủ công độc lập (không cần chọn phòng) */}
            <button
              onClick={() => setInvoiceModal({ contractId: "", roomName: "" })}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "#6366f1",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaPlus /> Tạo hóa đơn thủ công
            </button>
          </div>

          {/* Period selector */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "8px 18px",
              }}
            >
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Kỳ
              </span>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} style={{ background: "#1e293b" }}>
                    Tháng {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
              <span style={{ color: "#475569" }}>/</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} style={{ background: "#1e293b" }}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* Filters */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              <FaBuilding style={{ marginRight: 4 }} />
              Chi nhánh
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                background: "#f8fafc",
              }}
            >
              <option value="">-- Chọn chi nhánh --</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              <FaLayerGroup style={{ marginRight: 4 }} />
              Tầng
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              disabled={!selectedBranch}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                background: selectedBranch ? "#f8fafc" : "#f1f5f9",
              }}
            >
              <option value="">-- Tất cả tầng --</option>
              {floors.map((f) => (
                <option key={f.floorId} value={f.floorId}>
                  {f.floorName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1 1 220px" }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 5,
              }}
            >
              <FaSearch style={{ marginRight: 4 }} />
              Tìm phòng
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Tên phòng..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  background: "#f8fafc",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <FaSearch
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: 12,
                }}
              />
              {searchRoom && (
                <button
                  onClick={() => setSearchRoom("")}
                  style={{
                    position: "absolute",
                    right: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {selectedBranch && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Tổng phòng",
                val: filteredRooms.length,
                color: "#6366f1",
              },
              {
                label: "Đã ghi xong",
                val: filteredRooms.filter(
                  (r) => getRoomStatus(r.roomId) === "done",
                ).length,
                color: "#10b981",
              },
              {
                label: "Ghi dở",
                val: filteredRooms.filter(
                  (r) => getRoomStatus(r.roomId) === "partial",
                ).length,
                color: "#f59e0b",
              },
              {
                label: "Chưa ghi",
                val: filteredRooms.filter(
                  (r) => getRoomStatus(r.roomId) === "pending",
                ).length,
                color: "#ef4444",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "10px 18px",
                  boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                  {s.val}
                </span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {!selectedBranch ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "60px",
              textAlign: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <FaBuilding
              style={{ fontSize: 38, color: "#e2e8f0", marginBottom: 14 }}
            />
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Chọn chi nhánh để bắt đầu ghi chỉ số
            </p>
          </div>
        ) : loadingRooms ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#64748b" }}
          >
            Đang tải phòng...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}
          >
            Không tìm thấy phòng nào
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredRooms.map((room) => {
              const expanded = expandedRooms[room.roomId];
              const roomStatus = getRoomStatus(room.roomId);
              const sc = STATUS_COLOR[roomStatus];
              const sl = STATUS_LABEL[roomStatus];
              const contract = contracts[room.roomId];

              return (
                <div
                  key={room.roomId}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1.5px solid ${expanded ? "#6366f1" : "#e2e8f0"}`,
                    boxShadow: expanded
                      ? "0 4px 18px rgba(99,102,241,0.1)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "all 0.18s",
                  }}
                >
                  {/* Room header */}
                  <button
                    onClick={() => toggleRoom(room.roomId)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        flexShrink: 0,
                        background: expanded ? "#ede9fe" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: expanded ? "#6366f1" : "#64748b",
                        fontSize: 15,
                      }}
                    >
                      <FaDoorOpen />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: 14,
                        }}
                      >
                        {room.roomName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}
                      >
                        {room.floorName} · {room.branchName}
                        {contract && (
                          <span
                            style={{
                              color: "#6366f1",
                              marginLeft: 8,
                              fontWeight: 600,
                            }}
                          >
                            HĐ #{contract.contractId}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: `${sc}18`,
                        color: sc,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sl}
                    </span>
                    <FaChevronRight
                      style={{
                        color: "#94a3b8",
                        fontSize: 11,
                        flexShrink: 0,
                        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>

                  {/* Expanded */}
                  {expanded && (
                    <div
                      style={{
                        padding: "4px 18px 18px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {!readings[room.roomId] ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "30px",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          Đang tải chỉ số...
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              marginTop: 14,
                              flexWrap: "wrap",
                            }}
                          >
                            {SERVICES.map((svc) => {
                              const rd = readings[room.roomId]?.[svc.id] || {};
                              const usage =
                                rd.newValue && !isNaN(Number(rd.newValue))
                                  ? Math.max(
                                      0,
                                      Number(rd.newValue) - (rd.oldValue || 0),
                                    )
                                  : null;
                              const isSaved = rd.status === "saved";
                              const isLoading = rd.status === "loading";

                              return (
                                <div
                                  key={svc.id}
                                  style={{
                                    flex: "1 1 260px",
                                    border: `1.5px solid ${isSaved ? svc.color + "60" : svc.color + "30"}`,
                                    borderRadius: 12,
                                    padding: "14px",
                                    background: svc.bg,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      marginBottom: 12,
                                    }}
                                  >
                                    <span
                                      style={{ color: svc.color, fontSize: 17 }}
                                    >
                                      {svc.icon}
                                    </span>
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: "#0f172a",
                                      }}
                                    >
                                      {svc.label}
                                    </span>
                                    {isSaved && (
                                      <span
                                        style={{
                                          marginLeft: "auto",
                                          color: "#10b981",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                          background: "#d1fae5",
                                          padding: "2px 9px",
                                          borderRadius: 12,
                                        }}
                                      >
                                        <FaCheck style={{ fontSize: 10 }} /> Đã
                                        lưu
                                      </span>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <div>
                                      <div
                                        style={{
                                          fontSize: 10,
                                          color: "#64748b",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                          marginBottom: 2,
                                        }}
                                      >
                                        Kỳ trước
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 19,
                                          fontWeight: 800,
                                          color: "#475569",
                                        }}
                                      >
                                        {rd.oldValue ?? 0}{" "}
                                        <span style={{ fontSize: 11 }}>
                                          {svc.unit}
                                        </span>
                                      </div>
                                    </div>
                                    {usage !== null && (
                                      <div style={{ textAlign: "right" }}>
                                        <div
                                          style={{
                                            fontSize: 10,
                                            color: "#64748b",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            marginBottom: 2,
                                          }}
                                        >
                                          Tiêu thụ
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 19,
                                            fontWeight: 800,
                                            color: svc.color,
                                          }}
                                        >
                                          +{usage}{" "}
                                          <span style={{ fontSize: 11 }}>
                                            {svc.unit}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ marginBottom: 8 }}>
                                    <label
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                        display: "block",
                                        marginBottom: 5,
                                      }}
                                    >
                                      Chỉ số mới ({svc.unit})
                                    </label>
                                    <div style={{ display: "flex", gap: 7 }}>
                                      <input
                                        type="number"
                                        min={rd.oldValue || 0}
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
                                        style={{
                                          flex: 1,
                                          padding: "9px 11px",
                                          border: `1.5px solid ${rd.status === "error" ? "#ef4444" : isSaved ? "#10b981" : "#d1d5db"}`,
                                          borderRadius: 8,
                                          fontSize: 15,
                                          fontWeight: 700,
                                          background: isSaved
                                            ? "#f0fdf4"
                                            : "#fff",
                                          outline: "none",
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          handleSave(room.roomId, svc.id)
                                        }
                                        disabled={
                                          !rd.newValue || isSaved || isLoading
                                        }
                                        style={{
                                          padding: "9px 14px",
                                          borderRadius: 8,
                                          border: "none",
                                          cursor: "pointer",
                                          background: isSaved
                                            ? "#10b981"
                                            : svc.color,
                                          color: "#fff",
                                          fontWeight: 700,
                                          fontSize: 13,
                                          opacity:
                                            !rd.newValue || isSaved || isLoading
                                              ? 0.5
                                              : 1,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 5,
                                        }}
                                      >
                                        {isLoading ? (
                                          "..."
                                        ) : isSaved ? (
                                          <FaCheck />
                                        ) : (
                                          "Lưu"
                                        )}
                                      </button>
                                    </div>
                                    {rd.status === "error" && (
                                      <p
                                        style={{
                                          color: "#ef4444",
                                          fontSize: 12,
                                          margin: "4px 0 0",
                                        }}
                                      >
                                        <FaInfoCircle
                                          style={{ marginRight: 4 }}
                                        />
                                        {rd.errMsg}
                                      </p>
                                    )}
                                  </div>

                                  {!isSaved && (
                                    <label
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "#64748b",
                                        cursor: "pointer",
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        background: "rgba(255,255,255,0.6)",
                                        border: "1px dashed #cbd5e1",
                                      }}
                                    >
                                      <FaCamera />
                                      {rd.image
                                        ? rd.image.name
                                        : "Ảnh đồng hồ (tuỳ chọn)"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                          updateReading(
                                            room.roomId,
                                            svc.id,
                                            "image",
                                            e.target.files[0],
                                          )
                                        }
                                      />
                                    </label>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer action */}
                          <div
                            style={{
                              marginTop: 14,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {contract ? (
                                <>
                                  Hợp đồng{" "}
                                  <strong style={{ color: "#6366f1" }}>
                                    #{contract.contractId}
                                  </strong>{" "}
                                  · {contract.status}
                                </>
                              ) : (
                                <span style={{ color: "#f59e0b" }}>
                                  ⚠ Không tìm thấy hợp đồng active
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                setInvoiceModal({
                                  contractId: contract?.contractId || "",
                                  roomName: room.roomName,
                                })
                              }
                              style={{
                                padding: "9px 18px",
                                borderRadius: 9,
                                border: "none",
                                cursor: "pointer",
                                background:
                                  roomStatus === "done"
                                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                                    : "linear-gradient(135deg, #64748b, #475569)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                boxShadow:
                                  roomStatus === "done"
                                    ? "0 4px 12px rgba(99,102,241,0.25)"
                                    : "none",
                              }}
                            >
                              <FaFileInvoiceDollar />
                              {roomStatus === "done"
                                ? `Tạo hóa đơn T${month}/${year}`
                                : "Tạo hóa đơn (chưa ghi đủ)"}
                              <FaArrowRight style={{ fontSize: 11 }} />
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
