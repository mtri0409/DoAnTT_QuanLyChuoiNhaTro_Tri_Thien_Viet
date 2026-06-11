// app/(tenant)/home.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import apiProfile from "../../services/apiProfile";
import apiNotification from "../../services/apiNotification";
import {
  Bell,
  Home,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  User,
  CreditCard,
  FileText,
  Wrench,
  ChevronRight,
  CheckCircle,
  LogOut,
  AlertCircle,
  Clock,
  UserPlus,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

const { width } = Dimensions.get("window");
const IS_IOS = Platform.OS === "ios";

// ─── Notification config ──────────────────────────────────────────────────────
const NOTI_CONFIG = {
  CONTRACT: {
    color: "#3b82f6",
    bg: "#eff6ff",
    label: "Hợp đồng",
    Icon: FileText,
  },
  BILL: { color: "#10b981", bg: "#ecfdf5", label: "Hóa đơn", Icon: CreditCard },
  OVERDUE: {
    color: "#ef4444",
    bg: "#fef2f2",
    label: "Quá hạn",
    Icon: AlertCircle,
  },
  MAINTENANCE: {
    color: "#f59e0b",
    bg: "#fffbeb",
    label: "Bảo trì",
    Icon: Wrench,
  },
  DEFAULT: { color: "#06b6d4", bg: "#ecfeff", label: "Thông báo", Icon: Bell },
};
const getNotiCfg = (type) =>
  NOTI_CONFIG[type?.toUpperCase()] || NOTI_CONFIG.DEFAULT;

// ─── Animated greeting header ─────────────────────────────────────────────────
const GreetingHeader = ({ profile, notifCount, onBellPress }) => {
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Animated.View
      style={[
        styles.header,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Top row */}
      <View style={styles.headerTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{greeting}</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {profile?.fullName || "Người thuê"}
          </Text>
          <Text style={styles.headerDate}>{today}</Text>
        </View>

        {/* Bell button */}
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={onBellPress}
          activeOpacity={0.8}
        >
          <Bell size={22} color="#fff" strokeWidth={2} />
          {notifCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {notifCount > 9 ? "9+" : notifCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Room info pill */}
      {profile && (
        <View style={styles.infoPill}>
          <PillChip Icon={Home} text={`Phòng ${profile.roomName || "—"}`} />
          <View style={styles.pillDivider} />
          <PillChip
            Icon={Calendar}
            text={`HĐ: ${profile.contractEndDate || "N/A"}`}
          />
        </View>
      )}
    </Animated.View>
  );
};

const PillChip = ({ Icon, text }) => (
  <View style={styles.pillChip}>
    <Icon size={13} color="#93c5fd" strokeWidth={2} />
    <Text style={styles.pillChipText}>{text}</Text>
  </View>
);

// ─── Info card (stat) ─────────────────────────────────────────────────────────
const InfoCard = ({ Icon, label, value, color, bg, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      tension: 90,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.infoCard,
        { backgroundColor: bg, borderColor: color + "25" },
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.infoIconWrap}>
        <Icon size={22} color={color} strokeWidth={2} />
      </View>
      <Text style={[styles.infoValue, { color }]} numberOfLines={1}>
        {value || "—"}
      </Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── Quick action button ──────────────────────────────────────────────────────
const QuickBtn = ({ Icon, label, sub, color, bg, onPress, delay = 0 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      delay,
      tension: 80,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const press = () =>
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const release = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  return (
    <Animated.View
      style={[
        styles.qaBtnOuter,
        {
          opacity: entryAnim,
          transform: [
            {
              scale: entryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.75, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={press}
        onPressOut={release}
        activeOpacity={1}
      >
        <Animated.View style={[styles.qaBtn, { transform: [{ scale }] }]}>
          {/* Accent bar on top */}
          <View style={[styles.qaBtnAccent, { backgroundColor: color }]} />

          <View style={styles.qaBtnIcon}>
            <Icon size={26} color={color} strokeWidth={2} />
          </View>

          <Text style={styles.qaBtnLabel}>{label}</Text>
          <Text style={styles.qaBtnSub} numberOfLines={1}>
            {sub}
          </Text>

          {/* Arrow */}
          <View style={styles.qaBtnArrowWrap}>
            <ChevronRight size={16} color={color} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Notification row ─────────────────────────────────────────────────────────
const NotiRow = ({ note, index, onPress }) => {
  const cfg = getNotiCfg(note.type);
  const { Icon } = cfg;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.notiRow, { borderLeftColor: cfg.color }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.notiIcon}>
          <Icon size={17} color={cfg.color} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.notiMeta}>
            <Text
              style={[styles.notiType, { color: cfg.color }]}
              numberOfLines={1}
            >
              {note.title || cfg.label}
            </Text>
            <Text style={styles.notiTime} numberOfLines={1}>
              {note.createdAt ? note.createdAt.slice(0, 10) : ""}
            </Text>
          </View>
          <Text style={styles.notiContent} numberOfLines={2}>
            {note.content}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHead = ({ title, badge, onSeeAll }) => (
  <View style={styles.sectionHead}>
    <View style={styles.sectionHeadLeft}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {badge > 0 && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>Xem tất cả →</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TenantHome() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.profileId && !user?.userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const results = await Promise.allSettled([
        user?.profileId ? apiProfile.getProfileById(user.profileId) : null,
        user?.userId ? apiNotification.getNotificationById(user.userId) : null,
      ]);

      if (results[0].status === "fulfilled" && results[0].value) {
        const d = results[0].value?.data ?? results[0].value;
        setProfile(d);
      }
      if (results[1].status === "fulfilled" && results[1].value) {
        const d = results[1].value?.data ?? results[1].value;
        const arr = Array.isArray(d) ? d : [];
        setNotifications(arr.filter((n) => !n.isRead));
      }
    } catch (e) {
      console.error("Lỗi fetch home:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const [showAll, setShowAll] = useState(false);

  // ── quick actions ────────────────────────────────────────────────────────
  const QUICK_ACTIONS = [
    {
      Icon: User,
      label: "Hồ sơ cá nhân",
      sub: "Xem & chỉnh sửa",
      color: "#3b82f6",
      bg: "#eff6ff",
      onPress: () => router.push(`/(tenant)/profile`),
    },
    {
      Icon: CreditCard,
      label: "Lịch sử hóa đơn",
      sub: "Thanh toán & công nợ",
      color: "#10b981",
      bg: "#ecfdf5",
      onPress: () => router.push(`/(tenant)/bills`),
    },
    {
      Icon: FileText,
      label: "Xem hợp đồng",
      sub: "Hợp đồng đang hoạt động",
      color: "#f59e0b",
      bg: "#fffbeb",
      onPress: () => {
        // Debug: kiểm tra toàn bộ fields của profile
        console.log("=== PROFILE FIELDS ===", JSON.stringify(profile, null, 2));

        const contractId =
          profile?.contractId ||
          profile?.contract?.contractId ||
          profile?.contract?.id ||
          profile?.activeContractId ||
          profile?.currentContractId;

        console.log("contractId resolved:", contractId);

        if (contractId) {
          router.push(`/(tenant)/contract/${contractId}`);
        } else {
          console.warn("Không tìm thấy contractId trong profile!");
        }
      },
    },
    {
      Icon: Wrench,
      label: "Báo hỏng",
      sub: "Yêu cầu sửa chữa",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      onPress: () => router.push(`/(tenant)/maintenance`),
    },
  ];

  const EXTRA_ACTIONS = [
    {
      Icon: UserPlus,
      label: "Ghép phòng",
      sub: "Quản lý người ở ghép",
      color: "#06b6d4",
      bg: "#ecfeff",
      onPress: () => router.push(`/(tenant)/post`),
    },
  ];

  // Thêm tab mới vào đây, chỉ hiện khi bấm Tất cả
  const HIDDEN_ACTIONS = [];

  // Luôn hiện 4 chính + Ghép phòng, bấm Tất cả mới hiện HIDDEN
  const visibleActions = [
    ...QUICK_ACTIONS,
    ...EXTRA_ACTIONS,
    ...(showAll ? HIDDEN_ACTIONS : []),
  ];

  // ── loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Home size={44} color="#1e40af" strokeWidth={1.5} />
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 180} />
          ))}
        </View>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <GreetingHeader
        profile={profile}
        notifCount={notifications.length}
        onBellPress={() => router.push("/(tenant)/notifications")}
      />

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1e40af"]}
            tintColor="#1e40af"
          />
        }
      >
        {/* ── Quick actions ── */}
        <View style={styles.section}>
          <SectionHead title="Chức năng" />
          <View style={styles.qaGrid}>
            {visibleActions.map((a, i) => (
              <QuickBtn key={i} {...a} delay={i * 60} />
            ))}

            {/* Ô Tất cả nằm trong grid */}
            <Animated.View style={[styles.qaBtnOuter]}>
              <TouchableOpacity
                onPress={() => setShowAll((v) => !v)}
                activeOpacity={0.8}
              >
                <View style={[styles.qaBtn, { alignItems: "center" }]}>
                  <View
                    style={[styles.qaBtnAccent, { backgroundColor: "#1e40af" }]}
                  />
                  <View
                    style={[styles.qaBtnIcon, { backgroundColor: "#eff6ff" }]}
                  >
                    <LayoutGrid size={26} color="#1e40af" strokeWidth={2} />
                  </View>
                  <Text style={styles.qaBtnLabel}>Tất cả</Text>
                  <Text style={styles.qaBtnSub}>
                    {showAll ? "Thu gọn" : "Xem thêm"}
                  </Text>
                  <View style={styles.qaBtnArrowWrap}>
                    {showAll ? (
                      <ChevronUp size={16} color="#1e40af" strokeWidth={2.5} />
                    ) : (
                      <ChevronDown
                        size={16}
                        color="#1e40af"
                        strokeWidth={2.5}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* ── Notifications ── */}
        <View style={styles.section}>
          <SectionHead
            title="Nhắc nhở chưa đọc"
            badge={notifications.length}
            onSeeAll={
              notifications.length > 3
                ? () => router.push("/(tenant)/notifications")
                : null
            }
          />

          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <CheckCircle size={36} color="#10b981" strokeWidth={1.5} />
              <Text style={styles.emptyText}>Không có nhắc nhở mới</Text>
              <Text style={styles.emptySubtext}>Bạn đã xem hết thông báo!</Text>
            </View>
          ) : (
            notifications
              .slice(0, 4)
              .map((n, i) => (
                <NotiRow
                  key={n.notificationId || i}
                  note={n}
                  index={i}
                  onPress={() => router.push("/(tenant)/notifications")}
                />
              ))
          )}
        </View>

        {/* ── Logout (chỉ hiện khi showAll) ── */}
        {showAll && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.75}
          >
            <LogOut size={16} color="#64748b" strokeWidth={2} />
            <Text style={styles.logoutText}>Đăng xuất khỏi hệ thống</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Loading dot ──────────────────────────────────────────────────────────────
function LoadingDot({ delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#1e40af",
        opacity: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.25, 1],
        }),
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            }),
          },
        ],
      }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = (width - 48) / 2;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Header
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  headerTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerSub: { fontSize: 13, color: "#93c5fd", fontWeight: "500" },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  headerDate: { fontSize: 12, color: "#bfdbfe", marginTop: 2 },

  bellBtn: {
    marginTop: 2,
    padding: 6,
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
  },
  bellBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#1e3a8a",
  },
  bellBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    alignSelf: "flex-start",
    gap: 8,
  },
  pillChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  pillChipText: { color: "#dbeafe", fontSize: 12, fontWeight: "600" },
  pillDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  // Scroll body
  scrollBody: { paddingHorizontal: 16, paddingBottom: 20 },

  // Section
  section: { marginTop: 22 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeadLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  sectionBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  sectionBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  seeAll: { fontSize: 12, color: "#3b82f6", fontWeight: "600" },

  // Info cards
  infoRow: { paddingHorizontal: 0, gap: 10, paddingBottom: 4 },
  infoCard: {
    width: 115,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoValue: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  infoLabel: { fontSize: 10, color: "#64748b", fontWeight: "500" },

  // Quick action
  qaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  qaBtnOuter: { width: CARD_W },
  qaBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
    gap: 8,
  },
  qaBtnAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3.5 },
  qaBtnIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  qaBtnLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  qaBtnSub: { fontSize: 11, color: "#94a3b8", textAlign: "center" },
  qaBtnArrowWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  // Notifications
  notiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notiIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notiMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  notiType: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flex: 1,
  },
  notiTime: { fontSize: 10, color: "#9ca3af", marginLeft: 6 },
  notiContent: { fontSize: 13, color: "#374151", lineHeight: 18 },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#374151" },
  emptySubtext: { fontSize: 13, color: "#94a3b8" },

  // Show all button
  showAllBtn: {
    marginTop: 14,
    alignSelf: "center",
    alignItems: "center",
    gap: 5,
  },
  showAllIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  showAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: { color: "#64748b", fontWeight: "600", fontSize: 14 },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    gap: 14,
  },
  loadingDots: { flexDirection: "row", gap: 6, alignItems: "flex-end" },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
