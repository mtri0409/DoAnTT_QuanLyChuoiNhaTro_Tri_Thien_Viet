// app/(tenant)/payment/[invoiceId].js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  QrCode,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
} from "lucide-react-native";
import Constants from "expo-constants";
import { getBaseUrl } from "../../../utils/getLocalIp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiUserInvoice from "../../../services/apiUserInvoice";

const IS_IOS = Platform.OS === "ios";
const VNPAY_PROXY =
  Constants.expoConfig?.extra?.vnpayProxyUrl || `${getBaseUrl()}:3001`;

const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—");

// ─── Payment methods list ─────────────────────────────────────────────────────
const METHODS = [
  {
    Icon: Building2,
    label: "ATM / Internet Banking nội địa",
    color: "#1e40af",
  },
  {
    Icon: CreditCard,
    label: "Visa, MasterCard, JCB quốc tế",
    color: "#7c3aed",
  },
  { Icon: QrCode, label: "QR Code (NAPAS, VietQR)", color: "#0d9488" },
  { Icon: Smartphone, label: "Ví điện tử liên kết", color: "#d97706" },
];

// ─── MethodRow ────────────────────────────────────────────────────────────────
const MethodRow = ({ Icon, label, color, index }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      delay: 300 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.methodRow,
        {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.methodIcon, { backgroundColor: color + "18" }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.methodLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── PaymentForm ──────────────────────────────────────────────────────────────
function PaymentForm({ invoiceId, amount }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, []);
  const handleVNPay = async () => {
    if (!amount || amount <= 0) {
      setError("Số tiền không hợp lệ. Vui lòng quay lại hóa đơn.");
      return;
    }

    Animated.sequence([
      Animated.spring(scaleBtn, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
      }),
      Animated.spring(scaleBtn, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
      }),
    ]).start();

    setLoading(true);
    setError("");

    try {
      // ← Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem("authToken");
      const returnUrl = encodeURIComponent(
        `${getBaseUrl()}:3001/payment/callback/${invoiceId}`,
      );
      // Token gửi riêng lên /payment
      const url = `${VNPAY_PROXY}/payment?amount=${amount}&invoiceId=${invoiceId}&returnUrl=${returnUrl}&token=${encodeURIComponent(token)}`;
      console.log("🔗 Fetching:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
      const data = await res.json();

      console.log("✅ VNPay URL:", data.url);

      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        throw new Error("Không nhận được URL thanh toán từ server.");
      }
    } catch (err) {
      console.log("❌ Lỗi:", err.message);
      setError(err.message || "Không thể kết nối VNPay. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
          <Text style={styles.headerSub}>Hóa đơn #{invoiceId}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Shield size={14} color="#93c5fd" strokeWidth={2} />
          <Text style={styles.headerBadgeText}>Bảo mật</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }], gap: 14 }}
        >
          {/* Amount card */}
          <View style={styles.amountCard}>
            <View style={styles.amountInner}>
              <View style={styles.amountIconWrap}>
                <CreditCard size={24} color="#3b82f6" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.amountCardLabel}>Số tiền thanh toán</Text>
                <Text style={styles.amountCardValue}>{fmt(amount)}</Text>
              </View>
            </View>
            <View style={styles.invoiceChip}>
              <Text style={styles.invoiceChipText}>Hóa đơn #{invoiceId}</Text>
            </View>
          </View>

          {/* Methods */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Phương thức hỗ trợ</Text>
            {METHODS.map((m, i) => (
              <MethodRow key={i} {...m} index={i} />
            ))}
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorAlert}>
              <AlertTriangle size={16} color="#ef4444" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* CTA */}
          <TouchableOpacity
            onPress={handleVNPay}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Animated.View
              style={[
                styles.payBtn,
                loading && styles.payBtnLoading,
                { transform: [{ scale: scaleBtn }] },
              ]}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.payBtnText}>Đang kết nối VNPay...</Text>
                </>
              ) : (
                <>
                  <CreditCard size={20} color="#fff" strokeWidth={2} />
                  <Text style={styles.payBtnText}>Tiếp tục thanh toán</Text>
                  <ChevronRight size={18} color="#fff" strokeWidth={2.5} />
                </>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Secure note */}
          <View style={styles.secureRow}>
            <Shield size={13} color="#10b981" strokeWidth={2} />
            <Text style={styles.secureText}>
              Kết nối bảo mật SSL. Thông tin được mã hóa an toàn.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────
