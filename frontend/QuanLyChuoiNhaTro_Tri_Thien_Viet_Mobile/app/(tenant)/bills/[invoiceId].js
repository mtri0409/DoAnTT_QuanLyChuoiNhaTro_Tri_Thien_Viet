// app/(tenant)/bills/[invoiceId].js
import React, { useRef, useEffect } from "react";
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
import {
  ArrowLeft,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  FileText,
  ChevronRight,
  Shield,
  Receipt,
} from "lucide-react-native";
import useInvoiceDetail from "../../../hooks/useInvoiceDetail";

const IS_IOS = Platform.OS === "ios";

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

// ─── Configs ──────────────────────────────────────────────────────────────────
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

// ─── Section card ─────────────────────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, valueColor, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
      {String(value || "—")}
    </Text>
  </View>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ ratio }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(1, ratio),
      duration: 800,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);
  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InvoiceDetailScreen() {
  const { invoiceId } = useLocalSearchParams();
  const router = useRouter();
  const { invoice, loading } = useInvoiceDetail(invoiceId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Back về màn hình bills (không phải home)
  const handleBack = () => {
    router.push("/(tenant)/bills");
  };

  useEffect(() => {
    if (!loading && invoice) {
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
  }, [loading, invoice]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <AlertCircle size={40} color="#ef4444" strokeWidth={1.5} />
        <Text style={styles.errorText}>Không tìm thấy hóa đơn</Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtnError}>
          <Text style={styles.backBtnErrorText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const overdue = isOverdue(invoice.dueDate, invoice.status);
  const statusKey =
    overdue && invoice.status !== "PAID" ? "OVERDUE" : invoice.status;
  const sm = STATUS_CFG[statusKey] || STATUS_CFG.PENDING;
  const tm = TYPE_CFG[invoice.type] || {
    label: String(invoice.type || ""),
    color: "#6366f1",
  };
  const { Icon: StatusIcon } = sm;

  const canPay = ["PENDING", "PARTIAL"].includes(invoice.status);
  const paidAmount = Number(invoice.paidAmount) || 0;
  const totalAmount = Number(invoice.totalAmount) || 0;
  const remainAmount = totalAmount - paidAmount;
  const paidRatio = totalAmount > 0 ? paidAmount / totalAmount : 0;

  // Tên loại hóa đơn an toàn
  const typeLabel =
    invoice.type === "MONTHLY" && invoice.periodMonth
      ? `Tháng ${invoice.periodMonth}/${invoice.periodYear}`
      : tm.label;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Header — đồng bộ màu navy với home */}
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
          <Text style={styles.headerTitle}>Hóa đơn #{String(invoiceId)}</Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: sm.bg }]}>
          <StatusIcon size={12} color={sm.color} strokeWidth={2} />
          <Text style={[styles.statusPillText, { color: sm.color }]}>
            {sm.label}
          </Text>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount card */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <SectionCard style={styles.amountCard}>
            {/* Type label */}
            <View style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: tm.color }]} />
              <Text style={[styles.typeLabel, { color: tm.color }]}>
                {typeLabel}
              </Text>
            </View>

            {/* Total amount */}
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>Tổng số tiền</Text>
              <Text
                style={[styles.amountValue, overdue && { color: "#ef4444" }]}
              >
                {fmt(invoice.totalAmount)}
              </Text>
            </View>

            {/* Partial payment progress */}
            {invoice.status === "PARTIAL" && paidAmount > 0 && (
              <View style={styles.partialBlock}>
                <View style={styles.partialRow}>
                  <Text style={styles.paidText}>
                    {"✅ Đã nộp: " + fmt(paidAmount)}
                  </Text>
                  <Text style={styles.remainText}>
                    {"Còn lại: " + fmt(remainAmount)}
                  </Text>
                </View>
                <ProgressBar ratio={paidRatio} />
              </View>
            )}

            {/* Overdue warning */}
            {overdue && (
              <View style={styles.overdueAlert}>
                <AlertCircle size={14} color="#ef4444" strokeWidth={2} />
                <Text style={styles.overdueText}>
                  {"Hóa đơn đã "}
                  <Text style={{ fontWeight: "800" }}>quá hạn</Text>
                  {" (" +
                    formatDate(invoice.dueDate) +
                    "). Vui lòng thanh toán sớm."}
                </Text>
              </View>
            )}
          </SectionCard>
        </Animated.View>

        {/* Info grid */}
        <SectionCard>
          <Text style={styles.sectionTitle}>Thông tin hóa đơn</Text>
          <InfoRow
            label="Hạn thanh toán"
            value={formatDate(invoice.dueDate)}
            valueColor={overdue ? "#ef4444" : undefined}
          />
          <InfoRow label="Ngày tạo" value={formatDate(invoice.createdAt)} />
          {invoice.roomName ? (
            <InfoRow label="Phòng" value={String(invoice.roomName)} />
          ) : null}
          {invoice.contractId ? (
            <InfoRow
              label="Hợp đồng"
              value={"#" + String(invoice.contractId)}
            />
          ) : null}
          {invoice.status === "PAID" && invoice.paymentMethod ? (
            <InfoRow
              label="Phương thức"
              value={
                invoice.paymentMethod === "VNPAY"
                  ? "💳 VNPay"
                  : String(invoice.paymentMethod)
              }
            />
          ) : null}
          {invoice.status === "PAID" && invoice.paidAt ? (
            <InfoRow
              label="Thời gian thanh toán"
              value={formatDate(invoice.paidAt)}
              last
            />
          ) : (
            <InfoRow
              label="Trạng thái"
              value={sm.label}
              valueColor={sm.color}
              last
            />
          )}
        </SectionCard>

        {/* Invoice details */}
        {invoice.invoiceDetails?.length > 0 && (
          <SectionCard>
            <Text style={styles.sectionTitle}>Chi tiết khoản mục</Text>
            {invoice.invoiceDetails.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.detailItem,
                  idx < invoice.invoiceDetails.length - 1 &&
                    styles.detailItemBorder,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName}>
                    {String(
                      item.description ||
                        item.serviceName ||
                        `Khoản ${idx + 1}`,
                    )}
                  </Text>
                  {item.quantity && item.unitPrice ? (
                    <Text style={styles.detailMeta}>
                      {String(item.quantity) + " × " + fmt(item.unitPrice)}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.detailAmount}>{fmt(item.subTotal)}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Note */}
        {invoice.note ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <Text style={styles.noteText}>{String(invoice.note)}</Text>
          </SectionCard>
        ) : null}

        {/* Status messages */}
        {invoice.status === "PAID" && (
          <View
            style={[
              styles.statusMessage,
              { backgroundColor: "#ecfdf5", borderColor: "#6ee7b7" },
            ]}
          >
            <CheckCircle size={16} color="#10b981" strokeWidth={2} />
            <Text style={[styles.statusMessageText, { color: "#065f46" }]}>
              Hóa đơn này đã được thanh toán đầy đủ.
            </Text>
          </View>
        )}

        {invoice.status === "CANCELLED" && (
          <View
            style={[
              styles.statusMessage,
              { backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" },
            ]}
          >
            <XCircle size={16} color="#64748b" strokeWidth={2} />
            <Text style={[styles.statusMessageText, { color: "#475569" }]}>
              Hóa đơn này đã bị hủy.
            </Text>
          </View>
        )}

        {invoice.status === "REFUNDED" && (
          <View
            style={[
              styles.statusMessage,
              { backgroundColor: "#f5f3ff", borderColor: "#c4b5fd" },
            ]}
          >
            <RotateCcw size={16} color="#8b5cf6" strokeWidth={2} />
            <Text style={[styles.statusMessageText, { color: "#5b21b6" }]}>
              Hóa đơn này đã được hoàn tiền.
            </Text>
          </View>
        )}

        {/* Payment CTA */}
        {canPay && (
          <SectionCard style={styles.payCard}>
            <View style={styles.payAmountBlock}>
              <Text style={styles.payAmountLabel}>Số tiền cần thanh toán</Text>
              <Text style={styles.payAmountValue}>{fmt(remainAmount)}</Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={() =>
                router.push(`/payment/${invoiceId}?amount=${remainAmount}`)
              }
              activeOpacity={0.85}
            >
              <CreditCard size={18} color="#fff" strokeWidth={2} />
              <Text style={styles.payBtnText}>Thanh toán qua VNPay</Text>
              <ChevronRight size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.paySecure}>
              <Shield size={12} color="#10b981" strokeWidth={2} />
              <Text style={styles.paySecureText}>
                {"Thanh toán an toàn. Cập nhật "}
                <Text style={{ fontWeight: "700" }}>tự động</Text>
                {" sau giao dịch."}
              </Text>
            </View>
          </SectionCard>
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

  // Header — navy đồng bộ với home
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
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },

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

  // Amount card
  amountCard: { gap: 0 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { fontSize: 13, fontWeight: "700" },

  amountBlock: { marginBottom: 8 },
  amountLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
  },

  partialBlock: { marginTop: 14 },
  partialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paidText: { fontSize: 12, color: "#10b981", fontWeight: "600" },
  remainText: { fontSize: 12, color: "#ef4444", fontWeight: "600" },
  progressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: "#10b981", borderRadius: 4 },

  overdueAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  overdueText: { flex: 1, fontSize: 12, color: "#991b1b", lineHeight: 17 },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  infoValue: { fontSize: 13, fontWeight: "700", color: "#1e293b" },

  // Detail items
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  detailName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  detailMeta: { fontSize: 11, color: "#94a3b8" },
  detailAmount: { fontSize: 13, fontWeight: "800", color: "#1e293b" },

  // Note
  noteText: { fontSize: 13, color: "#374151", lineHeight: 20 },

  // Status messages
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  statusMessageText: { flex: 1, fontSize: 13, fontWeight: "600" },

  // Pay card
  payCard: { borderWidth: 2, borderColor: "#dbeafe" },
  payAmountBlock: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  payAmountLabel: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 4,
  },
  payAmountValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: -0.5,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1e40af",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    flex: 1,
    textAlign: "center",
  },
  paySecure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  paySecureText: { fontSize: 11, color: "#64748b" },
});
