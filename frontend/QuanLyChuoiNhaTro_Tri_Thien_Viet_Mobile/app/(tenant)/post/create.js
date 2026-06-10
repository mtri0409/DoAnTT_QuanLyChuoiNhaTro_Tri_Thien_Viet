// app/(tenant)/post/create.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  TextInput,
  Animated,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Send,
  DoorOpen,
  PenLine,
  CheckCircle2,
  ImageOff,
  ChevronDown,
  Lightbulb,
  Check,
} from "lucide-react-native";
import apiPost from "../../../services/apiPost";
import apiRoom from "../../../services/apiRoom";
import { imgURL } from "../../../services/config";

const IS_IOS = Platform.OS === "ios";
const MIN_DESC = 20;
const MAX_DESC = 1000;

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : null;

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${imgURL}${url}`;
};

// ─── Room Picker ──────────────────────────────────────────────────────────────
const RoomPicker = ({ rooms, selectedRoom, onSelect, error }) => {
  const [open, setOpen] = useState(false);

  if (rooms.length === 1) {
    return (
      <View style={styles.roomSingle}>
        <DoorOpen size={14} color="#3b82f6" strokeWidth={2} />
        <Text style={styles.roomSingleText}>{rooms[0].roomName}</Text>
        <CheckCircle2 size={14} color="#10b981" strokeWidth={2} />
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.roomPicker, error && styles.inputError]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <DoorOpen
          size={15}
          color={selectedRoom ? "#3b82f6" : "#94a3b8"}
          strokeWidth={2}
        />
        <Text
          style={[styles.roomPickerText, !selectedRoom && { color: "#94a3b8" }]}
        >
          {selectedRoom ? selectedRoom.roomName : "Chọn phòng..."}
        </Text>
        <ChevronDown
          size={15}
          color="#94a3b8"
          strokeWidth={2}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {rooms.map((r) => (
            <TouchableOpacity
              key={r.roomId}
              style={[
                styles.dropdownItem,
                selectedRoom?.roomId === r.roomId && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(r);
                setOpen(false);
              }}
            >
              <DoorOpen
                size={13}
                color={
                  selectedRoom?.roomId === r.roomId ? "#3b82f6" : "#64748b"
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedRoom?.roomId === r.roomId && {
                    color: "#3b82f6",
                    fontWeight: "700",
                  },
                ]}
              >
                {r.roomName}
              </Text>
              {selectedRoom?.roomId === r.roomId && (
                <Check size={13} color="#3b82f6" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
};

// ─── Room Preview Card ────────────────────────────────────────────────────────
const RoomPreview = ({ room, detail, loading }) => {
  if (loading) {
    return (
      <View style={[styles.previewCard, { alignItems: "center", padding: 24 }]}>
        <ActivityIndicator size="small" color="#1e3a8a" />
        <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
          Đang tải thông tin phòng...
        </Text>
      </View>
    );
  }

  const thumbnail =
    detail?.roomMedia?.find((m) => m.isThumbnail) ?? detail?.roomMedia?.[0];

  return (
    <View style={styles.previewCard}>
      {thumbnail ? (
        <Image
          source={{ uri: getFullImageUrl(thumbnail.url) }}
          style={styles.previewImg}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.previewImgEmpty}>
          <ImageOff size={28} color="#cbd5e1" strokeWidth={1.5} />
        </View>
      )}
      <View style={styles.previewBody}>
        <View style={styles.previewRoomRow}>
          <DoorOpen size={13} color="#3b82f6" strokeWidth={2} />
          <Text style={styles.previewRoomName}>{room.roomName}</Text>
        </View>
        {detail?.price && (
          <Text style={styles.previewPrice}>
            {formatPrice(detail.price)}
            <Text style={styles.previewPriceUnit}> /tháng</Text>
          </Text>
        )}
        {detail?.currentPeople != null && detail?.maxPeople != null && (
          <Text style={styles.previewPeople}>
            {detail.currentPeople}/{detail.maxPeople} người
          </Text>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CreatePostScreen() {
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [roomError, setRoomError] = useState(null);

  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // create.js ~ dòng 219
    const load = async () => {
      try {
        const data = await apiRoom.getMyRooms();
        console.log("✅ getMyRooms data:", JSON.stringify(data));
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.data)
              ? data.data
              : [];
        console.log("📋 list:", list);
        setRooms(list);
        if (list.length === 1) setSelectedRoom(list[0]);
      } catch (err) {
        console.log(
          "❌ getMyRooms error:",
          err?.response?.status,
          err?.response?.data,
          err?.message,
        );
        setRoomError("Không thể tải danh sách phòng.");
      } finally {
        setLoadingRooms(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedRoom) {
      setRoomDetail(null);
      return;
    }
    const load = async () => {
      setLoadingDetail(true);
      try {
        const data = await apiRoom.getRoomById(selectedRoom.roomId);
        // interceptor đã unwrap → data là object phòng luôn, không cần data?.data
        setRoomDetail(data?.data ?? data);
      } catch {
        setRoomDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    load();
  }, [selectedRoom]);

  const validate = () => {
    const errs = {};
    if (!selectedRoom) errs.room = "Vui lòng chọn phòng.";
    if (!description.trim()) errs.description = "Mô tả không được để trống.";
    else if (description.trim().length < MIN_DESC)
      errs.description = `Mô tả phải có ít nhất ${MIN_DESC} ký tự.`;
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      await apiPost.createPost({
        roomId: selectedRoom.roomId,
        description: description.trim(),
      });
      Alert.alert("Thành công", "Đăng bài thành công!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tenant)/post"),
        },
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Lỗi khi đăng bài. Thử lại sau.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const descLen = description.length;
  const descShort = descLen > 0 && descLen < MIN_DESC;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Đăng bài ghép phòng</Text>
          <Text style={styles.topBarSub}>
            Hiển thị công khai · hết hạn sau 30 ngày
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (submitting || rooms.length === 0) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || rooms.length === 0}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={16} color="#fff" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── API Error ── */}
        {apiError && (
          <View style={styles.apiErrorBanner}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        )}

        {/* ── Chọn phòng ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <DoorOpen size={15} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Chọn phòng</Text>
          </View>

          {loadingRooms ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#1e3a8a" />
              <Text style={styles.loadingRowText}>
                Đang tải danh sách phòng...
              </Text>
            </View>
          ) : roomError ? (
            <View style={styles.warnBanner}>
              <Text style={styles.warnText}>{roomError}</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Bạn chưa là thành viên của phòng nào. Vui lòng liên hệ quản lý
                để được thêm vào phòng.
              </Text>
            </View>
          ) : (
            <RoomPicker
              rooms={rooms}
              selectedRoom={selectedRoom}
              onSelect={(r) => {
                setSelectedRoom(r);
                setErrors((p) => ({ ...p, room: undefined }));
              }}
              error={errors.room}
            />
          )}
        </View>

        {/* ── Preview phòng ── */}
        {selectedRoom && (
          <RoomPreview
            room={selectedRoom}
            detail={roomDetail}
            loading={loadingDetail}
          />
        )}

        {/* ── Mô tả ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <PenLine size={15} color="#06b6d4" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Nội dung bài đăng</Text>
          </View>

          <Text style={styles.fieldLabel}>
            Mô tả <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.textarea, errors.description && styles.inputError]}
            value={description}
            onChangeText={(v) => {
              setDescription(v);
              setErrors((p) => ({ ...p, description: undefined }));
              setApiError(null);
            }}
            multiline
            numberOfLines={8}
            maxLength={MAX_DESC}
            placeholder={`Mô tả về phòng, yêu cầu người ghép, giá thuê chia sẻ, liên hệ... (tối thiểu ${MIN_DESC} ký tự)`}
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />

          {errors.description && (
            <Text style={styles.fieldError}>{errors.description}</Text>
          )}

          <View style={styles.counterRow}>
            <Text
              style={[styles.counterHint, descShort && { color: "#ef4444" }]}
            >
              {descShort ? `Cần thêm ${MIN_DESC - descLen} ký tự` : ""}
            </Text>
            <Text
              style={[
                styles.counter,
                descLen >= MAX_DESC && { color: "#ef4444" },
              ]}
            >
              {descLen}/{MAX_DESC}
            </Text>
          </View>

          {/* Tip */}
          <View style={styles.tipBox}>
            <Lightbulb size={13} color="#f59e0b" strokeWidth={2} />
            <Text style={styles.tipText}>
              Gợi ý: nêu rõ giá thuê chia sẻ, giới tính, thói quen sinh hoạt để
              tìm người phù hợp nhanh hơn.
            </Text>
          </View>
        </View>

        {/* ── Submit bottom ── */}
        <TouchableOpacity
          style={[
            styles.submitFullBtn,
            (submitting || rooms.length === 0) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || rooms.length === 0}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Send size={16} color="#fff" strokeWidth={2.5} />
              <Text style={styles.submitFullBtnText}>Đăng bài</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  topBar: {
    backgroundColor: "#1e3a8a",
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: { flex: 1 },
  topBarTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  topBarSub: {
    fontSize: 11,
    color: "#93c5fd",
    fontWeight: "500",
    marginTop: 1,
  },
  submitBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { opacity: 0.45 },

  scrollContent: { padding: 16, paddingTop: 14 },

  apiErrorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  apiErrorText: { fontSize: 13, color: "#ef4444", fontWeight: "600" },

  // Section card
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b" },

  // Room picker
  roomSingle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roomSingleText: { fontSize: 14, fontWeight: "700", color: "#1e3a8a" },
  roomPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  roomPickerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  dropdownItemActive: { backgroundColor: "#eff6ff" },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  // Preview card
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImg: { width: "100%", height: 140 },
  previewImgEmpty: {
    width: "100%",
    height: 100,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBody: { padding: 14 },
  previewRoomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  previewRoomName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  previewPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10b981",
    marginBottom: 2,
  },
  previewPriceUnit: { fontSize: 12, fontWeight: "500", color: "#94a3b8" },
  previewPeople: { fontSize: 12, color: "#64748b" },

  // Form
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#1e293b",
    minHeight: 160,
    lineHeight: 22,
  },
  inputError: { borderColor: "#ef4444" },
  fieldError: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 5,
    fontWeight: "600",
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  counterHint: { fontSize: 12, color: "#94a3b8" },
  counter: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },

  // Tip
  tipBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 12, color: "#92400e", lineHeight: 18 },

  // Banners
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 4,
  },
  loadingRowText: { fontSize: 13, color: "#64748b" },
  warnBanner: { backgroundColor: "#fffbeb", borderRadius: 12, padding: 12 },
  warnText: { fontSize: 13, color: "#92400e" },
  infoBanner: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 12 },
  infoText: { fontSize: 13, color: "#1e40af", lineHeight: 20 },

  // Submit full button
  submitFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1e3a8a",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  submitFullBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
