// app/(tenant)/profile/index.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  StatusBar,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  User,
  Bike,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  FileText,
  MessageSquare,
  Bell,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { C, IS_IOS } from "./ProfileStyles";
import apiProfile from "../../../services/apiProfile";
import ProfileTab from "./ProfileTab";
import VehicleTab from "./VehicleTab";
import PasswordTab from "./PasswordTab";

// ─── Error state ──────────────────────────────────────────────────────────────
function NoProfileState() {
  return (
    <View style={styles.errorWrap}>
      <AlertTriangle size={44} color={C.red} strokeWidth={1.5} />
      <Text style={styles.errorTitle}>Không tìm thấy hồ sơ</Text>
      <Text style={styles.errorSub}>
        Tài khoản chưa được liên kết với hồ sơ khách thuê.{"\n"}
        Vui lòng liên hệ quản trị viên.
      </Text>
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  labelColor,
  onPress,
  rightElement,
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
      </View>
      <Text style={[styles.menuLabel, labelColor && { color: labelColor }]}>
        {label}
      </Text>
      {rightElement || (
        <ChevronRight size={16} color={C.slate400} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({ children }) {
  return <View style={styles.menuCard}>{children}</View>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TenantProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(null); // null = menu view
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [roomName, setRoomName] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 70,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const profileId =
    user?.profileId ??
    user?.profile?.profileId ??
    user?.profile?.id ??
    user?.profileDTO?.profileId ??
    null;

  // Fetch roomName từ profile
  useEffect(() => {
    if (!profileId) return;
    apiProfile
      .getProfileById(profileId)
      .then((data) => setRoomName(data?.roomName || null))
      .catch(() => {});
  }, [profileId]);

  const initials = user?.fullName?.[0]?.toUpperCase() ?? "?";

  const handleLogout = () =>
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: logout },
    ]);

  // ── Sub-tab screen ──────────────────────────────────────────────────────────
  if (activeTab && profileId) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor={C.navy} />
        {/* Back header */}
        <View style={styles.subHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setActiveTab(null)}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color={C.white} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>
            {activeTab === "profile" && "Hồ sơ cá nhân"}
            {activeTab === "vehicle" && "Xe cộ"}
            {activeTab === "password" && "Bảo mật"}
          </Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.body}>
          {activeTab === "profile" && (
            <ProfileTab user={user} profileId={profileId} />
          )}
          {activeTab === "vehicle" && <VehicleTab profileId={profileId} />}
          {activeTab === "password" && <PasswordTab user={user} />}
        </View>
      </SafeAreaView>
    );
  }

  // ── Main menu ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* ── HEADER ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName || "Người dùng"}
            </Text>
            <Text style={styles.userSub}>
              {roomName ? `🏠 Phòng ${roomName}` : "Chưa có phòng"}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── CONTENT ── */}
      {!profileId ? (
        <View style={styles.body}>
          <NoProfileState />
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Group 1: Core profile actions */}
          <MenuCard>
            <MenuItem
              icon={User}
              iconColor={C.blue}
              iconBg={C.blueLight}
              label="Hồ sơ cá nhân"
              onPress={() => setActiveTab("profile")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={Bike}
              iconColor="#0891b2"
              iconBg="#e0f7fa"
              label="Xe cộ"
              onPress={() => setActiveTab("vehicle")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={ShieldCheck}
              iconColor={C.violet}
              iconBg={C.violetLight}
              label="Bảo mật & mật khẩu"
              onPress={() => setActiveTab("password")}
            />
          </MenuCard>

          {/* Group 2: App settings */}
          <MenuCard>
            <MenuItem
              icon={FileText}
              iconColor={C.slate500}
              iconBg={C.slate100}
              label="Điều khoản sử dụng"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={MessageSquare}
              iconColor={C.amber}
              iconBg={C.amberLight}
              label="Góp ý ứng dụng"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={Bell}
              iconColor={C.blue}
              iconBg={C.blueLight}
              label="Thông báo"
              onPress={() => {}}
              rightElement={
                <Switch
                  value={notifEnabled}
                  onValueChange={setNotifEnabled}
                  trackColor={{ false: C.slate200, true: "#22c55e" }}
                  thumbColor={C.white}
                  ios_backgroundColor={C.slate200}
                />
              }
            />
          </MenuCard>

          {/* Group 3: Logout */}
          <MenuCard>
            <MenuItem
              icon={LogOut}
              iconColor={C.red}
              iconBg={C.redLight}
              label="Đăng xuất"
              labelColor={C.red}
              onPress={handleLogout}
            />
          </MenuCard>

          <Text style={styles.version}>
            Quản lý chuỗi nhà trọ Trí Thiện Việt.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.navy },
  body: { flex: 1, backgroundColor: C.slate100 },

  // ── Header ──
  header: {
    backgroundColor: C.navy,
    paddingTop: IS_IOS ? 6 : 4,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: C.white },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: C.white,
    letterSpacing: 0.1,
  },
  userSub: { fontSize: 13, color: "rgba(147,197,253,0.85)", marginTop: 2 },

  // ── Sub-screen header ──
  subHeader: {
    backgroundColor: C.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: IS_IOS ? 6 : 4,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
  },

  // ── Scroll content ──
  scrollContent: { padding: 16, paddingBottom: 36, gap: 14 },

  // ── Menu card ──
  menuCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: C.slate900,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.slate100,
    marginLeft: 66,
  },

  // ── Version ──
  version: {
    textAlign: "center",
    fontSize: 12,
    color: C.slate400,
    marginTop: 4,
  },

  // ── Error ──
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontWeight: "800",
    color: C.red,
    fontSize: 17,
    textAlign: "center",
  },
  errorSub: {
    color: C.slate500,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
