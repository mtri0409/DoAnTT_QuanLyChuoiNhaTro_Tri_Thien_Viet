import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiRoom from '../../../QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/src/api/apiRoom';
import apiFloor from '../../../QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/src/api/apiFloor';
import apiBranches from '../../../QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/src/api/apiBranches';
import RoomGridCard from '../components/RoomGridCard';

const CONTACT_PHONE = '0385018194';
const ZALO_PHONE    = '0385018194';

const amenityIconMap = {
  wifi: '📶', 'wi-fi': '📶', internet: '📶',
  'nóng lạnh': '🚿', 'máy nước nóng': '🚿', 'nước nóng': '🚿',
  'máy lạnh': '❄️', 'điều hòa': '❄️',
  'wc riêng': '🚽', 'nhà vệ sinh': '🚽', toilet: '🚽',
  'bếp riêng': '🍳', 'nhà bếp': '🍳', bếp: '🍳',
  'gác lửng': '🪜', gác: '🪜',
  'thang máy': '🛗',
  'bãi xe': '🅿️', 'chỗ để xe': '🅿️', 'bãi xe máy': '🅿️',
  'bảo vệ': '💂', 'an ninh': '💂',
  'tủ lạnh': '🧊', camera: '📷', 'ban công': '🌿',
};

const getIcon = (name = '') => {
  const k = name.toLowerCase();
  return Object.entries(amenityIconMap).find(([key]) => k.includes(key))?.[1] ?? '✅';
};

const statusMap = {
  available:   { label: 'Còn phòng', bg: '#16a34a', bgLight: '#dcfce7', text: '#15803d' },
  occupied:    { label: 'Đã thuê',   bg: '#dc2626', bgLight: '#fee2e2', text: '#dc2626' },
  maintenance: { label: 'Bảo trì',   bg: '#f59e0b', bgLight: '#fef3c7', text: '#b45309' },
};

