import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, 
  FaCalendarAlt, FaArrowLeft, FaEdit, FaMotorcycle, 
  FaHome, FaFileContract, FaCloudUploadAlt, FaKey, FaUserEdit 
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State quản lý dữ liệu
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý trạng thái upload riêng biệt cho 2 nút
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // 1. Lấy dữ liệu chi tiết hồ sơ
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await apiProfile.getProfileById(id);
      setProfile(response);
    } catch (err) {
      console.error("Lỗi lấy chi tiết:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // 2. Hàm upload mặt trước (API 1)
  const handleUploadFront = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingFront(true);
      // Gọi đúng API mặt trước của ní ở đây
      await apiProfile.uploadFrontImage(id, formData); 
      await fetchDetail(); // Refresh dữ liệu
      alert("Cập nhật mặt trước thành công!");
    } catch (err) {
      alert("Lỗi upload mặt trước!");
    } finally {
      setUploadingFront(false);
    }
  };

  // 3. Hàm upload mặt sau (API 2)
  const handleUploadBack = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingBack(true);
      // Gọi đúng API mặt sau của ní ở đây
      await apiProfile.uploadBackImage(id, formData); 
      await fetchDetail(); // Refresh dữ liệu
      alert("Cập nhật mặt sau thành công!");
    } catch (err) {
      alert("Lỗi upload mặt sau!");
    } finally {
      setUploadingBack(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div><p>Đang tải dữ liệu...</p></div>;
  if (!profile) return <div className="text-center py-5">Không tìm thấy hồ sơ!</div>;

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      {/* --- BẢNG ĐIỀU KHIỂN TRÊN CÙNG --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-light border-0 rounded-circle p-2 shadow-sm">
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">HỒ SƠ KHÁCH THUÊ</h4>
            <span className="badge bg-primary-subtle text-primary">Mã số: #PR-{profile.profileId}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
           <button onClick={() => navigate(`/admin/profiles/edit/${id}`)} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
             <FaUserEdit /> Cập nhật
           </button>
           <button className="btn btn-outline-dark d-flex align-items-center gap-2 px-3">
             <FaKey /> Đổi mật khẩu
           </button>
        </div>
      </div>

      <div className="row g-4">
        {/* --- CỘT TRÁI: AVATAR & THÔNG TIN CƠ BẢN --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 text-center">
            <div className="bg-primary p-5">
              <FaUserCircle className="text-white mb-2" size={90} />
              <h5 className="text-white fw-bold mb-0">{profile.fullName}</h5>
              <p className="text-white-50 small mb-0">{profile.phone}</p>
            </div>
            <div className="card-body p-4 text-start">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-success-subtle p-2 rounded-3 text-success"><FaHome /></div>
                <div>
                  <div className="small text-muted">Phòng</div>
                  <div className="fw-bold">{profile.roomName || 'Đang trống'}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-danger-subtle p-2 rounded-3 text-danger"><FaFileContract /></div>
                <div>
                  <div className="small text-muted">Hợp đồng</div>
                  <div className="fw-bold">#{profile.activeContractId || 'N/A'}</div>
                </div>
              </div>
              <hr className="opacity-25" />
              <p className="small text-muted mb-1"><FaMapMarkerAlt className="me-1"/> Địa chỉ:</p>
              <p className="small fw-semibold">{profile.address}</p>
            </div>
          </div>

          {/* XE CỘ */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaMotorcycle className="text-warning"/> Biển số xe</h6>
            <div className="d-flex flex-wrap gap-2">
              {profile.vehicles?.length > 0 ? (
                profile.vehicles.map((v, i) => (
                  <span key={i} className="badge bg-light text-dark border px-3 py-2 fw-bold">{v.licensePlate}</span>
                ))
              ) : <span className="text-muted small italic">Chưa đăng ký</span>}
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT CCCD & UPLOAD ẢNH --- */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaIdCard className="text-info"/> Thông tin định danh
            </h6>
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="small text-muted fw-bold">SỐ ĐỊNH DANH</label>
                <div className="fs-5 fw-bold text-primary">{profile.identityNumber}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold">NƠI CẤP</label>
                <div className="fw-semibold">{profile.idIssuePlace || 'Chưa cập nhật'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold">NGÀY CẤP</label>
                <div className="fw-semibold"><FaCalendarAlt className="me-2 text-muted"/>{profile.idIssueDate || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted fw-bold">HẾT HẠN</label>
                <div className="fw-semibold text-danger"><FaCalendarAlt className="me-2"/>{profile.idExpirationDate || 'N/A'}</div>
              </div>
            </div>

            {/* PHẦN UPLOAD 2 ẢNH RIÊNG BIỆT */}
            <h6 className="fw-bold mb-3 text-secondary">Ảnh giấy tờ tùy thân</h6>
            <div className="row g-4">
              {/* MẶT TRƯỚC */}
              <div className="col-md-6 text-center">
                <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '220px' }}>
                  {profile.idFrontImage ? (
                    <img src={`http://localhost:8080/api/public/profile/image/${profile.idFrontImage}`} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt trước" />
                  ) : <span className="text-muted small">Trống mặt trước</span>}
                </div>
                <input type="file" id="frontImg" hidden onChange={handleUploadFront} accept="image/*" />
                <label htmlFor="frontImg" className={`btn btn-sm w-100 py-2 ${uploadingFront ? 'btn-secondary' : 'btn-primary'} rounded-3 shadow-sm`}>
                  {uploadingFront ? <span className="spinner-border spinner-border-sm"></span> : <><FaCloudUploadAlt /> Thêm ảnh mặt trước</>}
                </label>
              </div>

              {/* MẶT SAU */}
              <div className="col-md-6 text-center">
                <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '220px' }}>
                  {profile.idBackImage ? (
                    <img src={`http://localhost:8080/api/public/profile/image/${profile.idBackImage}`} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt sau" />
                  ) : <span className="text-muted small">Trống mặt sau</span>}
                </div>
                <input type="file" id="backImg" hidden onChange={handleUploadBack} accept="image/*" />
                <label htmlFor="backImg" className={`btn btn-sm w-100 py-2 ${uploadingBack ? 'btn-secondary' : 'btn-dark'} rounded-3 shadow-sm`}>
                  {uploadingBack ? <span className="spinner-border spinner-border-sm"></span> : <><FaCloudUploadAlt /> Thêm ảnh mặt sau</>}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;