function ResultScreen({ responseCode, txnRef, amount, invoiceId }) {
  const router = useRouter();
  const isSuccess = responseCode === "00";

  const [confirmStatus, setConfirmStatus] = useState("idle");
  const confirmedRef = useRef(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isSuccess || confirmedRef.current) return;
    confirmedRef.current = true;
    setConfirmStatus("loading");

    apiUserInvoice
      .confirmVNPay(invoiceId, amount, txnRef)
      .then(() => setConfirmStatus("done"))
      .catch((err) => {
        if (err?.response?.status === 409 || err?.response?.status === 200) {
          setConfirmStatus("done");
        } else {
          setConfirmStatus("error");
        }
      });
  }, [isSuccess, invoiceId, amount, txnRef]);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isSuccess ? "#0d9488" : "#ef4444"}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: isSuccess ? "#0d9488" : "#ef4444" },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push(`/bills/${invoiceId}`)}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { marginLeft: 12 }]}>
          Kết quả thanh toán
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View
          style={[
            styles.resultIconWrap,
            {
              backgroundColor: isSuccess ? "#ecfdf5" : "#fef2f2",
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {isSuccess ? (
            <CheckCircle size={52} color="#10b981" strokeWidth={1.5} />
          ) : (
            <XCircle size={52} color="#ef4444" strokeWidth={1.5} />
          )}
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, alignItems: "center", gap: 6 }}
        >
          <Text style={styles.resultTitle}>
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </Text>
          <Text style={styles.resultSub}>
            {isSuccess
              ? "Hóa đơn của bạn đã được ghi nhận."
              : `Giao dịch không thành công (mã lỗi: ${responseCode}).`}
          </Text>
        </Animated.View>

        {/* Transaction details */}
        <Animated.View
          style={[styles.card, { opacity: fadeAnim, width: "100%" }]}
        >
          <Text style={styles.sectionTitle}>Chi tiết giao dịch</Text>

          <View style={styles.txRow}>
            <Text style={styles.txLabel}>Mã giao dịch</Text>
            <Text style={styles.txValue} numberOfLines={1}>
              {txnRef || "—"}
            </Text>
          </View>
          <View style={[styles.txRow, styles.txRowBorder]}>
            <Text style={styles.txLabel}>Số tiền</Text>
            <Text
              style={[
                styles.txValue,
                { color: isSuccess ? "#10b981" : "#ef4444" },
              ]}
            >
              {fmt(amount)}
            </Text>
          </View>
          <View style={styles.txRow}>
            <Text style={styles.txLabel}>Trạng thái cập nhật</Text>
            {confirmStatus === "loading" && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <ActivityIndicator size="small" color="#f59e0b" />
                <Text
                  style={{ fontSize: 12, color: "#d97706", fontWeight: "600" }}
                >
                  Đang cập nhật...
                </Text>
              </View>
            )}
            {confirmStatus === "done" && (
              <Text
                style={{ fontSize: 12, color: "#10b981", fontWeight: "700" }}
              >
                ✅ Đã cập nhật
              </Text>
            )}
            {confirmStatus === "error" && (
              <Text
                style={{ fontSize: 12, color: "#ef4444", fontWeight: "600" }}
              >
                ⚠️ Thất bại
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          style={[{ width: "100%", gap: 10 }, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={[
              styles.payBtn,
              !isSuccess && { backgroundColor: "#1e40af" },
            ]}
            onPress={() => router.push(`/bills/${invoiceId}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Xem lại hóa đơn</Text>
          </TouchableOpacity>

          {!isSuccess && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() =>
                router.replace(`/payment/${invoiceId}?amount=${amount}`)
              }
              activeOpacity={0.85}
            >
              <RotateCcw size={16} color="#1e40af" strokeWidth={2} />
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PaymentScreen() {
  const { invoiceId } = useLocalSearchParams();
  const router = useRouter();

  // In Expo Router, query params come through useLocalSearchParams
  const params = useLocalSearchParams();
  const amountFromQuery = Number(params.amount || 0);

  // VNPay return detection: vnp_ResponseCode param present
  const isVNPayReturn = !!params.vnp_ResponseCode;

  if (isVNPayReturn) {
    return (
      <ResultScreen
        responseCode={params.vnp_ResponseCode}
        txnRef={params.vnp_TxnRef}
        amount={
          params.vnp_Amount ? Number(params.vnp_Amount) / 100 : amountFromQuery
        }
        invoiceId={invoiceId}
      />
    );
  }

  return <PaymentForm invoiceId={invoiceId} amount={amountFromQuery} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },

  // Header
  header: {
    backgroundColor: "#1e40af",
    paddingTop: IS_IOS ? 56 : (StatusBar.currentHeight || 24) + 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: {
    fontSize: 11,
    color: "#bfdbfe",
    fontWeight: "500",
    marginTop: 1,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerBadgeText: { color: "#bfdbfe", fontSize: 11, fontWeight: "700" },

  // Scroll
  scrollContent: { padding: 16 },
  resultContent: {
    padding: 20,
    alignItems: "center",
    gap: 16,
  },

  // Amount card
  amountCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  amountInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  amountIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  amountCardLabel: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 4,
  },
  amountCardValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: -0.5,
  },
  invoiceChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  invoiceChipText: { fontSize: 12, color: "#64748b", fontWeight: "600" },

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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },

  // Methods
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: { fontSize: 13, color: "#374151", fontWeight: "500", flex: 1 },

  // Error
  errorAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { flex: 1, fontSize: 13, color: "#991b1b", lineHeight: 18 },

  // Pay button
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1e40af",
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  payBtnLoading: { opacity: 0.8 },
  payBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // Secure
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  secureText: { fontSize: 12, color: "#94a3b8" },

  // Result
  resultIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultTitle: { fontSize: 22, fontWeight: "800", color: "#1e293b" },
  resultSub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },

  // Transaction rows
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  txRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  txLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  txValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    maxWidth: "55%",
  },

  // Retry button
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#dbeafe",
  },
  retryBtnText: { color: "#1e40af", fontWeight: "700", fontSize: 15 },
});
