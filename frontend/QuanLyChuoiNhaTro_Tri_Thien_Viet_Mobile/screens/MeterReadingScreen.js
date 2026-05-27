// screens/MeterReadingScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import apiBranches from "../services/apiBranches";
import apiFloor from "../services/apiFloor";
import apiRoom from "../services/apiRoom";
import apiMeterReading from "../services/apiMeterReading";
import ImageCapture from "../components/readings/ImageCapture";
import { useAuth } from "../context/AuthContext";

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const SERVICES = [
  {
    id: 1,
    label: "Điện",
    emoji: "⚡",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    unit: "kWh",
  },
  {
    id: 2,
    label: "Nước",
    emoji: "💧",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    unit: "m³",
  },
];

const STATUS_CONFIG = {
  done: { label: "✓ Đã xong", color: "#16a34a", bg: "#f0fdf4" },
  partial: { label: "~ Ghi dở", color: "#d97706", bg: "#fffbeb" },
  pending: { label: "• Chưa ghi", color: "#6b7280", bg: "#f9fafb" },
};

// ─── Picker Modal ─────────────────────────────────────────────────────────────
function PickerModal({
  visible,
  title,
  data,
  valueKey,
  labelKey,
  onSelect,
  onClose,
  selectedValue,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => String(item[valueKey])}
            renderItem={({ item }) => {
              const isSelected =
                String(item[valueKey]) === String(selectedValue);
              return (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item[valueKey]);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item[labelKey]}
                  </Text>
                  {isSelected && <Text style={{ color: "#3b82f6" }}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Logout Modal ──────────────────────────────────────────────────────────────
function LogoutModal({ visible, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.logoutOverlay}>
        <View style={styles.logoutSheet}>
          <Text style={styles.logoutIcon}>👋</Text>
          <Text style={styles.logoutTitle}>Đăng xuất?</Text>
          <Text style={styles.logoutSub}>
            Bạn có chắc muốn đăng xuất khỏi hệ thống?
          </Text>
          <View style={styles.logoutBtns}>
            <TouchableOpacity style={styles.logoutCancelBtn} onPress={onCancel}>
              <Text style={styles.logoutCancelText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutConfirmBtn}
              onPress={onConfirm}
            >
              <Text style={styles.logoutConfirmText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({
  svc,
  rd,
  roomId,
  onUpdate,
  onSave,
  onFile,
  onRemove,
  onOCR,
}) {
  const isSaved = rd?.status === "saved";
  const isLoading = rd?.status === "loading";
  const hasError = rd?.status === "error";
  const usage =
    rd?.newValue && !isNaN(Number(rd.newValue))
      ? Math.max(0, Number(rd.newValue) - (rd?.oldValue || 0))
      : null;

  return (
    <View
      style={[
        styles.serviceCard,
        {
          backgroundColor: svc.bgColor,
          borderColor: isSaved ? svc.color + "80" : svc.color + "30",
        },
      ]}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceEmoji}>{svc.emoji}</Text>
        <Text style={[styles.serviceLabel, { color: svc.color }]}>
          {svc.label}
        </Text>
        {isSaved && (
          <View style={[styles.savedBadge, { backgroundColor: "#dcfce7" }]}>
            <Text style={styles.savedBadgeText}>✓ Đã lưu</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statsLabel}>Kỳ trước</Text>
          <Text style={styles.statsValue}>
            {rd?.oldValue ?? 0} <Text style={styles.statsUnit}>{svc.unit}</Text>
          </Text>
        </View>
        {usage !== null && (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.statsLabel}>Tiêu thụ</Text>
            <Text style={[styles.statsValue, { color: svc.color }]}>
              +{usage} <Text style={styles.statsUnit}>{svc.unit}</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.numberInput,
            isSaved && styles.numberInputSaved,
            hasError && styles.numberInputError,
          ]}
          placeholder={`Chỉ số mới (${svc.unit})`}
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={rd?.newValue || ""}
          onChangeText={(v) => onUpdate(svc.id, "newValue", v)}
          editable={!isSaved}
        />
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: isSaved ? "#16a34a" : "#111827" },
            (!rd?.newValue || isSaved || isLoading) && styles.saveBtnDisabled,
          ]}
          onPress={() => onSave(svc.id)}
          disabled={!rd?.newValue || isSaved || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{isSaved ? "✓" : "Lưu"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {hasError && <Text style={styles.errorText}>⚠ {rd?.errMsg}</Text>}

      <ImageCapture
        serviceColor={svc.color}
        serviceId={svc.id}
        imageUri={rd?.imageUri}
        isSaved={isSaved}
        onFile={(uri) => onFile(svc.id, uri)}
        onRemove={() => onRemove(svc.id)}
        onOCRComplete={(val) => onOCR(svc.id, val)}
      />
    </View>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({
  room,
  expanded,
  readings,
  roomStatusCache,
  onToggle,
  onUpdateReading,
  onSave,
  onFile,
  onRemove,
  onOCR,
}) {
  // Ưu tiên dùng readings state nếu đã load, fallback về cache từ server
  const roomStatus = (() => {
    const r = readings[room.roomId];
    if (r) {
      // Đã load full data → tính từ state
      const statuses = SERVICES.map((s) => r[s.id]?.status);
      if (statuses.every((s) => s === "saved")) return "done";
      if (statuses.some((s) => s === "saved")) return "partial";
      return "pending";
    }
    // Chưa mở → dùng cache status từ server
    return roomStatusCache[room.roomId] ?? "pending";
  })();
  const statusCfg = STATUS_CONFIG[roomStatus];

  return (
    <View style={[styles.roomCard, expanded && styles.roomCardExpanded]}>
      <TouchableOpacity
        style={styles.roomHeader}
        onPress={() => onToggle(room.roomId)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.roomIcon,
            { backgroundColor: expanded ? "#dbeafe" : "#f3f4f6" },
          ]}
        >
          <Text style={{ fontSize: 18 }}>🚪</Text>
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.roomName}</Text>
          <Text style={styles.roomSub} numberOfLines={1}>
            {room.floorName} · {room.branchName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
        <Text
          style={[
            styles.chevron,
            { transform: [{ rotate: expanded ? "90deg" : "0deg" }] },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.roomBody}>
          {!readings[room.roomId] ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#9ca3af" />
              <Text style={styles.loadingText}>Đang tải chỉ số...</Text>
            </View>
          ) : (
            SERVICES.map((svc) => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                rd={readings[room.roomId]?.[svc.id]}
                roomId={room.roomId}
                onUpdate={(sid, field, val) =>
                  onUpdateReading(room.roomId, sid, field, val)
                }
                onSave={(sid) => onSave(room.roomId, sid)}
                onFile={(sid, uri) => onFile(room.roomId, sid, uri)}
                onRemove={(sid) => onRemove(room.roomId, sid)}
                onOCR={(sid, val) => onOCR(room.roomId, sid, val)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function MeterReadingScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [searchRoom, setSearchRoom] = useState("");
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [readings, setReadings] = useState({});
  // ✅ FIX: Cache trạng thái phòng từ server (không cần mở phòng mới biết)
  const [roomStatusCache, setRoomStatusCache] = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showFloorPicker, setShowFloorPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${String(i + 1).padStart(2, "0")}`,
  }));
  const YEARS = [2024, 2025, 2026, 2027].map((y) => ({
    value: y,
    label: String(y),
  }));

  // Load branches
  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res.content || res || []))
      .catch(() => setBranches([]));
  }, []);

  // Load floors khi đổi chi nhánh
  useEffect(() => {
    setSelectedFloor(null);
    setFloors([]);
    setRooms([]);
    setReadings({});
    setRoomStatusCache({});
    setExpandedRooms({});
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
          floorName: f.floorName ?? f.name ?? `Tầng ${f.floorId ?? f.id}`,
        }));

        const filtered = all.filter(
          (f) => String(f.branchId) === String(selectedBranch),
        );
        const reIndexed = filtered
          .sort((a, b) => a.floorId - b.floorId)
          .map((f, index) => ({ ...f, floorName: `Tầng ${index + 1}` }));

        setFloors(reIndexed);
      })
      .catch(() => setFloors([]));
  }, [selectedBranch]);

  // ✅ FIX: Load rooms + fetch trạng thái tất cả phòng ngầm
  useEffect(() => {
    if (!selectedBranch) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    setReadings({});
    setRoomStatusCache({});
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
      .then(async (res) => {
        const list = (res.content || []).map((r) => ({
          ...r,
          roomId: r.roomId ?? r.id,
        }));
        setRooms(list);

        // ✅ Fetch trạng thái tất cả phòng ngầm (không block UI)
        fetchAllRoomStatuses(list, month, year);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom]);

  // Reset khi đổi kỳ
  useEffect(() => {
    setReadings({});
    setExpandedRooms({});
    setRoomStatusCache({});
    if (rooms.length > 0) {
      fetchAllRoomStatuses(rooms, month, year);
    }
  }, [month, year]);

  // ✅ FIX: Hàm fetch trạng thái nhẹ cho tất cả phòng (chỉ lấy status, không load full)
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
        const savedServices = existing.filter((r) => r.newValue != null).length;
        if (savedServices === 0) newCache[roomId] = "pending";
        else if (savedServices >= SERVICES.length) newCache[roomId] = "done";
        else newCache[roomId] = "partial";
      } else {
        newCache[roomId] = "pending";
      }
    });
    setRoomStatusCache(newCache);
  }, []);

  // Load full data 1 phòng khi mở
  const loadRoomData = useCallback(
    async (roomId) => {
      const initReadings = {};
      SERVICES.forEach((svc) => {
        initReadings[svc.id] = {
          newValue: "",
          oldValue: 0,
          imageUri: null,
          status: "idle",
          savedValue: null,
        };
      });

      const [currentPeriod] = await Promise.allSettled([
        apiMeterReading.getByRoomAndPeriod(roomId, month, year),
      ]);

      if (currentPeriod.status === "fulfilled") {
        const existing = Array.isArray(currentPeriod.value)
          ? currentPeriod.value
          : [];
        existing.forEach((r) => {
          const sid = Number(r.serviceId);
          if (initReadings[sid]) {
            initReadings[sid] = {
              newValue: String(r.newValue ?? ""),
              oldValue: r.oldValue ?? 0,
              savedValue: r.newValue,
              status: "saved",
              imageUri: null,
            };
          }
        });
      }

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
              /* không có kỳ trước */
            }
          },
        ),
      );

      setReadings((prev) => ({ ...prev, [roomId]: initReadings }));
    },
    [month, year],
  );

  const toggleRoom = async (roomId) => {
    const next = !expandedRooms[roomId];
    setExpandedRooms((prev) => ({ ...prev, [roomId]: next }));
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
          ...(field === "newValue" && { status: "idle" }),
        },
      },
    }));
  };

  const handleFile = (roomId, serviceId, uri) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: { ...prev[roomId]?.[serviceId], imageUri: uri },
      },
    }));
  };

  const removeImage = (roomId, serviceId) =>
    handleFile(roomId, serviceId, null);

  const handleOCRValue = (roomId, serviceId, val) => {
    updateReading(roomId, serviceId, "newValue", String(val));
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
        r.imageUri,
      );
      setReadings((prev) => {
        const updated = {
          ...prev,
          [roomId]: {
            ...prev[roomId],
            [serviceId]: {
              ...prev[roomId][serviceId],
              status: "saved",
              savedValue: val,
            },
          },
        };
        // ✅ Cập nhật luôn roomStatusCache sau khi lưu thành công
        const statuses = SERVICES.map((s) => updated[roomId][s.id]?.status);
        const newStatus = statuses.every((s) => s === "saved")
          ? "done"
          : statuses.some((s) => s === "saved")
            ? "partial"
            : "pending";
        setRoomStatusCache((c) => ({ ...c, [roomId]: newStatus }));
        return updated;
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi lưu chỉ số";
      Alert.alert("Lỗi", msg);
      setReadings((prev) => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [serviceId]: {
            ...prev[roomId][serviceId],
            status: "error",
            errMsg: msg,
          },
        },
      }));
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setReadings({});
    setExpandedRooms({});
    await fetchAllRoomStatuses(rooms, month, year);
    setRefreshing(false);
  };

  const filteredRooms = rooms.filter(
    (r) =>
      !searchRoom ||
      r.roomName?.toLowerCase().includes(searchRoom.toLowerCase()),
  );

  // ✅ Stats tính từ cache (không cần mở phòng)
  const statsMap = {
    Tổng: filteredRooms.length,
    Xong: filteredRooms.filter((r) => {
      const rd = readings[r.roomId];
      if (rd) return SERVICES.every((s) => rd[s.id]?.status === "saved");
      return roomStatusCache[r.roomId] === "done";
    }).length,
    Dở: filteredRooms.filter((r) => {
      const rd = readings[r.roomId];
      if (rd)
        return (
          SERVICES.some((s) => rd[s.id]?.status === "saved") &&
          !SERVICES.every((s) => rd[s.id]?.status === "saved")
        );
      return roomStatusCache[r.roomId] === "partial";
    }).length,
    Chưa: filteredRooms.filter((r) => {
      const rd = readings[r.roomId];
      if (rd) return SERVICES.every((s) => rd[s.id]?.status !== "saved");
      return (
        !roomStatusCache[r.roomId] || roomStatusCache[r.roomId] === "pending"
      );
    }).length,
  };

  const STAT_COLORS = {
    Tổng: "#3b82f6",
    Xong: "#16a34a",
    Dở: "#d97706",
    Chưa: "#ef4444",
  };

  const selectedBranchName =
    branches.find((b) => String(b.branchId) === String(selectedBranch))
      ?.branchName || "Chọn chi nhánh";
  const selectedFloorName =
    floors.find((f) => String(f.floorId) === String(selectedFloor))
      ?.floorName || "Tất cả tầng";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Pickers */}
      <PickerModal
        visible={showBranchPicker}
        title="Chọn chi nhánh"
        data={branches}
        valueKey="branchId"
        labelKey="branchName"
        selectedValue={selectedBranch}
        onSelect={setSelectedBranch}
        onClose={() => setShowBranchPicker(false)}
      />
      <PickerModal
        visible={showFloorPicker}
        title="Chọn tầng"
        data={[{ floorId: "", floorName: "Tất cả tầng" }, ...floors]}
        valueKey="floorId"
        labelKey="floorName"
        selectedValue={selectedFloor}
        onSelect={(v) => setSelectedFloor(v || null)}
        onClose={() => setShowFloorPicker(false)}
      />
      <PickerModal
        visible={showMonthPicker}
        title="Chọn tháng"
        data={MONTHS}
        valueKey="value"
        labelKey="label"
        selectedValue={month}
        onSelect={(v) => setMonth(Number(v))}
        onClose={() => setShowMonthPicker(false)}
      />
      <PickerModal
        visible={showYearPicker}
        title="Chọn năm"
        data={YEARS}
        valueKey="value"
        labelKey="label"
        selectedValue={year}
        onSelect={(v) => setYear(Number(v))}
        onClose={() => setShowYearPicker(false)}
      />
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderRow}>
            <View>
              <Text style={styles.pageTitle}>⚡ Ghi Chỉ Số Điện – Nước</Text>
              <Text style={styles.pageSubtitle}>
                Chọn chi nhánh → mở phòng → nhập chỉ số
              </Text>
            </View>
            {/* ✅ Nút đăng xuất */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutBtnText}>Đăng Xuất →</Text>
            </TouchableOpacity>
          </View>
          {user?.userName && (
            <Text style={styles.userLabel}>👤 {user.userName}</Text>
          )}
        </View>

        {/* Filter card */}
        <View style={styles.filterCard}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowBranchPicker(true)}
          >
            <Text style={styles.filterBtnIcon}>🏢</Text>
            <Text
              style={[
                styles.filterBtnText,
                !selectedBranch && styles.filterBtnPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedBranchName}
            </Text>
            <Text style={styles.filterChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                styles.filterBtnHalf,
                !selectedBranch && styles.filterBtnDisabled,
              ]}
              onPress={() => selectedBranch && setShowFloorPicker(true)}
            >
              <Text style={styles.filterBtnIcon}>📐</Text>
              <Text
                style={[
                  styles.filterBtnText,
                  !selectedFloor && styles.filterBtnPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedFloor ? selectedFloorName : "Tất cả tầng"}
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.filterBtn,
                styles.filterBtnHalf,
                { flexDirection: "row", gap: 6 },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowMonthPicker(true)}
                style={styles.periodBtn}
              >
                <Text style={styles.periodBtnText}>
                  T{String(month).padStart(2, "0")}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: "#9ca3af", alignSelf: "center" }}>/</Text>
              <TouchableOpacity
                onPress={() => setShowYearPicker(true)}
                style={styles.periodBtn}
              >
                <Text style={styles.periodBtnText}>{year}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên phòng..."
              placeholderTextColor="#9ca3af"
              value={searchRoom}
              onChangeText={setSearchRoom}
            />
            {!!searchRoom && (
              <TouchableOpacity onPress={() => setSearchRoom("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats strip */}
        {selectedBranch && (
          <View style={styles.statsStrip}>
            {Object.entries(statsMap).map(([k, v]) => (
              <View key={k} style={styles.statItem}>
                <Text style={[styles.statValue, { color: STAT_COLORS[k] }]}>
                  {v}
                </Text>
                <Text style={styles.statLabel}>{k}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Content */}
        {!selectedBranch ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>
              Chọn chi nhánh để bắt đầu ghi chỉ số
            </Text>
          </View>
        ) : loadingRooms ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#6b7280" />
            <Text style={styles.emptyText}>Đang tải phòng...</Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚪</Text>
            <Text style={styles.emptyText}>Không tìm thấy phòng nào</Text>
          </View>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.roomId}
              room={room}
              expanded={!!expandedRooms[room.roomId]}
              readings={readings}
              roomStatusCache={roomStatusCache}
              onToggle={toggleRoom}
              onUpdateReading={updateReading}
              onSave={handleSave}
              onFile={handleFile}
              onRemove={removeImage}
              onOCR={handleOCRValue}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Header
  pageHeader: { marginBottom: 16 },
  pageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: { fontSize: 13, color: "#6b7280" },
  userLabel: { fontSize: 12, color: "#9ca3af", marginTop: 4 },

  // Logout button (header)
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  logoutBtnIcon: { fontSize: 14 },
  logoutBtnText: { fontSize: 12, fontWeight: "700", color: "#dc2626" },

  // Logout modal
  logoutOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  logoutSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "100%",
  },
  logoutIcon: { fontSize: 40, marginBottom: 12 },
  logoutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  logoutSub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  logoutBtns: { flexDirection: "row", gap: 12, width: "100%" },
  logoutCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutCancelText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  logoutConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutConfirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Filter card
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  filterBtnHalf: { flex: 1 },
  filterBtnDisabled: { opacity: 0.4 },
  filterBtnIcon: { fontSize: 14 },
  filterBtnText: { flex: 1, fontSize: 13, fontWeight: "500", color: "#374151" },
  filterBtnPlaceholder: { color: "#9ca3af" },
  filterChevron: { fontSize: 16, color: "#9ca3af" },
  periodBtn: {
    backgroundColor: "#eff6ff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  periodBtnText: { fontSize: 13, fontWeight: "700", color: "#3b82f6" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    gap: 6,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, height: 40, fontSize: 13, color: "#111827" },
  clearSearch: { fontSize: 16, color: "#9ca3af", paddingHorizontal: 4 },

  // Stats
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  // Empty
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: { fontSize: 40, opacity: 0.3 },
  emptyText: { fontSize: 14, color: "#9ca3af", textAlign: "center" },

  // Room card
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  roomCardExpanded: { borderWidth: 1.5, borderColor: "#93c5fd" },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  roomSub: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },
  chevron: { fontSize: 22, color: "#9ca3af", fontWeight: "300" },
  roomBody: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    padding: 12,
    gap: 10,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  loadingText: { color: "#9ca3af", fontSize: 13 },

  // Service card
  serviceCard: { borderRadius: 10, padding: 12, borderWidth: 1.5, gap: 8 },
  serviceHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceEmoji: { fontSize: 16 },
  serviceLabel: { fontSize: 14, fontWeight: "700", flex: 1 },
  savedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  savedBadgeText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statsLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statsValue: { fontSize: 20, fontWeight: "800", color: "#374151" },
  statsUnit: { fontSize: 12, fontWeight: "400", color: "#6b7280" },
  inputRow: { flexDirection: "row", gap: 8 },
  numberInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  numberInputSaved: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
  numberInputError: { borderColor: "#fca5a5" },
  saveBtn: {
    width: 60,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  errorText: { fontSize: 12, color: "#ef4444" },

  // Picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  modalClose: { fontSize: 18, color: "#6b7280" },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  pickerItemSelected: { backgroundColor: "#eff6ff" },
  pickerItemText: { fontSize: 15, color: "#374151" },
  pickerItemTextSelected: { color: "#3b82f6", fontWeight: "700" },
});
