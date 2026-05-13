import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaBuilding, FaMapMarkerAlt, FaArrowLeft,
  FaSave, FaExclamationCircle, FaSearch, FaUser,
  FaPhone, FaIdCard, FaTimes, FaCheck
} from 'react-icons/fa';
import apiBranches from '../../api/apiBranches';
import apiProfile from '../../api/apiProfile';
import { toast } from 'react-toastify';

const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
);

const css = `
  .cc-root-font { font-family: 'Plus Jakarta Sans', sans-serif; }
  .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1050;
    display:flex;align-items:center;justify-content:center; }
  .cc-modal { background:#fff;border-radius:20px;width:560px;max-height:85vh;
    display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.18);overflow:hidden; }
  .cc-input { width:100%;background:#f4f6fb;border:1.5px solid transparent;border-radius:11px;
    font-family:inherit;font-size:13.5px;padding:10px 14px;outline:none;transition:.15s;box-sizing:border-box; }
  .cc-input:focus { border-color:#4361ee;background:#fff; }
  .cc-btn { display:inline-flex;align-items:center;gap:7px;border:none;border-radius:11px;
    font-family:inherit;font-weight:700;font-size:13.5px;padding:10px 22px;cursor:pointer;transition:.15s; }
  .cc-btn-primary { background:#4361ee;color:#fff; }
  .cc-btn-primary:hover:not(:disabled) { background:#3451d1;transform:translateY(-1px);box-shadow:0 4px 14px rgba(67,97,238,.3); }
  .cc-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
  .profile-card { display:flex;align-items:center;gap:12px;padding:12px 14px;background:#f0fdf4;
    border:1.5px solid #bbf7d0;border-radius:12px; }
  .empty-box { border:2px dashed #e2e8f0;border-radius:12px;padding:28px;text-align:center;
    color:#94a3b8;cursor:pointer;transition:.15s; }
  .empty-box:hover { border-color:#a5b4fc;background:#fafbff; }
`;

const normalizeProfiles = res => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const getProfileId = profile => profile?.profileId ?? profile?.id ?? null;

const getBranchManagerId = branch =>
  branch?.managerId ??
  branch?.manager?.profileId ??
  branch?.manager?.id ??
  branch?.managerProfile?.profileId ??
  branch?.managerProfile?.id ??
  null;

const getBranchManagerProfile = branch =>
  branch?.manager ??
  branch?.managerProfile ??
  null;

