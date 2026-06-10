// app/(tenant)/contract/[contractId].js  — hoặc đặt tên tùy route
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FileText,
  ArrowLeft,
  DoorOpen,
  Calendar,
  Banknote,
  ShieldCheck,
  Users,
  Wrench,
  User,
  Phone,
  CreditCard,
  Zap,
  Droplets,
  Home,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useAuth } from "../../../context/AuthContext";
import apiContract from "../../../services/apiContractTenant";

const IS_IOS = Platform.OS === "ios";
const PRIMARY = "#1e3a8a";
const PRIMARY_LIGHT = "#3b82f6";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (amount == null || isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatContractCode = (id) => {
  if (!id) return "—";
  return `HD-${String(id).padStart(5, "0")}`;
};

const isMeterService = (svc) => {
  const unit = (svc.unitAtSigning || "").toLowerCase();
  return unit.includes("kwh") || unit.includes("m3") || unit.includes("m³");
};

// ─── Status config ─────────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
      return {
        label: "Đang hiệu lực",
        color: "#10b981",
        bg: "#ecfdf5",
        Icon: CheckCircle2,
      };
    case "PENDING":
      return {
        label: "Chờ duyệt",
        color: "#f59e0b",
        bg: "#fffbeb",
        Icon: Clock,
      };
    case "EXPIRED":
      return {
        label: "Đã hết hạn",
        color: "#94a3b8",
        bg: "#f1f5f9",
        Icon: XCircle,
      };
    case "TERMINATED":
      return {
        label: "Đã chấm dứt",
        color: "#ef4444",
        bg: "#fef2f2",
        Icon: XCircle,
      };
    default:
      return {
        label: status || "Không rõ",
        color: "#64748b",
        bg: "#f8fafc",
        Icon: Clock,
      };
  }
};

// ─── Section card ──────────────────────────────────────────────────────────────
const SectionCard = ({
  icon: Icon,
  iconColor = PRIMARY_LIGHT,
  title,
  children,
  collapsible = false,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={collapsible ? () => setOpen((v) => !v) : undefined}
        activeOpacity={collapsible ? 0.7 : 1}
      >
        <View
          style={[styles.cardHeaderIcon, { backgroundColor: iconColor + "18" }]}
        >
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        {collapsible &&
          (open ? (
            <ChevronUp size={16} color="#94a3b8" strokeWidth={2} />
          ) : (
            <ChevronDown size={16} color="#94a3b8" strokeWidth={2} />
          ))}
      </TouchableOpacity>
      {open && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
};

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, valueStyle, last = false }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <View style={styles.infoRowLeft}>
      {Icon && (
        <Icon
          size={13}
          color="#94a3b8"
          strokeWidth={2}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, valueStyle]} numberOfLines={2}>
      {value ?? "—"}
    </Text>
  </View>
);

// ─── Cost row ─────────────────────────────────────────────────────────────────
const CostRow = ({
  label,
  amount,
  labelStyle,
  amountStyle,
  divider = false,
  last = false,
}) => (
  <View
    style={[
      styles.costRow,
      !last && !divider && styles.costRowBorder,
      divider && styles.costRowDivider,
    ]}
  >
    <Text style={[styles.costLabel, labelStyle]}>{label}</Text>
    <Text style={[styles.costAmount, amountStyle]}>{amount}</Text>
  </View>
);

// ─── Member card ──────────────────────────────────────────────────────────────
const MemberCard = ({ member, isRep }) => (
  <View style={[styles.memberCard, isRep && styles.memberCardRep]}>
    <View style={[styles.memberAvatar, isRep && styles.memberAvatarRep]}>
      <User size={18} color={isRep ? "#fff" : "#94a3b8"} strokeWidth={2} />
    </View>
    <View style={{ flex: 1 }}>
      <View style={styles.memberNameRow}>
        <Text style={styles.memberName}>{member.fullName ?? "N/A"}</Text>
        {isRep && (
          <View style={styles.repBadge}>
            <Text style={styles.repBadgeText}>Đại diện</Text>
          </View>
        )}
      </View>
      <View style={styles.memberMeta}>
        {member.phone ? (
          <View style={styles.memberMetaItem}>
            <Phone size={10} color="#94a3b8" strokeWidth={2} />
            <Text style={styles.memberMetaText}>{member.phone}</Text>
          </View>
        ) : null}
        {member.identityNumber ? (
          <View style={styles.memberMetaItem}>
            <CreditCard size={10} color="#94a3b8" strokeWidth={2} />
            <Text style={styles.memberMetaText}>{member.identityNumber}</Text>
          </View>
        ) : null}
      </View>
    </View>
  </View>
);

