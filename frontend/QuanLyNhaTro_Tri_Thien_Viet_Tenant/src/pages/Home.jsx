import React, { useEffect, useState } from 'react';
import QuickActions from '../components/QuickAction';
import HeaderGrid from '../components/HeaderGird'; // Nhớ check lại tên file HeaderGird hay Grid nhé ní
import { useAuth } from '../context/AuthContext';
import apiProfile from '../api/apiProfile';

const Home = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null); // Đổi thành profile (số ít) vì mỗi user chỉ có 1 profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ fetch khi có user và có profileId
    if (user && user.profileId) {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          const response = await apiProfile.getProfileById(user.profileId);
          setProfile(response);
        } catch (error) {
          console.error("Lỗi lấy thông tin profile:", error);
        } finally {
          // Cho loading chạy thêm 500ms để hiệu ứng mượt hơn (optional)
          setTimeout(() => setLoading(false), 500);
        }
      };
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // --- TRẠNG THÁI LOADING ---
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted fw-bold animate__animated animate__pulse animate__infinite">
          Đang tải dữ liệu người thuê...
        </p>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Tiêu đề trang */}
      <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0 text-uppercase">Cổng thông tin người thuê</h4>
            <p className="text-muted small mb-0">Hệ thống Quản lý Chuỗi Nhà trọ - Powered by TRI Pham</p>
          </div>
          {/* Hiển thị ngày giờ hiện tại cho xịn */}
          <div className="text-end d-none d-md-block">
             <span className="badge bg-white text-dark shadow-sm py-2 px-3 rounded-pill border">
                {new Date().toLocaleDateString('vi-VN')}
             </span>
          </div>
      </div>

      {/* Dải phía trên - TRUYỀN DỮ LIỆU VÀO ĐÂY */}
      <HeaderGrid profileData={profile} userData={user} />

      {/* Dải phía dưới (Chức năng nhanh) */}
      <h5 className="fw-bold text-dark mt-5 mb-3 border-bottom pb-2">Chức năng thường dùng</h5>
      <QuickActions />
    </div>
  );
};

export default Home;