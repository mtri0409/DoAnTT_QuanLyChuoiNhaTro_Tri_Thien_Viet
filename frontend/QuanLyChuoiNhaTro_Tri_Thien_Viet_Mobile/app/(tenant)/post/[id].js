// app/(tenant)/post/[id].js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  DoorOpen,
  Clock,
  Users,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  BadgeCheck,
  Ban,
  AlertTriangle,
  DollarSign,
  RotateCcw,
  Trash2,
} from "lucide-react-native";
import apiPost from "../../../services/apiPost";
import apiRoom from "../../../services/apiRoom";
import apiRoomMedia from "../../../services/apiRoomMedia";
import { imgURL } from "../../../services/config";

const IS_IOS = Platform.OS === "ios";
const { width: SCREEN_W } = Dimensions.get("window");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : null;

const daysLeft = (expiresAt) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000))
    : null;

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${imgURL}${url}`;
};

const STATUS_CFG = {
  ACTIVE: { label: "Đang hoạt động", color: "#10b981", bg: "#ecfdf5" },
  CLOSED: { label: "Đã đóng", color: "#64748b", bg: "#f1f5f9" },
  EXPIRED: { label: "Hết hạn", color: "#f59e0b", bg: "#fffbeb" },
};

// ─── Image Carousel ───────────────────────────────────────────────────────────
const ImageCarousel = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <View style={styles.carouselEmpty}>
        <ImageOff size={40} color="#cbd5e1" strokeWidth={1.5} />
        <Text style={styles.carouselEmptyText}>Chưa có ảnh phòng</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselWrap}>
      <Image
        source={{ uri: getFullImageUrl(images[index]?.url) }}
        style={styles.carouselImg}
        resizeMode="cover"
      />
      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.carouselArrow, styles.carouselArrowLeft]}
            onPress={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
          >
            <ChevronLeft size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.carouselArrow, styles.carouselArrowRight]}
            onPress={() => setIndex((i) => (i + 1) % images.length)}
          >
            <ChevronRight size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.dotRow}>
            {images.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIndex(i)}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <View style={styles.carouselCounter}>
            <Text style={styles.carouselCounterText}>
              {index + 1}/{images.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  valueStyle,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Icon size={14} color={iconColor} strokeWidth={2} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  </View>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, iconColor, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Icon size={15} color={iconColor} strokeWidth={2} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id;

  const rawPostData = Array.isArray(params.postData)
    ? params.postData[0]
    : params.postData;

  // ── Tất cả hooks khai báo trước, đúng thứ tự ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const parsedPost = useMemo(() => {
    if (!rawPostData) return null;
    try {
      return JSON.parse(rawPostData);
    } catch {
      return null;
    }
  }, [rawPostData]);

  const [post, setPost] = useState(parsedPost);
  const [roomDetail, setRoomDetail] = useState(null);
  const [roomMedia, setRoomMedia] = useState([]);
  const [loading, setLoading] = useState(!parsedPost);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync post khi params thay đổi
  useEffect(() => {
    if (parsedPost) setPost(parsedPost);
  }, [rawPostData]);

  useEffect(() => {
    const load = async () => {
      try {
        let currentPost = post;
        // Nếu chưa có post data thì fetch (dùng user endpoint để lấy cả CLOSED/EXPIRED)
        if (!currentPost) {
          const postRes = await apiPost.getMyPostById(id);
          currentPost = postRes?.data ?? postRes;
          setPost(currentPost);
        }
        // Load room detail — dùng currentPost (không dùng post state vì có thể chưa update)
        const roomId = currentPost?.roomId;
        if (roomId) {
          try {
            // Gọi song song: thông tin phòng + danh sách media
            const [roomData, mediaData] = await Promise.allSettled([
              apiRoom.getRoomById(roomId),
              apiRoomMedia.getMediaByRoomId(roomId),
            ]);

            if (roomData.status === "fulfilled") {
              setRoomDetail(roomData.value?.data ?? roomData.value);
            }
            if (mediaData.status === "fulfilled") {
              const media = mediaData.value?.data ?? mediaData.value;
              setRoomMedia(Array.isArray(media) ? media : []);
            }
          } catch {
            // Room detail optional
          }
        }
      } catch (err) {
        if (!post) {
          setError("Không thể tải bài đăng. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading]);

  const handleClose = () => {
    Alert.alert("Đóng bài đăng", "Bạn có chắc muốn đóng bài đăng này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đóng bài",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await apiPost.closePost(id);
            setPost((p) => ({ ...p, status: "CLOSED" }));
          } catch {
            Alert.alert("Lỗi", "Không thể đóng bài đăng. Thử lại sau.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Xoá bài đăng", "Hành động này không thể hoàn tác.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await apiPost.deletePost(id);
            // Quay về trang danh sách post
            router.replace("/(tenant)/post");
          } catch {
            Alert.alert("Lỗi", "Không thể xoá bài đăng. Thử lại sau.");
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleRepost = async () => {
    setActionLoading(true);
    try {
      await apiPost.repost(id);
      Alert.alert("Thành công", "Đã đăng lại bài thành công.", [
        { text: "OK", onPress: () => router.replace("/(tenant)/post") },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể đăng lại. Thử lại sau.");
      setActionLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(tenant)/post")}
          >
            <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Chi tiết bài đăng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Đang tải bài đăng...</Text>
        </View>
      </View>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(tenant)/post")}
          >
            <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Chi tiết bài đăng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorWrap}>
          <AlertTriangle size={40} color="#f59e0b" strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Không tìm thấy</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const mediaList =
    roomMedia.length > 0 ? roomMedia : (roomDetail?.roomMedia ?? []);
  const images = mediaList
    .filter((m) => !m.mediaType || m.mediaType.startsWith("image"))
    .sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));

  const left = daysLeft(post?.expiresAt);
  const isUrgent = left !== null && left <= 5 && post?.status === "ACTIVE";
  const statusCfg = STATUS_CFG[post?.status] ?? STATUS_CFG.CLOSED;
  const address =
    post?.branchAddress || roomDetail?.floor?.branch?.address || null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tenant)/post")}
        >
          <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Chi tiết bài đăng</Text>
          <Text style={styles.topBarSub}>#POST-{post.postId}</Text>
        </View>
        {left !== null && (
          <View
            style={[
              styles.daysLeftBadge,
              isUrgent && styles.daysLeftBadgeUrgent,
            ]}
          >
            <Clock
              size={10}
              color={isUrgent ? "#ef4444" : "#64748b"}
              strokeWidth={2}
            />
            <Text
              style={[styles.daysLeftText, isUrgent && { color: "#ef4444" }]}
            >
              {left}d
            </Text>
          </View>
        )}
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Image Carousel ── */}
        <ImageCarousel images={images} />

        {/* ── Status + Room ── */}
        <SectionCard
          title="Thông tin phòng"
          icon={DoorOpen}
          iconColor="#3b82f6"
        >
          {/* Status pill */}
          <View style={styles.statusPill}>
            <BadgeCheck size={12} color={statusCfg.color} strokeWidth={2} />
            <Text style={[styles.statusPillText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>

          <View style={{ height: 12 }} />

          <InfoRow
            icon={DoorOpen}
            iconColor="#3b82f6"
            iconBg="#eff6ff"
            label="Tên phòng"
            value={
              post.roomName + (post.branchName ? ` · ${post.branchName}` : "")
            }
          />

          {address && (
            <InfoRow
              icon={MapPin}
              iconColor="#ef4444"
              iconBg="#fef2f2"
              label="Địa chỉ"
              value={address}
            />
          )}

          {roomDetail?.price && (
            <InfoRow
              icon={DollarSign}
              iconColor="#10b981"
              iconBg="#ecfdf5"
              label="Giá thuê"
              value={`${formatPrice(roomDetail.price)} /tháng`}
              valueStyle={{ color: "#10b981", fontWeight: "700" }}
            />
          )}

          {roomDetail?.currentPeople != null &&
            roomDetail?.maxPeople != null && (
              <InfoRow
                icon={Users}
                iconColor="#6366f1"
                iconBg="#eef2ff"
                label="Số người"
                value={`${roomDetail.currentPeople}/${roomDetail.maxPeople} người`}
              />
            )}
        </SectionCard>

        {/* ── Author ── */}
        <SectionCard title="Người đăng" icon={User} iconColor="#06b6d4">
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {post.authorName?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.authorRole}>Thành viên phòng</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Time ── */}
        <SectionCard title="Thời hạn bài đăng" icon={Clock} iconColor="#f59e0b">
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>NGÀY ĐĂNG</Text>
              <Text style={styles.timeValue}>{formatDate(post.createdAt)}</Text>
            </View>
            {left !== null && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>CÒN LẠI</Text>
                <Text
                  style={[styles.timeValue, isUrgent && { color: "#ef4444" }]}
                >
                  {left} ngày
                </Text>
              </View>
            )}
            {post.expiresAt && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>HẾT HẠN</Text>
                <Text style={styles.timeValue}>
                  {formatDate(post.expiresAt)}
                </Text>
              </View>
            )}
          </View>

          {isUrgent && (
            <View style={styles.urgentBanner}>
              <AlertTriangle size={13} color="#ef4444" strokeWidth={2} />
              <Text style={styles.urgentBannerText}>
                Bài đăng sắp hết hạn! Hãy đăng lại nếu cần.
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ── Description ── */}
        <SectionCard title="Mô tả" icon={FileText} iconColor="#10b981">
          <Text style={styles.description}>{post.description}</Text>
        </SectionCard>

        {/* ── Actions ── */}
        <View style={styles.actionsSection}>
          {post.status === "ACTIVE" && (
            <TouchableOpacity
              style={[
                styles.actionCloseBtn,
                actionLoading && styles.actionBtnDisabled,
              ]}
              onPress={handleClose}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ban size={16} color="#fff" strokeWidth={2} />
                  <Text style={styles.actionCloseBtnText}>Đóng bài đăng</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {post.status === "EXPIRED" && (
            <TouchableOpacity
              style={[
                styles.actionRepostBtn,
                actionLoading && styles.actionBtnDisabled,
              ]}
              onPress={handleRepost}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RotateCcw size={16} color="#fff" strokeWidth={2} />
                  <Text style={styles.actionRepostBtnText}>Đăng lại bài</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionDeleteBtn,
              actionLoading && styles.actionBtnDisabled,
            ]}
            onPress={handleDelete}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Trash2 size={16} color="#fff" strokeWidth={2} />
                <Text style={styles.actionDeleteBtnText}>Xoá bài đăng</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Top bar
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
  topBarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
  topBarSub: {
    fontSize: 11,
    color: "#93c5fd",
    fontWeight: "500",
    marginTop: 1,
  },
  daysLeftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  daysLeftBadgeUrgent: { backgroundColor: "rgba(239,68,68,0.2)" },
  daysLeftText: { fontSize: 12, color: "#94a3b8", fontWeight: "700" },

  scrollContent: { paddingBottom: 20 },

  // Carousel
  carouselWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 0.62,
    backgroundColor: "#e2e8f0",
    position: "relative",
  },
  carouselImg: { width: "100%", height: "100%" },
  carouselEmpty: {
    width: SCREEN_W,
    height: SCREEN_W * 0.55,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  carouselEmptyText: { fontSize: 13, color: "#94a3b8" },
  carouselArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselArrowLeft: { left: 10 },
  carouselArrowRight: { right: 10 },
  dotRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: { backgroundColor: "#fff", width: 18 },
  carouselCounter: {
    position: "absolute",
    top: 10,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  carouselCounterText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // Section card
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 18,
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

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    lineHeight: 20,
  },

  // Status pill
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillText: { fontSize: 12, fontWeight: "700" },

  // Author
  authorRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  authorName: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  authorRole: { fontSize: 12, color: "#64748b", marginTop: 2 },

  // Time
  timeRow: { flexDirection: "row", gap: 12 },
  timeItem: { flex: 1 },
  timeLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    marginBottom: 4,
  },
  timeValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  urgentBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },

  // Description
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    whiteSpace: "pre-wrap",
  },

  // Actions section
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  actionCloseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#d97706",
  },
  actionCloseBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  actionRepostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#059669",
  },
  actionRepostBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  actionDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#dc2626",
  },
  actionDeleteBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  actionBtnDisabled: { opacity: 0.5 },

  // Loading / Error
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  errorTitle: { fontSize: 17, fontWeight: "800", color: "#1e293b" },
  errorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
  },
  errorBtn: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  errorBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
