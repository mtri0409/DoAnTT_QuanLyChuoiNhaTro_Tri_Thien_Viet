import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { imgURL } from "../../../services/config";
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  Hash,
  FileText,
  Calendar,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react-native";
import apiMaintenanceRequest from "../../../services/apiMaintenanceaRequest";

const IS_IOS = Platform.OS === "ios";
const BASE_IMAGE_URL = imgURL;
const getImageUri = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (img.url) return img.url;
  if (img.imageName)
    return `${BASE_IMAGE_URL}/api/v1/maintenance/images/${img.imageName}`;
  return null;
};
const PRIMARY = "#1e3a8a";
const PRIMARY_LIGHT = "#3b82f6";
const { width: SCREEN_W } = Dimensions.get("window");

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    Icon: Clock,
    description: "Yêu cầu đang chờ đội kỹ thuật tiếp nhận.",
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    Icon: Wrench,
    description: "Đội kỹ thuật đang tiến hành xử lý.",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    Icon: CheckCircle2,
    description: "Sự cố đã được xử lý hoàn tất.",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#94a3b8",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    Icon: XCircle,
    description: "Yêu cầu đã bị hủy.",
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Timeline step ────────────────────────────────────────────────────────────
const STEPS = ["PENDING", "PROCESSING", "COMPLETED"];
const TimelineStep = ({ status, current }) => {
  const idx = STEPS.indexOf(status);
  const curIdx = STEPS.indexOf(current);
  const isCancelled = current === "CANCELLED";
  const done = !isCancelled && curIdx >= idx;
  const active = !isCancelled && curIdx === idx;
  const cfg = STATUS_CONFIG[status];

  return (
    <View style={tlStyles.stepWrap}>
      <View
        style={[
          tlStyles.dot,
          done && { backgroundColor: cfg.color, borderColor: cfg.color },
          active && { borderColor: cfg.color },
          isCancelled && { backgroundColor: "#e2e8f0", borderColor: "#e2e8f0" },
        ]}
      >
        {done && <cfg.Icon size={12} color="#fff" strokeWidth={2.5} />}
      </View>
      <Text
        style={[
          tlStyles.dotLabel,
          done && { color: cfg.color, fontWeight: "700" },
          !done && !active && { color: "#cbd5e1" },
        ]}
      >
        {cfg.label}
      </Text>
    </View>
  );
};

const tlStyles = StyleSheet.create({
  stepWrap: { alignItems: "center", gap: 6 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 64,
  },
});

