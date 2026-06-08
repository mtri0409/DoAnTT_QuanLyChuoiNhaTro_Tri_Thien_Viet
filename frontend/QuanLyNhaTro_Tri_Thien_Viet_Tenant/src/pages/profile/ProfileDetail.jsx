import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaUserCircle, FaIdCard, FaMapMarkerAlt, FaPhoneAlt,
  FaCalendarAlt, FaArrowLeft, FaEdit, FaMotorcycle,
  FaHome, FaFileContract, FaCloudUploadAlt, FaKey, FaUserEdit,
  FaCamera, FaTimes, FaUsers
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
import { notify } from '../../utils/swalUtils';
import { imgURL } from '../../api/config';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleUploadFront = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingFront(true);
      await apiProfile.uploadFrontImage(id, formData);
      await fetchDetail();
      notify("Cập nhật mặt trước thành công!");
    } catch (err) {
      notify("Lỗi upload mặt trước!", "error");
    } finally {
      setUploadingFront(false);
    }
  };

  const handleUploadBack = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingBack(true);
      await apiProfile.uploadBackImage(id, formData);
      await fetchDetail();
      notify("Cập nhật mặt sau thành công!");
    } catch (err) {
      notify("Lỗi upload mặt sau!", "error");
    } finally {
      setUploadingBack(false);
    }
  };

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

  // FIX: Gán stream vào video SAU KHI modal đã render xong
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Lỗi play video:", err);
      });
    }
  }, [stream, showCamera]); // showCamera là dependency để chạy lại sau khi modal render

  const openCamera = async (type) => {

     console.log('mediaDevices:', navigator.mediaDevices);
  console.log('getUserMedia:', navigator.mediaDevices?.getUserMedia);
  console.log('isSecureContext:', window.isSecureContext);

    setCameraType(type);
    setShowCamera(true); // render modal trước

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        notify("Trình duyệt của bạn không hỗ trợ camera!", "error");
        setShowCamera(false);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      // Set stream → useEffect sẽ gán vào videoRef sau khi modal đã render
      setStream(mediaStream);

    } catch (err) {
      console.error("Lỗi mở camera:", err);
      const messages = {
        NotAllowedError: "Bạn chưa cho phép truy cập camera! Vui lòng cấp quyền và tải lại trang.",
        NotFoundError: "Không tìm thấy camera trên thiết bị của bạn!",
        NotReadableError: "Camera đang được ứng dụng khác sử dụng!",
        OverconstrainedError: "Không tìm thấy camera phù hợp!",
      };
      notify(messages[err.name] || "Không thể mở camera: " + err.message, "error");
      setShowCamera(false);
      setCameraType(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'camera-capture.jpg');

      try {
        if (cameraType === 'front') {
          setUploadingFront(true);
          await apiProfile.uploadFrontImage(id, formData);
        } else {
          setUploadingBack(true);
          await apiProfile.uploadBackImage(id, formData);
        }
        await fetchDetail();
        notify(`Cập nhật ${cameraType === 'front' ? 'mặt trước' : 'mặt sau'} thành công!`);
        closeCamera();
      } catch (err) {
        notify("Lỗi upload ảnh từ camera!", "error");
      } finally {
        setUploadingFront(false);
        setUploadingBack(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraType(null);
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
  );
  if (!profile) return <div className="text-center py-5">Không tìm thấy hồ sơ!</div>;

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">

      {/* Modal Camera */}
      {showCamera && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark rounded-4">
              <div className="modal-header border-0">
                <h5 className="text-white">
                  Chụp ảnh {cameraType === 'front' ? 'mặt trước' : 'mặt sau'}
                </h5>
                <button className="btn-close btn-close-white" onClick={closeCamera} />
              </div>
              <div className="modal-body text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-3 w-100"
                  style={{ maxHeight: '60vh', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="modal-footer border-0 justify-content-center gap-3">
                <button className="btn btn-secondary" onClick={closeCamera}>
                  <FaTimes /> Hủy
                </button>
                <button
                  className="btn btn-primary btn-lg rounded-circle"
                  style={{ width: 60, height: 60 }}
                  onClick={capturePhoto}
                >
                  <FaCamera size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
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
          <button onClick={() => navigate(`/user/profile/${id}/update`)} className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
            <FaUserEdit /> Cập nhật
          </button>
          <button onClick={() => {
            // Pass profileId + roomId (roomId optional, backend sẽ query)
            const profileId = profile?.profileId;
            navigate(`/user/profile/${id}/guests`);
          }} className="btn btn-success d-flex align-items-center gap-2 px-4 shadow-sm">
            <FaUsers /> Người thân
          </button>
          <button onClick={() => navigate(`/user/change-password`)} className="btn btn-outline-dark d-flex align-items-center gap-2 px-3">
            <FaKey /> Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI */}
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaMotorcycle className="text-warning"/> Biển số xe
              </h6>
              <button
                onClick={() => navigate(`/user/manager-vehicle/${profile.profileId}`)}
                className="btn btn-sm btn-light text-primary fw-bold border-0 shadow-none p-0"
              >
                <FaEdit className="me-1"/> Chỉnh sửa
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {profile.vehicles?.length > 0 ? (
                profile.vehicles.map((v, i) => (
                  <span key={i} className="badge bg-light text-dark border px-3 py-2 fw-bold">
                    {v.licensePlate}
                  </span>
                ))
              ) : (
                <span className="text-muted small">Chưa đăng ký</span>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
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

            <h6 className="fw-bold mb-3 text-secondary">Ảnh giấy tờ tùy thân</h6>
            <div className="row g-4">
              {/* MẶT TRƯỚC */}
              <div className="col-md-6">
                <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '220px' }}>
                  {profile.idFrontImage ? (
                    <img src={`${imgURL}/api/v1/public/profile/image/${profile.idFrontImage}`} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt trước" />
                  ) : <span className="text-muted small">Trống mặt trước</span>}
                </div>
                <div className="d-flex gap-2">
                  <input type="file" id="frontImg" hidden onChange={handleUploadFront} accept="image/*" />
                  <label htmlFor="frontImg" className={`btn btn-sm flex-grow-1 py-2 ${uploadingFront ? 'btn-secondary' : 'btn-primary'} rounded-3 shadow-sm`}>
                    {uploadingFront ? <span className="spinner-border spinner-border-sm"></span> : <><FaCloudUploadAlt /> Tải lên</>}
                  </label>
                  <button onClick={() => openCamera('front')} className="btn btn-sm btn-outline-primary rounded-3" disabled={uploadingFront}>
                    <FaCamera /> Chụp
                  </button>
                </div>
              </div>

              {/* MẶT SAU */}
              <div className="col-md-6">
                <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '220px' }}>
                  {profile.idBackImage ? (
                    <img src={`${imgURL}/api/v1/public/profile/image/${profile.idBackImage}`} className="img-fluid h-100 w-100 object-fit-contain" alt="Mặt sau" />
                  ) : <span className="text-muted small">Trống mặt sau</span>}
                </div>
                <div className="d-flex gap-2">
                  <input type="file" id="backImg" hidden onChange={handleUploadBack} accept="image/*" />
                  <label htmlFor="backImg" className={`btn btn-sm flex-grow-1 py-2 ${uploadingBack ? 'btn-secondary' : 'btn-dark'} rounded-3 shadow-sm`}>
                    {uploadingBack ? <span className="spinner-border spinner-border-sm"></span> : <><FaCloudUploadAlt /> Tải lên</>}
                  </label>
                  <button onClick={() => openCamera('back')} className="btn btn-sm btn-outline-dark rounded-3" disabled={uploadingBack}>
                    <FaCamera /> Chụp
                  </button>
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