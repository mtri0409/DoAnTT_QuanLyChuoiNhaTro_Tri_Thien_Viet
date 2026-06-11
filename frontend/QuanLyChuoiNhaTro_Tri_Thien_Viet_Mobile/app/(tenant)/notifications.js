// app/(tenant)/notifications.js
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import apiNotification from "../../services/apiNotification";
import {
  Bell,
  CreditCard,
  FileText,
  Wrench,
  AlertCircle,
  User,
  CheckCheck,
  ChevronRight,
  BellOff,
  Search,
  XCircle,
} from "lucide-react-native";

const IS_IOS = Platform.OS === "ios";
const PAGE_SIZE = 10;

// ─── Notification type config ─────────────────────────────────────────────────
const NOTI_CONFIG = {
  BILL: {
    label: "Hóa đơn",
    color: "#10b981",
    bg: "#ecfdf5",
    Icon: CreditCard,
  },
  "OVER BILL": {
    label: "Quá hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: AlertCircle,
  },
  OVERDUE: {
    label: "Quá hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: AlertCircle,
  },
  CONTRACT: {
    label: "Hợp đồng",
    color: "#3b82f6",
    bg: "#eff6ff",
    Icon: FileText,
  },
  MAINTENANCE: {
    label: "Bảo trì",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: Wrench,
  },
  PROFILE_UPDATE: {
    label: "Hồ sơ",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: User,
  },
  DEFAULT: {
    label: "Thông báo",
    color: "#06b6d4",
    bg: "#ecfeff",
    Icon: Bell,
  },
};

const getNotiCfg = (type) =>
  NOTI_CONFIG[type?.toUpperCase()] || NOTI_CONFIG[type] || NOTI_CONFIG.DEFAULT;

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "UNREAD", label: "Chưa đọc", urgent: true },
  { key: "BILL", label: "Hóa đơn" },
  { key: "CONTRACT", label: "Hợp đồng" },
];

// ─── Single notification row ──────────────────────────────────────────────────
const NotiRow = React.memo(({ item, index, onPress }) => {
  const cfg = getNotiCfg(item.type);
  const { Icon } = cfg;
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: Math.min(index % 10, 9) * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const pressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.notiRow,
            { borderLeftColor: cfg.color },
            !item.isRead && styles.notiRowUnread,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Left accent bar */}
          <View style={[styles.rowAccent, { backgroundColor: cfg.color }]} />

          {/* Icon */}
          <View style={styles.rowIconWrap}>
            <Icon size={20} color={cfg.color} strokeWidth={2} />
          </View>

          {/* Content */}
          <View style={styles.rowContent}>
            <View style={styles.rowTopRow}>
              <Text
                style={[styles.rowTitle, !item.isRead && styles.rowTitleUnread]}
                numberOfLines={1}
              >
                {item.title || "Thông báo"}
              </Text>
              <Text style={styles.rowDate}>{dateStr}</Text>
            </View>
            <Text style={styles.rowBody} numberOfLines={2}>
              {item.content || ""}
            </Text>
            <View style={styles.rowBottomRow}>
              <View style={styles.typePill}>
                <Text style={[styles.typePillText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
          </View>

          <ChevronRight size={15} color="#cbd5e1" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, unreadCount, onChangeTab }) => (
  <View style={styles.tabBarWrap}>
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBarContent}
      style={styles.tabBar}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChangeTab(tab.key)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            activeOpacity={0.75}
          >
            {tab.urgent && unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.ScrollView>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ tab, searching }) => (
  <View style={styles.emptyBox}>
    <BellOff size={40} color="#cbd5e1" strokeWidth={1.5} />
    <Text style={styles.emptyText}>
      {searching
        ? "Không tìm thấy kết quả"
        : tab === "UNREAD"
          ? "Không có thông báo chưa đọc"
          : "Không có thông báo nào"}
    </Text>
    <Text style={styles.emptySubtext}>
      {searching
        ? "Thử thay đổi từ khóa tìm kiếm."
        : tab === "UNREAD"
          ? "Tất cả thông báo đã được đọc"
          : "Thông báo của bạn sẽ hiển thị ở đây"}
    </Text>
  </View>
);

