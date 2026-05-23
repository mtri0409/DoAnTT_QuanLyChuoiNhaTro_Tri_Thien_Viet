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

// ✅ Hàm kiểm tra token hết hạn chưa (đọc payload JWT)
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now; // true = hết hạn
  } catch {
    return true; // parse lỗi → coi như hết hạn
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  //cái này đăng nhập nó lưu token lại hết hạn token mới phải đăng nhập lại
  //   useEffect(() => {
  //     const init = async () => {
  //       try {
  //         const [savedUser, savedToken] = await Promise.all([
  //           AsyncStorage.getItem("user"),
  //           AsyncStorage.getItem("authToken"),
  //         ]);

  //cái này thì thoát app thì xóa luôn token phải đăng nhập lại
  useEffect(() => {
    const init = async () => {
      // ✅ Xóa token mỗi lần app khởi động (dev mode)
      if (__DEV__) {
        await AsyncStorage.multiRemove(["user", "authToken"]);
        setLoading(false);
        return;
      }

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
    setUser(userData);
    setToken(authToken);
    await Promise.all([
      AsyncStorage.setItem("user", JSON.stringify(userData)),
      AsyncStorage.setItem("authToken", authToken),
    ]);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["user", "authToken"]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
