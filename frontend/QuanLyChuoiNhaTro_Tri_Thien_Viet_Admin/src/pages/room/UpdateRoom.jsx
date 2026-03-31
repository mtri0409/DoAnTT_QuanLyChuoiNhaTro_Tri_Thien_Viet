import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaBed, FaDollarSign, FaFileAlt, FaUsers, FaBuilding,
  FaArrowLeft, FaSave, FaExclamationCircle, FaToggleOn
} from 'react-icons/fa';
import apiRoom from '../../api/apiRoom';
import apiFloor from '../../api/apiFloor';
import apiBranches from '../../api/apiBranches';

const UpdateRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // ← Load dữ liệu ban đầu
  const [floors, setFloors] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // 1. State lưu dữ liệu Form
  const [formData, setFormData] = useState({
    roomName: '',
    price: '',
    description: '',
    currentPeople: 0,
    maxPeople: 1,
    floorId: '',
    branchId: '', // ← Branch ID
    Status: 'AVAILABLE'
  });

  // 2. State lưu thông báo lỗi
  const [errors, setErrors] = useState({});

  // Fetch room data, floors & branches khi component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);

        // ===== ROOM DATA =====
        const roomRes = await apiRoom.getRoomById(roomId);
        const roomData = roomRes.data || roomRes;
        console.log('✅ Room loaded:', roomData);

        // ===== FLOORS =====
        const floorRes = await apiFloor.getAllFloors();
        const floorData = floorRes.data || floorRes;
        setFloors(Array.isArray(floorData) ? floorData : []);
        console.log('✅ Floors loaded:', floorData);

        // ===== BRANCHES =====
        const branchRes = await apiBranches.getAllBranches(1, 100);
        const branchData = branchRes.data || branchRes;
        const branchList = branchData?.content || [];
        setBranches(branchList);
        console.log('✅ Branches loaded:', branchList);

        // ===== SET FORM DATA =====
        // Tìm branchId từ floorId
        const selectedFloor = (Array.isArray(floorData) ? floorData : []).find(f => f.floorId === roomData.floorId);
        const branchIdFromFloor = selectedFloor?.branchId || '';

        setFormData({
          roomName: roomData.roomName || '',
          price: roomData.price || '',
          description: roomData.description || '',
          currentPeople: roomData.currentPeople || 0,
          maxPeople: roomData.maxPeople || 1,
          floorId: roomData.floorId || '',
          branchId: branchIdFromFloor,
          Status: roomData.Status || roomData.status || 'AVAILABLE'
        });

      } catch (err) {
        console.error('❌ Fetch error:', err);
        alert('Lỗi khi tải dữ liệu phòng!');
        navigate('/rooms/1');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [roomId, navigate]);

  // ← Filter floors theo branch
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
    
    // Xóa lỗi của trường đó
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
      floorId: '' // ← Reset floor khi đổi branch
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation client-side
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
      const response = await apiRoom.updateRoom(roomId, formData);
      console.log('✅ Response:', response);
      alert("Cập nhật phòng thành công!");
      navigate('/rooms/1');
    } catch (err) {
      console.error("❌ Lỗi API:", err);

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
    }
  };

  // Hàm Helper để hiển thị giao diện lỗi
  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1 animate__animated animate__fadeIn">
        <FaExclamationCircle size={12}/> {errors[fieldName]}
      </div>
    );
  };

  // Helper: lấy tên tầng từ floorId
  const getFloorName = (floorId) => {
    if (!floorId) return 'Chọn tầng';
    const floor = filteredFloors.find(f => f.floorId === parseInt(floorId));
    return floor ? `Tầng ${floor.floorNumber}` : 'Chọn tầng';
  };

  // Helper: lấy tên branch từ branchId
  const getBranchName = (branchId) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b.branchId === parseInt(branchId));
    return branch ? branch.branchName : '-';
  };

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
      {/* Header Điều hướng */}
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
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaBed size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">Thông tin cơ bản</h6>
              </div>

              {/* TÊN PHÒNG */}
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

              {/* GIÁ TIỀN */}
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

              {/* SỐ NGƯỜI HIỆN TẠI */}
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

              {/* SỐ NGƯỜI TỐI ĐA */}
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

          {/* CỘT PHẢI: THÔNG TIN THÊM */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                <div className="bg-info-subtle p-2 rounded-3 text-info">
                  <FaFileAlt size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-info">Thông tin thêm</h6>
              </div>

              <div className="row g-3">
                
                {/* MÔ TẢ */}
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">MÔ TẢ CHI TIẾT <span className="text-danger">*</span></label>
                  <textarea 
                    name="description" 
                    rows="4" 
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

                {/* CHI NHÁNH */}
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

                {/* TẦNG */}
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

                {/* TRẠNG THÁI */}
                <div className="col-12 mt-3">
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
                    <option value="OCCUPIED">📌 Đã cho thuê</option>
                    <option value="MAINTENANCE">🔧 Bảo trì</option>
                  </select>
                  {renderError('Status')}
                </div>

                {/* TÓMLẠI */}
                <div className="col-12 mt-3">
                  <div className="alert alert-light border-1 border-secondary-subtle">
                    <small className="text-muted fw-bold d-block mb-2">TÓMLẠI</small>
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
                      <div>
                        <span className="text-muted">Sức chứa:</span> <strong className="text-dark">{formData.currentPeople}/{formData.maxPeople} người</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NÚT THAO TÁC */}
                <div className="col-12 mt-auto pt-3 text-end">
                  <hr className="text-muted opacity-25 mb-4" />
                  <button 
                    type="button" 
                    onClick={() => navigate('/admin/rooms')}
                    className="btn btn-light px-4 me-2 border-0 fw-bold"
                    disabled={loading}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm"></span> Đang lưu...</>
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