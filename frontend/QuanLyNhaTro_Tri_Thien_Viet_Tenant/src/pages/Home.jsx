import React, { useEffect, useState } from "react";
import QuickActions from "../components/QuickAction";
import HeaderGrid from "../components/HeaderGird"; // Nhớ check tên file HeaderGird hay Grid nhé
import { useAuth } from "../context/AuthContext";
import apiProfile from "../api/apiProfile";
import apiNotification from "../api/apiNotification";

const Home = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ thực hiện khi user đã đăng nhập và có profileId
    if (user && user.profileId) {
      const fetchHomeData = async () => {
        try {
          setLoading(true);

          // Gọi song song cả 2 API để tối ưu tốc độ load trang
          const [profileRes, notiRes] = await Promise.all([
            apiProfile.getProfileById(user.profileId),
            apiNotification.getNotificationById(user.userId), // Chỉ lấy các thông báo chưa đọc
          ]);

          setProfile(profileRes);
          setNotifications(notiRes.filter((noti) => noti.isRead === false));
        } catch (error) {
          console.error("Lỗi tải dữ liệu trang chủ:", error.response);
        } finally {
          // Tạo hiệu ứng delay nhẹ để transition mượt hơn
          setTimeout(() => setLoading(false), 500);
        }
      };

      fetchHomeData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // --- MÀN HÌNH LOADING ---
  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-4 text-muted fw-bold animate__animated animate__fadeIn animate__infinite">
          Đang chuẩn bị không gian sống của bạn...
        </p>
      </div>
    );
  }

  // Nếu không có dữ liệu profile sau khi load xong
  if (!profile) {
    return (
      <div className="alert alert-warning m-4 rounded-4 shadow-sm border-0">
        <h5 className="fw-bold">Thông báo</h5>
        Hồ sơ của bạn hiện chưa được khởi tạo. Vui lòng liên hệ quản lý chuỗi
        nhà trọ để được hỗ trợ.
      </div>
    );
  }

  return (
    <div className="home-container animate__animated animate__fadeIn py-2">
      {/* 1. Header Tiêu đề & Ngày tháng */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase tracking-wider">
            Cổng thông tin người thuê
          </h4>
          <p className="text-muted small mb-0">
            Hệ thống Quản lý Chuỗi Nhà trọ -{" "}
            <span className="text-primary fw-bold">TRI PHAM</span>
          </p>
        </div>

        <div className="text-end d-none d-md-block">
          <div className="badge bg-white text-dark shadow-sm py-2 px-3 rounded-pill border d-flex align-items-center gap-2">
            <div
              className="bg-success rounded-circle"
              style={{ width: "8px", height: "8px" }}
            ></div>
            <span className="small fw-bold">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dải Grid thông tin (Profile & Unread Notifications) */}
      <HeaderGrid profileData={profile} notifications={notifications} />

      {/* 3. Khu vực Chức năng chính */}
      <div className="mt-5 mb-4 d-flex align-items-center gap-3">
        <h5 className="fw-bold text-dark mb-0">Chức năng thường dùng</h5>
        <div
          className="flex-grow-1 border-bottom"
          style={{ height: "1px" }}
        ></div>
      </div>

      <QuickActions />

      {/* 4. Footer nhỏ (Tùy chọn) */}
      <footer className="mt-5 pt-4 text-center text-muted small border-top">
        &copy; {new Date().getFullYear()} - Hệ thống Quản lý Nhà trọ Trí Thiên
        Việt
      </footer>
    </div>
  );
};

export default Home;
