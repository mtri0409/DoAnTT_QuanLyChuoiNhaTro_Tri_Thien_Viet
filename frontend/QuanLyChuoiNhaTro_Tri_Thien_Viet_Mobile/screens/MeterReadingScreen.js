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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import apiBranches from "../services/apiBranches";
import apiFloor from "../services/apiFloor";
import apiRoom from "../services/apiRoom";
import apiMeterReading from "../services/apiMeterReading";
import apiContract, { PAGE_SIZE_ROOMS } from "../services/apiContract";
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

const CONTRACT_STATUS_LABEL = {
  ACTIVE: "Đang hiệu lực",
  INACTIVE: "Tạm dừng",
  EXPIRED: "Hết hạn",
  TERMINATED: "Đã chấm dứt",
  PENDING: "Chờ kích hoạt",
};

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

// ─── ConfirmSaveModal ─────────────────────────────────────────────────────────
// Tương đương ConfirmSaveModal trên web: hiện cảnh báo nếu chỉ số âm / tiêu thụ cao
function ConfirmSaveModal({ data, onConfirm, onCancel }) {
  if (!data) return null;
  const { svcLabel, svcUnit, oldValue, newValue, isInitial } = data;
  const usage = isInitial
    ? null
    : Math.max(0, Number(newValue) - Number(oldValue));
  const isHighUsage = usage !== null && usage > 9999;
  const isNegative = !isInitial && Number(newValue) < Number(oldValue);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        style={styles.confirmOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1} style={styles.confirmSheet}>
          {/* Header */}
          <View style={styles.confirmHeader}>
            <Text style={styles.confirmHeaderIcon}>
              {isNegative || isHighUsage ? "⚠️" : "✅"}
            </Text>
            <Text style={styles.confirmTitle}>
              Xác nhận lưu chỉ số {svcLabel}
            </Text>
          </View>

          {/* Cảnh báo */}
          {isNegative && (
            <View
              style={[
                styles.alertBox,
                { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
              ]}
            >
              <Text style={[styles.alertText, { color: "#dc2626" }]}>
                ⚠ Chỉ số mới nhỏ hơn kỳ trước! Hãy kiểm tra lại — đồng hồ có thể
                bị nhập nhầm.
              </Text>
            </View>
          )}
          {isHighUsage && (
            <View
              style={[
                styles.alertBox,
                { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
              ]}
            >
              <Text style={[styles.alertText, { color: "#d97706" }]}>
                ⚠ Tiêu thụ rất cao ({usage} {svcUnit})! Kiểm tra lại trước khi
                xác nhận.
              </Text>
            </View>
          )}

          {/* Nội dung */}
          {isInitial ? (
            <View
              style={[
                styles.confirmValueBox,
                { backgroundColor: "#e0f2fe", borderColor: "#bae6fd" },
              ]}
            >
              <Text style={styles.confirmValueLabel}>
                Chỉ số gốc (số đầu đồng hồ)
              </Text>
              <Text style={[styles.confirmValueBig, { color: "#0284c7" }]}>
                {newValue}{" "}
                <Text style={styles.confirmValueUnit}>{svcUnit}</Text>
              </Text>
              <Text style={styles.confirmValueNote}>
                Đây sẽ là chỉ số kỳ trước khi người thuê đầu tiên vào phòng.
              </Text>
            </View>
          ) : (
            <View style={styles.confirmRowBoxes}>
              <View style={[styles.confirmBox, { backgroundColor: "#f9fafb" }]}>
                <Text style={styles.confirmValueLabel}>Kỳ trước</Text>
                <Text style={[styles.confirmValueBig, { color: "#6b7280" }]}>
                  {oldValue ?? 0}{" "}
                  <Text style={styles.confirmValueUnit}>{svcUnit}</Text>
                </Text>
              </View>
              <Text style={styles.confirmArrow}>→</Text>
              <View
                style={[
                  styles.confirmBox,
                  {
                    backgroundColor: "#f0fdf4",
                    borderColor: "#86efac",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={styles.confirmValueLabel}>Chỉ số mới</Text>
                <Text style={[styles.confirmValueBig, { color: "#16a34a" }]}>
                  {newValue}{" "}
                  <Text style={styles.confirmValueUnit}>{svcUnit}</Text>
                </Text>
              </View>
            </View>
          )}

          {!isInitial && usage !== null && !isNegative && (
            <Text style={styles.confirmUsage}>
              Tiêu thụ kỳ này:{" "}
              <Text
                style={{
                  color: isHighUsage ? "#d97706" : "#111827",
                  fontWeight: "700",
                }}
              >
                +{usage} {svcUnit}
              </Text>
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={onCancel}
            >
              <Text style={styles.confirmCancelText}>Kiểm tra lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmOkBtn,
                { backgroundColor: isNegative ? "#ef4444" : "#16a34a" },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmOkText}>
                {isNegative ? "Vẫn lưu (tôi chắc chắn)" : "✓ Xác nhận lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── ConfirmEditModal ─────────────────────────────────────────────────────────
// Tương đương ConfirmEditModal trên web: cảnh báo trước khi cho phép sửa lại
function ConfirmEditModal({ data, onConfirm, onCancel }) {
  if (!data) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        style={styles.confirmOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1} style={styles.confirmSheet}>
          <View style={styles.confirmHeader}>
            <Text style={styles.confirmHeaderIcon}>⚠️</Text>
            <Text style={styles.confirmTitle}>Sửa lại chỉ số?</Text>
          </View>
          <Text style={styles.confirmEditBody}>
            Chỉ số <Text style={{ fontWeight: "700" }}>{data.svcLabel}</Text> đã
            được lưu là{" "}
            <Text style={{ fontWeight: "700", color: "#111827" }}>
              {data.savedValue} {data.svcUnit}
            </Text>
            .{"\n"}Nếu bạn sửa lại, chỉ số cũ sẽ bị ghi đè. Hãy chắc chắn trước
            khi tiếp tục.
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={onCancel}
            >
              <Text style={styles.confirmCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmOkBtn, { backgroundColor: "#d97706" }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmOkText}>✏ Cho phép sửa lại</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({
  svc,
  rd,
  roomId,
  hasContract,
  onUpdate,
  onSave,
  onEdit,
  onFile,
  onRemove,
  onOCR,
  onViewImage,
}) {
  const isSaved = rd?.status === "saved";
  const isInitialSaved = rd?.status === "initial_saved";
  const isLoading = rd?.status === "loading";
  const hasError = rd?.status === "error";

  // Phòng chưa HĐ: hiển thị UI nhập chỉ số đầu
  if (!hasContract) {
    const val = rd?.initialValue || "";
    const isSavedInitial = isInitialSaved;

    return (
      <View
        style={[
          styles.serviceCard,
          {
            backgroundColor: "#e0f2fe",
            borderColor: isSavedInitial ? "#7dd3fc" : "#bae6fd",
          },
        ]}
      >
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceEmoji}>{svc.emoji}</Text>
          <Text style={[styles.serviceLabel, { color: svc.color }]}>
            {svc.label}
          </Text>
          <View style={[styles.savedBadge, { backgroundColor: "#e0f2fe" }]}>
            <Text style={[styles.savedBadgeText, { color: "#0284c7" }]}>
              Chỉ số đầu
            </Text>
          </View>
          {isSavedInitial && (
            <View style={[styles.savedBadge, { backgroundColor: "#dcfce7" }]}>
              <Text style={styles.savedBadgeText}>✓ Đã lưu</Text>
            </View>
          )}
        </View>

        <Text style={styles.initialHint}>
          Phòng chưa có hợp đồng — nhập chỉ số gốc của đồng hồ
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.numberInput,
              isSavedInitial && styles.numberInputSaved,
            ]}
            placeholder={`Số đầu đồng hồ (${svc.unit})`}
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={isSavedInitial ? val : rd?.initialValue || ""}
            onChangeText={(v) => onUpdate(svc.id, "initialValue", v)}
            editable={!isSavedInitial}
          />
          {!isSavedInitial && (
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: "#0284c7" },
                (!rd?.initialValue || isLoading) && styles.saveBtnDisabled,
              ]}
              onPress={() => onSave(svc.id)}
              disabled={!rd?.initialValue || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.errorText}>⚠ {rd?.errMsg}</Text>}
      </View>
    );
  }

  // Phòng có HĐ: UI bình thường
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
        {/* Nút sửa lại nếu đã lưu */}
        {isSaved && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEdit(svc.id)}
          >
            <Text style={styles.editBtnText}>✏ Sửa</Text>
          </TouchableOpacity>
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

      {/* Xem ảnh đồng hồ sau khi lưu */}
      {isSaved && rd?.imageUri && (
        <TouchableOpacity
          style={styles.imagePreviewRow}
          onPress={() => onViewImage(rd.imageUri)}
        >
          <Image
            source={{ uri: rd.imageUri }}
            style={styles.imagePreviewThumb}
          />
          <Text style={styles.imagePreviewText}>Xem ảnh đồng hồ</Text>
          <Text style={styles.imagePreviewExpand}>⤢</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({
  room,
  expanded,
  readings,
  contracts,
  roomStatusCache,
  month,
  year,
  onToggle,
  onUpdateReading,
  onSave,
  onEdit,
  onFile,
  onRemove,
  onOCR,
  onViewImage,
  onCreateInvoice,
}) {
  const roomStatus = (() => {
    const r = readings[room.roomId];
    if (r) {
      const statuses = SERVICES.map((s) => r[s.id]?.status);
      if (statuses.every((s) => s === "saved")) return "done";
      if (statuses.some((s) => s === "saved")) return "partial";
      return "pending";
    }
    return roomStatusCache[room.roomId] ?? "pending";
  })();
  const statusCfg = STATUS_CONFIG[roomStatus];
  const contract = contracts?.[room.roomId];
  const hasContract = !!contract;

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
            {Object.prototype.hasOwnProperty.call(contracts, room.roomId) ? (
              contract ? (
                <Text style={{ color: "#3b82f6", fontWeight: "600" }}>
                  {" "}
                  HĐ #{contract.contractId}
                </Text>
              ) : (
                <Text style={{ color: "#d97706" }}> (chưa có HĐ)</Text>
              )
            ) : null}
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
            <>
              {SERVICES.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  rd={readings[room.roomId]?.[svc.id]}
                  roomId={room.roomId}
                  hasContract={hasContract}
                  onUpdate={(sid, field, val) =>
                    onUpdateReading(room.roomId, sid, field, val)
                  }
                  onSave={(sid) => onSave(room.roomId, sid)}
                  onEdit={(sid) => onEdit(room.roomId, sid)}
                  onFile={(sid, uri) => onFile(room.roomId, sid, uri)}
                  onRemove={(sid) => onRemove(room.roomId, sid)}
                  onOCR={(sid, val) => onOCR(room.roomId, sid, val)}
                  onViewImage={onViewImage}
                />
              ))}

              {/* Footer: thông tin hợp đồng + nút tạo hóa đơn */}
              <View style={styles.roomFooter}>
                <Text style={styles.roomFooterContract} numberOfLines={1}>
                  {contract ? (
                    <>
                      Hợp đồng{" "}
                      <Text style={{ color: "#3b82f6", fontWeight: "700" }}>
                        #{contract.contractId}
                      </Text>{" "}
                      ·{" "}
                      {CONTRACT_STATUS_LABEL[contract.status] ??
                        contract.status}
                    </>
                  ) : (
                    <Text style={{ color: "#d97706" }}>
                      ⚠ Phòng chưa có hợp đồng
                    </Text>
                  )}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.invoiceBtn,
                    !contract && styles.invoiceBtnDisabled,
                    roomStatus === "done" &&
                      contract &&
                      styles.invoiceBtnActive,
                  ]}
                  onPress={() =>
                    contract &&
                    onCreateInvoice(contract.contractId, room.roomName)
                  }
                  disabled={!contract}
                >
                  <Text
                    style={[
                      styles.invoiceBtnText,
                      roomStatus === "done" && contract && { color: "#fff" },
                    ]}
                  >
                    🧾{" "}
                    {!contract
                      ? "Tạo hóa đơn (cần HĐ)"
                      : roomStatus === "done"
                        ? `Tạo HĐ T${String(month).padStart(2, "0")}/${year}`
                        : "Tạo hóa đơn (chưa ghi đủ)"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Image Lightbox Modal ──────────────────────────────────────────────────────
function ImageLightbox({ uri, onClose }) {
  if (!uri) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.lightboxOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Image
          source={{ uri }}
          style={styles.lightboxImage}
          resizeMode="contain"
        />
        <Text style={styles.lightboxClose}>✕ Đóng</Text>
      </TouchableOpacity>
    </Modal>
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
  const [contracts, setContracts] = useState({});
  const [roomStatusCache, setRoomStatusCache] = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalRooms, setTotalRooms] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [lightboxUri, setLightboxUri] = useState(null);

  // Modals xác nhận lưu / sửa lại
  const [confirmModal, setConfirmModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

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
    setContracts({});
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
          floorName:
            f.floorName ??
            f.name ??
            f.floorNumber ??
            `Tầng ${f.floorId ?? f.id}`,
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

  // Fetch trạng thái nhẹ cho tất cả phòng (có lọc isInitial như bên web)
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
    setRoomStatusCache((prev) => ({ ...prev, ...newCache }));
  }, []);

  // ─── Load phòng trang đầu khi đổi filter (dùng getRoomsPaged — backend pagination) ──
  useEffect(() => {
    if (!selectedBranch) {
      setRooms([]);
      setCurrentPage(0);
      setHasMorePages(false);
      setTotalRooms(0);
      return;
    }
    setLoadingRooms(true);
    setRooms([]);
    setCurrentPage(0);
    setHasMorePages(false);
    setTotalRooms(0);
    setReadings({});
    setContracts({});
    setRoomStatusCache({});
    setExpandedRooms({});

    apiContract
      .getRoomsPaged(
        0,
        selectedFloor || null,
        selectedBranch || null,
        searchRoom || "",
      )
      .then((res) => {
        const list = (res.content || []).map((r) => ({
          ...r,
          roomId: r.roomId ?? r.id,
        }));
        setRooms(list);
        setHasMorePages(!res.last && res.totalPages > 1);
        setTotalRooms(res.totalElements || list.length);
        fetchAllRoomStatuses(list, month, year);
      })
      .catch((err) => {
        console.error("Load rooms error:", err);
        setRooms([]);
      })
      .finally(() => setLoadingRooms(false));
  }, [selectedBranch, selectedFloor, searchRoom, fetchAllRoomStatuses]);

  // ─── Load trang tiếp theo từ backend ──────────────────────────────────────
  const loadMoreRooms = useCallback(async () => {
    if (loadingMore || !hasMorePages) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const res = await apiContract.getRoomsPaged(
        nextPage,
        selectedFloor || null,
        selectedBranch || null,
        searchRoom || "",
      );
      const newList = (res.content || []).map((r) => ({
        ...r,
        roomId: r.roomId ?? r.id,
      }));
      setRooms((prev) => [...prev, ...newList]);
      setCurrentPage(nextPage);
      setHasMorePages(!res.last);
      fetchAllRoomStatuses(newList, month, year);
    } catch (err) {
      console.error("Load more rooms error:", err);
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
    fetchAllRoomStatuses,
  ]);

  // Reset khi đổi kỳ
  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    setRoomStatusCache({});
    if (rooms.length > 0) {
      fetchAllRoomStatuses(rooms, month, year);
    }
  }, [month, year, fetchAllRoomStatuses]);

  // Load full data 1 phòng khi mở (hỗ trợ cả phòng chưa HĐ)
  const loadRoomData = useCallback(
    async (roomId) => {
      const initReadings = {};
      SERVICES.forEach((svc) => {
        initReadings[svc.id] = {
          newValue: "",
          oldValue: 0,
          initialValue: "",
          savedValue: null,
          imageUri: null,
          status: "idle",
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

        existing.forEach((r) => {
          const sid = Number(r.serviceId);
          if (!initReadings[sid]) return;

          if (hasContract) {
            // Bỏ qua bản ghi "khởi đầu" (isInitial = true)
            if (r.isInitial) return;

            initReadings[sid] = {
              newValue: String(r.newValue ?? ""),
              oldValue: r.oldValue ?? 0,
              initialValue: "",
              savedValue: r.newValue,
              status: r.newValue != null ? "saved" : "idle",
              imageUri: null,
            };
          } else {
            // Phòng chưa có HĐ → bản ghi này là chỉ số khởi đầu
            initReadings[sid] = {
              newValue: "",
              oldValue: 0,
              initialValue: String(r.newValue ?? ""),
              savedValue: null,
              status: r.newValue != null ? "initial_saved" : "idle",
              imageUri: null,
            };
          }
        });
      }

      // Chỉ fetch kỳ trước khi phòng có HĐ
      if (hasContract) {
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

  // ── Mở modal xác nhận trước khi lưu ──
  const handleSaveClick = (roomId, serviceId) => {
    const r = readings[roomId]?.[serviceId];
    const contract = contracts[roomId];
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

  // ── Thực hiện lưu sau khi xác nhận ──
  const handleSaveConfirmed = async () => {
    const { roomId, serviceId, newValue, isInitial } = confirmModal;
    setConfirmModal(null);

    const r = readings[roomId]?.[serviceId];

    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [serviceId]: { ...prev[roomId][serviceId], status: "loading" },
      },
    }));

    try {
      if (!isInitial) {
        await apiMeterReading.saveReading(
          roomId,
          serviceId,
          newValue,
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
        // Phòng chưa có HĐ: lưu chỉ số khởi đầu
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
      }
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

  // ── Mở modal xác nhận sửa lại ──
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

  // ── Cho phép sửa lại sau xác nhận ──
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

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    await fetchAllRoomStatuses(rooms, month, year);
    setRefreshing(false);
  };

  // rooms đã được backend lọc theo searchRoom + filter; stats tính trên toàn bộ list
  const filteredRooms = rooms;

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

      {/* Lightbox xem ảnh đồng hồ */}
      <ImageLightbox uri={lightboxUri} onClose={() => setLightboxUri(null)} />

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
          <>
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                expanded={!!expandedRooms[room.roomId]}
                readings={readings}
                contracts={contracts}
                roomStatusCache={roomStatusCache}
                month={month}
                year={year}
                onToggle={toggleRoom}
                onUpdateReading={updateReading}
                onSave={handleSaveClick}
                onEdit={handleEditClick}
                onFile={handleFile}
                onRemove={removeImage}
                onOCR={handleOCRValue}
                onViewImage={setLightboxUri}
                onCreateInvoice={(contractId, roomName) =>
                  Alert.alert(
                    "Tạo hóa đơn",
                    `Tạo hóa đơn T${String(month).padStart(2, "0")}/${year} cho ${roomName}?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Tạo",
                        onPress: () =>
                          router.push(
                            `/invoice/create?contractId=${contractId}&month=${month}&year=${year}`,
                          ),
                      },
                    ],
                  )
                }
              />
            ))}

            {/* ── Load trang tiếp từ backend ── */}
            {hasMorePages && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={loadMoreRooms}
                activeOpacity={0.75}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#3b82f6" size="small" />
                ) : (
                  <Text style={styles.loadMoreText}>
                    ↓ Tải thêm phòng ({rooms.length}/{totalRooms})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
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

  // Confirm modal (save & edit)
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    gap: 12,
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmHeaderIcon: { fontSize: 20 },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1 },
  alertBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  alertText: { fontSize: 13, lineHeight: 18 },
  confirmValueBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  confirmValueLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  confirmValueBig: { fontSize: 24, fontWeight: "800" },
  confirmValueUnit: { fontSize: 14, fontWeight: "400", color: "#6b7280" },
  confirmValueNote: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  confirmRowBoxes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmBox: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  confirmArrow: { fontSize: 18, color: "#9ca3af" },
  confirmUsage: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  confirmBtns: { flexDirection: "row", gap: 10 },
  confirmCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  confirmOkBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmOkText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  confirmEditBody: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

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

  // Room footer (hợp đồng + nút tạo hóa đơn)
  roomFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    gap: 8,
  },
  roomFooterContract: { fontSize: 12, color: "#6b7280" },
  invoiceBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  invoiceBtnActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  invoiceBtnDisabled: { opacity: 0.5 },
  invoiceBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },

  // Service card
  serviceCard: { borderRadius: 10, padding: 12, borderWidth: 1.5, gap: 8 },
  serviceHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceEmoji: { fontSize: 16 },
  serviceLabel: { fontSize: 14, fontWeight: "700", flex: 1 },
  savedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  savedBadgeText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },
  editBtn: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBtnText: { fontSize: 11, fontWeight: "600", color: "#d97706" },
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
  initialHint: { fontSize: 12, color: "#0284c7" },

  // Image preview (sau khi lưu)
  imagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  imagePreviewThumb: { width: 40, height: 32, borderRadius: 6 },
  imagePreviewText: { flex: 1, fontSize: 12, color: "#6b7280" },
  imagePreviewExpand: { fontSize: 14, color: "#9ca3af" },

  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: { width: "100%", height: "80%" },
  lightboxClose: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },

  // Load more
  loadMoreBtn: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },

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
