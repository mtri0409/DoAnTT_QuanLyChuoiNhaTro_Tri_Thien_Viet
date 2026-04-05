import { useState } from 'react';
import { useNavigate } from "react-router-dom";


const amenityIcons = {
  wifi: '📶', 'wi-fi': '📶',
  'nóng lạnh': '🚿', 'máy nước nóng': '🚿',
  'máy lạnh': '❄️', 'điều hòa': '❄️',
  'wc riêng': '🚽', 'nhà vệ sinh': '🚽', 'toilet': '🚽',
  'bếp riêng': '🍳', 'nhà bếp': '🍳', 'bếp': '🍳',
  'gác lửng': '🪜',
  'thang máy': '🛗',
  'bãi xe': '🅿️', 'chỗ để xe': '🅿️',
  'bảo vệ': '💂', 'an ninh': '💂',
};

const getAmenityIcon = (name = '') => {
  const key = name.toLowerCase();
  return amenityIcons[key] || '✅';
};

const badgeColors = {
  available: { bg: '#16a34a', label: 'Còn phòng' },
  occupied:  { bg: '#dc2626', label: 'Đã thuê' },
  maintenance: { bg: '#f59e0b', label: 'Bảo trì' },
};

export default function RoomCard({ room }) {
  const [imgIdx, setImgIdx] = useState(0);
const navigate = useNavigate();
  // fallback nếu không có ảnh
  const images = room.images?.length
    ? room.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'];

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };
  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  };

  const statusInfo = badgeColors[room.status] || null;

  const formatPrice = (price) => {
    if (!price) return '—';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 16px rgba(29,108,240,0.08)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        border: '1.5px solid transparent',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(29,108,240,0.13)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#e8f0fe';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(29,108,240,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {/* ── Image gallery ── */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#f1f4f9' }}>
        <img
          src={images[imgIdx]}
          alt={room.roomName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'; }}
        />

        {statusInfo && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            fontSize: 11, fontWeight: 700, padding: '3px 9px',
            borderRadius: 20, background: statusInfo.bg, color: '#fff', zIndex: 2,
          }}>
            {statusInfo.label}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button onClick={prevImg} style={navBtnStyle('left')}>‹</button>
            <button onClick={nextImg} style={navBtnStyle('right')}>›</button>
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
              {images.map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)' }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Info ── */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2236', lineHeight: 1.3 }}>
            {room.roomName}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1d6cf0', whiteSpace: 'nowrap' }}>
            {formatPrice(room.price)}
            <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/tháng</span>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#64748b' }}>
          {room.area && <span>📐 {room.area}</span>}
          {room.address && <span>📍 {room.address}</span>}
          {room.floor?.floorName && <span>🏢 {room.floor.floorName}</span>}
        </div>

        {/* Description */}
        {room.description && (
          <p style={{
            fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {room.amenities.map((a) => (
              <span key={a.amenityId ?? a.amenityName} style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6,
                background: '#e8f0fe', color: '#1d6cf0', fontWeight: 500,
              }}>
                {getAmenityIcon(a.amenityName)} {a.amenityName}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
          <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
            🏘 {room.floor?.branch?.branchName ?? '—'}
          </span>
          <button onClick={() => navigate(`/rooms/${room.roomId}`)} style={{
            background: '#1d6cf0', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 18px',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Xem chi tiết →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── helpers ──
const navBtnStyle = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 8,
  background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%',
  width: 28, height: 28, fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
});