const fmt = (p) => (p ? Number(p).toLocaleString('vi-VN') + 'đ' : '—');

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const [room,    setRoom]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [copied,    setCopied]    = useState(false);

  const [relatedRooms,    setRelatedRooms]    = useState([]);
  const [loadingRelated,  setLoadingRelated]  = useState(false);

  // ── Branch / Floor info ──
  const [branchName,  setBranchName]  = useState('');
  const [floorNumber, setFloorNumber] = useState('');

  const abortRef = useRef(false);

  // ── Fetch room ──
  useEffect(() => {
    if (!roomId) { setLoading(false); return; }
    abortRef.current = false;

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await apiRoom.getRoomById(roomId);
        if (abortRef.current) return;

        const raw  = res.data || res;
        let   data = null;

        if      (raw?.roomId)         data = raw;
        else if (raw?.data?.roomId)   data = raw.data;
        else if (raw?.result?.roomId) data = raw.result;
        else                          data = raw;

        if (!data?.roomId) {
          setError('Dữ liệu phòng không hợp lệ.');
          setRoom(null);
        } else {
          setRoom(data);
          setError(null);
          setActiveImg(0);
        }
      } catch {
        if (!abortRef.current) {
          setError('Không thể tải thông tin phòng.');
          setRoom(null);
        }
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    };

    fetchRoom();
    return () => { abortRef.current = true; };
  }, [roomId]);

  useEffect(() => {
    if (!room?.floorId) return;

    let cancelled = false;

    const fetchMeta = async () => {
      try {
        setLoadingRelated(true);

        const [floorRes, branchRes] = await Promise.all([
          apiFloor.getAllFloors(),
          apiBranches.getAllBranches(1, 200),
        ]);

        if (cancelled) return;

        const floorRaw = floorRes.data || floorRes;
        const allFloors = Array.isArray(floorRaw)
          ? floorRaw
          : floorRaw?.content ?? floorRaw?.data ?? [];

        const branchRaw  = branchRes.data || branchRes;
        const allBranches = branchRaw?.content ?? branchRaw?.data ?? (Array.isArray(branchRaw) ? branchRaw : []);

        const currentFloor = allFloors.find(f => f.floorId === room.floorId);
        if (!currentFloor) { setLoadingRelated(false); return; }

        setFloorNumber(currentFloor.floorNumber ?? '');

        const targetBranchId = currentFloor.branchId;
        const foundBranch = allBranches.find(
          b => b.branchId === targetBranchId || String(b.branchId) === String(targetBranchId)
        );
        const resolvedBranchName =
          foundBranch?.branchName ??
          currentFloor.branchName ??
          currentFloor.branch?.branchName ??
          `Chi nhánh #${targetBranchId}`;

        setBranchName(resolvedBranchName);

        const floorIdsInSameBranch = allFloors
          .filter(f => f.branchId === targetBranchId || String(f.branchId) === String(targetBranchId))
          .map(f => f.floorId);

        const roomRes  = await apiRoom.getAllRooms(0, 50);
        if (cancelled) return;

        const roomRaw  = roomRes.data || roomRes;
        const allRooms = roomRaw?.content ?? roomRaw?.data?.content ??
          (Array.isArray(roomRaw) ? roomRaw : []);

        const related = allRooms.filter(r =>
          r.roomId !== room.roomId &&
          floorIdsInSameBranch.includes(r.floorId)
        );

        setRelatedRooms(related.slice(0, 3));
      } catch (err) {
        console.error('Fetch meta error:', err);
        if (!cancelled) { setBranchName(''); setRelatedRooms([]); }
      } finally {
        if (!cancelled) setLoadingRelated(false);
      }
    };

    fetchMeta();
    return () => { cancelled = true; };
  }, [room?.floorId, room?.roomId]);

  const getImages = () => {
    if (!room?.roomMedia?.length) return ['http://localhost:8080/images/default.jpg'];
    const urls = room.roomMedia
      .filter(m => { if (!m.mediaType) return true; const t = m.mediaType.toLowerCase(); return t === 'image' || t.startsWith('image/'); })
      .map(m => {
        const url = m.url ?? m.mediaUrl;
        if (!url) return null;
        if (url.includes('storage.troapp.vn')) return null;
        if (url.startsWith('/images')) return `http://localhost:8080${url}`;
        return url;
      })
      .filter(Boolean);
    return urls.length ? urls : ['http://localhost:8080/images/default.jpg'];
  };

  const images = getImages();

  const copyPhone = () => {
    navigator.clipboard.writeText(CONTACT_PHONE.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading skeleton ──
  if (loading) return (
    <div style={styles.pageWrap}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ ...styles.skeleton, height: 56, width: 200, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
          <div>
            <div style={{ ...styles.skeleton, height: 440, borderRadius: 20 }} />
            <div style={{ ...styles.skeleton, height: 120, borderRadius: 16, marginTop: 20 }} />
          </div>
          <div>
            <div style={{ ...styles.skeleton, height: 320, borderRadius: 20 }} />
            <div style={{ ...styles.skeleton, height: 200, borderRadius: 16, marginTop: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ ...styles.pageWrap, textAlign: 'center', paddingTop: 100 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
      <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: 8 }}>Không tìm thấy phòng</h2>
      <p style={{ color: '#64748b', marginBottom: 28 }}>{error}</p>
      <button onClick={() => navigate(-1)} style={styles.btnPrimary}>← Quay lại</button>
    </div>
  );

  if (!room) return null;

  const statusKey    = (room.Status ?? room.status ?? '').toLowerCase();
  const statusInfo   = statusMap[statusKey] ?? null;
  const maxPeople    = room.maxPeople ?? room.maxOccupants ?? null;
  const currentPeople = room.currentPeople ?? room.currentOccupants ?? null;
  const roomArea     = room.area ?? room.roomArea ?? null;
  const roomPrice    = room.price ?? room.roomPrice ?? null;
  const roomDeposit  = room.depositAmount ?? room.deposit ?? null;
  const roomDesc     = room.description ?? '';
  const roomName     = room.roomName ?? room.name ?? roomId;
  const amenities    = room.amenities ?? [];

  return (
    <div style={styles.pageWrap}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* ── Breadcrumb / Back ── */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f0f4ff'; }}
          >←</button>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {branchName && <><span style={{ color: '#1d4ed8', fontWeight: 600 }}>{branchName}</span> › </>}
              {floorNumber && <><span style={{ color: '#475569' }}>Tầng {floorNumber}</span> › </>}
              <span style={{ color: '#475569' }}>Chi tiết</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
              Phòng {roomName}
            </h1>
          </div>
          {statusInfo && (
            <span style={{
              marginLeft: 'auto', background: statusInfo.bgLight,
              color: statusInfo.text, padding: '6px 16px',
              borderRadius: 20, fontSize: 13, fontWeight: 700,
            }}>
              ● {statusInfo.label}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Gallery */}
            <div style={styles.card}>
              <div style={{ position: 'relative', height: 440, borderRadius: 16, overflow: 'hidden', background: '#e2e8f0' }}>
                <img
                  key={images[activeImg]}
                  src={images[activeImg]}
                  alt={`Phòng ${roomName}`}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
                />
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                }}>
                  📷 {activeImg + 1}/{images.length}
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)} style={styles.galleryArrow('left')}>‹</button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)} style={styles.galleryArrow('right')}>›</button>
                  </>
                )}
                {images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {images.map((_, i) => (
                      <div key={i} onClick={() => setActiveImg(i)} style={{
                        width: i === activeImg ? 22 : 8, height: 8, borderRadius: 4,
                        background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.45)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`Thumb ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60'; }}
                      style={{
                        width: 76, height: 56, objectFit: 'cover', borderRadius: 10,
                        flexShrink: 0, cursor: 'pointer',
                        border: `2.5px solid ${i === activeImg ? '#3b82f6' : 'transparent'}`,
                        opacity: i === activeImg ? 1 : 0.55, transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Giá + Tiền cọc ── */}
            <div style={{
              ...styles.card,
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0f4ff 100%)',
              border: '1px solid #bfdbfe',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
                    GIÁ THUÊ HÀNG THÁNG
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#1d4ed8' }}>
                    {fmt(roomPrice)}
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#64748b' }}> /tháng</span>
                  </div>
                </div>

                {/* ── THÊM: Hiển thị tiền cọc nổi bật hơn ── */}
                {roomDeposit && (
                  <div style={{
                    background: '#fff', borderRadius: 14, padding: '14px 20px',
                    border: '1.5px solid #fde68a',
                    // eslint-disable-next-line no-dupe-keys
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)',
                    textAlign: 'center', minWidth: 140,
                  }}>
                    <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 4 }}>
                      💰 TIỀN CỌC
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>
                      {fmt(roomDeposit)}
                    </div>
                    <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>
                      Hoàn lại khi hết hợp đồng
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {branchName  && <StatCard emoji="🏢" label="Chi nhánh"  value={branchName} />}
              {floorNumber && <StatCard emoji="🏗️" label="Tầng"       value={`Tầng ${floorNumber}`} />}
              {roomArea    && <StatCard emoji="📐" label="Diện tích"   value={`${roomArea} m²`} />}
              {maxPeople    != null && <StatCard emoji="👥" label="Tối đa"    value={`${maxPeople} người`} />}
              {currentPeople != null && <StatCard emoji="🧑" label="Hiện tại" value={`${currentPeople} người`} />}
            </div>

            {/* Description */}
            {roomDesc && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📝</span>
                  <span style={styles.sectionTitle}>Mô tả</span>
                </div>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>
                  {roomDesc}
                </p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>✨</span>
                  <span style={styles.sectionTitle}>Tiện ích phòng</span>
                  <span style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {amenities.length} tiện ích
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {amenities.map((a, idx) => {
                    const colors = [
                      { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
                      { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
                      { bg: '#fefce8', border: '#fde68a', text: '#92400e' },
                      { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
                      { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' },
                      { bg: '#f0fdfa', border: '#99f6e4', text: '#134e4a' },
                    ];
                    const c = colors[idx % colors.length];
                    return (
                      <div key={a.amenityId ?? a.amenityName}
                        style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, transition: 'transform 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <span style={{ fontSize: 20 }}>{getIcon(a.amenityName)}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{a.amenityName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Contact card */}
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              background: 'linear-gradient(145deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
              padding: '28px 24px',
            }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 2 }}>Liên hệ đặt phòng</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 24 }}>Phản hồi nhanh trong ngày</div>

              <div style={{ marginBottom: 18 }}>
                <div style={styles.contactLabel}>SỐ ĐIỆN THOẠI</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)' }}>
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                    style={{ color: '#fff', fontWeight: 700, fontSize: 18, flex: 1, textDecoration: 'none', letterSpacing: '0.5px' }}>
                    📞 {CONTACT_PHONE}
                  </a>
                  <button onClick={copyPhone} style={{
                    background: copied ? 'rgba(134,239,172,0.3)' : 'rgba(255,255,255,0.18)',
                    border: 'none', borderRadius: 8, padding: '6px 12px',
                    cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                  }}>
                    {copied ? '✓ Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <div style={styles.contactLabel}>NHẮN TIN ZALO</div>
                <a href={`https://zalo.me/${ZALO_PHONE}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#0068ff', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  💬 Chat Zalo ngay
                </a>
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' }}>
                  Hỗ trợ 7:00 – 22:00 • T2 – CN
                </div>
              </div>
            </div>

            {/* Quick summary */}
            <div style={{ ...styles.card, padding: '20px 22px' }}>
              <div style={{ ...styles.sectionHeader, marginBottom: 14 }}>
                <span style={styles.sectionIcon}>📋</span>
                <span style={styles.sectionTitle}>Tóm tắt</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {roomName      && <SummaryRow label="Tên phòng" value={roomName} />}
                {branchName    && <SummaryRow label="Chi nhánh" value={branchName} />}
                {floorNumber   && <SummaryRow label="Tầng"      value={`Tầng ${floorNumber}`} />}
                {roomArea      && <SummaryRow label="Diện tích" value={`${roomArea} m²`} />}
                {maxPeople    != null && <SummaryRow label="Tối đa"    value={`${maxPeople} người`} />}
                {currentPeople != null && <SummaryRow label="Hiện tại" value={`${currentPeople} người`} />}
                <SummaryRow label="Giá thuê" value={fmt(roomPrice)} highlight />
                {/* ── THÊM: tiền cọc trong tóm tắt ── */}
                {roomDeposit && <SummaryRow label="💰 Tiền cọc" value={fmt(roomDeposit)} depositHighlight />}
                {statusInfo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Trạng thái</span>
                    <span style={{ background: statusInfo.bg, color: '#fff', borderRadius: 6, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Why us */}
            <div style={{ ...styles.card, background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', border: '1px solid #fde68a', padding: '20px 22px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 12 }}>💡 Tại sao chọn chúng tôi?</div>
              {['Giá cả minh bạch', 'Hỗ trợ 24/7', 'Không phí trung gian', 'Xem phòng miễn phí'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: '#78350f' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fbbf24', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related rooms ── */}
        {loadingRelated && (
          <div style={{ marginTop: 48, marginBottom: 40 }}>
            <div style={{ ...styles.skeleton, height: 28, width: 300, marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ ...styles.skeleton, height: 340, borderRadius: 18 }} />)}
            </div>
          </div>
        )}

        {!loadingRelated && relatedRooms.length > 0 && (
          <div style={{ marginTop: 48, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>🏠 Phòng cùng chi nhánh</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
                  {relatedRooms.length} phòng khác tại <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{branchName}</span>
                </p>
              </div>
              <button onClick={() => navigate(-1)} style={{ background: '#f0f4ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f0f4ff'; }}
              >
                Xem tất cả →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {relatedRooms.map(r => <RoomGridCard key={r.roomId} room={r} />)}
            </div>
          </div>
        )}

        {!loadingRelated && relatedRooms.length === 0 && room && (
          <div style={{ marginTop: 48, marginBottom: 40, textAlign: 'center', background: '#fff', borderRadius: 18, padding: '40px 20px', boxShadow: '0 1px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Không có phòng nào khác cùng chi nhánh</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Hãy xem thêm các phòng ở chi nhánh khác</div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ──
function StatCard({ emoji, label, value }) {
  return (
    <div
      style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{value}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight, depositHighlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
      <span style={{
        color: depositHighlight ? '#b45309' : highlight ? '#1d4ed8' : '#0f172a',
        fontSize: 13, fontWeight: 600,
        background: depositHighlight ? '#fef9c3' : 'transparent',
        padding: depositHighlight ? '1px 8px' : 0,
        borderRadius: depositHighlight ? 6 : 0,
      }}>{value}</span>
    </div>
  );
}

const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)',
    padding: '32px 24px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 18, padding: '24px 26px',
    boxShadow: '0 1px 12px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
  },
  skeleton: {
    background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 12,
    background: '#f0f4ff', border: '1px solid #e0e7ff',
    color: '#3b82f6', fontSize: 18, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  btnPrimary: {
    background: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: 12, padding: '12px 28px',
    fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 18, paddingBottom: 14, borderBottom: '2px solid #f1f5f9',
  },
  sectionIcon:  { fontSize: 20 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#0f172a' },
  contactLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 8, letterSpacing: '0.5px' },
  galleryArrow: (side) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 14,
    background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
    width: 40, height: 40, fontSize: 20, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)', zIndex: 2,
    transition: 'transform 0.15s, background 0.15s', color: '#334155',
  }),
};

if (typeof document !== 'undefined' && !document.getElementById('room-detail-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'room-detail-styles';
  styleEl.textContent = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(styleEl);
}