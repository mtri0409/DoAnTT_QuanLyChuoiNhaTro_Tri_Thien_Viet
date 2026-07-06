// app/(tenant)/_layout.js
import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Home, Receipt, Bell, UserCircle } from "lucide-react-native";
import useInvoiceList from "../../hooks/useInvoiceList";
import apiNotification from "../../services/apiNotification";

const PRIMARY = "#3b82f6";

const TAB_CFG = [
  { name: "home", title: "Tổng quan", Icon: Home },
  { name: "bills", title: "Hóa đơn", Icon: Receipt },
  { name: "notifications", title: "Thông báo", Icon: Bell },
  { name: "profile", title: "Hồ sơ", Icon: UserCircle },
];

const TabBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -8,
        backgroundColor: "#ef4444",
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: "#ffffff",
        zIndex: 10,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 9,
          fontWeight: "800",
          lineHeight: 12,
        }}
      >
        {count > 99 ? "99+" : String(count)}
      </Text>
    </View>
  );
};

function TenantTabs() {
  const router = useRouter();
  const { user } = useAuth();
  const { urgentCount = 0 } = useInvoiceList();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiNotification.getNotificationById(user.userId);
        const data = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        if (!cancelled) setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch (_) {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const handleUrl = ({ url }) => {
      if (!url) return;
      if (
        !url.startsWith("quanlynhatro://payment/") &&
        !url.startsWith("exp+quanlynhatro://payment/")
      )
        return;
      const withoutScheme = url
        .replace("exp+quanlynhatro://", "")
        .replace("quanlynhatro://", "");
      router.replace(`/${withoutScheme}`);
    };
    const sub = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });
    return () => sub.remove();
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const cfg = TAB_CFG.find((t) => t.name === route.name);
        const isBills = route.name === "bills";
        const isNotifications = route.name === "notifications";

        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#dbeafe",
            height: Platform.OS === "ios" ? 84 : 66,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
            paddingTop: 8,
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 16,
          },
          tabBarActiveTintColor: PRIMARY,
          tabBarInactiveTintColor: "#94a3b8",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            marginTop: 2,
            letterSpacing: 0.2,
          },
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ focused, color }) => {
            const IconComp = cfg?.Icon;
            if (!IconComp) return null;
            return (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 28,
                  position: "relative",
                }}
              >
                {focused && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      width: 28,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: PRIMARY,
                      opacity: 0.25,
                    }}
                  />
                )}
                <IconComp
                  size={focused ? 23 : 20}
                  color={color}
                  strokeWidth={focused ? 2.5 : 1.8}
                />
                {isBills && <TabBadge count={urgentCount} />}
                {isNotifications && <TabBadge count={unreadCount} />}
              </View>
            );
          },
        };
      }}
    >
      {TAB_CFG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
      <Tabs.Screen name="bills/[invoiceId]" options={{ href: null }} />
      <Tabs.Screen name="payment/[invoiceId]" options={{ href: null }} />
      <Tabs.Screen
        name="notifications/[notificationId]"
        options={{ href: null }}
      />
      <Tabs.Screen name="contract/[contractId]" options={{ href: null }} />
      <Tabs.Screen name="maintenance/[id]" options={{ href: null }} />
      <Tabs.Screen name="maintenance/index" options={{ href: null }} />
      <Tabs.Screen name="maintenance/create" options={{ href: null }} />
      <Tabs.Screen name="post/create" options={{ href: null }} />
      <Tabs.Screen name="post/index" options={{ href: null }} />
      <Tabs.Screen name="post/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default function TenantLayout() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eff6ff",
        }}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (isAdmin) return <Redirect href="/home" />;

  return <TenantTabs />;
}
