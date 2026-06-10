import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Wrench,
  ArrowLeft,
  FileText,
  ImagePlus,
  X,
  Send,
  Home,
  CheckCircle2,
  ChevronDown,
} from "lucide-react-native";
import apiMaintenanceRequest from "../../../services/apiMaintenanceaRequest";
import apiRoom from "../../../services/apiRoom";
import { useLocalSearchParams } from "expo-router";

const IS_IOS = Platform.OS === "ios";
const PRIMARY = "#1e3a8a";
const PRIMARY_LIGHT = "#3b82f6";
const MAX_IMAGES = 5;

// Danh mục sự cố — đồng bộ với web
const CATEGORIES = [
  { label: "-- Chọn danh mục --", value: "" },
  { label: "Điện", value: "ELECTRICAL" },
  { label: "Nước / Ống nước", value: "PLUMBING" },
  { label: "Điều hòa / Quạt", value: "HVAC" },
  { label: "Cửa / Khóa", value: "DOOR_LOCK" },
  { label: "Nội thất / Đồ dùng", value: "FURNITURE" },
  { label: "Internet / TV", value: "INTERNET_TV" },
  { label: "Tường / Trần / Sàn", value: "STRUCTURE" },
  { label: "Khác", value: "OTHER" },
];

export default function CreateMaintenanceScreen() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Room state (tự load giống web) ──
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomError, setRoomError] = useState(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  const headerAnim = useRef(new Animated.Value(-30)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const { roomId, roomName } = useLocalSearchParams();

  useEffect(() => {
    const loadRooms = async () => {
      // Nếu có roomId truyền qua params → dùng luôn, không cần gọi API
      if (roomId) {
        const room = {
          roomId: Number(roomId),
          roomName: roomName ?? `Phòng #${roomId}`,
        };
        setRooms([room]);
        setSelectedRoom(room);
        setLoadingRooms(false);
        return;
      }

      // Không có params → tự load danh sách phòng của tenant
      try {
        const res = await apiRoom.getMyRooms();
        // Axio interceptor có thể đã unwrap, thử cả hai dạng
        const raw = res?.data ?? res;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
            ? raw.content
            : [];

        if (list.length === 0) {
          setRoomError(
            "Bạn chưa đang thuê phòng nào. Vui lòng liên hệ quản lý.",
          );
        } else {
          setRooms(list);
          if (list.length === 1) setSelectedRoom(list[0]);
        }
      } catch {
        setRoomError("Không thể tải danh sách phòng. Vui lòng thử lại.");
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, []);

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

  const animateSuccess = () => {
    Animated.spring(successScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const pickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Giới hạn ảnh", `Tối đa ${MAX_IMAGES} ảnh mỗi yêu cầu.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Vui lòng cấp quyền truy cập thư viện ảnh.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - images.length,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedRoom) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn phòng.");
      return;
    }
    if (!category) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn danh mục sự cố.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả sự cố.");
      return;
    }
    setSubmitting(true);
    try {
      const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label;
      const fullDescription = categoryLabel
        ? `[${categoryLabel}] ${description.trim()}`
        : description.trim();

      const res = await apiMaintenanceRequest.createRequest(
        selectedRoom.roomId,
        fullDescription,
      );

      // FIX: parse requestId an toàn — axiosClient có thể đã unwrap data
      const requestId =
        res?.data?.requestId ?? res?.requestId ?? res?.data?.id ?? res?.id;

      if (images.length > 0 && requestId) {
        // FIX: React Native không có Web API `File` — dùng object { uri, name, type }
        const files = images.map((img) => ({
          uri: img.uri,
          name: `image_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
          type: img.mimeType ?? "image/jpeg",
        }));
        await apiMaintenanceRequest.uploadImages(requestId, files);
      }

      setSuccess(true);
      animateSuccess();
      setTimeout(() => router.replace("/(tenant)/maintenance"), 2200);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Không thể gửi yêu cầu. Vui lòng thử lại.";
      Alert.alert("Lỗi", typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={styles.successScreen}>
          <Animated.View
            style={[
              styles.successCard,
              { transform: [{ scale: successScale }] },
            ]}
          >
            <View style={styles.successIconWrap}>
              <CheckCircle2 size={52} color="#10b981" strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>Gửi thành công!</Text>
            <Text style={styles.successSub}>
              Yêu cầu của bạn đã được ghi nhận.{"\n"}Chúng tôi sẽ xử lý sớm nhất
              có thể.
            </Text>
            <ActivityIndicator
              size="small"
              color={PRIMARY_LIGHT}
              style={{ marginTop: 16 }}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={IS_IOS ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>Hỗ trợ cư dân</Text>
          <Text style={styles.headerTitle}>Gửi yêu cầu sửa chữa</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Wrench size={22} color="#fff" strokeWidth={2} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Chọn phòng (tự load, giống web) ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={14} color={PRIMARY} strokeWidth={2} />
            <Text style={styles.sectionLabel}>Phòng của bạn</Text>
            <Text style={styles.required}>*</Text>
          </View>

          {loadingRooms ? (
            <View style={styles.roomLoading}>
              <ActivityIndicator size="small" color={PRIMARY_LIGHT} />
              <Text style={styles.roomLoadingText}>Đang tải phòng...</Text>
            </View>
          ) : roomError ? (
            <Text style={styles.roomError}>{roomError}</Text>
          ) : rooms.length === 0 ? (
            <Text style={styles.roomEmpty}>
              Bạn chưa đang thuê phòng nào. Vui lòng liên hệ quản lý.
            </Text>
          ) : rooms.length === 1 ? (
            // Chỉ 1 phòng → hiển thị badge, không cần chọn
            <View style={styles.roomBadge}>
              <Home size={13} color={PRIMARY} strokeWidth={2} />
              <Text style={styles.roomBadgeText}>{rooms[0].roomName}</Text>
              <CheckCircle2 size={13} color={PRIMARY} strokeWidth={2} />
            </View>
          ) : (
            // Nhiều phòng → dropdown chọn
            <>
              <TouchableOpacity
                style={styles.roomPicker}
                onPress={() => setShowRoomPicker((v) => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.roomPickerText}>
                  {selectedRoom ? selectedRoom.roomName : "-- Chọn phòng --"}
                </Text>
                <ChevronDown size={16} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
              {showRoomPicker && (
                <View style={styles.dropdownList}>
                  {rooms.map((r) => (
                    <TouchableOpacity
                      key={r.roomId}
                      style={[
                        styles.dropdownItem,
                        selectedRoom?.roomId === r.roomId &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedRoom(r);
                        setShowRoomPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedRoom?.roomId === r.roomId &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {r.roomName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Danh mục sự cố ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wrench size={14} color={PRIMARY} strokeWidth={2} />
            <Text style={styles.sectionLabel}>Danh mục sự cố</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TouchableOpacity
            style={styles.roomPicker}
            onPress={() => setShowCategoryPicker((v) => !v)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.roomPickerText, !category && { color: "#94a3b8" }]}
            >
              {category
                ? CATEGORIES.find((c) => c.value === category)?.label
                : "-- Chọn danh mục --"}
            </Text>
            <ChevronDown size={16} color="#64748b" strokeWidth={2} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.dropdownList}>
              {CATEGORIES.filter((c) => c.value !== "").map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.dropdownItem,
                    category === c.value && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(c.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      category === c.value && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={14} color={PRIMARY} strokeWidth={2} />
            <Text style={styles.sectionLabel}>Mô tả sự cố</Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết sự cố bạn gặp phải... (vd: điều hòa không hoạt động, vòi nước bị rò rỉ...)"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ImagePlus size={14} color="#64748b" strokeWidth={2} />
            <Text style={styles.sectionLabel}>Ảnh đính kèm</Text>
            <Text style={styles.optional}>
              ({images.length}/{MAX_IMAGES})
            </Text>
          </View>

          <View style={styles.imageGrid}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageTile}>
                <Image
                  source={{ uri: img.uri }}
                  style={styles.imageTileImg}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => removeImage(idx)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <X size={12} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < MAX_IMAGES && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <ImagePlus size={24} color="#94a3b8" strokeWidth={1.5} />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHint}>
            Ảnh giúp đội kỹ thuật xác định sự cố nhanh hơn.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (submitting || loadingRooms || !selectedRoom || !category) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || loadingRooms || !selectedRoom || !category}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Send size={16} color="#fff" strokeWidth={2} />
              <Text style={styles.submitText}>Gửi yêu cầu</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerSub: { fontSize: 12, color: "#93c5fd", fontWeight: "500" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Body
  body: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Section
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  required: { fontSize: 13, color: "#ef4444", fontWeight: "700" },
  optional: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },

  // Room picker
  roomLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  roomLoadingText: { fontSize: 13, color: "#94a3b8" },
  roomError: { fontSize: 13, color: "#ef4444" },
  roomEmpty: { fontSize: 13, color: "#64748b", fontStyle: "italic" },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  roomBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },
  roomPicker: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomPickerText: {
    fontSize: 14,
    color: "#1e293b",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginTop: -4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItemSelected: {
    backgroundColor: "#eff6ff",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1e293b",
  },
  dropdownItemTextSelected: {
    color: PRIMARY,
    fontWeight: "700",
  },

  // Input
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1e293b",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // Image picker
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageTile: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imageTileImg: { width: "100%", height: "100%" },
  removeImgBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  addImageText: { fontSize: 10, color: "#94a3b8", fontWeight: "600" },
  imageHint: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },

  // Submit
  submitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Success
  successScreen: {
    flex: 1,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 36,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
    gap: 8,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.2,
  },
  successSub: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },
});
