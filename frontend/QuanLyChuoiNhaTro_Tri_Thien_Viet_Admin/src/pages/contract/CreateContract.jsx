import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch, FaUser, FaTimes, FaCheck, FaArrowLeft,
  FaFileSignature, FaPhone, FaIdCard, FaCalendarAlt,
  FaDoorOpen, FaConciergeBell, FaExclamationCircle, FaSave,
  FaBuilding, FaCheckCircle,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";
import apiServices from "../../api/apiService";
import apiRoom from "../../api/apiRoom";
import apiBranches from "../../api/apiBranches";

/* ─── Font ────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
);

/* ─── Styles ──────────────────────────────────────────────── */
const css = `
  .cc-root { font-family:'Plus+Jakarta+Sans',sans-serif;background:#f4f6fb;min-height:100vh;font-family:'Plus Jakarta Sans',sans-serif; }
  .cc-card { background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,.07);padding:28px; }
  .cc-input { width:100%;background:#f4f6fb;border:1.5px solid transparent;border-radius:11px;
    font-family:inherit;font-size:13.5px;padding:10px 14px;outline:none;transition:.15s;box-sizing:border-box; }
  .cc-input:focus { border-color:#4361ee;background:#fff; }
  .cc-input.err { border-color:#ef4444;background:#fff9f9; }
  .cc-select { width:100%;background:#f4f6fb;border:1.5px solid transparent;border-radius:11px;
    font-family:inherit;font-size:13.5px;padding:10px 14px;outline:none;transition:.15s;box-sizing:border-box;cursor:pointer; }
  .cc-select:focus { border-color:#4361ee;background:#fff; }
  .cc-select:disabled { opacity:.55;cursor:not-allowed; }
  .cc-label { font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
    color:#64748b;display:block;margin-bottom:7px; }
  .cc-btn { display:inline-flex;align-items:center;gap:7px;border:none;border-radius:11px;
    font-family:inherit;font-weight:700;font-size:13.5px;padding:10px 22px;cursor:pointer;transition:.15s; }
  .cc-btn-primary { background:#4361ee;color:#fff; }
  .cc-btn-primary:hover:not(:disabled) { background:#3451d1;transform:translateY(-1px);box-shadow:0 4px 14px rgba(67,97,238,.3); }
  .cc-btn-primary:disabled { opacity:.6;cursor:not-allowed; }
  .cc-btn-ghost { background:#f4f6fb;color:#475569;border:1.5px solid #e2e8f0; }
  .cc-btn-ghost:hover { background:#e8ecf5; }
  .cc-btn-outline { background:transparent;color:#4361ee;border:1.5px solid #c7d0f8;border-radius:10px;
    padding:7px 14px;font-family:inherit;font-weight:600;font-size:13px;cursor:pointer;
    display:inline-flex;align-items:center;gap:6px;transition:.15s; }
  .cc-btn-outline:hover { background:#eef0fd; }
  .cc-err { font-size:12px;color:#ef4444;margin-top:5px;display:flex;align-items:center;gap:5px; }
  .svc-row { border:1.5px solid #e2e8f0;border-radius:12px;padding:11px 14px;
    display:flex;align-items:center;gap:12px;cursor:pointer;transition:.15s;background:#fafbff; }
  .svc-row.sel { border-color:#4361ee;background:#f0f3ff; }
  .svc-row:hover { border-color:#a5b4fc; }
  .svc-check { width:22px;height:22px;border-radius:7px;border:2px solid #cbd5e1;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s; }
  .svc-check.sel { background:#4361ee;border-color:#4361ee; }
  .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;
    display:flex;align-items:center;justify-content:center; }
  .cc-modal { background:#fff;border-radius:20px;width:560px;max-height:85vh;
    display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.18);overflow:hidden; }
  .section-head { display:flex;align-items:center;gap:10px;padding-bottom:16px;
    border-bottom:1.5px solid #f1f5f9;margin-bottom:20px; }
  .section-icon { width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .room-pill { display:flex;align-items:center;gap:8px;padding:10px 14px;background:#eef0fd;
    border-radius:11px;margin-top:8px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .cc-fadein { animation:fadeUp .25s ease; }
  .profile-card { display:flex;align-items:center;gap:12px;padding:12px 14px;background:#f0fdf4;
    border:1.5px solid #bbf7d0;border-radius:12px; }
  .empty-box { border:2px dashed #e2e8f0;border-radius:12px;padding:28px;text-align:center;
    color:#94a3b8;cursor:pointer;transition:.15s; }
  .empty-box:hover { border-color:#a5b4fc;background:#fafbff; }
`;

