import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpiner from "./LoadingSpiner";

/**
 * ProtectedRoute - Bộ lọc gác cổng phía Frontend
 *
 * @param {ReactNode} children     - Component sẽ render nếu đủ quyền
 * @param {Array}     allowedRoles - Danh sách role được phép (VD: ['ADMIN', 'STAFF'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // 1. Đang loading (xác thực ban đầu)
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <LoadingSpiner />
      </div>
    );
  }

  // 2. Chưa đăng nhập → về trang login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Không đủ quyền truy cập route này
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // STAFF → redirect về trang mặc định của STAFF (hợp đồng)
    // TENANT → redirect về maintenance
    // Các role khác → về login
    const fallbackMap = {
      STAFF: "/contracts",
      TENANT: "/maintenance",
    };
    const fallback = fallbackMap[user.role] || "/login";
    return <Navigate to={fallback} replace />;
  }

  // 4. Đủ điều kiện → render trang
  return children;
};

export default ProtectedRoute;
