// app/(tenant)/post/index.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Users,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  DoorOpen,
  AlertTriangle,
  ChevronRight,
  FileText,
} from "lucide-react-native";
import apiPost from "../../../services/apiPost";

const IS_IOS = Platform.OS === "ios";
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysLeft = (expiresAt) =>
  expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000))
    : null;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE: {
    label: "Đang hoạt động",
    color: "#10b981",
    bg: "#ecfdf5",
    Icon: CheckCircle2,
  },
  CLOSED: {
    label: "Đã đóng",
    color: "#64748b",
    bg: "#f1f5f9",
    Icon: XCircle,
  },
  EXPIRED: {
    label: "Hết hạn",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: Clock,
  },
};

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Hoạt động", urgent: true },
  { key: "CLOSED", label: "Đã đóng" },
  { key: "EXPIRED", label: "Hết hạn" },
];

// ─── PostRow ──────────────────────────────────────────────────────────────────
const PostRow = React.memo(({ post, index, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index % PAGE_SIZE, 9) * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  const cfg = STATUS_CFG[post.status] ?? STATUS_CFG.CLOSED;
  const { Icon: StatusIcon } = cfg;
  const left = daysLeft(post.expiresAt);
  const isUrgent = left !== null && left <= 5 && post.status === "ACTIVE";

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

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
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
            styles.postRow,
            isUrgent && styles.postRowUrgent,
            post.status === "ACTIVE" && !isUrgent && styles.postRowActive,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Accent bar */}
          <View style={[styles.rowAccent, { backgroundColor: cfg.color }]} />

          {/* Icon */}
          <View style={styles.rowIconWrap}>
            <StatusIcon size={20} color={cfg.color} strokeWidth={2} />
          </View>

          {/* Content */}
          <View style={styles.rowContent}>
            <View style={styles.rowTopRow}>
              <View style={styles.rowRoomRow}>
                <DoorOpen size={12} color="#3b82f6" strokeWidth={2} />
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {post.roomName}
                  {post.branchName ? ` · ${post.branchName}` : ""}
                </Text>
              </View>
              {left !== null && post.status === "ACTIVE" && (
                <Text
                  style={[styles.rowDaysLeft, isUrgent && { color: "#ef4444" }]}
                >
                  {isUrgent ? "⚠️ " : ""}Còn {left} ngày
                </Text>
              )}
            </View>

            <Text style={styles.rowDesc} numberOfLines={2}>
              {post.description}
            </Text>

            <View style={styles.rowBottomRow}>
              <View style={styles.statusPill}>
                <Text style={[styles.statusPillText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              <Text style={styles.rowDate}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          <ChevronRight size={16} color="#cbd5e1" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, urgentCount, onChangeTab }) => {
  const scrollRef = useRef(null);
  return (
    <View style={styles.tabBarWrap}>
      <Animated.ScrollView
        ref={scrollRef}
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
              {tab.urgent && urgentCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {urgentCount > 99 ? "99+" : urgentCount}
                  </Text>
                </View>
              )}
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ searching, onCreatePost }) => (
  <View style={styles.emptyBox}>
    <FileText size={40} color="#cbd5e1" strokeWidth={1.5} />
    <Text style={styles.emptyText}>
      {searching ? "Không tìm thấy kết quả" : "Chưa có bài đăng nào"}
    </Text>
    <Text style={styles.emptySubtext}>
      {searching
        ? "Thử thay đổi từ khóa tìm kiếm."
        : "Hãy đăng bài để tìm người ghép phòng!"}
    </Text>
    {!searching && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onCreatePost}>
        <Plus size={14} color="#fff" strokeWidth={2.5} />
        <Text style={styles.emptyBtnText}>Đăng bài ngay</Text>
      </TouchableOpacity>
    )}
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoommatePostsScreen() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (pageNum = 0, replace = true) => {
    if (pageNum === 0) {
      if (replace) setLoading(true);
      else setRefreshing(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const res = await apiPost.getMyPosts(pageNum, 20);
      const data = res?.data ?? res;
      const content = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
          ? data
          : [];
      const tp = data?.totalPages ?? 1;
      setPosts((prev) => (pageNum === 0 ? content : [...prev, ...content]));
      setTotalPages(tp);
      setPage(pageNum);
    } catch {
      setError("Không thể tải danh sách bài đăng.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  // Load lần đầu
  useEffect(() => {
    fetchPosts(0);
  }, []);

  // Tự reload mỗi khi quay lại màn hình (sau create/edit/delete)
  useFocusEffect(
    useCallback(() => {
      fetchPosts(0);
    }, [fetchPosts]),
  );

  const handleRefresh = useCallback(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && page + 1 < totalPages) fetchPosts(page + 1, false);
  }, [loadingMore, page, totalPages, fetchPosts]);

  // ── Header animation ─────────────────────────────────────────────────────────
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

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleClose = (postId) => {
    Alert.alert("Đóng bài đăng", "Bạn có chắc muốn đóng bài đăng này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đóng bài",
        style: "destructive",
        onPress: async () => {
          try {
            await apiPost.closePost(postId);
            setPosts((prev) =>
              prev.map((p) =>
                p.postId === postId ? { ...p, status: "CLOSED" } : p,
              ),
            );
          } catch {
            Alert.alert("Lỗi", "Không thể đóng bài đăng. Thử lại sau.");
          }
        },
      },
    ]);
  };

  const handleDelete = (postId) => {
    Alert.alert("Xoá bài đăng", "Hành động này không thể hoàn tác.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await apiPost.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p.postId !== postId));
          } catch {
            Alert.alert("Lỗi", "Không thể xoá bài đăng. Thử lại sau.");
          }
        },
      },
    ]);
  };

  const handleRepost = async (postId) => {
    try {
      await apiPost.repost(postId);
      fetchPosts(0);
    } catch {
      Alert.alert("Lỗi", "Không thể đăng lại. Thử lại sau.");
    }
  };

  // ── Filter / search ──────────────────────────────────────────────────────────
  const filteredPosts = posts.filter((p) => {
    const matchTab = activeTab === "ALL" || p.status === activeTab;
    const matchSearch =
      !searchText ||
      p.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.roomName?.toLowerCase().includes(searchText.toLowerCase());
    return matchTab && matchSearch;
  });

  const urgentCount = posts.filter(
    (p) => p.status === "ACTIVE" && daysLeft(p.expiresAt) <= 5,
  ).length;

  // ── List header ──────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {error && (
        <View style={styles.errorBanner}>
          <AlertTriangle size={14} color="#ef4444" strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPosts(0)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerIconWrap}>
            <Users size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Tìm ghép phòng</Text>
            <Text style={styles.headerTitle}>Bài đăng của tôi</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/(tenant)/post/create")}
          >
            <Plus size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={14} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo phòng, mô tả..."
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

      {/* Tab bar */}
      <TabBar
        activeTab={activeTab}
        urgentCount={urgentCount}
        onChangeTab={setActiveTab}
      />

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Đang tải bài đăng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item, index) =>
            String(item.postId ?? item.id ?? `fallback-${index}`)
          }
          renderItem={({ item, index }) => (
            <PostRow
              post={item}
              index={index}
              onPress={() => {
                const pid = item.postId ?? item.id;
                if (!pid) return;
                router.push({
                  pathname: `/(tenant)/post/${pid}`,
                  params: { postData: JSON.stringify(item) },
                });
              }}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <EmptyState
              searching={!!searchText.trim()}
              onCreatePost={() => router.push("/(tenant)/post/create")}
            />
          }
          ListFooterComponent={<FooterLoader visible={loadingMore} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
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

  // Header
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
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
  headerSub: {
    fontSize: 12,
    color: "#93c5fd",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  createBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    padding: 0,
  },

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

  // List
  listContent: { padding: 16, paddingTop: 12 },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: "#ef4444" },
  retryText: { fontSize: 13, color: "#3b82f6", fontWeight: "700" },

  // Post row
  postRow: {
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
  postRowUrgent: { borderWidth: 1, borderColor: "#fecaca" },
  postRowActive: { borderWidth: 1, borderColor: "#a7f3d0" },
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
  },
  rowRoomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  rowDaysLeft: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    flexShrink: 0,
  },
  rowDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 8,
  },
  rowBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 10, fontWeight: "700" },
  rowDate: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },

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
  emptySubtext: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

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
