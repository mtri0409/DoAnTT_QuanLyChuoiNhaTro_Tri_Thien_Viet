import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBed, FaDollarSign, FaFileAlt, FaUsers, FaBuilding,
  FaArrowLeft, FaSave, FaExclamationCircle, FaToggleOn,
  FaImage, FaTimes, FaPlus, FaCheck
} from 'react-icons/fa';
import apiRoom from '../../api/apiRoom';
import apiFloor from '../../api/apiFloor';
import apiBranches from '../../api/apiBranches';
import apiAmenity from '../../api/apiAmenity';
import apiRoomMedia from '../../api/apiRoomMedia';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [floors, setFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);

  // ← THÊM: branch được chọn để filter tầng
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // ← THÊM: floors đã lọc theo branch
  const filteredFloors = selectedBranchId
    ? floors.filter(f => String(f.branchId) === String(selectedBranchId))
    : [];
  
  const [formData, setFormData] = useState({
    roomName: '',
    price: '',
    description: '',
    currentPeople: 0,
    maxPeople: 1,
    floorId: '',
    Status: 'AVAILABLE',
    amenities: []
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFilters = async () => {
      try {
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
      } catch (err) {
        console.error('Fetch filters error:', err);
        alert('Lỗi khi tải dữ liệu!');
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    return () => {
      mediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    };
  }, [mediaFiles]);

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

  // ← THÊM: khi đổi chi nhánh → reset floorId
  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranchId(branchId);
    setFormData(prev => ({ ...prev, floorId: '' }));
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newMediaFiles = Array.from(files).map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      mediaType: file.type || 'image/jpeg'
    }));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAmenityChange = (amenityId) => {
    const isSelected = formData.amenities.some(a => a.amenityId === amenityId);
    if (isSelected) {
      setFormData({ ...formData, amenities: formData.amenities.filter(a => a.amenityId !== amenityId) });
    } else {
      setFormData({ ...formData, amenities: [...formData.amenities, { amenityId: amenityId }] });
    }
  };

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
      console.log('Bước 1: Tạo phòng...');
      const roomResponse = await apiRoom.createRoom(formData);
      const createdRoom = roomResponse.data || roomResponse;
      const newRoomId = createdRoom.roomId;
      console.log('Tạo phòng OK, roomId:', newRoomId);

      if (mediaFiles.length > 0) {
        console.log(`Bước 2: Upload ${mediaFiles.length} ảnh...`);
        setUploading(true);
        for (let i = 0; i < mediaFiles.length; i++) {
          try {
            await apiRoomMedia.createRoomMedia(mediaFiles[i].file, newRoomId, false);
            console.log(`Upload ảnh ${i + 1}/${mediaFiles.length} OK`);
          } catch (uploadErr) {
            console.error(`Lỗi upload ảnh ${i + 1}:`, uploadErr);
          }
        }
        setUploading(false);
      }

      alert("Tạo phòng thành công!");
      navigate('/rooms/1');
    } catch (err) {
      console.error("Lỗi API:", err);
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
    const floor = floors.find(f => f.floorId === parseInt(floorId));
    return floor ? `Tầng ${floor.floorNumber}` : 'Chọn tầng';
  };

  const getBranchName = (branchId) => {
    if (!branchId) return '-';
    const branch = branches.find(b => String(b.branchId) === String(branchId));
    return branch ? branch.branchName : '-';
  };

  const getAmenityName = (amenityId) => {
    const amenity = allAmenities.find(a => a.amenityId === amenityId);
    return amenity ? amenity.amenityName : 'Không xác định';
  };

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
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Thêm phòng mới</h4>
          <p className="text-muted small mb-0">Thông tin phòng sẽ được lưu vào hệ thống quản lý</p>
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

                {/* ← THÊM: Chọn chi nhánh trước */}
                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaBuilding className="me-1 text-muted"/> CHI NHÁNH <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select bg-light border-0 py-2"
                    value={selectedBranchId}
                    onChange={handleBranchChange}
                    required
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map(branch => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ← SỬA: Tầng lọc theo chi nhánh đã chọn */}
                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaBuilding className="me-1 text-muted"/> TẦNG <span className="text-danger">*</span>
                  </label>
                  <select 
                    name="floorId"
                    className={`form-select bg-light border-0 py-2 ${errors.floorId ? 'is-invalid border-danger' : ''}`}
                    value={formData.floorId}
                    onChange={handleInputChange}
                    disabled={!selectedBranchId}
                    required
                  >
                    <option value="">
                      {!selectedBranchId ? '-- Chọn chi nhánh trước --' : '-- Chọn tầng --'}
                    </option>
                    {filteredFloors.map(floor => (
                      <option key={floor.floorId} value={floor.floorId}>
                        Tầng {floor.floorNumber}
                      </option>
                    ))}
                  </select>
                  {!selectedBranchId && (
                    <small className="text-muted">Vui lòng chọn chi nhánh trước</small>
                  )}
                  {selectedBranchId && filteredFloors.length === 0 && (
                    <small className="text-warning">Chi nhánh này chưa có tầng nào</small>
                  )}
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

                <div className="col-12 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaImage className="me-1 text-muted"/> HÌNH ẢNH PHÒNG
                  </label>
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Chọn file từ máy</label>
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
                    {mediaFiles.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted fw-bold d-block mb-2">
                          Ảnh/Video đã chọn ({mediaFiles.length})
                        </small>
                        <div className="row g-2">
                          {mediaFiles.map((media, idx) => (
                            <div key={idx} className="col-6 col-md-4">
                              <div className="bg-white rounded-2 p-2 position-relative">
                                <img 
                                  src={media.preview} 
                                  alt="preview" 
                                  className="img-fluid rounded-2" 
                                  style={{ maxHeight: '80px', width: '100%', objectFit: 'cover' }} 
                                />
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
                                  onClick={() => handleRemoveMedia(idx)}
                                >
                                  <FaTimes size={10} />
                                </button>
                                <small className="text-muted d-block text-center mt-1" style={{ fontSize: '10px' }}>
                                  {media.file.name}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <div className="alert alert-light border-1 border-secondary-subtle">
                    <small className="text-muted fw-bold d-block mb-2">TÓM LẠI</small>
                    <div className="small">
                      <div className="mb-2">
                        <span className="text-muted">Phòng:</span> <strong className="text-dark">{formData.roomName || '(chưa nhập)'}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Chi nhánh:</span> <strong className="text-dark">{getBranchName(selectedBranchId)}</strong>
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
                      {mediaFiles.length > 0 && (
                        <div>
                          <span className="text-muted">Ảnh/Video:</span> <strong className="text-dark">{mediaFiles.length} file</strong>
                        </div>
                      )}
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
                      <><FaSave size={14}/> Lưu phòng</>
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

export default CreateRoom;