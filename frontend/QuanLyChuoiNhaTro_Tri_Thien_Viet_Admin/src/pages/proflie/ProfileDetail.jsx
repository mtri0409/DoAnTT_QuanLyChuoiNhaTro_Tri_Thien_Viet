import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, 
  FaCalendarAlt, FaArrowLeft, FaEdit, FaMotorcycle, FaHome, FaFileContract 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await apiProfile.getProfileById(id);
        setProfile(response);
      } catch (err) {
        console.error("Lỗi lấy chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;
  if (!profile) return <div className="text-center py-5">Không tìm thấy hồ sơ!</div>;

  return (
    <div className="container-fluid py-4">
      {/* Header & Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT KHÁCH THUÊ</h4>
            <span className="badge bg-primary-subtle text-primary mt-1">ID: #PR-{profile.profileId}</span>
          </div>
        </div>
        <button onClick={() => navigate(`/admin/profiles/edit/${id}`)} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4">
          <FaEdit /> Chỉnh sửa hồ sơ
        </button>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & PHÒNG */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="bg-primary p-4 text-center">
              <FaUserCircle className="text-white mb-2" size={80} />
              <h5 className="text-white fw-bold mb-0">{profile.fullName}</h5>
              <p className="text-white-50 small mb-0">{profile.phone}</p>
            </div>
            <div className="card-body p-4">
              <div className="mb-3 d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-success"><FaHome /></div>
                <div>
                  <div className="small text-muted">Phòng đang thuê</div>
                  <div className="fw-bold text-dark">{profile.roomName || 'Chưa nhận phòng'}</div>
                </div>
              </div>
              <div className="mb-3 d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-danger"><FaFileContract /></div>
                <div>
                  <div className="small text-muted">Hợp đồng hiện tại</div>
                  <div className="fw-bold text-dark">#{profile.activeContractId || 'N/A'}</div>
                  <div className="small text-muted">Hết hạn: {profile.contractEndDate || 'N/A'}</div>
                </div>
              </div>
              <hr className="text-muted opacity-25" />
              <div className="small text-muted mb-1"><FaMapMarkerAlt className="me-2"/>Địa chỉ thường trú:</div>
              <div className="small fw-semibold">{profile.address}</div>
            </div>
          </div>

          {/* DANH SÁCH XE (Lọc biển số null) */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FaMotorcycle className="text-warning"/> Phương tiện đăng ký
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {profile.vehicles?.filter(v => v.licensePlate).length > 0 ? (
                profile.vehicles.filter(v => v.licensePlate).map((v, index) => (
                  <span key={index} className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fw-bold">
                    {v.licensePlate}
                  </span>
                ))
              ) : (
                <span className="text-muted small italic">Chưa đăng ký xe</span>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT ĐỊNH DANH */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaIdCard className="text-info"/> Thông tin định danh (CCCD)
            </h6>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Số định danh</label>
                <div className="fs-5 fw-bold text-primary">{profile.identityNumber}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Nơi cấp</label>
                <div className="fw-semibold">{profile.idIssuePlace || 'Chưa cập nhập'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Ngày cấp</label>
                <div className="fw-semibold"><FaCalendarAlt className="me-2 text-muted"/>{profile.idIssueDate || 'Chưa cập nhập'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Ngày hết hạn</label>
                <div className="fw-semibold text-danger"><FaCalendarAlt className="me-2"/>{profile.idExpirationDate || 'Chưa cập nhập'}</div>
              </div>

              {/* KHU VỰC ẢNH CCCD (Nếu có) */}
              <div className="col-12 mt-4">
                <label className="small text-muted text-uppercase fw-bold mb-2">Ảnh giấy tờ tùy thân</label>
                <div className="row g-3">
                  <div className="col-md-6">
                     <div className="rounded-3 bg-light d-flex align-items-center justify-content-center border" style={{ height: '200px' }}>
                      {profile.idFrontImage ? (
                        <img src={`http://localhost:8080/api/public/profile/image/${profile.idFrontImage}`} alt="Mặt trước" className="img-fluid rounded-3 h-100 w-100 object-fit-contain" />
                      ) : (
                        <span className="text-muted small">Mặt trước CCCD </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="rounded-3 bg-light d-flex align-items-center justify-content-center border" style={{ height: '200px' }}>
                      {profile.idBackImage ? (
                        <img src={`http://localhost:8080/api/public/profile/image/${profile.idBackImage}`} alt="Mặt sau" className="img-fluid rounded-3 h-100 w-100 object-fit-cover" />
                      ) : (
                        <span className="text-muted small">Mặt sau CCCD</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;