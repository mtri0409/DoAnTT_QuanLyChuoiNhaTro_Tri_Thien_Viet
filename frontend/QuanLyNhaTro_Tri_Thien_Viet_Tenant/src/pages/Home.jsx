import React, { useEffect, useState } from "react";
import QuickActions from "../components/QuickAction";
import HeaderGrid from "../components/HeaderGird";
import { useAuth } from "../context/AuthContext";
import apiProfile from "../api/apiProfile";
import apiNotification from "../api/apiNotification";

const Home = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.profileId) {
      const fetchHomeData = async () => {
        try {
          setLoading(true);
          const [profileRes, notiRes] = await Promise.all([
            apiProfile.getProfileById(user.profileId),
            apiNotification.getNotificationById(user.userId),
          ]);
          setProfile(profileRes);
          setNotifications(notiRes.filter((n) => !n.isRead));
        } catch (error) {
          console.error("Lỗi tải dữ liệu trang chủ:", error.response);
        } finally {
          setTimeout(() => setLoading(false), 400);
        }
      };
      fetchHomeData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh", gap: "16px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="text-muted small fw-medium mb-0">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <div className="m-3">
        <div
          className="text-center p-5 rounded-4 border"
          style={{ background: "#fff8e1", borderColor: "#ffe082" }}
        >
          <div className="fs-2 mb-3">⚠️</div>
          <h6 className="fw-bold" style={{ color: "#5f4c00" }}>
            Chưa có hồ sơ
          </h6>
          <p className="mb-0 small" style={{ color: "#7a6200" }}>
            Hồ sơ của bạn chưa được khởi tạo. Vui lòng liên hệ quản lý để được
            hỗ trợ.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-1 px-md-2 pb-5">
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {/* Left: brand + title */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold flex-shrink-0"
            style={{
              width: 42,
              height: 42,
              fontSize: "0.75rem",
              background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              letterSpacing: "0.5px",
            }}
          >
            TTV
          </div>
          <div>
            <h4
              className="mb-0 fw-bold"
              style={{ fontSize: "1rem", color: "#1a1a2e" }}
            >
              Cổng thông tin người thuê
            </h4>
            <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
              Hệ thống quản lý chuỗi nhà trọ
            </p>
          </div>
        </div>

        {/* Right: date badge (md+) */}
        <div className="d-none d-md-flex align-items-center gap-2 badge bg-white border text-dark fw-semibold px-3 py-2 rounded-pill shadow-sm">
          <span
            className="rounded-circle bg-success d-inline-block flex-shrink-0"
            style={{ width: 8, height: 8 }}
          />
          <span style={{ fontSize: "0.8rem" }}>{today}</span>
        </div>
      </div>

      {/* Info grid */}
      <HeaderGrid profileData={profile} notifications={notifications} />

      {/* Section divider */}
      <div className="d-flex align-items-center gap-3 my-4">
        <span
          className="text-uppercase fw-bold text-secondary text-nowrap"
          style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}
        >
          Chức năng thường dùng
        </span>
        <hr className="flex-grow-1 m-0" />
      </div>

      {/* Quick actions */}
      <QuickActions profile={profile} />
    </div>
  );
};

export default Home;
