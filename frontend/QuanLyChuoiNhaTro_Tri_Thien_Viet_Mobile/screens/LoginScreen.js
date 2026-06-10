// screens/LoginScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import apiUser from "../services/apiUser";
import {
  Home,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
} from "lucide-react-native";

// ── Design tokens (đồng bộ với app) ─────────────────────────────────────────
const C = {
  navy: "#1e3a8a",
  navyDark: "#1e2d6b",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  white: "#ffffff",
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  red: "#ef4444",
  redLight: "#fef2f2",
  redBorder: "#fca5a5",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ── Entrance animation ──────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!form.userName.trim() || !form.password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiUser.loginUser(form);
      const { token } = response.data;
      const userDetail = await apiUser.getUserByUsername(form.userName);
      const fullUser = userDetail.data;
      await login(fullUser, token);
      router.replace("/home");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu!";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* ── Nền navy phía trên ── */}
      <View style={s.topBg} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Hero ── */}
          <View style={s.hero}>
            <View style={s.logoRing}>
              <View style={s.logoCircle}>
                <Home size={32} color={C.white} strokeWidth={2} />
              </View>
            </View>
            <Text style={s.appName}>Quản Lý Nhà Trọ</Text>
            <View style={s.brandRow}>
              <Building2
                size={13}
                color="rgba(147,197,253,0.8)"
                strokeWidth={2}
              />
              <Text style={s.brandSub}>Trí Thiện Việt</Text>
            </View>
          </View>

          {/* ── Card ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Đăng nhập</Text>
            <Text style={s.cardSub}>Vui lòng nhập thông tin tài khoản</Text>

            {/* Error */}
            {!!error && (
              <View style={s.errorBox}>
                <AlertCircle size={15} color={C.red} strokeWidth={2} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Username */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Tên đăng nhập</Text>
              <View
                style={[s.inputRow, focusedField === "user" && s.inputRowFocus]}
              >
                <User
                  size={18}
                  color={focusedField === "user" ? C.blue : C.slate400}
                  strokeWidth={2}
                  style={s.fieldIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Nhập tên đăng nhập..."
                  placeholderTextColor={C.slate400}
                  value={form.userName}
                  onChangeText={(v) => setForm({ ...form, userName: v })}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setFocusedField("user")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Mật khẩu</Text>
              <View
                style={[s.inputRow, focusedField === "pass" && s.inputRowFocus]}
              >
                <Lock
                  size={18}
                  color={focusedField === "pass" ? C.blue : C.slate400}
                  strokeWidth={2}
                  style={s.fieldIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Nhập mật khẩu..."
                  placeholderTextColor={C.slate400}
                  value={form.password}
                  onChangeText={(v) => setForm({ ...form, password: v })}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  onFocus={() => setFocusedField("pass")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={C.slate400} strokeWidth={2} />
                  ) : (
                    <Eye size={18} color={C.slate400} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={C.white} size="small" />
              ) : (
                <>
                  <LogIn size={18} color={C.white} strokeWidth={2.5} />
                  <Text style={s.btnText}>Đăng Nhập</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={s.footer}>Đồ án tốt nghiệp – IT Student 2026</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.slate100 },

  // Nền navy chiếm 40% trên
  topBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: C.navy,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // ── Hero ──
  hero: { alignItems: "center", marginBottom: 28 },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  brandSub: {
    fontSize: 13,
    color: "rgba(147,197,253,0.85)",
    fontWeight: "500",
  },

  // ── Card ──
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.slate900,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: C.slate500,
    marginBottom: 20,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.redLight,
    borderColor: C.redBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { flex: 1, color: C.red, fontSize: 13 },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.slate700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 7,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.slate100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.slate200,
    paddingHorizontal: 14,
    height: 50,
  },
  inputRowFocus: {
    borderColor: C.blue,
    backgroundColor: C.blueLight,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.slate900,
  },
  eyeBtn: { padding: 4, marginLeft: 6 },

  // Button
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.navy,
    borderRadius: 14,
    height: 52,
    marginTop: 8,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: C.white, fontSize: 16, fontWeight: "700" },

  // Footer
  footer: {
    textAlign: "center",
    color: C.slate400,
    fontSize: 12,
    marginTop: 24,
  },
});