const ProfileSearchModal = ({ onSelect, onClose }) => {
  const [kw, setKw] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    let active = true;

    apiProfile.getInternalProfile(1, 10, 'profileId', 'desc', true)
      .then(res => {
        if (!active) return;
        setResults(normalizeProfiles(res));
        setDone(true);
      })
      .catch(() => {
        if (!active) return;
        setResults([]);
        setDone(true);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const search = async e => {
    e.preventDefault();

    const keyword = kw.trim();
    setLoading(true);
    setDone(true);

    try {
      const res = keyword
        ? await apiProfile.searchInternalProfiles(keyword, 1, 10, 'profileId', 'desc', true)
        : await apiProfile.getInternalProfile(1, 10, 'profileId', 'desc', true);

      setResults(normalizeProfiles(res));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay cc-root-font" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Tìm người quản lý</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>×</button>
          </div>

          <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
              <input
                ref={ref}
                className="cc-input"
                style={{ paddingLeft: 36 }}
                placeholder="Tên, số điện thoại hoặc CCCD..."
                value={kw}
                onChange={e => setKw(e.target.value)}
              />
            </div>
            <button className="cc-btn cc-btn-primary" type="submit" disabled={loading}>
              {loading ? 'Đang tìm' : 'Tìm'}
            </button>
          </form>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 24px 24px', flex: 1 }}>
          {loading && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>
              Đang tải nhân sự hệ thống...
            </p>
          )}

          {done && !loading && results.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>
              Không tìm thấy nhân sự hệ thống phù hợp.
            </p>
          )}

          {!loading && results.map(profile => (
            <button
              key={profile.profileId ?? profile.id}
              type="button"
              style={{
                width: '100%',
                background: 'none',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                cursor: 'pointer',
                marginBottom: 8,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: '.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4361ee'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
              onClick={() => onSelect(profile)}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#eef0fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaUser color="#4361ee" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  {profile.fullName}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 14 }}>
                  <span><FaPhone size={9} style={{ marginRight: 4 }} />{profile.phone ?? 'N/A'}</span>
                  <span><FaIdCard size={9} style={{ marginRight: 4 }} />{profile.identityNumber ?? 'N/A'}</span>
                </div>
              </div>

              <FaCheck color="#16a34a" size={13} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const UpdateBranch = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const [formData, setFormData] = useState({
    branchName: '',
    address: '',
    managerId: null,
  });

  const [errors, setErrors] = useState({});
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    let active = true;

    apiBranches.getBranchById(id)
      .then(async res => {
        if (!active) return;

        const branch = res?.data ?? res;
        const managerId = getBranchManagerId(branch);
        const managerProfile = getBranchManagerProfile(branch);

        setFormData({
          branchName: branch.branchName || '',
          address: branch.address || '',
          managerId,
        });

        if (managerProfile) {
          setSelectedManager(managerProfile);
          return;
        }

        if (managerId) {
          try {
            const profileRes = await apiProfile.getProfileById(managerId);
            if (!active) return;
            setSelectedManager(profileRes?.data ?? profileRes);
          } catch {
            if (!active) return;
            setSelectedManager(null);
          }
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Không tìm thấy chi nhánh!');
        navigate('/branches');
      })
      .finally(() => {
        if (!active) return;
        setInitLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectManager = profile => {
    setSelectedManager(profile);
    setFormData(prev => ({
      ...prev,
      managerId: getProfileId(profile),
    }));
    setShowManagerModal(false);
  };

  const handleRemoveManager = () => {
    setSelectedManager(null);
    setFormData(prev => ({ ...prev, managerId: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiBranches.updateBranch(id, formData);
      toast.success('Cập nhật chi nhánh thành công!');
      navigate('/branches');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data;
        if (backendErrors && typeof backendErrors === 'object') setErrors(backendErrors);
        else toast.error(err.response.data?.message || 'Dữ liệu không hợp lệ.');
      } else {
        toast.error('Lỗi hệ thống hoặc mất kết nối server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = field => {
    if (!errors[field]) return null;

    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={12} /> {errors[field]}
      </div>
    );
  };

  if (initLoading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <FontLink />

      <div className="container-fluid py-4 cc-root-font">
        {showManagerModal && (
          <ProfileSearchModal
            onSelect={handleSelectManager}
            onClose={() => setShowManagerModal(false)}
          />
        )}

        <div className="d-flex align-items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-light border-0 shadow-sm rounded-circle p-2">
            <FaArrowLeft />
          </button>
          <div>
            <h4 className="fw-bold text-uppercase mb-0">Cập nhật chi nhánh</h4>
            <p className="text-muted small mb-0">Chỉnh sửa thông tin chi nhánh trong hệ thống</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
                  <div className="bg-primary-subtle p-2 rounded-3 text-primary"><FaBuilding /></div>
                  <h6 className="fw-bold mb-0 text-primary">Thông tin chi nhánh</h6>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    TÊN CHI NHÁNH <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    className={`form-control bg-light border-0 py-2 ${errors.branchName ? 'is-invalid border-danger' : ''}`}
                    value={formData.branchName}
                    onChange={handleInputChange}
                  />
                  {renderError('branchName')}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    ĐỊA CHỈ <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows="4"
                    className={`form-control bg-light border-0 ${errors.address ? 'is-invalid' : ''}`}
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {renderError('address')}
                </div>

                <div className="mb-0">
                  <label className="form-label small fw-bold text-muted mb-2">NGƯỜI QUẢN LÝ</label>

                  {!selectedManager ? (
                    <div className="empty-box" onClick={() => setShowManagerModal(true)}>
                      <FaUser style={{ fontSize: 28, opacity: .2, marginBottom: 10 }} />
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                        Chưa chọn người quản lý
                      </p>
                      <p style={{ margin: 0, fontSize: 12 }}>Nhấn để chọn từ nhân sự hệ thống</p>
                    </div>
                  ) : (
                    <div className="profile-card">
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FaUser color="#16a34a" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                          {selectedManager.fullName}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', gap: 14 }}>
                          <span><FaPhone size={9} style={{ marginRight: 4 }} />{selectedManager.phone ?? 'N/A'}</span>
                          <span><FaIdCard size={9} style={{ marginRight: 4 }} />{selectedManager.identityNumber ?? 'N/A'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveManager}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                  {renderError('managerId')}
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex justify-content-center align-items-center text-center">
                <FaMapMarkerAlt size={40} className="text-primary mb-3" />
                <h5 className="fw-bold">Cập nhật chi nhánh</h5>
                <p className="text-muted small mb-0">Chỉnh sửa tên, địa chỉ và người quản lý chi nhánh</p>
              </div>
            </div>

            <div className="col-12 text-end">
              <hr className="opacity-25" />
              <button type="button" onClick={() => navigate('/branches')} className="btn btn-light me-2 fw-bold">
                Hủy
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary px-5 fw-bold d-inline-flex align-items-center gap-2">
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span> Đang lưu...</>
                  : <><FaSave size={14} /> Cập nhật</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateBranch;