// ─── Image viewer ─────────────────────────────────────────────────────────────
const ImageViewer = ({ images, visible, initialIndex, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIdx(initialIndex);
  }, [visible, initialIndex]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ivStyles.overlay}>
        <TouchableOpacity style={ivStyles.closeBtn} onPress={onClose}>
          <X size={22} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        <Image
          source={{ uri: images[idx] }}
          style={ivStyles.img}
          resizeMode="contain"
        />

        <View style={ivStyles.navRow}>
          <TouchableOpacity
            style={[ivStyles.navBtn, idx === 0 && ivStyles.navBtnDisabled]}
            onPress={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            <ChevronLeft size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={ivStyles.counter}>
            {idx + 1} / {images.length}
          </Text>
          <TouchableOpacity
            style={[
              ivStyles.navBtn,
              idx === images.length - 1 && ivStyles.navBtnDisabled,
            ]}
            onPress={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
            disabled={idx === images.length - 1}
          >
            <ChevronRight size={18} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ivStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: IS_IOS ? 60 : 36,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  img: {
    width: SCREEN_W,
    height: SCREEN_W,
  },
  navRow: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  navBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: { opacity: 0.3 },
  counter: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiMaintenanceRequest.getRequestById(id);
      const data = res?.data ?? res;
      setRequest(data);
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
    } catch {
      setError("Không thể tải chi tiết yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Hủy yêu cầu", "Bạn có chắc muốn hủy yêu cầu này không?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy yêu cầu",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await apiMaintenanceRequest.cancelRequest(id);
            fetchDetail();
          } catch {
            Alert.alert("Lỗi", "Không thể hủy yêu cầu. Vui lòng thử lại.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const cfg = request
    ? (STATUS_CONFIG[request.status] ?? {
        label: request.status,
        color: "#64748b",
        bg: "#f8fafc",
        border: "#e2e8f0",
        Icon: Clock,
        description: "",
      })
    : null;

  const images = request?.images ?? [];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tenant)/maintenance")}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>Chi tiết yêu cầu</Text>
          <Text style={styles.headerTitle}>
            {request ? `#REQ-${request.requestId}` : "Đang tải..."}
          </Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Wrench size={22} color="#fff" strokeWidth={2} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY_LIGHT} />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <AlertTriangle size={40} color="#ef4444" strokeWidth={1.5} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Status banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: cfg.bg, borderColor: cfg.border },
            ]}
          >
            <View style={styles.statusIconWrap}>
              <cfg.Icon size={26} color={cfg.color} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusLabel, { color: cfg.color }]}>
                {cfg.label}
              </Text>
              <Text style={styles.statusDesc}>{cfg.description}</Text>
            </View>
          </View>

          {/* Timeline */}
          {request.status !== "CANCELLED" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tiến trình xử lý</Text>
              <View style={styles.timeline}>
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <TimelineStep status={s} current={request.status} />
                    {i < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.tlLine,
                          STEPS.indexOf(request.status) > i && {
                            backgroundColor: STATUS_CONFIG[STEPS[i]].color,
                          },
                        ]}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* Info card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin yêu cầu</Text>

            <InfoRow
              icon={<Hash size={15} color={PRIMARY} strokeWidth={2} />}
              label="Mã yêu cầu"
            >
              <Text style={styles.infoValue}>#REQ-{request.requestId}</Text>
            </InfoRow>

            <View style={styles.divider} />

            <InfoRow
              icon={<Home size={15} color={PRIMARY} strokeWidth={2} />}
              label="Phòng"
            >
              <Text style={styles.infoValue}>
                {request.roomName ?? request.roomId ?? "—"}
              </Text>
            </InfoRow>

            {request.assetName || request.assetId ? (
              <>
                <View style={styles.divider} />
                <InfoRow
                  icon={<Wrench size={15} color={PRIMARY} strokeWidth={2} />}
                  label="Thiết bị"
                >
                  <Text style={styles.infoValue}>
                    {request.assetName ?? `#${request.assetId}`}
                  </Text>
                </InfoRow>
              </>
            ) : null}

            <View style={styles.divider} />

            <InfoRow
              icon={<Calendar size={15} color={PRIMARY} strokeWidth={2} />}
              label="Ngày gửi"
            >
              <Text style={styles.infoValue}>
                {formatDate(request.createdAt)}
              </Text>
            </InfoRow>

            {request.updatedAt && request.updatedAt !== request.createdAt && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  icon={<Calendar size={15} color="#64748b" strokeWidth={2} />}
                  label="Cập nhật lần cuối"
                >
                  <Text style={styles.infoValue}>
                    {formatDate(request.updatedAt)}
                  </Text>
                </InfoRow>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <FileText size={15} color={PRIMARY} strokeWidth={2} />
              <Text style={styles.cardTitle}>Mô tả sự cố</Text>
            </View>
            <Text style={styles.descText}>{request.description}</Text>
          </View>

          {/* Images */}
          {images.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <ImageIcon size={15} color={PRIMARY} strokeWidth={2} />
                <Text style={styles.cardTitle}>
                  Ảnh đính kèm ({images.length})
                </Text>
              </View>
              <View style={styles.imageGrid}>
                {images.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.imageTile}
                    onPress={() => {
                      setViewerIndex(i);
                      setViewerVisible(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: getImageUri(img) }}
                      style={styles.imageTileImg}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Staff note */}
          {request.staffNote ? (
            <View style={[styles.card, styles.noteCard]}>
              <Text style={styles.noteLabel}>💬 Phản hồi từ đội kỹ thuật</Text>
              <Text style={styles.noteText}>{request.staffNote}</Text>
            </View>
          ) : null}

          {/* Cancel button */}
          {request.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled]}
              onPress={handleCancel}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ban size={16} color="#fff" strokeWidth={2} />
                  <Text style={styles.cancelBtnText}>Hủy yêu cầu</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.ScrollView>
      )}

      <ImageViewer
        images={images.map(getImageUri).filter(Boolean)}
        visible={viewerVisible}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const InfoRow = ({ icon, label, children }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

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
  body: { padding: 16, paddingTop: 20, paddingBottom: 40, gap: 14 },

  // Status banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: { fontSize: 15, fontWeight: "800" },
  statusDesc: { fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 18 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Timeline
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tlLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, color: "#1e293b", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#f1f5f9" },

  // Description
  descText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },

  // Images
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageTile: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  imageTileImg: { width: "100%", height: "100%" },

  // Staff note
  noteCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  noteText: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 20,
  },

  // Cancel btn
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#dc2626",
    marginTop: 4,
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // States
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  errorText: { fontSize: 14, color: "#64748b", textAlign: "center" },
  retryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
