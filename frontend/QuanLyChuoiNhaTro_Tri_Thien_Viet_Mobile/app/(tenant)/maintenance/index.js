import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Wrench,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Home,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react-native";
import apiMaintenanceTenant from "../../../services/apiMaintenanceaRequest";

const IS_IOS = Platform.OS === "ios";
const PRIMARY = "#1e3a8a";
const PRIMARY_LIGHT = "#3b82f6";
const PAGE_SIZE = 10;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    color: "#f59e0b",
    bg: "#fffbeb",
    dot: "#f59e0b",
    Icon: Clock,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "#3b82f6",
    bg: "#eff6ff",
    dot: "#3b82f6",
    Icon: Wrench,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "#10b981",
    bg: "#ecfdf5",
    dot: "#10b981",
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#94a3b8",
    bg: "#f1f5f9",
    dot: "#94a3b8",
    Icon: XCircle,
  },
};

const FILTER_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Hoàn thành", value: "COMPLETED", hideBadge: true },
  { label: "Đã hủy", value: "CANCELLED" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ─── Footer loader ────────────────────────────────────────────────────────────
const FooterLoader = ({ visible }) => {
  if (!visible) return <View style={{ height: 24 }} />;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={PRIMARY} />
      <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
    </View>
  );
};

// ─── Request Card (bills row style) ──────────────────────────────────────────
const RequestCard = ({ item, index, onView }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index % 10, 9) * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const cfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    color: "#64748b",
    bg: "#f8fafc",
    dot: "#64748b",
    Icon: Clock,
  };
  const { Icon } = cfg;

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
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={() => onView(item.requestId)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.card,
            item.status === "PENDING" && styles.cardPending,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Accent bar left */}
          <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

          {/* Icon */}
          <View style={styles.cardIconWrap}>
            <Icon size={20} color={cfg.color} strokeWidth={2} />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardRoomRow}>
                <Home size={11} color="#94a3b8" strokeWidth={2} />
                <Text style={styles.roomName} numberOfLines={1}>
                  {item.roomName}
                </Text>
                {item.images?.length > 0 && (
                  <View style={styles.imgBadge}>
                    <ImageIcon size={9} color="#64748b" strokeWidth={2} />
                    <Text style={styles.imgBadgeText}>
                      {item.images.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.reqId}>#REQ-{item.requestId}</Text>
            </View>

            <Text style={styles.desc} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.cardBottomRow}>
              <View style={styles.statusPill}>
                <Text style={[styles.statusPillText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          <ChevronRight size={16} color="#cbd5e1" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ListMaintenanceScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");

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

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const res = await apiMaintenanceTenant.getMyRequests();
      const data = res?.data ?? res;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];
      setRequests(list);
    } catch (err) {
      setError("Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset display count khi đổi filter/search
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [filterStatus, searchText]);

  const handleRefresh = () => {
    setRefreshing(true);
    setDisplayCount(PAGE_SIZE);
    fetchRequests();
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    const filtered = requests.filter((r) => {
      const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
      const matchSearch =
        !searchText.trim() ||
        r.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.roomName?.toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
    if (displayCount >= filtered.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 900);
  }, [loadingMore, displayCount, requests, filterStatus, searchText]);

  const handleCancel = (requestId) => {
    Alert.alert("Hủy yêu cầu", "Bạn có chắc muốn hủy yêu cầu này không?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy yêu cầu",
        style: "destructive",
        onPress: async () => {
          try {
            await apiMaintenanceTenant.cancelRequest(requestId);
            fetchRequests();
          } catch {
            Alert.alert("Lỗi", "Không thể hủy yêu cầu. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchSearch =
      !searchText.trim() ||
      r.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.roomName?.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  const displayedRequests = filteredRequests.slice(0, displayCount);

  const getCount = (status) =>
    requests.filter((r) => r.status === status).length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Wrench size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Hỗ trợ cư dân</Text>
            <Text style={styles.headerTitle}>Báo hỏng & Sửa chữa</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              const firstRoom = requests.find((r) => r.roomId);
              router.push({
                pathname: "/(tenant)/maintenance/create",
                params: firstRoom
                  ? { roomId: firstRoom.roomId, roomName: firstRoom.roomName }
                  : {},
              });
            }}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={14} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mô tả, phòng..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </Animated.View>

      {/* Filter chips */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(i) => i.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = filterStatus === item.value;
            const cnt = item.value !== "ALL" ? getCount(item.value) : null;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilterStatus(item.value)}
              >
                {cnt != null && cnt > 0 && !item.hideBadge && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>
                      {cnt > 99 ? "99+" : cnt}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY_LIGHT} />
          <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <AlertTriangle size={40} color="#ef4444" strokeWidth={1.5} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchRequests}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedRequests}
          keyExtractor={(i) => String(i.requestId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[PRIMARY_LIGHT]}
              tintColor={PRIMARY_LIGHT}
              title="Kéo xuống để làm mới"
              titleColor="#64748b"
            />
          }
          ListFooterComponent={<FooterLoader visible={loadingMore} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>
                {searchText || filterStatus !== "ALL" ? "🔍" : "🔧"}
              </Text>
              <Text style={styles.emptyTitle}>
                {searchText || filterStatus !== "ALL"
                  ? "Không tìm thấy kết quả"
                  : "Chưa có yêu cầu nào"}
              </Text>
              <Text style={styles.emptySub}>
                {searchText || filterStatus !== "ALL"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa."
                  : "Khi có sự cố, hãy gửi yêu cầu để được hỗ trợ."}
              </Text>
              {!searchText && filterStatus === "ALL" && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => {
                    const firstRoom = requests.find((r) => r.roomId);
                    router.push({
                      pathname: "/(tenant)/maintenance/create",
                      params: firstRoom
                        ? {
                            roomId: firstRoom.roomId,
                            roomName: firstRoom.roomName,
                          }
                        : {},
                    });
                  }}
                >
                  <Plus size={14} color="#fff" strokeWidth={2} />
                  <Text style={styles.emptyBtnText}>Gửi yêu cầu ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item, index }) => (
            <RequestCard
              item={item}
              index={index}
              onView={(id) => router.push(`/(tenant)/maintenance/${id}`)}
            />
          )}
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
    backgroundColor: PRIMARY,
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    gap: 14,
  },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_LIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
  searchInput: { flex: 1, color: "#fff", fontSize: 14, padding: 0 },

  // Filter
  filterWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  filterChipActive: { backgroundColor: PRIMARY },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  filterChipTextActive: { color: "#fff" },
  filterBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    marginRight: 5,
  },
  filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  filterBadgeActive: { backgroundColor: "#ffffff" },
  filterBadgeTextActive: { color: PRIMARY },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statCount: { fontSize: 22, fontWeight: "800" },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },

  // List
  listContent: { padding: 16, paddingTop: 12, paddingBottom: 32 },

  // Card (bills row style)
  card: {
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
  cardPending: { borderWidth: 1, borderColor: "#fde68a" },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  cardContent: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardRoomRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  roomName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    maxWidth: 140,
  },
  imgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 4,
  },
  imgBadgeText: { fontSize: 10, color: "#64748b" },
  reqId: { fontSize: 10, color: "#cbd5e1", fontWeight: "500" },
  desc: { fontSize: 13, color: "#475569", lineHeight: 19, marginBottom: 8 },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 10, fontWeight: "700" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#ef4444",
  },
  cancelBtnText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  dateText: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },

  // Footer loader
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerLoaderText: { fontSize: 13, color: "#64748b", fontWeight: "500" },

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

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  emptySub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