// ─── Footer loader ────────────────────────────────────────────────────────────
const FooterLoader = ({ visible }) => {
  if (!visible) return <View style={{ height: 24 }} />;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="#1e3a8a" />
      <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [markingAll, setMarkingAll] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // Header animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiNotification.getNotificationById(user.userId);
      // API may return array directly or wrapped in .data
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setDisplayCount(PAGE_SIZE);
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset displayCount khi đổi tab hoặc search
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [activeTab, searchText]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore]);

  // ─── Mark all as read ────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length || markingAll) return;
    setMarkingAll(true);
    try {
      await Promise.all(
        unread.map((n) => apiNotification.markAsRead(n.notificationId)),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // ─── Filter ──────────────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    const matchTab =
      activeTab === "ALL"
        ? true
        : activeTab === "UNREAD"
          ? !n.isRead
          : n.type?.toUpperCase().includes(activeTab);
    const matchSearch =
      !searchText.trim() ||
      (n.title ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
      (n.content ?? "").toLowerCase().includes(searchText.toLowerCase());
    return matchTab && matchSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  // ─── List header: unread banner ─────────────────────────────────────────────
  const ListHeader = () => {
    if (!unreadCount) return null;
    return (
      <TouchableOpacity
        style={styles.unreadBanner}
        onPress={() => setActiveTab("UNREAD")}
        activeOpacity={0.8}
      >
        <View style={styles.unreadBannerLeft}>
          <View style={styles.unreadBannerDot} />
          <Text style={styles.unreadBannerText}>
            Bạn có <Text style={styles.unreadBannerCount}>{unreadCount}</Text>{" "}
            thông báo chưa đọc
          </Text>
        </View>
        <ChevronRight size={15} color="#1d4ed8" strokeWidth={2.5} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerIconWrap}>
            <Bell size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Trung tâm</Text>
            <Text style={styles.headerTitle}>Thông báo</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
              disabled={markingAll}
            >
              {markingAll ? (
                <ActivityIndicator size="small" color="#bfdbfe" />
              ) : (
                <>
                  <CheckCheck size={14} color="#bfdbfe" strokeWidth={2} />
                  <Text style={styles.markAllText}>Đọc tất cả</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={14} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tiêu đề, nội dung..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <XCircle size={14} color="#94a3b8" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ── Tab bar ── */}
      <TabBar
        activeTab={activeTab}
        unreadCount={unreadCount}
        onChangeTab={setActiveTab}
      />

      {/* ── Content ── */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, idx) => String(item.notificationId || idx)}
          renderItem={({ item, index }) => (
            <NotiRow
              item={item}
              index={index}
              onPress={() =>
                router.push(`/(tenant)/notifications/${item.notificationId}`)
              }
            />
          )}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <EmptyState tab={activeTab} searching={!!searchText.trim()} />
          }
          ListFooterComponent={<FooterLoader visible={loadingMore} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasMore) handleLoadMore();
          }}
          onEndReachedThreshold={0.2}
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
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Header — navy đồng bộ home / bills
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
    gap: 14,
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
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minWidth: 42,
    justifyContent: "center",
  },
  markAllText: { color: "#bfdbfe", fontSize: 11, fontWeight: "700" },

  // Search bar
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

  // Tabs
  tabBarWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabBar: { maxHeight: 52 },
  tabBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  tabItemActive: { backgroundColor: "#1e3a8a" },
  tabLabel: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  tabLabelActive: { color: "#fff" },
  tabBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    marginRight: 5,
  },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  // Unread banner
  unreadBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  unreadBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  unreadBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  unreadBannerText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
  },
  unreadBannerCount: {
    fontWeight: "800",
    color: "#1d4ed8",
  },

  // List
  listContent: { padding: 16, paddingTop: 12 },

  // Notification row
  notiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  notiRowUnread: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#fafcff",
  },
  rowAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  rowContent: { flex: 1 },
  rowTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  rowTitleUnread: {
    fontWeight: "800",
    color: "#1e293b",
  },
  rowDate: { fontSize: 10, color: "#94a3b8", flexShrink: 0 },
  rowBody: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 6,
  },
  rowBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typePill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: { fontSize: 10, fontWeight: "700" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },

  // Empty
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
  emptySubtext: { fontSize: 13, color: "#94a3b8" },

  // Footer loader
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerLoaderText: { fontSize: 13, color: "#64748b", fontWeight: "500" },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
