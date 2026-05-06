import React, { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios"; // Đảm bảo đã cài axios: npm install axios
import apiUser from "../api/apiUser";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();    
 useEffect(()=>{
    console.log("Loading context ....")
    if(user==null)
    {
       navigate("/login");
    }
  },[])

  // --- HÀM LOGIN MỚI: CÓ GỌI API LẤY ID ---
  const login = useCallback(async (username, authToken) => {
    setLoading(true);
    try {
      // 1. Lưu token tạm thời để gọi API tiếp theo
      setToken(authToken);
      localStorage.setItem("authToken", authToken);

      // 2. Gọi API lấy thông tin chi tiết User dựa trên username
      // Thay đổi URL cho đúng với Backend của ní nhé
      const response = await apiUser.getUserByUsername(username);

    //   const fullUserData = response.data; // Đây là lúc lấy được cái ID từ Backend

      // 3. Lưu Full thông tin (đã có ID) vào State và LocalStorage
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response));

    } catch (error) {
      console.error("Lỗi lấy thông tin Profile:", error);
      logout(); // Nếu lỗi thì logout luôn cho an toàn
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, // Bây giờ user.id sẽ tồn tại ở đây
        token, 
        login, 
        logout, 
        loading, 
        setLoading, 
        isAuthenticated: Boolean(token) 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};