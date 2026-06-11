// app/index.js
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;

  // Admin/Manager → giữ nguyên luồng cũ (app/home.js + Stack)
  if (isAdmin) return <Redirect href="/home" />;

  // Tenant → giao diện mới có bottom tabs
  return <Redirect href="/(tenant)/home" />;
}
