import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Zap,
  Droplets,
  Building2,
  Layers,
  Search,
  X,
  ChevronRight,
  LogOut,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  User,
  Camera,
  Pencil,
  DoorOpen,
  CalendarDays,
  BarChart3,
} from "lucide-react-native";
import apiBranches from "../services/apiBranches";
import apiFloor from "../services/apiFloor";
import apiMeterReading from "../services/apiMeterReading";
import apiContract, { PAGE_SIZE_ROOMS } from "../services/apiContract";
import apiInvoice from "../services/apiInvoice";
import ImageCapture from "../components/readings/ImageCapture";
import { useAuth } from "../context/AuthContext";

const IS_IOS = Platform.OS === "ios";
const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const SERVICES = [
  {
    id: 1,
    label: "Điện",
    Icon: Zap,
    color: "#f59e0b",
    bgColor: "#fffbeb",
    unit: "kWh",
  },
  {
    id: 2,
    label: "Nước",
    Icon: Droplets,
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

const STAT_COLORS = {
  Tổng: "#3b82f6",
  Xong: "#16a34a",
  Dở: "#d97706",
  Chưa: "#ef4444",
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
              <X size={20} color="#6b7280" strokeWidth={2} />
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
                  {isSelected && (
                    <CheckCircle size={16} color="#1e3a8a" strokeWidth={2} />
                  )}
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
          <View style={styles.logoutIconWrap}>
            <LogOut size={28} color="#ef4444" strokeWidth={2} />
          </View>
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
          <View style={styles.confirmHeader}>
            {isNegative || isHighUsage ? (
              <AlertCircle size={22} color="#f59e0b" strokeWidth={2} />
            ) : (
              <CheckCircle size={22} color="#16a34a" strokeWidth={2} />
            )}
            <Text style={styles.confirmTitle}>
              Xác nhận lưu chỉ số {svcLabel}
            </Text>
          </View>

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
            <AlertCircle size={22} color="#d97706" strokeWidth={2} />
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
  const { Icon: SvcIcon } = svc;

  if (!hasContract) {
    const val = rd?.initialValue || "";
    return (
      <View
        style={[
          styles.serviceCard,
          {
            backgroundColor: "#e0f2fe",
            borderColor: isInitialSaved ? "#7dd3fc" : "#bae6fd",
          },
        ]}
      >
        <View style={styles.serviceHeader}>
          <View
            style={[styles.serviceIconWrap, { backgroundColor: "#bae6fd" }]}
          >
            <SvcIcon size={16} color="#0284c7" strokeWidth={2.5} />
          </View>
          <Text style={[styles.serviceLabel, { color: "#0284c7" }]}>
            {svc.label}
          </Text>
          <View style={[styles.savedBadge, { backgroundColor: "#e0f2fe" }]}>
            <Text style={[styles.savedBadgeText, { color: "#0284c7" }]}>
              Chỉ số đầu
            </Text>
          </View>
          {isInitialSaved && (
            <View style={[styles.savedBadge, { backgroundColor: "#dcfce7" }]}>
              <CheckCircle size={10} color="#16a34a" strokeWidth={2.5} />
              <Text style={styles.savedBadgeText}> Đã lưu</Text>
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
              isInitialSaved && styles.numberInputSaved,
            ]}
            placeholder={`Số đầu đồng hồ (${svc.unit})`}
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={isInitialSaved ? val : rd?.initialValue || ""}
            onChangeText={(v) => onUpdate(svc.id, "initialValue", v)}
            editable={!isInitialSaved}
          />
          {!isInitialSaved && (
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
        <View
          style={[
            styles.serviceIconWrap,
            { backgroundColor: svc.color + "20" },
          ]}
        >
          <SvcIcon size={16} color={svc.color} strokeWidth={2.5} />
        </View>
        <Text style={[styles.serviceLabel, { color: svc.color }]}>
          {svc.label}
        </Text>
        {isSaved && (
          <View style={[styles.savedBadge, { backgroundColor: "#dcfce7" }]}>
            <CheckCircle size={10} color="#16a34a" strokeWidth={2.5} />
            <Text style={styles.savedBadgeText}> Đã lưu</Text>
          </View>
        )}
        {isSaved && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEdit(svc.id)}
          >
            <Pencil size={11} color="#d97706" strokeWidth={2.5} />
            <Text style={styles.editBtnText}> Sửa</Text>
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
            { backgroundColor: isSaved ? "#16a34a" : "#1e3a8a" },
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

      {isSaved && rd?.imageUri && (
        <TouchableOpacity
          style={styles.imagePreviewRow}
          onPress={() => onViewImage(rd.imageUri)}
        >
          <Image
            source={{ uri: rd.imageUri }}
            style={styles.imagePreviewThumb}
          />
          <Camera size={12} color="#6b7280" strokeWidth={2} />
          <Text style={styles.imagePreviewText}>Xem ảnh đồng hồ</Text>
          <ChevronRight size={14} color="#9ca3af" strokeWidth={2} />
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
  contractCache,
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
  createdInvoices,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
  const contract = contracts?.[room.roomId] ?? contractCache?.[room.roomId];
  const hasContract = !!contract;
  const contractLoaded =
    Object.prototype.hasOwnProperty.call(contracts, room.roomId) ||
    Object.prototype.hasOwnProperty.call(contractCache, room.roomId);

  const pressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  return (
    <Animated.View
      style={[
        styles.roomCard,
        expanded && styles.roomCardExpanded,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.roomAccent, { backgroundColor: statusCfg.color }]} />

      <TouchableOpacity
        style={styles.roomHeader}
        onPress={() => onToggle(room.roomId)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <View
          style={[
            styles.roomIconWrap,
            { backgroundColor: expanded ? "#dbeafe" : "#f1f5f9" },
          ]}
        >
          <DoorOpen
            size={20}
            color={expanded ? "#1e3a8a" : "#64748b"}
            strokeWidth={2}
          />
        </View>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.roomName}</Text>
          <Text style={styles.roomSub} numberOfLines={1}>
            {room.floorName} · {room.branchName}
          </Text>
          {!contractLoaded ? (
            <View style={styles.contractBadgeLoading}>
              <ActivityIndicator size={10} color="#94a3b8" />
              <Text style={styles.contractBadgeLoadingText}>
                Đang tải HĐ...
              </Text>
            </View>
          ) : contract ? (
            <View style={styles.contractBadgeActive}>
              <FileText size={10} color="#1e3a8a" strokeWidth={2.5} />
              <Text style={styles.contractBadgeActiveText}>
                HĐ #{contract.contractId} · Có hợp đồng
              </Text>
            </View>
          ) : (
            <View style={styles.contractBadgeNone}>
              <AlertCircle size={10} color="#d97706" strokeWidth={2.5} />
              <Text style={styles.contractBadgeNoneText}>Chưa có hợp đồng</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="#94a3b8"
          strokeWidth={2}
          style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.roomBody}>
          {!readings[room.roomId] ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#1e3a8a" />
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

              <View style={styles.roomFooter}>
                <View style={styles.roomFooterContractRow}>
                  {contract ? (
                    <>
                      <FileText size={12} color="#64748b" strokeWidth={2} />
                      <Text style={styles.roomFooterContract} numberOfLines={1}>
                        Hợp đồng{" "}
                        <Text style={{ color: "#1e3a8a", fontWeight: "700" }}>
                          #{contract.contractId}
                        </Text>{" "}
                        ·{" "}
                        {CONTRACT_STATUS_LABEL[contract.status] ??
                          contract.status}
                      </Text>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} color="#d97706" strokeWidth={2} />
                      <Text
                        style={[
                          styles.roomFooterContract,
                          { color: "#d97706" },
                        ]}
                      >
                        Phòng chưa có hợp đồng
                      </Text>
                    </>
                  )}
                </View>
                {(() => {
                  const invoiceCreated =
                    contract && createdInvoices?.[contract.contractId];
                  return (
                    <TouchableOpacity
                      style={[
                        styles.invoiceBtn,
                        !contract && styles.invoiceBtnDisabled,
                        invoiceCreated
                          ? styles.invoiceBtnDone
                          : roomStatus === "done" &&
                            contract &&
                            styles.invoiceBtnActive,
                      ]}
                      onPress={() =>
                        !invoiceCreated &&
                        contract &&
                        onCreateInvoice(contract.contractId, room.roomName)
                      }
                      disabled={!contract || !!invoiceCreated}
                      activeOpacity={invoiceCreated ? 1 : 0.7}
                    >
                      <Receipt
                        size={13}
                        color={
                          contract && (invoiceCreated || roomStatus === "done")
                            ? "#fff"
                            : "#64748b"
                        }
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.invoiceBtnText,
                          roomStatus === "done" &&
                            contract &&
                            !invoiceCreated && { color: "#fff" },
                          invoiceCreated && { color: "#fff" },
                        ]}
                      >
                        {!contract
                          ? " Tạo hóa đơn (cần HĐ)"
                          : invoiceCreated
                            ? ` ✓ Đã tạo HĐ T${String(month).padStart(2, "0")}/${year}`
                            : roomStatus === "done"
                              ? ` Tạo HĐ T${String(month).padStart(2, "0")}/${year}`
                              : " Tạo hóa đơn (chưa ghi đủ)"}
                      </Text>
                    </TouchableOpacity>
                  );
                })()}
              </View>
            </>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, iconColor = "#cbd5e1", text, subtext }) {
  return (
    <View style={styles.emptyBox}>
      <Icon size={40} color={iconColor} strokeWidth={1.5} />
      <Text style={styles.emptyText}>{text}</Text>
      {subtext ? <Text style={styles.emptySubtext}>{subtext}</Text> : null}
    </View>
  );
}

// ─── Footer Loader ─────────────────────────────────────────────────────────────
function FooterLoader({ visible }) {
  if (!visible) return <View style={{ height: 24 }} />;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="#1e3a8a" />
      <Text style={styles.footerLoaderText}>Đang tải thêm phòng...</Text>
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
        <View style={styles.lightboxCloseBtn}>
          <X size={16} color="#fff" strokeWidth={2.5} />
          <Text style={styles.lightboxCloseText}>Đóng</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function MeterReadingScreen() {
  const { logout, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [searchRoom, setSearchRoom] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchRoom), 400);
    return () => clearTimeout(timer);
  }, [searchRoom]);

  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [readings, setReadings] = useState({});
  const [contracts, setContracts] = useState({});
  const [contractCache, setContractCache] = useState({});
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
  const [confirmModal, setConfirmModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [createdInvoices, setCreatedInvoices] = useState({});
  const [bulkInvoiceLoading, setBulkInvoiceLoading] = useState(false);
  const [bulkInvoiceResult, setBulkInvoiceResult] = useState(null);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [showFloorPicker, setShowFloorPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Animated header (giống bills.js)
  const headerAnim = useRef(new Animated.Value(-30)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${String(i + 1).padStart(2, "0")}`,
  }));
  const YEARS = [2024, 2025, 2026, 2027].map((y) => ({
    value: y,
    label: String(y),
  }));

  // ── Load branches ──
  useEffect(() => {
    if (authLoading) return;
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res.content || res || []))
      .catch(() => setBranches([]));
  }, [authLoading]);

  // ── Load floors khi đổi chi nhánh ──
  useEffect(() => {
    setSelectedFloor(null);
    setFloors([]);
    setRooms([]);
    setReadings({});
    setContracts({});
    setContractCache({});
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

  // ── Load phòng trang đầu ──
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
    setContractCache({});
    setRoomStatusCache({});
    setExpandedRooms({});
    setCreatedInvoices({});
    setBulkInvoiceResult(null);

    apiContract
      .getRoomsPaged(
        0,
        selectedFloor || null,
        selectedBranch || null,
        debouncedSearch || "",
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
        fetchAllContracts(list);
      })
      .catch((err) => {
        console.error("Load rooms error:", err);
        setRooms([]);
      })
      .finally(() => setLoadingRooms(false));
  }, [
    selectedBranch,
    selectedFloor,
    debouncedSearch,
    fetchAllRoomStatuses,
    fetchAllContracts,
  ]);

  const loadMoreRooms = useCallback(async () => {
    if (loadingMore || !hasMorePages) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const res = await apiContract.getRoomsPaged(
        nextPage,
        selectedFloor || null,
        selectedBranch || null,
        debouncedSearch || "",
      );
      const newList = (res.content || []).map((r) => ({
        ...r,
        roomId: r.roomId ?? r.id,
      }));
      setRooms((prev) => [...prev, ...newList]);
      setCurrentPage(nextPage);
      setHasMorePages(!res.last && nextPage + 1 < res.totalPages);
      fetchAllRoomStatuses(newList, month, year);
      fetchAllContracts(newList);
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
    debouncedSearch,
    month,
    year,
    fetchAllRoomStatuses,
    fetchAllContracts,
  ]);

  useEffect(() => {
    setReadings({});
    setContracts({});
    setExpandedRooms({});
    setRoomStatusCache({});
    if (rooms.length > 0) fetchAllRoomStatuses(rooms, month, year);
  }, [month, year, fetchAllRoomStatuses]);

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

  const handleOCRValue = (roomId, serviceId, val) =>
    updateReading(roomId, serviceId, "newValue", String(val));

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
          false,
          r.oldValue ?? 0,
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
        await apiMeterReading.saveReading(
          roomId,
          serviceId,
          newValue,
          month,
          year,
          null,
          true,
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

  const selectedBranchName =
    branches.find((b) => String(b.branchId) === String(selectedBranch))
      ?.branchName || "Chọn chi nhánh";
  const selectedFloorName =
    floors.find((f) => String(f.floorId) === String(selectedFloor))
      ?.floorName || "Tất cả tầng";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Modals */}
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
      <ConfirmSaveModal
        data={confirmModal}
        onConfirm={handleSaveConfirmed}
        onCancel={() => setConfirmModal(null)}
      />
      <ConfirmEditModal
        data={editModal}
        onConfirm={handleEditConfirmed}
        onCancel={() => setEditModal(null)}
      />
      <ImageLightbox uri={lightboxUri} onClose={() => setLightboxUri(null)} />

      {/* ── Animated Header (giống bills.js) ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerIconWrap}>
            <BarChart3 size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Quản lý chỉ số</Text>
            <Text style={styles.headerTitle}>Ghi Điện – Nước</Text>
          </View>
          {user?.userName && (
            <View style={styles.headerUserWrap}>
              <User size={13} color="#93c5fd" strokeWidth={2} />
              <Text style={styles.headerUser}>{user.userName}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#fca5a5" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Filter row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowBranchPicker(true)}
          >
            <Building2 size={13} color="#93c5fd" strokeWidth={2} />
            <Text style={styles.filterChipText} numberOfLines={1}>
              {selectedBranchName}
            </Text>
            <ChevronRight size={12} color="#93c5fd" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, !selectedBranch && { opacity: 0.4 }]}
            onPress={() => selectedBranch && setShowFloorPicker(true)}
          >
            <Layers size={13} color="#93c5fd" strokeWidth={2} />
            <Text style={styles.filterChipText} numberOfLines={1}>
              {selectedFloor ? selectedFloorName : "Tất cả tầng"}
            </Text>
          </TouchableOpacity>
          <View style={styles.periodWrap}>
            <TouchableOpacity
              style={styles.periodChip}
              onPress={() => setShowMonthPicker(true)}
            >
              <CalendarDays size={12} color="#93c5fd" strokeWidth={2} />
              <Text style={styles.periodChipText}>
                T{String(month).padStart(2, "0")}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: "#475569", fontSize: 12 }}>/</Text>
            <TouchableOpacity
              style={styles.periodChip}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.periodChipText}>{year}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar (giống bills.js) */}
        <View style={styles.searchBar}>
          <Search size={14} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên phòng..."
            placeholderTextColor="#94a3b8"
            value={searchRoom}
            onChangeText={setSearchRoom}
          />
          {!!searchRoom && (
            <TouchableOpacity onPress={() => setSearchRoom("")}>
              <X size={14} color="#94a3b8" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1e3a8a"]}
            tintColor="#1e3a8a"
            title="Kéo xuống để làm mới"
            titleColor="#64748b"
          />
        }
        keyboardShouldPersistTaps="handled"
      >
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
          <EmptyState
            icon={Building2}
            text="Chọn chi nhánh để bắt đầu"
            subtext="Chọn chi nhánh → mở phòng → nhập chỉ số"
          />
        ) : loadingRooms ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingWrapText}>
              Đang tải danh sách phòng...
            </Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            text="Không tìm thấy phòng nào"
            subtext="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
          />
        ) : (
          <>
            {/* ── Bulk invoice banner ── */}
            {(() => {
              const eligibleRooms = filteredRooms.filter((r) => {
                const c = contracts[r.roomId] ?? contractCache[r.roomId];
                const status = (() => {
                  const rd = readings[r.roomId];
                  if (rd) {
                    const statuses = SERVICES.map((s) => rd[s.id]?.status);
                    if (statuses.every((s) => s === "saved")) return "done";
                    return "other";
                  }
                  return roomStatusCache[r.roomId] ?? "pending";
                })();
                return (
                  !!c && !createdInvoices[c.contractId] && status === "done"
                );
              });
              const doneCount = filteredRooms.filter((r) => {
                const c = contracts[r.roomId] ?? contractCache[r.roomId];
                return !!c && createdInvoices[c.contractId];
              }).length;
              const allDone = eligibleRooms.length === 0 && doneCount > 0;

              return (
                <View style={styles.bulkBanner}>
                  <View style={styles.bulkBannerIconWrap}>
                    <Receipt size={18} color="#1e3a8a" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bulkBannerTitle}>
                      Tạo hóa đơn hàng loạt
                    </Text>
                    <Text style={styles.bulkBannerSub}>
                      {allDone
                        ? `✓ Đã tạo xong ${doneCount} hóa đơn cho chi nhánh này`
                        : `${eligibleRooms.length} phòng đã ghi đủ, chưa tạo HĐ T${String(month).padStart(2, "0")}/${year}`}
                    </Text>
                    {bulkInvoiceResult && (
                      <Text style={styles.bulkBannerResult}>
                        <Text style={{ color: "#16a34a" }}>
                          ✓ {bulkInvoiceResult.success} thành công
                        </Text>
                        {bulkInvoiceResult.failed > 0 && (
                          <Text style={{ color: "#ef4444" }}>
                            {" "}
                            ✗ {bulkInvoiceResult.failed} thất bại
                          </Text>
                        )}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.bulkBtn,
                      (allDone || eligibleRooms.length === 0) &&
                        styles.bulkBtnDone,
                      bulkInvoiceLoading && styles.bulkBtnLoading,
                    ]}
                    disabled={
                      allDone ||
                      bulkInvoiceLoading ||
                      eligibleRooms.length === 0
                    }
                    onPress={() => {
                      if (bulkInvoiceLoading || eligibleRooms.length === 0)
                        return;
                      Alert.alert(
                        "Tạo hóa đơn hàng loạt",
                        `Tạo ${eligibleRooms.length} hóa đơn T${String(month).padStart(2, "0")}/${year} cho tất cả phòng đã ghi đủ?`,
                        [
                          { text: "Hủy", style: "cancel" },
                          {
                            text: "Tạo tất cả",
                            onPress: async () => {
                              setBulkInvoiceLoading(true);
                              setBulkInvoiceResult(null);
                              let success = 0,
                                failed = 0;
                              for (const r of eligibleRooms) {
                                const c =
                                  contracts[r.roomId] ??
                                  contractCache[r.roomId];
                                if (!c) continue;
                                try {
                                  await apiInvoice.createManual(
                                    c.contractId,
                                    month,
                                    year,
                                  );
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
                            },
                          },
                        ],
                      );
                    }}
                    activeOpacity={0.75}
                  >
                    {bulkInvoiceLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.bulkBtnText}>
                        {allDone
                          ? "✓ Đã xong"
                          : `Tạo tất cả (${eligibleRooms.length})`}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })()}

            {filteredRooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                expanded={!!expandedRooms[room.roomId]}
                readings={readings}
                contracts={contracts}
                contractCache={contractCache}
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
                createdInvoices={createdInvoices}
                onCreateInvoice={(contractId, roomName) =>
                  Alert.alert(
                    "Tạo hóa đơn",
                    `Tạo hóa đơn T${String(month).padStart(2, "0")}/${year} cho ${roomName}?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Tạo",
                        onPress: async () => {
                          try {
                            await apiInvoice.createManual(
                              contractId,
                              month,
                              year,
                            );
                            setCreatedInvoices((prev) => ({
                              ...prev,
                              [contractId]: true,
                            }));
                            Alert.alert(
                              "Thành công",
                              `Đã tạo hóa đơn T${String(month).padStart(2, "0")}/${year}`,
                            );
                          } catch (err) {
                            Alert.alert(
                              "Lỗi",
                              err?.response?.data?.message ||
                                "Không thể tạo hóa đơn",
                            );
                          }
                        },
                      },
                    ],
                  )
                }
              />
            ))}

            {/* Load more / Footer loader */}
            {hasMorePages && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={loadMoreRooms}
                activeOpacity={0.75}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <FooterLoader visible />
                ) : (
                  <>
                    <ChevronRight
                      size={16}
                      color="#1e3a8a"
                      strokeWidth={2.5}
                      style={{ transform: [{ rotate: "90deg" }] }}
                    />
                    <Text style={styles.loadMoreText}>
                      Tải thêm phòng ({rooms.length}/{totalRooms})
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1e3a8a" }, // xanh để status bar liền màu với header
  scroll: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // ── Header (bills style) ──
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: IS_IOS ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
    gap: 14,
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSub: { fontSize: 12, color: "#93c5fd", fontWeight: "500" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  headerUserWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerUser: { fontSize: 12, color: "#93c5fd", fontWeight: "500" },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Filter chips in header ──
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
    flex: 1,
  },
  filterChipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  periodWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  periodChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  periodChipText: { fontSize: 12, fontWeight: "700", color: "#e2e8f0" },

  // ── Search bar (bills style) ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14, padding: 0 },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  // ── Loading states (bills style) ──
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingTop: 60,
  },
  loadingWrapText: { fontSize: 14, color: "#64748b", fontWeight: "500" },

  // ── Empty state (bills style) ──
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#374151" },
  emptySubtext: { fontSize: 13, color: "#94a3b8", textAlign: "center" },

  // ── Footer loader ──
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerLoaderText: { fontSize: 13, color: "#64748b", fontWeight: "500" },

  // ── Load more button ──
  loadMoreBtn: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  loadMoreText: { fontSize: 14, fontWeight: "600", color: "#1e3a8a" },

  // ── Bulk invoice banner ──
  bulkBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bulkBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  bulkBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  bulkBannerSub: { fontSize: 12, color: "#64748b" },
  bulkBannerResult: { fontSize: 12, marginTop: 4 },
  bulkBtn: {
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 86,
  },
  bulkBtnDone: { backgroundColor: "#16a34a" },
  bulkBtnLoading: { backgroundColor: "#94a3b8" },
  bulkBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // ── Room card (bills row style) ──
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  roomCardExpanded: { borderWidth: 1.5, borderColor: "#93c5fd" },
  roomAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingLeft: 18,
    gap: 10,
  },
  roomIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  roomSub: { fontSize: 11, color: "#64748b", marginTop: 1 },

  // Contract badge variants
  contractBadgeLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  contractBadgeLoadingText: { fontSize: 10, color: "#94a3b8" },
  contractBadgeActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  contractBadgeActiveText: {
    fontSize: 11,
    color: "#1e3a8a",
    fontWeight: "600",
  },
  contractBadgeNone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  contractBadgeNoneText: { fontSize: 11, color: "#d97706", fontWeight: "600" },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },

  roomBody: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
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
  loadingText: { color: "#64748b", fontSize: 13, fontWeight: "500" },

  // Room footer
  roomFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    gap: 8,
  },
  roomFooterContractRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  roomFooterContract: { fontSize: 12, color: "#64748b", flex: 1 },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  invoiceBtnActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  invoiceBtnDone: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  invoiceBtnDisabled: { opacity: 0.45 },
  invoiceBtnText: { fontSize: 13, fontWeight: "600", color: "#64748b" },

  // ── Service card ──
  serviceCard: { borderRadius: 12, padding: 12, borderWidth: 1.5, gap: 8 },
  serviceHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: { fontSize: 14, fontWeight: "700", flex: 1 },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  savedBadgeText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  numberInputSaved: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
  numberInputError: { borderColor: "#fca5a5" },
  saveBtn: {
    width: 60,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  errorText: { fontSize: 12, color: "#ef4444" },
  initialHint: { fontSize: 12, color: "#0284c7" },
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

  // ── Lightbox ──
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: { width: "100%", height: "80%" },
  lightboxCloseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  lightboxCloseText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // ── Picker modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
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
  pickerItemTextSelected: { color: "#1e3a8a", fontWeight: "700" },

  // ── Logout modal ──
  logoutOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  logoutSheet: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  logoutIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoutTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  logoutSub: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  logoutBtns: { flexDirection: "row", gap: 12, width: "100%", marginTop: 8 },
  logoutCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutCancelText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  logoutConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutConfirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // ── Confirm modals ──
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
  confirmHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", flex: 1 },
  alertBox: { borderRadius: 10, borderWidth: 1, padding: 10 },
  alertText: { fontSize: 13, lineHeight: 18 },
  confirmValueBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  confirmValueLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  confirmValueBig: { fontSize: 24, fontWeight: "800" },
  confirmValueUnit: { fontSize: 14, fontWeight: "400", color: "#6b7280" },
  confirmValueNote: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  confirmRowBoxes: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmBox: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  confirmArrow: { fontSize: 18, color: "#9ca3af" },
  confirmUsage: { textAlign: "center", fontSize: 13, color: "#6b7280" },
  confirmBtns: { flexDirection: "row", gap: 10 },
  confirmCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  confirmEditBody: { fontSize: 14, color: "#64748b", lineHeight: 20 },
});
