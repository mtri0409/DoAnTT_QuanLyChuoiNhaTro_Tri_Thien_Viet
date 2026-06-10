// app/(tenant)/notifications/[notificationId].js
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import apiNotification from "../../../services/apiNotification";
import {
  ArrowLeft,
  Bell,
  CreditCard,
  FileText,
  Wrench,
  AlertCircle,
  User,
  CheckCircle,
  Calendar,
  Tag,
} from "lucide-react-native";

const IS_IOS = Platform.OS === "ios";

// ─── Type config ──────────────────────────────────────────────────────────────
const NOTI_CONFIG = {
  BILL: {
    label: "Hóa đơn",
    color: "#10b981",
    bg: "#ecfdf5",
    gradientTop: "#d1fae5",
    Icon: CreditCard,
  },
  "OVER BILL": {
    label: "Hóa đơn quá hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    gradientTop: "#fee2e2",
    Icon: AlertCircle,
  },
  OVERDUE: {
    label: "Quá hạn",
    color: "#ef4444",
    bg: "#fef2f2",
    gradientTop: "#fee2e2",
    Icon: AlertCircle,
  },
  CONTRACT: {
    label: "Hợp đồng",
    color: "#3b82f6",
    bg: "#eff6ff",
    gradientTop: "#dbeafe",
    Icon: FileText,
  },
  MAINTENANCE: {
    label: "Bảo trì",
    color: "#f59e0b",
    bg: "#fffbeb",
    gradientTop: "#fef3c7",
    Icon: Wrench,
  },
  PROFILE_UPDATE: {
    label: "Cập nhật hồ sơ",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    gradientTop: "#ede9fe",
    Icon: User,
  },
  DEFAULT: {
    label: "Thông báo",
    color: "#06b6d4",
    bg: "#ecfeff",
    gradientTop: "#cffafe",
    Icon: Bell,
  },
};

const getNotiCfg = (type) =>
  NOTI_CONFIG[type?.toUpperCase()] || NOTI_CONFIG[type] || NOTI_CONFIG.DEFAULT;

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── Info row (same pattern as invoiceId) ────────────────────────────────────
const InfoRow = ({ label, value, valueColor, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
      {String(value || "—")}
    </Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NotificationDetailScreen() {
  const { notificationId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleBack = () => router.push("/(tenant)/notifications");

  // ─── Fetch single notification or find from list ──────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch the full list and find the matching one
        const response = await apiNotification.getNotificationById(user.userId);
        const data = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        const found = data.find(
          (n) => String(n.notificationId) === String(notificationId),
        );
        if (found) {
          setNotification(found);
          // Auto mark as read
          if (!found.isRead) {
            apiNotification.markAsRead(found.notificationId).catch(() => {});
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading notification", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notificationId, user]);

  // ─── Entry animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && notification) {
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
  }, [loading, notification]);

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !notification) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <AlertCircle size={40} color="#ef4444" strokeWidth={1.5} />
        <Text style={styles.errorText}>Không tìm thấy thông báo</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtnError}>
          <Text style={styles.backBtnErrorText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = getNotiCfg(notification.type);
  const { Icon } = cfg;

  const createdAt = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const createdDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerSub}>Chi tiết</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Thông báo #{String(notificationId)}
          </Text>
        </View>

        {/* Read status pill */}
        <View
          style={[
            styles.readPill,
            {
              backgroundColor: notification.isRead
                ? "rgba(16,185,129,0.15)"
                : "rgba(239,68,68,0.15)",
            },
          ]}
        >
          <CheckCircle
            size={12}
            color={notification.isRead ? "#6ee7b7" : "#fca5a5"}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.readPillText,
              { color: notification.isRead ? "#6ee7b7" : "#fca5a5" },
            ]}
          >
            {notification.isRead ? "Đã đọc" : "Chưa đọc"}
          </Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero card (like amountCard in bills) ── */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <SectionCard style={[styles.heroCard, { borderTopColor: cfg.color }]}>
            {/* Type row */}
            <View style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: cfg.color }]} />
              <Text style={[styles.typeLabel, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>

            {/* Icon + title block */}
            <View style={styles.heroBlock}>
              <View style={[styles.heroIconWrap, { backgroundColor: cfg.bg }]}>
                <Icon size={32} color={cfg.color} strokeWidth={1.8} />
              </View>
              <Text style={styles.heroTitle}>
                {notification.title || "Thông báo"}
              </Text>
            </View>

            {/* Date chip */}
            <View style={styles.dateBadge}>
              <Calendar size={12} color="#64748b" strokeWidth={2} />
              <Text style={styles.dateBadgeText}>{createdDate}</Text>
            </View>
          </SectionCard>
        </Animated.View>

        {/* ── Content card ── */}
        <SectionCard>
          <Text style={styles.sectionTitle}>NỘI DUNG THÔNG BÁO</Text>
          <View style={[styles.contentBlock, { borderLeftColor: cfg.color }]}>
            <Text style={styles.contentText}>
              {notification.content || "Không có nội dung."}
            </Text>
          </View>
        </SectionCard>

        {/* ── Meta info card (like invoice info rows) ── */}
        <SectionCard>
          <Text style={styles.sectionTitle}>THÔNG TIN CHI TIẾT</Text>
          <InfoRow
            label="Mã thông báo"
            value={`#${notification.notificationId}`}
          />
          <InfoRow label="Loại" value={cfg.label} valueColor={cfg.color} />
          <InfoRow label="Thời gian" value={createdAt} />
          <InfoRow
            label="Trạng thái"
            value={notification.isRead ? "Đã đọc" : "Chưa đọc"}
            valueColor={notification.isRead ? "#10b981" : "#f59e0b"}
            last
          />
        </SectionCard>

        {/* ── Unread notice banner ── */}
        {!notification.isRead && (
          <View style={styles.noticeBanner}>
            <Bell size={16} color="#1d4ed8" strokeWidth={2} />
            <Text style={styles.noticeText}>
              Thông báo này đã được đánh dấu là đã đọc.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    gap: 14,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  errorText: { fontSize: 16, fontWeight: "700", color: "#374151" },
  backBtnError: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  backBtnErrorText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Header — navy đồng bộ home / bills / invoiceId
  header: {
    backgroundColor: "#1e3a8a",
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSub: { fontSize: 11, color: "#93c5fd", fontWeight: "500" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", marginTop: 1 },
  readPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  readPillText: { fontSize: 11, fontWeight: "700" },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  // Hero card
  heroCard: {
    borderTopWidth: 3,
    gap: 0,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { fontSize: 13, fontWeight: "700" },
  heroBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateBadgeText: { fontSize: 12, color: "#64748b", fontWeight: "600" },

  // Section title (same as invoiceId)
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Content block
  contentBlock: {
    borderLeftWidth: 4,
    borderRadius: 4,
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  contentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    whiteSpace: "pre-line",
  },

  // Info rows (identical to invoiceId)
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  infoValue: { fontSize: 13, fontWeight: "700", color: "#1e293b" },

  // Notice banner
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  noticeText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#1d4ed8" },
});