// ─── Service row ──────────────────────────────────────────────────────────────
const ServiceRow = ({ svc }) => {
  const meter = isMeterService(svc);
  const isElec = (svc.unitAtSigning || "").toLowerCase().includes("kwh");
  return (
    <View style={styles.serviceRow}>
      <View style={styles.serviceLeft}>
        {meter ? (
          isElec ? (
            <Zap size={14} color="#f59e0b" strokeWidth={2} />
          ) : (
            <Droplets size={14} color="#06b6d4" strokeWidth={2} />
          )
        ) : (
          <Wrench size={14} color="#8b5cf6" strokeWidth={2} />
        )}
        <Text style={styles.serviceName}>{svc.serviceName}</Text>
        {meter && (
          <View style={styles.meterBadge}>
            <Text style={styles.meterBadgeText}>Thực tế</Text>
          </View>
        )}
      </View>
      <Text style={styles.servicePrice}>
        {formatCurrency(svc.priceAtSigning)}
        <Text style={styles.serviceUnit}>
          {" "}
          / {svc.unitAtSigning || "tháng"}
        </Text>
      </Text>
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ContractDetailScreen() {
  const { contractId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  const runEntrance = () => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [cRes, mRes, sRes] = await Promise.all([
        apiContract.getContractById(contractId),
        apiContract.getMembersWithProfile(contractId),
        apiContract.getServices(contractId),
      ]);
      const normalize = (r) =>
        Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : [];

      setContract(cRes?.data ?? cRes);
      setMembers(normalize(mRes));
      setServices(normalize(sRes));
      runEntrance();
    } catch (err) {
      console.error("ContractDetailScreen fetch error", err);
      setError("Không thể tải hợp đồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // ─── Derived ──────────────────────────────────────────────────────────────
  const monthlyServices = services.filter((s) => !isMeterService(s));
  const meterServices = services.filter((s) => isMeterService(s));
  const totalMonthlySvcCost = monthlyServices.reduce(
    (sum, s) => sum + Number(s.priceAtSigning ?? 0),
    0,
  );
  const totalFixed = (contract?.rentPrice ?? 0) + totalMonthlySvcCost;

  const statusCfg = contract ? getStatusConfig(contract.status) : null;
  const endDate = contract?.endDate ? new Date(contract.endDate) : null;
  const remainingDays = endDate
    ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const paymentDay = contract?.billingDay ?? contract?.paymentDay ?? null;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <ActivityIndicator size="large" color={PRIMARY_LIGHT} />
        <Text style={styles.loadingText}>Đang tải hợp đồng...</Text>
      </View>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !contract) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <AlertTriangle size={44} color="#ef4444" strokeWidth={1.5} />
        <Text style={styles.errorTitle}>Không tải được hợp đồng</Text>
        <Text style={styles.errorSub}>{error ?? "Không tìm thấy dữ liệu"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchAll}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { Icon: StatusIcon } = statusCfg;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] },
        ]}
      >
        {/* Top row */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Hợp đồng thuê phòng</Text>
            <Text style={styles.headerTitle}>
              {formatContractCode(contract.contractId)}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <StatusIcon size={12} color={statusCfg.color} strokeWidth={2.5} />
            <Text style={[styles.statusPillText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Deadline alert strip */}
        {contract.status === "ACTIVE" && remainingDays !== null && (
          <View
            style={[
              styles.alertStrip,
              remainingDays <= 30 ? styles.alertStripWarn : styles.alertStripOk,
            ]}
          >
            <Calendar
              size={13}
              color={remainingDays <= 30 ? "#92400e" : "#065f46"}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.alertStripText,
                { color: remainingDays <= 30 ? "#92400e" : "#065f46" },
              ]}
            >
              {remainingDays > 0
                ? `Còn ${remainingDays} ngày hiệu lực — hết hạn ${formatDate(contract.endDate)}`
                : "Hợp đồng đã quá hạn — vui lòng liên hệ chủ trọ để gia hạn"}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        style={{ opacity: contentFade }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
            title="Kéo xuống để làm mới"
            titleColor="#64748b"
          />
        }
      >
        {/* 1. Thông tin phòng thuê */}
        <SectionCard
          icon={Home}
          iconColor={PRIMARY_LIGHT}
          title="Thông tin phòng thuê"
        >
          <InfoRow
            icon={DoorOpen}
            label="Phòng"
            value={
              contract.roomName ||
              (contract.roomId ? `Phòng #${contract.roomId}` : null)
            }
          />
          <InfoRow
            icon={Calendar}
            label="Ngày bắt đầu"
            value={formatDate(contract.startDate)}
          />
          <InfoRow
            icon={Calendar}
            label="Ngày kết thúc"
            value={formatDate(contract.endDate)}
          />
          {paymentDay && (
            <InfoRow
              icon={Calendar}
              label="Ngày thanh toán"
              value={`Ngày ${paymentDay} hàng tháng`}
            />
          )}
          {contract.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Ghi chú</Text>
              <Text style={styles.noteText}>{contract.note}</Text>
            </View>
          )}
        </SectionCard>

        {/* 2. Chi phí hàng tháng */}
        <SectionCard
          icon={Banknote}
          iconColor="#10b981"
          title="Chi phí hàng tháng"
        >
          <CostRow
            label="Tiền thuê phòng"
            amount={formatCurrency(contract.rentPrice)}
          />
          {monthlyServices.map((svc, idx) => (
            <CostRow
              key={idx}
              label={svc.serviceName}
              amount={formatCurrency(svc.priceAtSigning)}
            />
          ))}
          <CostRow
            divider
            label={
              <View>
                <Text style={styles.totalLabel}>Tổng mỗi tháng</Text>
                <Text style={styles.totalSub}>(chưa bao gồm điện, nước)</Text>
              </View>
            }
            amount={formatCurrency(totalFixed)}
            amountStyle={styles.totalAmount}
            last
          />

          {meterServices.length > 0 && (
            <View style={styles.meterSection}>
              <Text style={styles.meterSectionTitle}>
                Điện, nước (tính theo chỉ số thực tế):
              </Text>
              {meterServices.map((svc, idx) => {
                const isElec = (svc.unitAtSigning || "")
                  .toLowerCase()
                  .includes("kwh");
                return (
                  <View key={idx} style={styles.meterRow}>
                    {isElec ? (
                      <Zap size={12} color="#f59e0b" strokeWidth={2} />
                    ) : (
                      <Droplets size={12} color="#06b6d4" strokeWidth={2} />
                    )}
                    <Text style={styles.meterName}>{svc.serviceName}</Text>
                    <Text style={styles.meterPrice}>
                      {formatCurrency(svc.priceAtSigning)} / {svc.unitAtSigning}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.meterNote}>
                <Text style={styles.meterNoteText}>
                  Chi phí điện, nước sẽ được tính riêng dựa trên chỉ số thực tế
                  hàng tháng
                </Text>
              </View>
            </View>
          )}
        </SectionCard>

        {/* 3. Tiền đặt cọc */}
        <SectionCard
          icon={ShieldCheck}
          iconColor="#8b5cf6"
          title="Tiền đặt cọc"
        >
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Số tiền đặt cọc (một lần)</Text>
            <Text style={styles.depositAmount}>
              {formatCurrency(contract.depositAmount)}
            </Text>
          </View>
          <Text style={styles.depositNote}>
            * Tiền cọc sẽ được hoàn trả khi kết thúc hợp đồng (không bao gồm chi
            phí sửa chữa nếu có)
          </Text>
        </SectionCard>

        {/* 4. Thành viên */}
        <SectionCard
          icon={Users}
          iconColor="#f59e0b"
          title="Thành viên hợp đồng"
          collapsible={members.length > 3}
        >
          {members.length === 0 ? (
            <View style={styles.emptyMembers}>
              <Text style={styles.emptyMembersText}>
                Chưa có thành viên nào
              </Text>
            </View>
          ) : (
            members.map((member, idx) => (
              <MemberCard
                key={member.profileId ?? idx}
                member={member}
                isRep={idx === 0}
              />
            ))
          )}
        </SectionCard>

        {/* 5. Dịch vụ đăng ký */}
        {services.length > 0 && (
          <SectionCard
            icon={Wrench}
            iconColor="#06b6d4"
            title="Dịch vụ đã đăng ký"
            collapsible={services.length > 4}
          >
            {services.map((svc, idx) => (
              <ServiceRow key={idx} svc={svc} />
            ))}
          </SectionCard>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} — Hợp đồng thuê phòng trọ
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Loading / error
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
  },
  errorSub: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 11,
  },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: PRIMARY,
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  // Alert strip (inside header)
  alertStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  alertStripWarn: { backgroundColor: "#fef3c7" },
  alertStripOk: { backgroundColor: "#d1fae5" },
  alertStripText: { fontSize: 12, fontWeight: "600", flex: 1, lineHeight: 17 },

  // Scroll
  scrollContent: { padding: 16, paddingTop: 18, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    letterSpacing: 0.1,
  },
  cardBody: { paddingHorizontal: 16, paddingBottom: 4, paddingTop: 2 },

  // InfoRow
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 12,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  infoRowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  infoValue: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    flexShrink: 1,
  },

  // Note
  noteBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  noteLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  noteText: { fontSize: 13, color: "#334155", lineHeight: 18 },

  // CostRow
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 8,
  },
  costRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  costRowDivider: {
    borderTopWidth: 2,
    borderTopColor: "#e2e8f0",
    marginTop: 4,
    paddingTop: 14,
  },
  costLabel: { fontSize: 13, color: "#64748b", flex: 1 },
  costAmount: { fontSize: 13, color: "#1e293b", fontWeight: "600" },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  totalSub: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  totalAmount: { fontSize: 17, fontWeight: "800", color: PRIMARY_LIGHT },

  // Meter
  meterSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 8,
    gap: 6,
  },
  meterSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
  },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 3,
  },
  meterName: { fontSize: 12, color: "#475569", flex: 1 },
  meterPrice: { fontSize: 12, color: "#64748b" },
  meterNote: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 9,
    marginTop: 4,
  },
  meterNoteText: { fontSize: 11, color: "#64748b", lineHeight: 16 },

  // Deposit
  depositRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  depositLabel: { fontSize: 13, color: "#64748b" },
  depositAmount: { fontSize: 18, fontWeight: "800", color: "#10b981" },
  depositNote: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  // Members
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  memberCardRep: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memberAvatarRep: { backgroundColor: PRIMARY_LIGHT },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  memberName: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  repBadge: {
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  repBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  memberMeta: { flexDirection: "row", gap: 12, marginTop: 4, flexWrap: "wrap" },
  memberMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  memberMetaText: { fontSize: 11, color: "#64748b" },
  emptyMembers: { paddingVertical: 20, alignItems: "center" },
  emptyMembersText: { fontSize: 13, color: "#94a3b8" },

  // Services
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  serviceLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  serviceName: { fontSize: 13, fontWeight: "600", color: "#334155", flex: 1 },
  meterBadge: {
    backgroundColor: "#e0f2fe",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  meterBadgeText: { fontSize: 9, color: "#0369a1", fontWeight: "700" },
  servicePrice: { fontSize: 12, fontWeight: "600", color: "#1e293b" },
  serviceUnit: { fontSize: 11, color: "#94a3b8", fontWeight: "400" },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 8,
  },
});
