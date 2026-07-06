import React, { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  // 1. Khởi tạo State: Lấy cả User và Token từ localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(false);

  // 2. Hàm Login: Lưu cả 2 vào Storage
  const login = useCallback((userData, authToken) => {
    // Lưu vào State
    setUser(userData);
    setToken(authToken);
    
    // Lưu vào LocalStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", authToken);
  }, []);

  // 3. Hàm Logout: Xóa sạch dấu vết
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, // Thêm token vào đây để các component con lấy dùng
        login, 
        logout, 
        loading, 
        setLoading, 
        isAuthenticated: Boolean(token) // Xác thực dựa trên Token sẽ an toàn hơn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};