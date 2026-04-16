import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBed, FaDollarSign, FaFileAlt,
  FaBuilding, FaArrowLeft, FaSave, FaExclamationCircle, FaToggleOn,
  FaImage, FaTimes, FaCheck
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
  const [selectedBranchId, setSelectedBranchId] = useState('');

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
    amenities: [],
    depositAmount: '',
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
        setBranches(branchData?.content || []);

        const amenityRes = await apiAmenity.getAllAmenities(0, 100);
        const amenityData = amenityRes.data || amenityRes;
        setAllAmenities(amenityData?.content || []);
      } catch (err) {
        console.error('Fetch filters error:', err);
        alert('Lỗi khi tải dữ liệu!');
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    return () => { mediaFiles.forEach(m => URL.revokeObjectURL(m.preview)); };
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

  const handleBranchChange = (e) => {
    setSelectedBranchId(e.target.value);
    setFormData(prev => ({ ...prev, floorId: '' }));
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setMediaFiles(prev => [
      ...prev,
      ...Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        mediaType: file.type || 'image/jpeg'
      }))
    ]);
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAmenityChange = (amenityId) => {
    const isSelected = formData.amenities.some(a => a.amenityId === amenityId);
    setFormData({
      ...formData,
      amenities: isSelected
        ? formData.amenities.filter(a => a.amenityId !== amenityId)
        : [...formData.amenities, { amenityId }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.roomName.trim()) { alert('Vui lòng nhập tên phòng!'); setLoading(false); return; }
    if (!formData.floorId) { alert('Vui lòng chọn tầng!'); setLoading(false); return; }

    try {
      const roomResponse = await apiRoom.createRoom(formData);
      const createdRoom = roomResponse.data || roomResponse;
      const newRoomId = createdRoom.roomId;

      if (mediaFiles.length > 0) {
        setUploading(true);
        for (let i = 0; i < mediaFiles.length; i++) {
          try { await apiRoomMedia.createRoomMedia(mediaFiles[i].file, newRoomId, false); }
          catch (err) { console.error(`Lỗi upload ảnh ${i + 1}:`, err); }
        }
        setUploading(false);
      }

      alert('Tạo phòng thành công!');
      navigate('/rooms/1');
    } catch (err) {
      console.error('Lỗi API:', err);
      if (err.response?.status === 400) {
        const be = err.response.data;
        typeof be === 'object' && !Array.isArray(be) ? setErrors(be) : alert(be?.message || 'Dữ liệu không hợp lệ.');
      } else {
        alert('Lỗi hệ thống hoặc mất kết nối Server.');
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const renderError = (f) => errors[f]
    ? <div className="text-danger small mt-1 d-flex align-items-center gap-1"><FaExclamationCircle size={12}/> {errors[f]}</div>
    : null;

  const getFloorName = (fId) => {
    const f = floors.find(f => f.floorId === parseInt(fId));
    return f ? `Tầng ${f.floorNumber}` : 'Chọn tầng';
  };
  const getBranchName = (bId) => branches.find(b => String(b.branchId) === String(bId))?.branchName || '-';
  const getAmenityName = (aId) => allAmenities.find(a => a.amenityId === aId)?.amenityName || 'Không xác định';
  const fmtVND = (val) => val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '(chưa nhập)';

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <h4 className="fw-bold text-dark mb-0 text-uppercase">Thêm phòng mới</h4>
          <p className="text-muted small mb-0">Thông tin phòng sẽ được lưu vào hệ thống quản lý</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">

          {/* ── CỘT TRÁI ── */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary"><FaBed size={20} /></div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin cơ bản</h6>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">TÊN PHÒNG <span className="text-danger">*</span></label>
                <input type="text" name="roomName"
                  className={`form-control bg-light border-0 py-2 ${errors.roomName ? 'is-invalid border-danger' : ''}`}
                  placeholder="VD: P101, A201" value={formData.roomName} onChange={handleInputChange} required />
                {renderError('roomName')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">GIÁ TIỀN (VNĐ) <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaDollarSign className="text-success" size={12}/></span>
                  <input type="number" name="price"
                    className={`form-control bg-light border-0 py-2 ${errors.price ? 'is-invalid' : ''}`}
                    placeholder="VD: 3000000" value={formData.price} onChange={handleInputChange} min="0" required />
                </div>
                {renderError('price')}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">TIỀN CỌC (VNĐ)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaDollarSign className="text-warning" size={12}/></span>
                  <input type="number" name="depositAmount"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: 1000000 (để trống nếu không có)"
                    value={formData.depositAmount} onChange={handleInputChange} min="0" />
                </div>
                <small className="text-muted d-block mt-1">Tiền cọc giữ chỗ phòng (tuỳ chọn)</small>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">SỐ NGƯỜI TỐI ĐA <span className="text-danger">*</span></label>
                <input type="number" name="maxPeople"
                  className="form-control bg-light border-0 py-2"
                  placeholder="1" value={formData.maxPeople} onChange={handleInputChange} min="1" required />
                <small className="text-muted d-block mt-1">
                  Số người hiện tại sẽ tự động cập nhật theo hợp đồng
                </small>
              </div>

              <div className="alert alert-light border-0 rounded-3 py-2 px-3 mb-0">
                <small className="text-muted d-flex align-items-center gap-2">
                  <span>👥</span>
                  <span>Số người hiện tại mặc định <strong>0</strong> — tự động cập nhật khi có hợp đồng</span>
                </small>
              </div>
            </div>
          </div>

          {/* ── CỘT PHẢI ── */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info"><FaFileAlt size={20} /></div>
                <h6 className="fw-bold mb-0 text-info">Thông tin thêm</h6>
              </div>

              <div className="row g-3">

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">MÔ TẢ CHI TIẾT <span className="text-danger">*</span></label>
                  <textarea name="description" rows="3"
                    className={`form-control bg-light border-0 ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Mô tả phòng, tiện ích, điều kiện, v.v..."
                    value={formData.description} onChange={handleInputChange} required />
                  {renderError('description')}
                  <small className="text-muted d-block mt-2">{formData.description.length}/500 ký tự</small>
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaBuilding className="me-1 text-muted"/> CHI NHÁNH <span className="text-danger">*</span>
                  </label>
                  <select className="form-select bg-light border-0 py-2" value={selectedBranchId} onChange={handleBranchChange} required>
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
                  </select>
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaBuilding className="me-1 text-muted"/> TẦNG <span className="text-danger">*</span>
                  </label>
                  <select name="floorId"
                    className={`form-select bg-light border-0 py-2 ${errors.floorId ? 'is-invalid' : ''}`}
                    value={formData.floorId} onChange={handleInputChange} disabled={!selectedBranchId} required>
                    <option value="">{!selectedBranchId ? '-- Chọn chi nhánh trước --' : '-- Chọn tầng --'}</option>
                    {filteredFloors.map(f => <option key={f.floorId} value={f.floorId}>Tầng {f.floorNumber}</option>)}
                  </select>
                  {!selectedBranchId && <small className="text-muted">Vui lòng chọn chi nhánh trước</small>}
                  {selectedBranchId && filteredFloors.length === 0 && <small className="text-warning">Chi nhánh này chưa có tầng nào</small>}
                  {renderError('floorId')}
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaToggleOn className="me-1 text-muted"/> TRẠNG THÁI
                  </label>
                  {/* ── 5 trạng thái ── */}
                  <select name="Status" className="form-select bg-light border-0 py-2" value={formData.Status} onChange={handleInputChange}>
                    <option value="AVAILABLE">✓ Có sẵn</option>
                    <option value="SHARED">🤝 Ở ghép</option>
                    <option value="DEPOSITED">💰 Đã cọc</option>
                    <option value="OCCUPIED">📌 Đã cho thuê</option>
                    <option value="MAINTENANCE">🔧 Bảo trì</option>
                  </select>
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label small fw-bold text-muted">TIỆN ÍCH</label>
                  <div className="bg-light rounded-3 p-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {allAmenities.length > 0 ? allAmenities.map(a => (
                      <div key={a.amenityId} className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id={`a-${a.amenityId}`}
                          checked={formData.amenities.some(x => x.amenityId === a.amenityId)}
                          onChange={() => handleAmenityChange(a.amenityId)} />
                        <label className="form-check-label small" htmlFor={`a-${a.amenityId}`}>{a.amenityName}</label>
                      </div>
                    )) : <small className="text-muted">Chưa có tiện ích nào</small>}
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label small fw-bold text-muted">
                    <FaImage className="me-1 text-muted"/> HÌNH ẢNH PHÒNG
                  </label>
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Chọn file từ máy</label>
                      <input type="file" multiple accept="image/*,video/*"
                        className="form-control bg-white border-0 py-2 small"
                        onChange={handleFileUpload} disabled={uploading} />
                      {uploading && (
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <span className="spinner-border spinner-border-sm text-primary"></span>
                          <small className="text-muted">Đang upload ảnh...</small>
                        </div>
                      )}
                    </div>
                    {mediaFiles.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted fw-bold d-block mb-2">Ảnh/Video đã chọn ({mediaFiles.length})</small>
                        <div className="row g-2">
                          {mediaFiles.map((media, idx) => (
                            <div key={idx} className="col-6 col-md-4">
                              <div className="bg-white rounded-2 p-2 position-relative">
                                <img src={media.preview} alt="preview" className="img-fluid rounded-2"
                                  style={{ maxHeight: '80px', width: '100%', objectFit: 'cover' }} />
                                <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
                                  onClick={() => handleRemoveMedia(idx)}>
                                  <FaTimes size={10} />
                                </button>
                                <small className="text-muted d-block text-center mt-1" style={{ fontSize: '10px' }}>{media.file.name}</small>
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
                      <div className="mb-2"><span className="text-muted">Phòng:</span> <strong>{formData.roomName || '(chưa nhập)'}</strong></div>
                      <div className="mb-2"><span className="text-muted">Chi nhánh:</span> <strong>{getBranchName(selectedBranchId)}</strong></div>
                      <div className="mb-2"><span className="text-muted">Tầng:</span> <strong>{getFloorName(formData.floorId)}</strong></div>
                      <div className="mb-2"><span className="text-muted">Giá:</span> <strong>{fmtVND(formData.price)}</strong></div>
                      {formData.depositAmount && (
                        <div className="mb-2"><span className="text-muted">Tiền cọc:</span> <strong className="text-warning">{fmtVND(formData.depositAmount)}</strong></div>
                      )}
                      <div className="mb-2"><span className="text-muted">Sức chứa tối đa:</span> <strong>{formData.maxPeople} người</strong></div>
                      {formData.amenities.length > 0 && (
                        <div className="mb-2">
                          <span className="text-muted">Tiện ích:</span>
                          <div className="mt-1">
                            {formData.amenities.map((a, i) => (
                              <span key={i} className="badge bg-primary me-1 mb-1">
                                <FaCheck size={10} className="me-1" /> {getAmenityName(a.amenityId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mediaFiles.length > 0 && (
                        <div><span className="text-muted">Ảnh/Video:</span> <strong>{mediaFiles.length} file</strong></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-auto pt-3 text-end">
                  <hr className="text-muted opacity-25 mb-4" />
                  <button type="button" onClick={() => navigate('/rooms/1')}
                    className="btn btn-light px-4 me-2 border-0 fw-bold" disabled={loading || uploading}>
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={loading || uploading}
                    className="btn btn-primary px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2">
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm"></span> {uploading ? 'Đang upload ảnh...' : 'Đang lưu...'}</>
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