/* ─── Profile Search Modal ──────────────────────────────────── */
const ProfileSearchModal = ({ onSelect, onClose }) => {
  const [kw, setKw] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!kw.trim()) return;
    setLoading(true); setDone(true);
    try {
      const res = await apiProfile.searchProfiles(kw.trim(), 0, 10, null, null, null, true);
      setResults(res?.content ?? res ?? []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Tìm người đại diện</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>×</button>
          </div>
          <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
              <input ref={ref} className="cc-input" style={{ paddingLeft: 36 }}
                placeholder="Tên, số điện thoại hoặc CCCD…"
                value={kw} onChange={e => setKw(e.target.value)} />
            </div>
            <button className="cc-btn cc-btn-primary" type="submit" disabled={loading || !kw.trim()}>
              {loading ? '⏳' : 'Tìm'}
            </button>
          </form>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 24px 24px', flex: 1 }}>
          {!done && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <FaUser style={{ fontSize: 36, opacity: .25, marginBottom: 10 }} />
              <p style={{ fontSize: 13 }}>Nhập tên, SĐT hoặc số CCCD để tìm kiếm</p>
            </div>
          )}
          {done && !loading && results.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>Không tìm thấy kết quả.</p>
          )}
          {results.map(p => (
            <button key={p.profileId ?? p.id} type="button"
              style={{ width: '100%', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '12px 14px', cursor: 'pointer', marginBottom: 8, textAlign: 'left', display: 'flex',
                alignItems: 'center', gap: 12, transition: '.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#4361ee'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}
              onClick={() => onSelect(p)}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eef0fd',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaUser color="#4361ee" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{p.fullName}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 14 }}>
                  <span><FaPhone size={9} style={{ marginRight: 4 }} />{p.phone ?? 'N/A'}</span>
                  <span><FaIdCard size={9} style={{ marginRight: 4 }} />{p.identityNumber ?? 'N/A'}</span>
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

/* ─── Room Picker ─────────────────────────────────────────── */
const RoomPicker = ({ value, onSelect, error, prefilledBranch }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(prefilledBranch ? String(prefilledBranch.branchId) : "");
  const [keyword, setKeyword] = useState(value?.roomName || "");
  const [results, setResults] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounce = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoadingBranches(true);
      try {
        const res = await apiBranches.getAllBranches(1, 100, "branchId", "asc", "");
        const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
        setBranches(Array.isArray(list) ? list : []);
      } finally { setLoadingBranches(false); }
    };
    load();
  }, []);

  /* when prefilled branch changes after branches load */
  useEffect(() => {
    if (prefilledBranch) setSelectedBranchId(String(prefilledBranch.branchId));
  }, [prefilledBranch]);

  useEffect(() => {
    if (value) { setKeyword(value.roomName); }
    else { setKeyword(""); }
  }, [value]);

  useEffect(() => {
    const handler = (e) => { if (!wrapperRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRooms = async (kw, branchId) => {
    if (!branchId) { setResults([]); setOpen(false); return; }
    setLoadingRooms(true);
    try {
      const res = await apiRoom.getAllRooms(0, 100, "roomName", "asc", null, branchId, kw);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setResults(Array.isArray(list) ? list.filter(r => (r.Status || r.status || '').toUpperCase() === 'AVAILABLE') : []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoadingRooms(false); }
  };

  const handleBranchChange = (e) => {
    const id = e.target.value;
    setSelectedBranchId(id);
    onSelect(null);
    setKeyword("");
    setResults([]);
    setOpen(false);
    if (id) fetchRooms("", id);
  };

  const handleInput = (e) => {
    setKeyword(e.target.value);
    if (value) onSelect(null);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchRooms(e.target.value, selectedBranchId), 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Branch select */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <FaBuilding size={13} />
        </div>
        <select className="cc-select" style={{ paddingLeft: 34 }}
          value={selectedBranchId} onChange={handleBranchChange}
          disabled={loadingBranches}>
          <option value="">— Chọn chi nhánh —</option>
          {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
        </select>
      </div>

      {/* Room search */}
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4361ee', zIndex: 1 }}>
          {loadingRooms ? <span style={{ width: 13, height: 13, border: '2px solid #c7d0f8', borderTopColor: '#4361ee',
            borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
            : <FaDoorOpen size={13} />}
        </div>
        <input className={`cc-input ${error ? 'err' : ''}`} style={{ paddingLeft: 34 }}
          type="text" autoComplete="off"
          placeholder={selectedBranchId ? "Gõ tên phòng để tìm…" : "Chọn chi nhánh trước…"}
          value={keyword}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          disabled={!selectedBranchId} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {open && results.length > 0 && (
          <div style={{ position: 'absolute', width: '100%', background: '#fff',
            border: '1.5px solid #e2e8f0', borderRadius: 12, marginTop: 4,
            maxHeight: 220, overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)' }}>
            {results.map(room => (
              <button key={room.roomId} type="button"
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  background: 'transparent', border: 'none', padding: '10px 14px', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', transition: '.1s' }}
                onMouseEnter={e => e.currentTarget.style.background='#f4f6fb'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                onMouseDown={() => { setKeyword(room.roomName); setOpen(false); onSelect(room); }}>
                <FaDoorOpen color="#4361ee" size={12} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{room.roomName}</div>
                  {room.roomPrice && (
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {Number(room.roomPrice).toLocaleString('vi-VN')} đ/tháng
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>#{room.roomId}</span>
              </button>
            ))}
          </div>
        )}
        {open && !loadingRooms && results.length === 0 && selectedBranchId && (
          <div style={{ position: 'absolute', width: '100%', background: '#fff', border: '1.5px solid #e2e8f0',
            borderRadius: 12, marginTop: 4, padding: '14px', textAlign: 'center',
            fontSize: 13, color: '#94a3b8', zIndex: 10 }}>
            Không tìm thấy phòng trống phù hợp
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main CreateContract ──────────────────────────────────── */
const CreateContract = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* Pre-filled from RoomList navigation */
  const prefilledRoom   = location.state?.room   ?? null;
  const prefilledBranch = location.state?.branch ?? null;

  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(prefilledRoom);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const [form, setForm] = useState({ startDate: "", endDate: "", billingDay: "" });

  useEffect(() => {
    const fetchSvc = async () => {
      setLoadingServices(true);
      try {
        const res = await apiServices.getAllServices(1, 100, "serviceId", "asc", "");
        const list = res?.content ?? res?.data?.content ?? res?.data ?? res ?? [];
        setAvailableServices(Array.isArray(list) ? list : []);
      } finally { setLoadingServices(false); }
    };
    fetchSvc();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: null }));
  };

  const toggleService = svc => {
    const exists = selectedServices.find(s => s.serviceId === svc.serviceId);
    if (exists) setSelectedServices(p => p.filter(s => s.serviceId !== svc.serviceId));
    else setSelectedServices(p => [...p, { serviceId: svc.serviceId, serviceName: svc.serviceName,
        quantity: 1, unitPrice: svc.unitPrice ?? svc.price ?? 0, unit: svc.unit ?? svc.unitName }]);
  };

  const validate = () => {
    const e = {};
    if (!selectedRoom) e.roomId = "Vui lòng chọn phòng";
    if (!selectedProfile) e.representativeId = "Vui lòng chọn người đại diện";
    if (!form.startDate) e.startDate = "Chọn ngày bắt đầu";
    if (!form.endDate) e.endDate = "Chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (!form.billingDay || +form.billingDay < 1 || +form.billingDay > 28) e.billingDay = "Ngày thanh toán từ 1–28";
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    const repId = selectedProfile.profileId ?? selectedProfile.id;
    const payload = {
      roomId: selectedRoom.roomId,
      startDate: form.startDate,
      endDate: form.endDate,
      billingDay: +form.billingDay,
      representativeId: repId,
      memberIds: [repId],
      contractServices: selectedServices.map(s => ({ serviceId: s.serviceId, quantity: s.quantity, unitPrice: s.unitPrice })),
    };
    try {
      setSubmitting(true);
      await apiContract.createContract(payload);
      alert("Tạo hợp đồng thành công!");
      navigate("/contracts");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Có lỗi xảy ra!";
      if (err.response?.status === 400 && typeof err.response.data === 'object') setErrors(err.response.data);
      else alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setSubmitting(false); }
  };

  const Err = ({ field }) => errors[field]
    ? <div className="cc-err"><FaExclamationCircle size={11} />{errors[field]}</div>
    : null;

  /* ── Render ── */
  return (
    <>
      <style>{css}</style>
      <FontLink />
      {showModal && (
        <ProfileSearchModal
          onSelect={p => { setSelectedProfile(p); setErrors(e => ({ ...e, representativeId: null })); setShowModal(false); }}
          onClose={() => setShowModal(false)} />
      )}

      <div className="cc-root" style={{ padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 38, height: 38, border: '1.5px solid #e2e8f0', borderRadius: 12,
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaArrowLeft color="#64748b" size={14} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#4361ee', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaFileSignature color="#fff" size={16} />
              </div>
              <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>
                Tạo hợp đồng mới
              </h1>
            </div>
            <p style={{ margin: '3px 0 0 46px', fontSize: 12.5, color: '#94a3b8' }}>
              Điền đầy đủ thông tin để tạo hợp đồng thuê phòng
            </p>
          </div>
        </div>

        {/* Pre-filled banner */}
        {prefilledRoom && (
          <div style={{ background: '#eef0fd', border: '1.5px solid #c7d0f8', borderRadius: 14,
            padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaCheckCircle color="#4361ee" size={16} />
            <span style={{ fontSize: 13, color: '#3451d1', fontWeight: 600 }}>
              Đã chọn phòng <strong>{prefilledRoom.roomName}</strong> từ danh sách phòng
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }}>
            {/* ── Cột trái ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Thông tin phòng & hợp đồng */}
              <div className="cc-card cc-fadein">
                <div className="section-head">
                  <div className="section-icon" style={{ background: '#eef0fd' }}>
                    <FaDoorOpen color="#4361ee" size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Phòng & hợp đồng</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Chọn phòng và thiết lập thời gian</div>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="cc-label">Chi nhánh & Phòng <span style={{ color: '#ef4444' }}>*</span></label>
                  <RoomPicker
                    value={selectedRoom}
                    onSelect={r => { setSelectedRoom(r); setErrors(e => ({ ...e, roomId: null })); }}
                    error={errors.roomId}
                    prefilledBranch={prefilledBranch} />
                  {selectedRoom && (
                    <div className="room-pill" style={{ marginTop: 10 }}>
                      <FaDoorOpen color="#4361ee" size={13} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#3451d1', flex: 1 }}>
                        {selectedRoom.roomName}
                      </span>
                      <span style={{ fontSize: 11.5, color: '#94a3b8' }}>ID: {selectedRoom.roomId}</span>
                      <button type="button" onClick={() => setSelectedRoom(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0 2px' }}>
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                  <Err field="roomId" />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="cc-label">Ngày thanh toán hàng tháng <span style={{ color: '#ef4444' }}>*</span></label>
                  <input className={`cc-input ${errors.billingDay ? 'err' : ''}`}
                    type="number" name="billingDay" min={1} max={28}
                    placeholder="VD: 5 (ngày 5 hàng tháng)"
                    value={form.billingDay} onChange={handleChange} />
                  <Err field="billingDay" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="cc-label"><FaCalendarAlt style={{ marginRight: 4 }} />Bắt đầu <span style={{ color: '#ef4444' }}>*</span></label>
                    <input className={`cc-input ${errors.startDate ? 'err' : ''}`}
                      type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                    <Err field="startDate" />
                  </div>
                  <div>
                    <label className="cc-label"><FaCalendarAlt style={{ marginRight: 4 }} />Kết thúc <span style={{ color: '#ef4444' }}>*</span></label>
                    <input className={`cc-input ${errors.endDate ? 'err' : ''}`}
                      type="date" name="endDate" value={form.endDate} onChange={handleChange}
                      min={form.startDate || undefined} />
                    <Err field="endDate" />
                  </div>
                </div>
              </div>

              {/* Người đại diện */}
              <div className="cc-card cc-fadein">
                <div className="section-head">
                  <div className="section-icon" style={{ background: '#f0fdf4' }}>
                    <FaUser color="#16a34a" size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Người đại diện</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Người ký hợp đồng</div>
                  </div>
                  <button type="button" className="cc-btn-outline"
                    onClick={() => setShowModal(true)}>
                    <FaSearch size={11} /> {selectedProfile ? "Đổi" : "Tìm kiếm"}
                  </button>
                </div>

                <Err field="representativeId" />

                {!selectedProfile ? (
                  <div className="empty-box" onClick={() => setShowModal(true)}>
                    <FaUser style={{ fontSize: 28, opacity: .2, marginBottom: 10 }} />
                    <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                      Chưa chọn người đại diện
                    </p>
                    <p style={{ margin: 0, fontSize: 12 }}>Nhấn để tìm theo tên, SĐT hoặc CCCD</p>
                  </div>
                ) : (
                  <div className="profile-card">
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaUser color="#16a34a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{selectedProfile.fullName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, display: 'flex', gap: 14 }}>
                        <span><FaPhone size={9} style={{ marginRight: 4 }} />{selectedProfile.phone ?? 'N/A'}</span>
                        <span><FaIdCard size={9} style={{ marginRight: 4 }} />{selectedProfile.identityNumber ?? 'N/A'}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedProfile(null)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Cột phải: dịch vụ ── */}
            <div className="cc-card cc-fadein" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="section-head">
                <div className="section-icon" style={{ background: '#f0f9ff' }}>
                  <FaConciergeBell color="#0284c7" size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Dịch vụ đăng ký</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Tùy chọn — có thể bỏ qua</div>
                </div>
                {selectedServices.length > 0 && (
                  <span style={{ background: '#e0f2fe', color: '#0284c7', borderRadius: 20,
                    padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
                    {selectedServices.length} đã chọn
                  </span>
                )}
              </div>

              {loadingServices ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', color: '#94a3b8', gap: 10 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#0284c7',
                    borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Đang tải dịch vụ…</p>
                </div>
              ) : availableServices.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', color: '#94a3b8' }}>
                  <FaConciergeBell style={{ fontSize: 32, opacity: .2, marginBottom: 10 }} />
                  <p style={{ fontSize: 13 }}>Không có dịch vụ nào</p>
                </div>
              ) : (
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
                  maxHeight: 400, paddingRight: 2 }}>
                  {availableServices.map(svc => {
                    const sel = !!selectedServices.find(s => s.serviceId === svc.serviceId);
                    return (
                      <div key={svc.serviceId}
                        className={`svc-row ${sel ? 'sel' : ''}`}
                        onClick={() => toggleService(svc)}>
                        <div className={`svc-check ${sel ? 'sel' : ''}`}>
                          {sel && <FaCheck color="#fff" size={9} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{svc.serviceName}</div>
                          {svc.unitPrice != null && (
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                              {Number(svc.unitPrice).toLocaleString('vi-VN')} đ/{svc.unit ?? svc.unitName ?? 'tháng'}
                            </div>
                          )}
                        </div>
                        {sel && <FaCheck color="#4361ee" size={13} style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {selectedServices.length > 0 && (
                <div style={{ marginTop: 16, background: '#f0f9ff', border: '1.5px solid #bae6fd',
                  borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', margin: '0 0 10px' }}>
                    Dịch vụ đã chọn:
                  </p>
                  {selectedServices.map(s => (
                    <div key={s.serviceId}
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{s.serviceName}</span>
                      <span style={{ color: '#64748b' }}>
                        {Number(s.unitPrice).toLocaleString('vi-VN')} đ{s.unit ? `/${s.unit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1.5px solid #f1f5f9',
                display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="cc-btn cc-btn-ghost"
                  onClick={() => navigate('/contracts')} disabled={submitting}>
                  Hủy bỏ
                </button>
                <button type="submit" className="cc-btn cc-btn-primary" disabled={submitting}
                  style={{ paddingLeft: 28, paddingRight: 28 }}>
                  {submitting
                    ? <><span style={{ width: 14, height: 14, border: '2px solid #a5b4fc', borderTopColor: '#fff',
                        borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Đang tạo…</>
                    : <><FaSave size={13} /> Tạo hợp đồng</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateContract;