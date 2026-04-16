import { useState, useEffect, useCallback, useMemo } from 'react';
import RoomCard from '../components/RoomCard';
import userService from '../services/userService';

const MAX_PRICE  = 20;
const PAGE_SIZE  = 5;
const FETCH_SIZE = 100;

export default function Home() {
  const [allRooms,    setAllRooms]    = useState([]);
  const [branches,    setBranches]    = useState([]);
  const [amenities,   setAmenities]   = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error,       setError]       = useState(null);

  const [activeBranchId, setActiveBranchId] = useState(null);

  const [maxPrice,        setMaxPrice]        = useState(MAX_PRICE);
  const [activeAmenities, setActiveAmenities] = useState([]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    userService.getAllBranches(1, 50)
      .then(res => { const l = res.content; setBranches(Array.isArray(l) ? l : []); })
      .catch(() => setBranches([]));
    userService.getAllAmenities(0, 100)
      .then(res => { const l = res.content; setAmenities(Array.isArray(l) ? l : []); })
      .catch(() => setAmenities([]));
  }, []);

  const fetchRooms = useCallback(() => {
    setLoadingRooms(true);
    setError(null);

    setPage(0);
    userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', activeBranchId)
      .then(res => {
        const data = res.content;
        console.log(data);
        setAllRooms(Array.isArray(data) ? data : []);

      })
      .catch(() => setError('Không thể tải danh sách phòng. Vui lòng thử lại.'))
      .finally(() => setLoadingRooms(false));
  }, [activeBranchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleBranchChange = (branchId) => setActiveBranchId(branchId);

  const toggleAmenity = (id) =>
    setActiveAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  // Chỉ lấy phòng AVAILABLE
  const filteredRooms = useMemo(() => allRooms.filter(room => {
    const status = (room.status ?? room.Status ?? '').toUpperCase();
    if (status !== 'AVAILABLE') return false;
    if ((room.price ?? 0) / 1_000_000 > maxPrice) return false;
    if (!activeAmenities.every(id => room.amenities?.some(a => (a.amenityId ?? a.id) === id))) return false;
    return true;
  }), [allRooms, maxPrice, activeAmenities]);

  const totalPages  = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRooms   = filteredRooms.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const sliderPercent = (maxPrice / MAX_PRICE) * 100;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* Branch filter bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 24,
        boxShadow: '0 2px 16px rgba(29,108,240,0.08)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginRight: 4 }}>📍 Chi nhánh:</span>
        <BranchChip label="Tất cả" active={activeBranchId === null} onClick={() => handleBranchChange(null)} />
        {branches.map(b => (
          <BranchChip key={b.branchId} label={b.branchName}
            active={activeBranchId === b.branchId}
            onClick={() => handleBranchChange(b.branchId)} />
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 24, alignItems: 'start' }}>

        {/* Left: room list */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2236', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            Danh sách phòng trọ
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', background: '#f1f4f9', padding: '2px 10px', borderRadius: 20 }}>
              {filteredRooms.length} phòng
            </span>
          </div>

          {loadingRooms && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 210, borderRadius: 14, background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            </div>
          )}

          {!loadingRooms && error && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <p style={{ color: '#dc2626', fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{error}</p>
              <button onClick={fetchRooms} style={solidBtn}>Thử lại</button>
            </div>
          )}

          {!loadingRooms && !error && filteredRooms.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏚️</div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>Không tìm thấy phòng phù hợp. Hãy thử điều chỉnh bộ lọc.</p>
            </div>
          )}

          {!loadingRooms && !error && pageRooms.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pageRooms.map(room => <RoomCard key={room.roomId} room={room} />)}
            </div>
          )}

          {/* Pagination — tính trên filteredRooms */}
          {!loadingRooms && !error && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 28 }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                style={{ ...pageBtn, opacity: currentPage === 0 ? 0.4 : 1 }}>← Trước</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{
                  ...pageBtn,
                  background: currentPage === i ? '#1d6cf0' : '#fff',
                  color: currentPage === i ? '#fff' : '#64748b',
                  borderColor: currentPage === i ? '#1d6cf0' : '#e2e8f0',
                  fontWeight: currentPage === i ? 700 : 500,
                }}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                style={{ ...pageBtn, opacity: currentPage === totalPages - 1 ? 0.4 : 1 }}>Tiếp →</button>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 100 }}>

          {/* Price slider */}
          <div style={filterCard}>
            <div style={filterTitle}>💰 Lọc theo giá</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              <span>0đ</span>
              <span style={{ fontWeight: 700, color: '#1d6cf0' }}>
                {maxPrice >= MAX_PRICE ? `${MAX_PRICE}tr+` : `≤ ${maxPrice} triệu`}
              </span>
            </div>
            <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: '#e2e8f0' }} />
              <div style={{ position: 'absolute', left: 0, width: `${sliderPercent}%`, height: 6, borderRadius: 3, background: '#1d6cf0' }} />
              <input type="range" min={1} max={MAX_PRICE} step={1} value={maxPrice}
                onChange={e => { setMaxPrice(Number(e.target.value)); setPage(0); }}
                style={{ position: 'absolute', width: '100%', opacity: 0, height: 20, cursor: 'pointer', zIndex: 2, margin: 0 }} />
              <div style={{
                position: 'absolute', left: `calc(${sliderPercent}% - 10px)`,
                width: 20, height: 20, borderRadius: '50%',
                background: '#1d6cf0', border: '3px solid #fff',
                boxShadow: '0 2px 6px rgba(29,108,240,0.35)', pointerEvents: 'none',
              }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[2, 4, 6, 8, 10, MAX_PRICE].map(val => (
                <button key={val} onClick={() => { setMaxPrice(val); setPage(0); }} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12,
                  border: `1.5px solid ${maxPrice === val ? '#1d6cf0' : '#e2e8f0'}`,
                  background: maxPrice === val ? '#e8f0fe' : '#fff',
                  color: maxPrice === val ? '#1d6cf0' : '#64748b',
                  fontFamily: 'inherit', fontWeight: maxPrice === val ? 600 : 500, cursor: 'pointer',
                }}>
                  {val >= MAX_PRICE ? `${MAX_PRICE}tr+` : `≤${val}tr`}
                </button>
              ))}
            </div>
            {maxPrice < MAX_PRICE && (
              <button onClick={() => { setMaxPrice(MAX_PRICE); setPage(0); }} style={{ ...clearBtn, marginTop: 12 }}>✕ Bỏ lọc giá</button>
            )}
          </div>

          {/* Amenities filter */}
          <div style={filterCard}>
            <div style={filterTitle}>✨ Lọc theo tiện ích</div>
            {amenities.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Đang tải...</p>
            ) : amenities.map((a, i) => {
              const id = a.amenityId ?? a.id;
              const checked = activeAmenities.includes(id);
              const icon = Object.entries({
                wifi: '📶', 'máy lạnh': '❄️', 'điều hòa': '❄️',
                'nóng lạnh': '🚿', 'wc': '🚽', 'toilet': '🚽',
                bếp: '🍳', 'gác lửng': '🪜', 'thang máy': '🛗',
                'bãi xe': '🅿️', 'chỗ để xe': '🅿️', 'bảo vệ': '💂',
              }).find(([k]) => a.amenityName?.toLowerCase().includes(k))?.[1] ?? '✅';
              return (
                <div key={id} onClick={() => { toggleAmenity(id); setPage(0); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
                  borderBottom: i < amenities.length - 1 ? '1px solid #e2e8f0' : 'none',
                  cursor: 'pointer', fontSize: 14,
                  color: checked ? '#1a2236' : '#64748b', fontWeight: 500, userSelect: 'none',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${checked ? '#1d6cf0' : '#e2e8f0'}`,
                    background: checked ? '#1d6cf0' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', fontWeight: 700,
                  }}>
                    {checked && '✓'}
                  </div>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <span>{a.amenityName}</span>
                </div>
              );
            })}
            {activeAmenities.length > 0 && (
              <button onClick={() => { setActiveAmenities([]); setPage(0); }} style={{ ...clearBtn, marginTop: 14 }}>
                ✕ Bỏ lọc tiện ích
              </button>
            )}
          </div>

          {/* Contact card */}
          <div style={{ background: 'linear-gradient(135deg, #1d6cf0 0%, #1558cc 100%)', borderRadius: 14, padding: 20, color: '#fff' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>📞 Liên hệ tư vấn</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['📱','0901 234 567'],['💬','Zalo: 0901 234 567'],['🕐','7:00 – 22:00 mỗi ngày']].map(([ic, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>{ic}</span> {text}
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', marginTop: 14, padding: 10,
              background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Liên hệ ngay</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const filterCard = { background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(29,108,240,0.08)', padding: 20 };
const filterTitle = { fontSize: 15, fontWeight: 700, color: '#1a2236', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 };
const clearBtn   = { width: '100%', padding: 9, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'none', color: '#64748b', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const pageBtn    = { padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontFamily: 'inherit', cursor: 'pointer' };
const solidBtn   = { background: '#1d6cf0', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' };

function BranchChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 50, fontSize: 14,
      fontWeight: active ? 600 : 500, cursor: 'pointer',
      border: `1.5px solid ${active ? '#1d6cf0' : '#e2e8f0'}`,
      background: active ? '#1d6cf0' : '#fff',
      color: active ? '#fff' : '#64748b',
      fontFamily: 'inherit', transition: 'all 0.18s',
    }}>{label}</button>
  );
}