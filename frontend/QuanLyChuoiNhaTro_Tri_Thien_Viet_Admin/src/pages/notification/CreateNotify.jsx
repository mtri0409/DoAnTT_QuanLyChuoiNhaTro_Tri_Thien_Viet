import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, FaArrowLeft, FaSave, FaExclamationCircle, 
  FaBuilding, FaUser, FaInfoCircle, FaBullhorn, FaUsers, FaMapMarkerAlt
} from 'react-icons/fa';
import apiBranch from '../../api/apiBranches';
import apiProfile from '../../api/apiProfile';
import apiNotification from '../../api/apiNotification';

const CreateNotification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [profiles, setProfiles] = useState([]); 
  
  // Chế độ gửi: 'INDIVIDUAL' (Cá nhân), 'BRANCH' (Chi nhánh), 'GLOBAL' (Toàn hệ thống)
  const [sendMode, setSendMode] = useState('INDIVIDUAL'); 
  const [profileId, setProfileId] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL', 
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiBranch.getAllBranches(0, 100);
        setBranches(response.content);
      } catch (err) { console.error(err); }
    };
    fetchBranches();
  }, []);

  // Chỉ load profiles khi ở chế độ gửi cá nhân và đã chọn chi nhánh
  useEffect(() => {
    if (sendMode !== 'INDIVIDUAL' || !selectedBranch) {
      setProfiles([]);
      return;
    }
    const fetchProfilesByBranch = async () => {
      try {
        setLoading(true);
        const response = await apiProfile.getAllProfiles(1, 500, 'fullName', 'asc', selectedBranch, true);
        setProfiles(response.content);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfilesByBranch();
  }, [selectedBranch, sendMode]);
  // Thêm useEffect này để "dọn dẹp" dữ liệu khi đổi Mode
  useEffect(() => {
    if (sendMode === 'GLOBAL') {
      setProfileId(0);
      setSelectedBranch('');
    } else if (sendMode === 'BRANCH') {
      setProfileId(0);
    }
  }, [sendMode]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  // Logic xử lý ID linh hoạt theo sendMode
  let finalProfileId = 0;
  let finalBranchId = 0;

  if (sendMode === 'INDIVIDUAL') {
    finalProfileId = profileId;
    finalBranchId = 0; // Ép về 0 khi gửi cá nhân
  } else if (sendMode === 'BRANCH') {
    finalProfileId = 0; // Ép về 0 khi gửi theo chi nhánh
    finalBranchId = selectedBranch;
  } else if (sendMode === 'GLOBAL') {
    finalProfileId = 0;
    finalBranchId = 0;
  }
    try{
      console.log(finalBranchId,"-",finalProfileId);
      const response =await apiNotification.createManualNotification(finalProfileId,finalBranchId, formData);
      console.log(response);
      alert("Gửi thông báo thành công!");
      navigate('/notifications'); 
    } catch (err) {
        console.log(err.response)
      if (err.response?.status === 400) setErrors(err.response.data || {});
      else alert("Lỗi hệ thống.");
    } finally { setLoading(false); }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light shadow-sm rounded-circle p-2 border-0">
          <FaArrowLeft className="text-muted" />
        </button>
        <h4 className="fw-bold text-dark mb-0">SOẠN THÔNG BÁO</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              
              {/* 1. LOẠI THÔNG BÁO */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">1. Loại thông báo</label>
                <div className="d-flex flex-wrap gap-2">
                  {['GENERAL', 'PAYMENT', 'MAINTENANCE', 'URGENT'].map(t => (
                    <button
                      key={t} type="button"
                      className={`btn px-4 rounded-pill fw-bold transition-all ${formData.type === t ? 'btn-primary shadow' : 'btn-light text-muted'}`}
                      onClick={() => setFormData({...formData, type: t})}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. ĐỐI TƯỢNG NHẬN TIN */}
              <div className="mb-4 p-3 bg-light rounded-4">
                <label className="form-label small fw-bold text-muted text-uppercase d-block mb-3">2. Đối tượng nhận tin</label>
                
                <div className="d-flex gap-3 mb-3 flex-wrap">
                  <div className={`p-3 rounded-3 border flex-fill cursor-pointer transition-all ${sendMode === 'INDIVIDUAL' ? 'bg-white border-primary shadow-sm' : 'bg-transparent'}`}
                       onClick={() => setSendMode('INDIVIDUAL')}>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="sendMode" checked={sendMode === 'INDIVIDUAL'} readOnly />
                      <label className="form-check-label fw-bold small"><FaUser className="me-1"/> CÁ NHÂN</label>
                    </div>
                  </div>

                  <div className={`p-3 rounded-3 border flex-fill cursor-pointer transition-all ${sendMode === 'BRANCH' ? 'bg-white border-primary shadow-sm' : 'bg-transparent'}`}
                       onClick={() => setSendMode('BRANCH')}>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="sendMode" checked={sendMode === 'BRANCH'} readOnly />
                      <label className="form-check-label fw-bold small"><FaMapMarkerAlt className="me-1"/> THEO CHI NHÁNH</label>
                    </div>
                  </div>

                  <div className={`p-3 rounded-3 border flex-fill cursor-pointer transition-all ${sendMode === 'GLOBAL' ? 'bg-white border-danger shadow-sm' : 'bg-transparent'}`}
                       onClick={() => setSendMode('GLOBAL')}>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="sendMode" checked={sendMode === 'GLOBAL'} readOnly />
                      <label className="form-check-label fw-bold small text-danger"><FaUsers className="me-1"/> TOÀN HỆ THỐNG</label>
                    </div>
                  </div>
                </div>

                {/* Phần chọn Chi nhánh / Người nhận tùy theo Mode */}
                {(sendMode === 'INDIVIDUAL' || sendMode === 'BRANCH') && (
                  <div className="row g-3 animate__animated animate__fadeIn">
                    <div className="col-md-6">
                      <label className="small text-muted mb-1 fw-bold">Chọn chi nhánh</label>
                      <select className="form-select border-0 py-2 shadow-sm" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                        <option value="">-- Danh sách chi nhánh --</option>
                        {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
                      </select>
                    </div>
                    
                    {sendMode === 'INDIVIDUAL' && (
                      <div className="col-md-6">
                        <label className="small text-muted mb-1 fw-bold">Chọn người nhận</label>
                        <select className="form-select border-0 py-2 shadow-sm" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
                          <option value="">-- Danh sách khách thuê --</option>
                          {profiles.map(p => <option key={p.profileId} value={p.profileId}>{p.fullName}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. NỘI DUNG */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">3. Tiêu đề</label>
                <input type="text" name="title" className="form-control border-0 bg-light py-2" value={formData.title} onChange={handleInputChange} placeholder="Nhập tiêu đề..." />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">4. Nội dung</label>
                <textarea name="content" rows="5" className="form-control border-0 bg-light" value={formData.content} onChange={handleInputChange} placeholder="Nhập nội dung chi tiết..." />
              </div>

              <div className="text-end border-top pt-3">
                <button type="submit" disabled={loading || (sendMode === 'INDIVIDUAL' && !profileId) || (sendMode === 'BRANCH' && !selectedBranch)} className="btn btn-primary px-5 shadow fw-bold">
                  {loading ? 'Đang gửi...' : <><FaBullhorn className="me-2"/> XÁC NHẬN GỬI</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateNotification;