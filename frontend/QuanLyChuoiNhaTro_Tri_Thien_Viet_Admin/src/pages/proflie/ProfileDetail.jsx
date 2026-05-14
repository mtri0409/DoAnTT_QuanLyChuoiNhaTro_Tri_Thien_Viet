import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaIdCard, FaMapMarkerAlt,
  FaCalendarAlt, FaArrowLeft, FaEdit, FaMotorcycle, FaFileContract,
  FaCloudUploadAlt, FaCamera, FaTimes
} from 'react-icons/fa';
import apiProfile from '../../api/apiProfile';
import { toast } from 'react-toastify';

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

  // Gán stream vào video SAU KHI modal đã render
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Lỗi play video:", err);
      });
    }
  }, [stream, showCamera]);

  const handleUploadFront = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingFront(true);
      await apiProfile.uploadFrontImage(id, formData);
      await fetchDetail();
      toast.success("Cập nhật mặt trước thành công!");
    } catch (err) {
      toast.error("Lỗi upload mặt trước!", "error");
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
      toast.success("Cập nhật mặt sau thành công!");
    } catch (err) {
      toast.error("Lỗi upload mặt sau!", "error");
    } finally {
      setUploadingBack(false);
    }
  };

  const openCamera = async (type) => {
    setCameraType(type);
    setShowCamera(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Trình duyệt của bạn không hỗ trợ camera!", "error");
        setShowCamera(false);
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Lỗi mở camera:", err);
      const messages = {
        NotAllowedError: "Bạn chưa cho phép truy cập camera! Vui lòng cấp quyền và tải lại trang.",
        NotFoundError: "Không tìm thấy camera trên thiết bị của bạn!",
        NotReadableError: "Camera đang được ứng dụng khác sử dụng!",
        OverconstrainedError: "Không tìm thấy camera phù hợp!",
      };
      toast.error(messages[err.name] || "Không thể mở camera: " + err.message, "error");
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
        toast.success(`Cập nhật ${cameraType === 'front' ? 'mặt trước' : 'mặt sau'} thành công!`);
        closeCamera();
      } catch (err) {
        toast.error("Lỗi upload ảnh từ camera!", "error");
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

  if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;
  if (!profile) return <div className="text-center py-5">Không tìm thấy hồ sơ!</div>;

  const isTenant = profile.roleName === "TENANT";

  return (
    <div className="container-fluid py-4">

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT HỒ SƠ</h4>
            <span className="badge bg-primary-subtle text-primary mt-1">ID: #PR-{profile.profileId}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin/profiles/${id}/update`)}
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4"
        >
          <FaEdit /> Chỉnh sửa hồ sơ
        </button>
      </div>

      <div className="row g-4">

        {/* CỘT TRÁI */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="bg-primary p-4 text-center">
              <FaUserCircle className="text-white mb-2" size={80} />
              <h5 className="text-white fw-bold mb-0">{profile.fullName}</h5>
              <p className="text-white-50 small mb-0">{profile.phone}</p>
            </div>
            <div className="card-body p-4">

              {isTenant && (
                <div className="mb-3 d-flex align-items-center gap-3">
                  <div>
                    <div className="small text-muted">Phòng đang thuê</div>
                    <div className="fw-bold text-dark">{profile.roomName || 'Chưa nhận phòng'}</div>
                  </div>
                </div>
              )}

              <div className="mb-3 d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-danger"><FaFileContract /></div>
                {isTenant ? (
                  <div>
                    <div className="small text-muted">Hợp đồng hiện tại</div>
                    <div className="fw-bold text-dark">#{profile.activeContractId || 'N/A'}</div>
                    <div className="small text-muted">Hết hạn: {profile.contractEndDate || 'N/A'}</div>
                  </div>
                ) : (
                  <div>
                    <div className="small text-muted">Chức vụ</div>
                    <div className="fw-bold text-dark">{profile.roleName || 'N/A'}</div>
                  </div>
                )}
              </div>

              <hr className="text-muted opacity-25" />
              <div className="small text-muted mb-1"><FaMapMarkerAlt className="me-2"/>Địa chỉ thường trú:</div>
              <div className="small fw-semibold">{profile.address}</div>
            </div>
          </div>

          {/* XE */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FaMotorcycle className="text-warning"/> Phương tiện đăng ký
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {profile.vehicles?.filter(v => v.licensePlate).length > 0 ? (
                profile.vehicles.filter(v => v.licensePlate).map((v, index) => (
                  <span key={index} className="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fw-bold d-flex align-items-center">
                    {v.brand && <span className="text-primary me-2 text-uppercase">{v.brand}</span>}
                    <span className="text-muted opacity-50 me-2">|</span>
                    <span>{v.licensePlate}</span>
                  </span>
                ))
              ) : (
                <span className="text-muted small">Chưa đăng ký xe</span>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
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
                <div className="fw-semibold">{profile.idIssuePlace || 'Chưa cập nhật'}</div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Ngày cấp</label>
                <div className="fw-semibold">
                  <FaCalendarAlt className="me-2 text-muted"/>{profile.idIssueDate || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="small text-muted text-uppercase fw-bold">Ngày hết hạn</label>
                <div className="fw-semibold text-danger">
                  <FaCalendarAlt className="me-2"/>{profile.idExpirationDate || 'Chưa cập nhật'}
                </div>
              </div>

              {/* ẢNH CCCD */}
              <div className="col-12 mt-2">
                <label className="small text-muted text-uppercase fw-bold mb-3">Ảnh giấy tờ tùy thân</label>
                <div className="row g-3">

                  {/* MẶT TRƯỚC */}
                  <div className="col-md-6">
                    <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '200px' }}>
                      {profile.idFrontImage ? (
                        <img
                          src={`http://localhost:8080/api/public/profile/image/${profile.idFrontImage}`}
                          alt="Mặt trước"
                          className="img-fluid h-100 w-100 object-fit-contain"
                        />
                      ) : (
                        <span className="text-muted small">Mặt trước CCCD</span>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <input type="file" id="frontImg" hidden onChange={handleUploadFront} accept="image/*" />
                      <label htmlFor="frontImg" className={`btn btn-sm flex-grow-1 py-2 ${uploadingFront ? 'btn-secondary' : 'btn-primary'} rounded-3 shadow-sm`}>
                        {uploadingFront
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <><FaCloudUploadAlt /> Tải lên</>
                        }
                      </label>
                      <button
                        onClick={() => openCamera('front')}
                        className="btn btn-sm btn-outline-primary rounded-3"
                        disabled={uploadingFront}
                      >
                        <FaCamera /> Chụp
                      </button>
                    </div>
                  </div>

                  {/* MẶT SAU */}
                  <div className="col-md-6">
                    <div className="rounded-4 bg-light border border-2 border-dashed d-flex align-items-center justify-content-center overflow-hidden mb-2" style={{ height: '200px' }}>
                      {profile.idBackImage ? (
                        <img
                          src={`http://localhost:8080/api/public/profile/image/${profile.idBackImage}`}
                          alt="Mặt sau"
                          className="img-fluid h-100 w-100 object-fit-cover"
                        />
                      ) : (
                        <span className="text-muted small">Mặt sau CCCD</span>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <input type="file" id="backImg" hidden onChange={handleUploadBack} accept="image/*" />
                      <label htmlFor="backImg" className={`btn btn-sm flex-grow-1 py-2 ${uploadingBack ? 'btn-secondary' : 'btn-dark'} rounded-3 shadow-sm`}>
                        {uploadingBack
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <><FaCloudUploadAlt /> Tải lên</>
                        }
                      </label>
                      <button
                        onClick={() => openCamera('back')}
                        className="btn btn-sm btn-outline-dark rounded-3"
                        disabled={uploadingBack}
                      >
                        <FaCamera /> Chụp
                      </button>
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