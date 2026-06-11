// app/(tenant)/bills.js
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
import {
  FileText,
  Bell,
  CreditCard,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Receipt,
  Search,
} from "lucide-react-native";
import useInvoiceList from "../../hooks/useInvoiceList";

const IS_IOS = Platform.OS === "ios";
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || ["PAID", "CANCELLED", "REFUNDED"].includes(status))
    return false;
  return new Date(dueDate) < new Date();
};

// ─── Status / Type configs ────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: Clock,
  },
  PARTIAL: {
    label: "Thanh toán một phần",
    color: "#3b82f6",
    bg: "#eff6ff",
    Icon: CreditCard,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "#10b981",
    bg: "#ecfdf5",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#64748b",
    bg: "#f1f5f9",
    Icon: XCircle,
  },
  DRAFT: { label: "Nháp", color: "#94a3b8", bg: "#f8fafc", Icon: FileText },
  OVERDUE: {
    label: "Quá hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: AlertCircle,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    Icon: RotateCcw,
  },
};

const TYPE_CFG = {
  MONTHLY: { label: "Hóa đơn tháng", color: "#1e40af" },
  DEPOSIT: { label: "Tiền cọc", color: "#0d9488" },
  REPAIR: { label: "Sửa chữa", color: "#d97706" },
};

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "NEED_PAY", label: "Cần thanh toán", urgent: true },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "CANCELLED", label: "Đã hủy" },
];

// ─── InvoiceRow component ─────────────────────────────────────────────────────
const InvoiceRow = React.memo(({ invoice, index, onPress }) => {
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

  const overdue = isOverdue(invoice.dueDate, invoice.status);
  const statusKey =
    overdue && invoice.status !== "PAID" ? "OVERDUE" : invoice.status;
  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.PENDING;
  const tm = TYPE_CFG[invoice.type] || {
    label: invoice.type,
    color: "#6366f1",
  };
  const { Icon: StatusIcon } = cfg;
  const canPay = ["PENDING", "PARTIAL"].includes(invoice.status);

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
            styles.invoiceRow,
            overdue && styles.invoiceRowOverdue,
            canPay && !overdue && styles.invoiceRowNeedPay,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.rowAccent, { backgroundColor: cfg.color }]} />
          <View style={styles.rowIconWrap}>
            <StatusIcon size={20} color={cfg.color} strokeWidth={2} />
          </View>
          <View style={styles.rowContent}>
            <View style={styles.rowTopRow}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {invoice.type === "MONTHLY" && invoice.periodMonth
                  ? `Tháng ${invoice.periodMonth}/${invoice.periodYear}`
                  : tm.label}
              </Text>
              <Text style={[styles.rowAmount, overdue && { color: "#ef4444" }]}>
                {fmt(invoice.totalAmount)}
              </Text>
            </View>
            <View style={styles.rowBottomRow}>
              <View style={styles.statusPill}>
                <Text style={[styles.statusPillText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              <Text style={[styles.rowDue, overdue && { color: "#ef4444" }]}>
                {overdue ? "⚠️ " : ""}HH: {formatDate(invoice.dueDate)}
              </Text>
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
const EmptyState = ({ searching }) => (
  <View style={styles.emptyBox}>
    <Receipt size={40} color="#cbd5e1" strokeWidth={1.5} />
    <Text style={styles.emptyText}>
      {searching ? "Không tìm thấy kết quả" : "Không có hóa đơn nào"}
    </Text>
    <Text style={styles.emptySubtext}>
      {searching
        ? "Thử thay đổi từ khóa tìm kiếm."
        : "Hóa đơn của bạn sẽ hiển thị ở đây"}
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
export default function BillsScreen() {
  const router = useRouter();
  const {
    invoices = [],
    loading,
    pageNumber,
    totalPages,
    activeTab,
    urgentCount,
    changeTab,
    changePage,
    refresh,
  } = useInvoiceList();

  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Reset display count khi đổi tab
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [activeTab]);

  // Reset display count khi có dữ liệu mới
  useEffect(() => {
    if (!loading) {
      setDisplayCount(PAGE_SIZE);
    }
  }, [loading]);

  // Filter by search
  const filteredInvoices = searchText.trim()
    ? invoices.filter((inv) => {
        const q = searchText.toLowerCase();
        const title =
          inv.type === "MONTHLY" && inv.periodMonth
            ? `tháng ${inv.periodMonth}/${inv.periodYear}`
            : (TYPE_CFG[inv.type]?.label ?? inv.type ?? "").toLowerCase();
        return (
          title.includes(q) ||
          String(inv.totalAmount).includes(q) ||
          String(inv.invoiceId).includes(q)
        );
      })
    : invoices;

  const displayedInvoices = filteredInvoices.slice(0, displayCount);
  const hasMoreLocal = displayCount < filteredInvoices.length;
  const hasMoreRemote = pageNumber < totalPages;
  const hasMore = hasMoreLocal || hasMoreRemote;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setDisplayCount(PAGE_SIZE);
    if (typeof refresh === "function") {
      await refresh();
    }
    setRefreshing(false);
  }, [refresh]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    if (hasMoreLocal) {
      setTimeout(() => {
        setDisplayCount((prev) => prev + PAGE_SIZE);
        setLoadingMore(false);
      }, 900);
    } else if (hasMoreRemote) {
      await changePage(pageNumber + 1);
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    } else {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasMore,
    hasMoreLocal,
    hasMoreRemote,
    pageNumber,
    changePage,
  ]);

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

  const ListHeader = () => (
    <View>
      {/* Urgent banner */}
      {urgentCount > 0 && activeTab !== "NEED_PAY" && (
        <TouchableOpacity
          style={styles.urgentBanner}
          onPress={() => changeTab("NEED_PAY")}
          activeOpacity={0.85}
        >
          <Bell size={14} color="#d97706" strokeWidth={2} />
          <Text style={styles.urgentText}>
            Bạn có <Text style={{ fontWeight: "800" }}>{urgentCount}</Text> hóa
            đơn cần thanh toán
          </Text>
          <Text style={styles.urgentCta}>Xem ngay →</Text>
        </TouchableOpacity>
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
            <Receipt size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Quản lý tài chính</Text>
            <Text style={styles.headerTitle}>Hóa đơn của tôi</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={14} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tháng, số tiền..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </Animated.View>

      {/* Tab bar */}
      <TabBar
        activeTab={activeTab}
        urgentCount={urgentCount}
        onChangeTab={changeTab}
      />

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedInvoices}
          keyExtractor={(item, idx) => String(item.invoiceId || idx)}
          renderItem={({ item, index }) => (
            <InvoiceRow
              invoice={item}
              index={index}
              onPress={() => router.push(`/bills/${item.invoiceId}`)}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyState searching={!!searchText.trim()} />}
          ListFooterComponent={<FooterLoader visible={loadingMore} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
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

  // Urgent banner
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  urgentText: { flex: 1, fontSize: 12, color: "#92400e", fontWeight: "600" },
  urgentCta: { fontSize: 12, color: "#d97706", fontWeight: "700" },

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

  // Invoice row
  invoiceRow: {
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
  invoiceRowOverdue: { borderWidth: 1, borderColor: "#fecaca" },
  invoiceRowNeedPay: { borderWidth: 1, borderColor: "#fde68a" },
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
  },
  rowContent: { flex: 1 },
  rowTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  rowAmount: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  rowBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 10, fontWeight: "700" },
  rowDue: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },

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
