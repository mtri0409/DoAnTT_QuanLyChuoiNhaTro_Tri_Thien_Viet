// app/(tenant)/profile/ProfileTab.js
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  CalendarDays,
  Clock3,
  Pencil,
  Save,
  Home,
  BadgeCheck,
  X,
  Check,
} from "lucide-react-native";
import { s, C } from "../../../components/ProfileStyles";
import {
  InfoRow,
  EditField,
  SectionCard,
  Divider,
} from "../../../components/ProfileComponents";
import axiosInstance from "../../../services/axios";

const unwrap = (r) => r?.data ?? r;
const api = {
  getProfile: (id) => axiosInstance.get(`/public/profiles/${id}`).then(unwrap),
  // Backend: @PutMapping("/user/profiles/{profileId}")
  updateProfile: (id, data) =>
    axiosInstance.put(`/user/profiles/${id}`, data).then(unwrap),
};

// ── Helpers date ────────────────────────────────────────────────────────────
const toISO = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fromISO = (str) => {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// ── DateField với Modal (fix iOS spinner đè layout) ─────────────────────────
function DateField({ label, value, onChange, IconComponent }) {
  const [show, setShow] = useState(false);
  // tmpDate giữ giá trị tạm trong khi user đang cuộn spinner iOS
  const [tmpDate, setTmpDate] = useState(null);

  const openPicker = () => {
    setTmpDate(fromISO(value)); // reset về giá trị hiện tại mỗi lần mở
    setShow(true);
  };

  const handleAndroidChange = (event, selected) => {
    setShow(false);
    if (event.type !== "dismissed" && selected) onChange(toISO(selected));
  };

  const handleIOSChange = (_, selected) => {
    if (selected) setTmpDate(selected);
  };

  const confirmIOS = () => {
    if (tmpDate) onChange(toISO(tmpDate));
    setShow(false);
  };

  const cancelIOS = () => setShow(false);

  return (
    <View style={df.wrapper}>
      {IconComponent && (
        <IconComponent
          size={16}
          color={C.violet}
          strokeWidth={2}
          style={df.icon}
        />
      )}
      <View style={df.inner}>
        <Text style={df.label}>{label}</Text>
        <TouchableOpacity
          style={df.trigger}
          onPress={openPicker}
          activeOpacity={0.75}
        >
          <CalendarDays size={14} color={C.blue} strokeWidth={2} />
          <Text style={[df.triggerText, !value && df.placeholder]}>
            {value || "Chọn ngày..."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Android: picker native, không cần Modal */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={fromISO(value)}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          maximumDate={new Date(2100, 11, 31)}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {/* iOS: bọc trong Modal để tránh đè layout */}
      {Platform.OS === "ios" && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={cancelIOS}
        >
          <TouchableOpacity
            style={df.modalOverlay}
            activeOpacity={1}
            onPress={cancelIOS}
          />
          <View style={df.modalSheet}>
            {/* Thanh tiêu đề */}
            <View style={df.sheetHeader}>
              <TouchableOpacity onPress={cancelIOS} style={df.sheetBtn}>
                <X size={18} color={C.slate500 || "#64748b"} strokeWidth={2} />
                <Text style={df.sheetBtnTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <Text style={df.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={confirmIOS} style={df.sheetBtn}>
                <Text style={df.sheetBtnTextConfirm}>Xong</Text>
                <Check
                  size={18}
                  color={C.blue || "#2563eb"}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tmpDate || fromISO(value)}
              mode="date"
              display="spinner"
              onChange={handleIOSChange}
              maximumDate={new Date(2100, 11, 31)}
              minimumDate={new Date(1900, 0, 1)}
              locale="vi-VN"
              style={df.iosPicker}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

// ── ProfileTab ───────────────────────────────────────────────────────────────
export default function ProfileTab({ profileId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const data = await api.getProfile(profileId);
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        identityNumber: data.identityNumber || "",
        idIssuePlace: data.idIssuePlace || "",
        idIssueDate: data.idIssueDate || "",
        idExpirationDate: data.idExpirationDate || "",
      });
    } catch {
      Alert.alert("Lỗi", "Không thể tải hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateProfile(profileId, form);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ");
      setEditing(false);
      load();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật hồ sơ";
      Alert.alert("Lỗi", msg);
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({
    value: form[key] || "",
    onChangeText: (v) => setForm((p) => ({ ...p, [key]: v })),
  });

  const fd = (key) => ({
    value: form[key] || "",
    onChange: (v) => setForm((p) => ({ ...p, [key]: v })),
  });

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.navy} size="large" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[s.tabContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar hero ── */}
        <View style={styles.avatarHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile?.fullName?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          </View>
          <Text style={styles.avatarName}>{profile?.fullName || "—"}</Text>
          <View style={styles.pillRow}>
            {profile?.roomName && (
              <View style={styles.pill}>
                <Home size={11} color={C.sky} strokeWidth={2} />
                <Text style={styles.pillText}>Phòng {profile.roomName}</Text>
              </View>
            )}
            <View
              style={[
                styles.pill,
                { backgroundColor: "rgba(16,185,129,0.15)" },
              ]}
            >
              <BadgeCheck size={11} color="#6ee7b7" strokeWidth={2} />
              <Text style={[styles.pillText, { color: "#6ee7b7" }]}>
                Đã xác thực
              </Text>
            </View>
          </View>
        </View>

        {/* ── Chế độ xem ── */}
        {!editing && (
          <>
            <SectionCard
              IconComponent={Phone}
              iconColor={C.blue}
              title="Thông tin liên lạc"
              accent={C.navy}
            >
              <Divider />
              <InfoRow
                IconComponent={User}
                iconColor={C.blue}
                label="Họ và tên"
                value={profile?.fullName}
              />
              <InfoRow
                IconComponent={Phone}
                iconColor="#0891b2"
                label="Điện thoại"
                value={profile?.phone}
              />
              <InfoRow
                IconComponent={Mail}
                iconColor={C.teal}
                label="Email"
                value={profile?.email}
              />
              <InfoRow
                IconComponent={MapPin}
                iconColor={C.violet}
                label="Địa chỉ"
                value={profile?.address}
              />
            </SectionCard>

            <SectionCard
              IconComponent={CreditCard}
              iconColor={C.violet}
              title="Căn cước công dân"
              accent={C.violet}
            >
              <Divider />
              <InfoRow
                IconComponent={CreditCard}
                iconColor={C.violet}
                label="Số CCCD"
                value={profile?.identityNumber}
              />
              <InfoRow
                IconComponent={Building2}
                iconColor={C.amber}
                label="Nơi cấp"
                value={profile?.idIssuePlace}
              />
              <InfoRow
                IconComponent={CalendarDays}
                iconColor={C.teal}
                label="Ngày cấp"
                value={profile?.idIssueDate}
              />
              <InfoRow
                IconComponent={Clock3}
                iconColor={C.red}
                label="Ngày hết hạn"
                value={profile?.idExpirationDate}
              />
            </SectionCard>

            <TouchableOpacity
              style={s.primaryBtn}
              onPress={() => setEditing(true)}
              activeOpacity={0.85}
            >
              <Pencil size={16} color={C.white} strokeWidth={2} />
              <Text style={s.primaryBtnText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Chế độ chỉnh sửa ── */}
        {editing && (
          <>
            <SectionCard
              IconComponent={Phone}
              iconColor={C.blue}
              title="Thông tin liên lạc"
              accent={C.navy}
            >
              <Divider />
              <EditField
                label="Họ và tên"
                {...f("fullName")}
                IconComponent={User}
              />
              <EditField
                label="Điện thoại"
                {...f("phone")}
                IconComponent={Phone}
                keyboardType="phone-pad"
              />
              <EditField
                label="Email"
                {...f("email")}
                IconComponent={Mail}
                keyboardType="email-address"
              />
              <EditField
                label="Địa chỉ"
                {...f("address")}
                IconComponent={MapPin}
              />
            </SectionCard>

            <SectionCard
              IconComponent={CreditCard}
              iconColor={C.violet}
              title="Căn cước công dân"
              accent={C.violet}
            >
              <Divider />
              <EditField
                label="Số CCCD"
                {...f("identityNumber")}
                keyboardType="numeric"
                IconComponent={CreditCard}
              />
              <EditField
                label="Nơi cấp"
                {...f("idIssuePlace")}
                IconComponent={Building2}
              />
              <DateField
                label="Ngày cấp"
                {...fd("idIssueDate")}
                IconComponent={CalendarDays}
              />
              <DateField
                label="Ngày hết hạn"
                {...fd("idExpirationDate")}
                IconComponent={Clock3}
              />
            </SectionCard>

            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setEditing(false)}
              >
                <Text style={s.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <>
                    <Save size={15} color={C.white} strokeWidth={2} />
                    <Text style={s.saveBtnText}>Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  avatarHero: { alignItems: "center", paddingVertical: 24, gap: 10 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: C.navy,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 36, fontWeight: "900", color: C.white },
  avatarName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.slate900,
    letterSpacing: 0.1,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.navy,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: { fontSize: 12, color: C.sky, fontWeight: "600" },
});

const df = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  icon: { marginTop: 22 },
  inner: { flex: 1, gap: 4 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: C.slate500 || "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.slate100 || "#f1f5f9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  triggerText: {
    fontSize: 15,
    color: C.slate900 || "#0f172a",
    fontWeight: "500",
  },
  placeholder: { color: C.slate400 || "#94a3b8" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // safe area bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.slate900 || "#0f172a",
  },
  sheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  sheetBtnTextCancel: {
    fontSize: 15,
    color: C.slate500 || "#64748b",
    fontWeight: "500",
  },
  sheetBtnTextConfirm: {
    fontSize: 15,
    color: C.blue || "#2563eb",
    fontWeight: "700",
  },
  iosPicker: { width: "100%" },
});
