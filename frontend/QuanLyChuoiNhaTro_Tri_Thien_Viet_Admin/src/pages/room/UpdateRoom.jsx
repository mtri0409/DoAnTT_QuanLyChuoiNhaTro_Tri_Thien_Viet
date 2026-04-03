import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBed, FaDollarSign, FaFileAlt, FaUsers, FaBuilding,
  FaArrowLeft, FaSave, FaExclamationCircle, FaToggleOn,
  FaImage, FaTimes, FaCheck
} from 'react-icons/fa';
import { imgURL } from '../../api/config';
import apiRoom from '../../api/apiRoom';
import apiFloor from '../../api/apiFloor';
import apiBranches from '../../api/apiBranches';
import apiAmenity from '../../api/apiAmenity';
import apiRoomMedia from '../../api/apiRoomMedia';

const UpdateRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  
  const [formData, setFormData] = useState({
    roomName: '',
    price: '',
    description: '',
    currentPeople: 0,
    maxPeople: 1,
    floorId: '',
    branchId: '',
    Status: 'AVAILABLE',
    amenities: []
  });

  // ← Ảnh CŨ đã có trên server (load từ API)
  const [existingMedia, setExistingMedia] = useState([]);
  // existingMedia = [{ mediaId: 1, url: "/images/room-media/xxx.jpg", mediaType: "image/jpeg" }, ...]

  // ← Ảnh MỚI vừa chọn từ máy (chưa upload)
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  // newMediaFiles = [{ file: File, preview: "blob:...", mediaType: "image/jpeg" }, ...]

  // ← Danh sách mediaId cần xóa
  const [mediaToDelete, setMediaToDelete] = useState([]);

  const [errors, setErrors] = useState({});

  // ========== HELPER: Ghép URL ảnh ==========
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${imgURL}${url}`;
  };

  // Fetch room data, floors, branches & amenities
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);

        const roomRes = await apiRoom.getRoomById(roomId);
        const roomData = roomRes.data || roomRes;
        console.log('Room loaded:', roomData);

        const floorRes = await apiFloor.getAllFloors();
        const floorData = floorRes.data || floorRes;
        setFloors(Array.isArray(floorData) ? floorData : []);

        const branchRes = await apiBranches.getAllBranches(1, 100);
        const branchData = branchRes.data || branchRes;
        const branchList = branchData?.content || [];
        setBranches(branchList);

        const amenityRes = await apiAmenity.getAllAmenities(0, 100);
        const amenityData = amenityRes.data || amenityRes;
        const amenityList = amenityData?.content || [];
        setAllAmenities(amenityList);

        const selectedFloor = (Array.isArray(floorData) ? floorData : []).find(f => f.floorId === roomData.floorId);
        const branchIdFromFloor = selectedFloor?.branchId || '';

        // ← Set form data KHÔNG có roomMedia
        setFormData({
          roomName: roomData.roomName || '',
          price: roomData.price || '',
          description: roomData.description || '',
          currentPeople: roomData.currentPeople || 0,
          maxPeople: roomData.maxPeople || 1,
          floorId: roomData.floorId || '',
          branchId: branchIdFromFloor,
          Status: roomData.Status || roomData.status || 'AVAILABLE',
          amenities: roomData.amenities || []
        });

        // ← Set ảnh cũ riêng
        setExistingMedia(roomData.roomMedia || []);

      } catch (err) {
        console.error('Fetch error:', err);
        alert('Lỗi khi tải dữ liệu phòng!');
        navigate('/rooms/1');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [roomId, navigate]);

  // Cleanup blob URLs khi unmount
  useEffect(() => {
    return () => {
      newMediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    };
  }, [newMediaFiles]);

  // Filter floors theo branch
  useEffect(() => {
    if (!formData.branchId) {
      setFilteredFloors(floors);
    } else {
      const filtered = floors.filter(f => f.branchId === parseInt(formData.branchId));
      setFilteredFloors(filtered);
    }
  }, [formData.branchId, floors]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
    });
    
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setFormData({
      ...formData,
      branchId: branchId,
      floorId: ''
    });
  };

  // ← Chọn file mới từ máy
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      mediaType: file.type || 'image/jpeg'
    }));

    setNewMediaFiles(prev => [...prev, ...newFiles]);
  };

  // ← Xóa ảnh CŨ (đánh dấu để xóa khi submit)
  const handleRemoveExistingMedia = (index) => {
    const media = existingMedia[index];
    if (media.mediaId) {
      setMediaToDelete(prev => [...prev, media.mediaId]);
    }
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ← Xóa ảnh MỚI (chưa upload, chỉ bỏ khỏi danh sách)
  const handleRemoveNewMedia = (index) => {
    setNewMediaFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAmenityChange = (amenityId) => {
    const isSelected = formData.amenities.some(a => a.amenityId === amenityId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a.amenityId !== amenityId)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, { amenityId: amenityId }]
      });
    }
  };

  // ← SUBMIT: Update phòng → Xóa ảnh cũ → Upload ảnh mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.roomName.trim()) {
      alert('Vui lòng nhập tên phòng!');
      setLoading(false);
      return;
    }

    if (!formData.floorId) {
      alert('Vui lòng chọn tầng!');
      setLoading(false);
      return;
    }

    try {
      // ======= BƯỚC 1: Cập nhật thông tin phòng =======
      console.log('Bước 1: Cập nhật phòng...');
      await apiRoom.updateRoom(roomId, formData);
      console.log('Cập nhật phòng OK');

      // ======= BƯỚC 2: Xóa ảnh cũ đã bị remove =======
      if (mediaToDelete.length > 0) {
        console.log(`Bước 2: Xóa ${mediaToDelete.length} ảnh cũ...`);
        for (const mediaId of mediaToDelete) {
          try {
            await apiRoomMedia.deleteRoomMedia(mediaId);
            console.log(`Xóa ảnh ${mediaId} OK`);
          } catch (delErr) {
            console.error(`Lỗi xóa ảnh ${mediaId}:`, delErr);
          }
        }
      }

      // ======= BƯỚC 3: Upload ảnh mới =======
      if (newMediaFiles.length > 0) {
        console.log(`Bước 3: Upload ${newMediaFiles.length} ảnh mới...`);
        setUploading(true);

        for (let i = 0; i < newMediaFiles.length; i++) {
          try {
            await apiRoomMedia.createRoomMedia(
              newMediaFiles[i].file,
              roomId,
              false
            );
            console.log(`Upload ảnh ${i + 1}/${newMediaFiles.length} OK`);
          } catch (uploadErr) {
            console.error(`Lỗi upload ảnh ${i + 1}:`, uploadErr);
          }
        }
        setUploading(false);
      }

      alert("Cập nhật phòng thành công!");
      navigate('/rooms/1');

    } catch (err) {
      console.error("Lỗi API:", err);
      console.error("Response data:", err.response?.data);

      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data;
        
        if (typeof backendErrors === 'object' && !Array.isArray(backendErrors)) {
          setErrors(backendErrors);
        } else {
          alert(backendErrors?.message || "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
        }
      } else {
        alert("Lỗi hệ thống hoặc mất kết nối Server.");
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1 animate__animated animate__fadeIn">
        <FaExclamationCircle size={12}/> {errors[fieldName]}
      </div>
    );
  };

  const getFloorName = (floorId) => {
    if (!floorId) return 'Chọn tầng';
    const floor = filteredFloors.find(f => f.floorId === parseInt(floorId));
    return floor ? `Tầng ${floor.floorNumber}` : 'Chọn tầng';
  };

  const getBranchName = (branchId) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b.branchId === parseInt(branchId));
    return branch ? branch.branchName : '-';
  };

  const getAmenityName = (amenityId) => {
    const amenity = allAmenities.find(a => a.amenityId === amenityId);
    return amenity ? amenity.amenityName : 'Không xác định';
  };

  // Tổng số ảnh hiển thị

  if (initialLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <span className="ms-2">Đang tải dữ liệu phòng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          title="Quay lại"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Chỉnh sửa phòng</h4>
          <p className="text-muted small mb-0">Cập nhật thông tin phòng {formData.roomName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaBed size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin cơ bản</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">TÊN PHÒNG <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="roomName"
                  className={`form-control bg-light border-0 py-2 ${errors.roomName ? 'is-invalid border-danger' : ''}`} 
                  placeholder="VD: P101, A201" 
                  value={formData.roomName}
                  onChange={handleInputChange}
                  required
                />
                {renderError('roomName')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">GIÁ TIỀN (VNĐ) <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className={`input-group-text bg-light border-0 ${errors.price ? 'border border-danger border-end-0' : ''}`}>
                    <FaDollarSign className="text-success" size={12}/>
                  </span>
                  <input 
                    type="number" 
                    name="price"
                    className={`form-control bg-light border-0 py-2 ${errors.price ? 'is-invalid border border-danger border-start-0' : ''}`} 
                    placeholder="VD: 3000000" 
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                {renderError('price')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">SỐ NGƯỜI HIỆN TẠI</label>
                <input 
                  type="number" 
                  name="currentPeople"
                  className={`form-control bg-light border-0 py-2 ${errors.currentPeople ? 'is-invalid border-danger' : ''}`} 
                  placeholder="0" 
                  value={formData.currentPeople}
                  onChange={handleInputChange}
                  min="0"
                />
                {renderError('currentPeople')}
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-muted">SỐ NGƯỜI TỐI ĐA <span className="text-danger">*</span></label>
                <input 
                  type="number" 
                  name="maxPeople"
                  className={`form-control bg-light border-0 py-2 ${errors.maxPeople ? 'is-invalid border-danger' : ''}`} 
                  placeholder="1" 
                  value={formData.maxPeople}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
                {renderError('maxPeople')}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info">
                  <FaFileAlt size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-info">Thông tin thêm</h6>
              </div>

              <div className="row g-3">
                
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">MÔ TẢ CHI TIẾT <span className="text-danger">*</span></label>
                  <textarea 
                    name="description" 
                    rows="3" 
                    className={`form-control bg-light border-0 ${errors.description ? 'is-invalid border-danger' : ''}`} 
                    placeholder="Mô tả phòng, tiện ích, điều kiện, v.v..." 
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  {renderError('description')}
                  <small className="text-muted d-block mt-2">
                    {formData.description.length}/500 ký tự
                  </small>
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">CHI NHÁNH</label>
                  <select 
                    name="branchId"
                    className={`form-select bg-light border-0 py-2 ${errors.branchId ? 'is-invalid border-danger' : ''}`}
                    value={formData.branchId}
                    onChange={handleBranchChange}
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {Array.isArray(branches) && branches.map(branch => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                  {renderError('branchId')}
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaBuilding className="me-1 text-muted"/> TẦNG <span className="text-danger">*</span>
                  </label>
                  <select 
                    name="floorId"
                    className={`form-select bg-light border-0 py-2 ${errors.floorId ? 'is-invalid border-danger' : ''}`}
                    value={formData.floorId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn tầng --</option>
                    {Array.isArray(filteredFloors) && filteredFloors.map(floor => (
                      <option key={floor.floorId} value={floor.floorId}>
                        Tầng {floor.floorNumber}
                      </option>
                    ))}
                  </select>
                  {renderError('floorId')}
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaToggleOn className="me-1 text-muted"/> TRẠNG THÁI
                  </label>
                  <select 
                    name="Status"
                    className={`form-select bg-light border-0 py-2 ${errors.Status ? 'is-invalid border-danger' : ''}`}
                    value={formData.Status}
                    onChange={handleInputChange}
                  >
                    <option value="AVAILABLE">✓ Có sẵn</option>
                    <option value="OCCUPIED">Đã cho thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                  {renderError('Status')}
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label small fw-bold text-muted">TIỆN ÍCH</label>
                  <div className="bg-light rounded-3 p-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {Array.isArray(allAmenities) && allAmenities.length > 0 ? (
                      allAmenities.map(amenity => (
                        <div key={amenity.amenityId} className="form-check mb-2">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`amenity-${amenity.amenityId}`}
                            checked={formData.amenities.some(a => a.amenityId === amenity.amenityId)}
                            onChange={() => handleAmenityChange(amenity.amenityId)}
                          />
                          <label className="form-check-label small" htmlFor={`amenity-${amenity.amenityId}`}>
                            {amenity.amenityName}
                          </label>
                        </div>
                      ))
                    ) : (
                      <small className="text-muted">Chưa có tiện ích nào</small>
                    )}
                  </div>
                </div>

                {/* ========== PHẦN HÌNH ẢNH - ĐÃ SỬA ========== */}
                <div className="col-12 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaImage className="me-1 text-muted"/> HÌNH ẢNH PHÒNG
                  </label>
                  
                  <div className="bg-light rounded-3 p-3 mb-3">

                    {/* Chọn file mới */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Thêm ảnh mới từ máy</label>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,video/*"
                        className="form-control bg-white border-0 py-2 small"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <span className="spinner-border spinner-border-sm text-primary"></span>
                          <small className="text-muted">Đang upload ảnh...</small>
                        </div>
                      )}
                    </div>

                    {/* Ảnh CŨ đã có trên server */}
                    {existingMedia.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted fw-bold d-block mb-2">
                          Ảnh hiện tại ({existingMedia.length})
                        </small>
                        <div className="row g-2">
                          {existingMedia.map((media, idx) => (
                            <div key={`existing-${idx}`} className="col-6 col-md-4">
                              <div className="bg-white rounded-2 p-2 position-relative">
                                <img 
                                  src={getFullImageUrl(media.url)} 
                                  alt={`Ảnh ${idx + 1}`} 
                                  className="img-fluid rounded-2" 
                                  style={{ maxHeight: '80px', width: '100%', objectFit: 'cover' }} 
                                />
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
                                  onClick={() => handleRemoveExistingMedia(idx)}
                                  title="Xóa ảnh này"
                                >
                                  <FaTimes size={10} />
                                </button>
                                {/* Badge ảnh cũ */}
                                <span 
                                  className="badge bg-secondary position-absolute bottom-0 start-0 m-1 rounded-pill"
                                  style={{ fontSize: '9px' }}
                                >
                                  Đã lưu
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ảnh MỚI vừa chọn */}
                    {newMediaFiles.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted fw-bold d-block mb-2">
                          Ảnh mới thêm ({newMediaFiles.length})
                        </small>
                        <div className="row g-2">
                          {newMediaFiles.map((media, idx) => (
                            <div key={`new-${idx}`} className="col-6 col-md-4">
                              <div className="bg-white rounded-2 p-2 position-relative">
                                <img 
                                  src={media.preview} 
                                  alt={`Ảnh mới ${idx + 1}`} 
                                  className="img-fluid rounded-2" 
                                  style={{ maxHeight: '80px', width: '100%', objectFit: 'cover' }} 
                                />
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
                                  onClick={() => handleRemoveNewMedia(idx)}
                                  title="Bỏ ảnh này"
                                >
                                  <FaTimes size={10} />
                                </button>
                                {/* Badge ảnh mới */}
                                <span 
                                  className="badge bg-primary position-absolute bottom-0 start-0 m-1 rounded-pill"
                                  style={{ fontSize: '9px' }}
                                >
                                  Mới
                                </span>
                                <small className="text-muted d-block text-center mt-1" style={{ fontSize: '10px' }}>
                                  {media.file.name}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Thông báo xóa */}
                    {mediaToDelete.length > 0 && (
                      <div className="alert alert-warning small mt-3 mb-0 py-2">
                        <FaExclamationCircle size={12} className="me-1" />
                        {mediaToDelete.length} ảnh sẽ bị xóa khi lưu
                      </div>
                    )}
                  </div>
                </div>

                {/* TÓM TẮT */}
                <div className="col-12 mt-3">
                  <div className="alert alert-light border-1 border-secondary-subtle">
                    <small className="text-muted fw-bold d-block mb-2">TÓM LẠI</small>
                    <div className="small">
                      <div className="mb-2">
                        <span className="text-muted">Phòng:</span> <strong className="text-dark">{formData.roomName || '(chưa nhập)'}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Chi nhánh:</span> <strong className="text-dark">{getBranchName(formData.branchId)}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Tầng:</span> <strong className="text-dark">{getFloorName(formData.floorId)}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Giá:</span> <strong className="text-dark">
                          {formData.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.price) : '(chưa nhập)'}
                        </strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Sức chứa:</span> <strong className="text-dark">{formData.currentPeople}/{formData.maxPeople} người</strong>
                      </div>
                      {formData.amenities.length > 0 && (
                        <div className="mb-2">
                          <span className="text-muted">Tiện ích:</span>
                          <div className="mt-1">
                            {formData.amenities.map((a, idx) => (
                              <span key={idx} className="badge bg-primary me-1 mb-1">
                                <FaCheck size={10} className="me-1" /> {getAmenityName(a.amenityId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted">Ảnh/Video:</span> 
                        <strong className="text-dark"> {existingMedia.length} hiện tại</strong>
                        {newMediaFiles.length > 0 && (
                          <span className="text-primary"> + {newMediaFiles.length} mới</span>
                        )}
                        {mediaToDelete.length > 0 && (
                          <span className="text-danger"> - {mediaToDelete.length} xóa</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-auto pt-3 text-end">
                  <hr className="text-muted opacity-25 mb-4" />
                  <button 
                    type="button" 
                    onClick={() => navigate('/rooms/1')}
                    className="btn btn-light px-4 me-2 border-0 fw-bold"
                    disabled={loading || uploading}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || uploading}
                    className="btn btn-primary px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span> 
                        {uploading ? 'Đang upload ảnh...' : 'Đang lưu...'}
                      </>
                    ) : (
                      <><FaSave size={14}/> Cập nhật phòng</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateRoom;