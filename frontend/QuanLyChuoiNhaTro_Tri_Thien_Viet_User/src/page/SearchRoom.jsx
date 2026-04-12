import { useState, useEffect, useCallback, useMemo } from 'react';
import RoomCard from '../components/RoomCard';
import userService from '../services/userService';

const MAX_PRICE  = 20;
const PAGE_SIZE  = 5;   // số phòng hiển thị mỗi trang (client-side)
const FETCH_SIZE = 100; // fetch nhiều lên để filter client-side không bị lệch trang

const isRoomVisible = (room) => {
  const s = (room.status ?? room.Status ?? '').toUpperCase();
  if (s === 'MAINTENANCE' || s === 'DEPOSITED') return false;
  if (s === 'OCCUPIED') return (room.currentPeople ?? 0) < (room.maxPeople ?? 1);
  return true;
};

const getRoomTag = (room) => {
  const s = (room.status ?? room.Status ?? '').toUpperCase();
  if (s === 'AVAILABLE') return { label: 'Còn phòng', bg: '#16a34a' };
  if (s === 'OCCUPIED')  return { label: 'Ở ghép',    bg: '#f59e0b' };
  return null;
};

export default function SearchRoom() {
  const [allRooms,    setAllRooms]    = useState([]); // toàn bộ phòng fetch về
  const [branches,    setBranches]    = useState([]);
  const [amenities,   setAmenities]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // Server-side filter (gọi lại API)
  const [activeBranchId, setActiveBranchId] = useState(null);

  // Client-side filters
  const [maxPrice,        setMaxPrice]        = useState(MAX_PRICE);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [searchText,      setSearchText]      = useState('');
  const [statusFilter,    setStatusFilter]    = useState('ALL');

  // Client-side pagination
  const [page, setPage] = useState(0);

  // Fetch branches & amenities
  useEffect(() => {
    userService.getAllBranches(1, 50)
      .then(res => { const l = res.content; setBranches(Array.isArray(l) ? l : []); })
      .catch(() => setBranches([]));
    userService.getAllAmenities(0, 100)
      .then(res => { const l = res.content; setAmenities(Array.isArray(l) ? l : []); })
      .catch(() => setAmenities([]));
  }, []);


  const fetchRooms = useCallback(() => {
    setLoading(true);
    setError(null);
    setPage(0); // reset page về 0 khi fetch mới
    userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', activeBranchId)
      .then(res => {
        const data = res.content;
        setAllRooms(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Không thể tải danh sách phòng.'))
      .finally(() => setLoading(false));
  }, [activeBranchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Client-side filter → đây là source of truth cho pagination
  const filtered = useMemo(() => allRooms.filter(room => {
    if (!isRoomVisible(room)) return false;
    if ((room.price ?? 0) / 1_000_000 > maxPrice) return false;
    if (!activeAmenities.every(id => room.amenities?.some(a => (a.amenityId ?? a.id) === id))) return false;
    if (searchText && !room.roomName?.toLowerCase().includes(searchText.toLowerCase()) && !room.description?.toLowerCase().includes(searchText.toLowerCase())) return false;
    const tag = getRoomTag(room);
    if (statusFilter === 'AVAILABLE' && tag?.label !== 'Còn phòng') return false;
    if (statusFilter === 'OCCUPIED'  && tag?.label !== 'Ở ghép')    return false;
    return true;
  }), [allRooms, maxPrice, activeAmenities, searchText, statusFilter]);

  // Pagination tính trên filtered
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1); // tránh page vượt quá
  const pageRooms   = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Reset page về 0 khi client filter thay đổi
  const setFilter = (fn) => { fn(); setPage(0); };

  const handleBranch   = (id) => { setActiveBranchId(id); }; // fetchRooms tự reset page
  const toggleAmenity  = (id) => setFilter(() => setActiveAmenities(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  const resetAll       = () => { setActiveBranchId(null); setMaxPrice(MAX_PRICE); setActiveAmenities([]); setSearchText(''); setStatusFilter('ALL'); };

  const hasFilter  = activeBranchId !== null || maxPrice < MAX_PRICE || activeAmenities.length > 0 || searchText || statusFilter !== 'ALL';
  const sliderPct  = (maxPrice / MAX_PRICE) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
        .sr-wrap { font-family: 'Be Vietnam Pro', sans-serif; max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; }
        .sr-search-bar { background: #fff; border-radius: 14px; display: flex; align-items: center; gap: 12px; padding: 6px 6px 6px 18px; box-shadow: 0 2px 20px rgba(29,108,240,0.10); border: 1.5px solid #e8f0fe; }
        .sr-search-bar input { border: none; outline: none; font-family: inherit; font-size: 15px; color: #1a2236; flex: 1; background: none; }
        .sr-search-bar input::placeholder { color: #94a3b8; }
        .sr-btn { background: #1d6cf0; color: #fff; border: none; border-radius: 10px; padding: 10px 22px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .2s; }
        .sr-btn:hover { background: #1558cc; }
        .sr-chip { padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-family: inherit; transition: all .18s; }
        .sr-chip.active { background: #1d6cf0; color: #fff; border-color: #1d6cf0; font-weight: 700; }
        .sr-chip.green.active { background: #16a34a; border-color: #16a34a; }
        .sr-chip.amber.active { background: #f59e0b; border-color: #f59e0b; }
        .sr-card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 2px 16px rgba(29,108,240,0.07); }
        .sr-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 14px; }
        .sr-amenity-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f4f9; cursor: pointer; font-size: 14px; color: #475569; font-weight: 500; user-select: none; }
        .sr-amenity-row:last-child { border-bottom: none; }
        .sr-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; font-weight: 700; flex-shrink: 0; }
        .sr-checkbox.on { background: #1d6cf0; border-color: #1d6cf0; }
        .sr-pg { padding: 8px 13px; border-radius: 8px; font-size: 13px; font-weight: 500; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-family: inherit; cursor: pointer; transition: all .15s; }
        .sr-pg.active { background: #1d6cf0; color: #fff; border-color: #1d6cf0; font-weight: 700; }
        .sr-pg:disabled { opacity: .35; cursor: not-allowed; }
        .sr-skeleton { border-radius: 14px; background: linear-gradient(90deg,#f1f4f9 25%,#e8edf5 50%,#f1f4f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
      `}</style>

      <div className="sr-wrap">

        {/* Header + search */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2236', margin: 0 }}>Tìm phòng trọ</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Hiển thị phòng còn trống & phòng ghép còn chỗ</p>
            </div>
            {hasFilter && (
              <button onClick={resetAll} style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', color: '#64748b', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="sr-search-bar" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 17, color: '#94a3b8' }}>🔍</span>
            <input type="text" placeholder="Tìm theo tên phòng, mô tả..."
              value={searchText}
              onChange={e => setFilter(() => setSearchText(e.target.value))} />
            {searchText && <button onClick={() => setFilter(() => setSearchText(''))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, padding: '0 4px' }}>✕</button>}
            <button className="sr-btn">Tìm kiếm</button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`sr-chip ${statusFilter === 'ALL' ? 'active' : ''}`}       onClick={() => setFilter(() => setStatusFilter('ALL'))}>Tất cả</button>
            <button className={`sr-chip green ${statusFilter === 'AVAILABLE' ? 'active' : ''}`} onClick={() => setFilter(() => setStatusFilter('AVAILABLE'))}>🟢 Còn phòng</button>
            <button className={`sr-chip amber ${statusFilter === 'OCCUPIED' ? 'active' : ''}`}  onClick={() => setFilter(() => setStatusFilter('OCCUPIED'))}>🟡 Ở ghép</button>
          </div>
        </div>

        {/* Branch */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', marginBottom: 24, boxShadow: '0 2px 12px rgba(29,108,240,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginRight: 4 }}>Chi nhánh</span>
          <button className={`sr-chip ${activeBranchId === null ? 'active' : ''}`} onClick={() => handleBranch(null)}>Tất cả</button>
          {branches.map(b => (
            <button key={b.branchId} className={`sr-chip ${activeBranchId === b.branchId ? 'active' : ''}`} onClick={() => handleBranch(b.branchId)}>
              {b.branchName}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 268px', gap: 24, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2236', display: 'flex', alignItems: 'center', gap: 8 }}>
                Kết quả
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1d6cf0', background: '#e8f0fe', padding: '2px 10px', borderRadius: 20 }}>
                  {filtered.length} phòng
                </span>
              </div>
              {totalPages > 1 && (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Trang {currentPage + 1} / {totalPages}</span>
              )}
            </div>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3].map(i => <div key={i} className="sr-skeleton" style={{ height: 200 }} />)}
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(29,108,240,0.07)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#dc2626', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{error}</p>
                <button className="sr-btn" onClick={fetchRooms}>Thử lại</button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(29,108,240,0.07)' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🏚️</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a2236', marginBottom: 6 }}>Không tìm thấy phòng phù hợp</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="sr-btn" onClick={resetAll}>Xóa bộ lọc</button>
              </div>
            )}

            {!loading && !error && pageRooms.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pageRooms.map(room => <RoomCard key={room.roomId} room={room} tag={getRoomTag(room)} />)}
              </div>
            )}

            {/* Pagination — tính trên filtered, không phải server */}
            {!loading && !error && totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 28 }}>
                <button className="sr-pg" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>← Trước</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`sr-pg ${currentPage === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                <button className="sr-pg" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>Tiếp →</button>
              </div>
            )}
          </div>

          {/* RIGHT sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 100 }}>

            {/* Price */}
            <div className="sr-card">
              <div className="sr-label">Giá thuê</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                <span style={{ color: '#94a3b8' }}>0đ</span>
                <span style={{ fontWeight: 700, color: '#1d6cf0' }}>{maxPrice >= MAX_PRICE ? `${MAX_PRICE}tr+` : `≤ ${maxPrice} triệu`}</span>
              </div>
              <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ position: 'absolute', inset: '7px 0', borderRadius: 3, background: '#f1f4f9' }} />
                <div style={{ position: 'absolute', left: 0, width: `${sliderPct}%`, top: 7, bottom: 7, borderRadius: 3, background: '#1d6cf0' }} />
                <input type="range" min={1} max={MAX_PRICE} step={1} value={maxPrice}
                  onChange={e => setFilter(() => setMaxPrice(Number(e.target.value)))}
                  style={{ position: 'absolute', width: '100%', opacity: 0, height: 20, cursor: 'pointer', zIndex: 2, margin: 0 }} />
                <div style={{ position: 'absolute', left: `calc(${sliderPct}% - 10px)`, width: 20, height: 20, borderRadius: '50%', background: '#1d6cf0', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(29,108,240,0.35)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[2, 4, 6, 8, 10, MAX_PRICE].map(v => (
                  <button key={v} onClick={() => setFilter(() => setMaxPrice(v))} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${maxPrice === v ? '#1d6cf0' : '#e2e8f0'}`,
                    background: maxPrice === v ? '#e8f0fe' : '#fff',
                    color: maxPrice === v ? '#1d6cf0' : '#64748b',
                    fontWeight: maxPrice === v ? 700 : 500,
                  }}>
                    {v >= MAX_PRICE ? `${MAX_PRICE}tr+` : `≤${v}tr`}
                  </button>
                ))}
              </div>
              {maxPrice < MAX_PRICE && (
                <button onClick={() => setFilter(() => setMaxPrice(MAX_PRICE))} style={{ width: '100%', marginTop: 12, padding: 8, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'none', color: '#94a3b8', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>
                  ✕ Bỏ lọc giá
                </button>
              )}
            </div>

            {/* Amenities */}
            <div className="sr-card">
              <div className="sr-label">Tiện ích</div>
              {amenities.length === 0
                ? <p style={{ fontSize: 13, color: '#94a3b8' }}>Đang tải...</p>
                : amenities.map(a => {
                  const id = a.amenityId ?? a.id;
                  const on = activeAmenities.includes(id);
                  const icon = Object.entries({ wifi:'📶','máy lạnh':'❄️','điều hòa':'❄️','nóng lạnh':'🚿','wc':'🚽',toilet:'🚽',bếp:'🍳','gác lửng':'🪜','thang máy':'🛗','bãi xe':'🅿️','bảo vệ':'💂' })
                    .find(([k]) => a.amenityName?.toLowerCase().includes(k))?.[1] ?? '✅';
                  return (
                    <div key={id} className="sr-amenity-row" onClick={() => toggleAmenity(id)}>
                      <div className={`sr-checkbox ${on ? 'on' : ''}`}>{on && '✓'}</div>
                      <span>{icon}</span>
                      <span>{a.amenityName}</span>
                    </div>
                  );
                })
              }
              {activeAmenities.length > 0 && (
                <button onClick={() => setFilter(() => setActiveAmenities([]))} style={{ width: '100%', marginTop: 12, padding: 8, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'none', color: '#94a3b8', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>
                  ✕ Bỏ lọc tiện ích
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="sr-card">
              <div className="sr-label">Chú thích</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { color: '#16a34a', title: 'Còn phòng', sub: 'Chưa có ai thuê' },
                  { color: '#f59e0b', title: 'Ở ghép', sub: 'Còn chỗ, đang có người thuê' },
                ].map(({ color, title, sub }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2236' }}>{title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 10, borderTop: '1px solid #f1f4f9', fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
                  Phòng bảo trì và đã đặt cọc không hiển thị ở đây.
                </div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: 'linear-gradient(135deg,#1d6cf0,#1558cc)', borderRadius: 14, padding: 20, color: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, opacity: .9 }}>📞 Tư vấn miễn phí</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['📱','0901 234 567'],['💬','Zalo: 0901 234 567'],['🕐','7:00 – 22:00 mỗi ngày']].map(([ic,tx]) => (
                  <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><span>{ic}</span>{tx}</div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 14, padding: 10, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Liên hệ ngay
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}