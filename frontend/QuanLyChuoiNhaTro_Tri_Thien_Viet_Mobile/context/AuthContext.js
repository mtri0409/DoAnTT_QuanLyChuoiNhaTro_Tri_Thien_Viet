// context/AuthContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return ctx;
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

/**
 * Đọc role từ userData hoặc JWT payload.
 * Điều chỉnh field name cho khớp với response backend của bạn.
 *
 * Ví dụ backend trả về:
 *   { role: "ADMIN" }          → dùng ngay
 *   { roles: ["ROLE_ADMIN"] }  → tự strip "ROLE_"
 *   JWT payload có "role"      → đọc từ token
 */
const extractRole = (userData, token) => {
  // 1. Đọc trực tiếp từ userData
  if (userData?.role) {
    return userData.role.toUpperCase().replace("ROLE_", "");
  }
  if (Array.isArray(userData?.roles) && userData.roles.length > 0) {
    return userData.roles[0].toUpperCase().replace("ROLE_", "");
  }

  // 2. Đọc từ JWT payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role) return payload.role.toUpperCase().replace("ROLE_", "");
    if (payload.roles?.[0])
      return payload.roles[0].toUpperCase().replace("ROLE_", "");
    // Spring Security đặt trong "authorities"
    if (payload.authorities?.[0]?.authority) {
      return payload.authorities[0].authority
        .toUpperCase()
        .replace("ROLE_", "");
    }
  } catch {}

  // 3. Mặc định → tenant
  return "TENANT";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [savedUser, savedToken] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("authToken"),
        ]);
        if (savedUser && savedToken) {
          if (isTokenExpired(savedToken)) {
            await AsyncStorage.multiRemove(["user", "authToken"]);
          } else {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (userData, authToken) => {
    // Gắn thêm role vào user object trước khi lưu
    const enriched = {
      ...userData,
      role: extractRole(userData, authToken),
    };
    setUser(enriched);
    setToken(authToken);
    await Promise.all([
      AsyncStorage.setItem("user", JSON.stringify(enriched)),
      AsyncStorage.setItem("authToken", authToken),
    ]);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["user", "authToken"]);
  }, []);

  const role = user?.role || null;
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(token),
        role,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
