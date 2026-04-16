import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const badgeColors = {
  available: { bg: '#16a34a', bgLight: '#dcfce7', label: 'Còn phòng' },
  occupied: { bg: '#dc2626', bgLight: '#fee2e2', label: 'Đã thuê' },
  maintenance: { bg: '#f59e0b', bgLight: '#fef3c7', label: 'Bảo trì' },
};

const amenityIcons = {
  wifi: '📶', 'wi-fi': '📶',
  'nóng lạnh': '🚿', 'máy nước nóng': '🚿',
  'máy lạnh': '❄️', 'điều hòa': '❄️',
  'wc riêng': '🚽', 'nhà vệ sinh': '🚽',
  'bếp riêng': '🍳', bếp: '🍳',
  'gác lửng': '🪜',
  'bãi xe': '🅿️', 'chỗ để xe': '🅿️', 'bãi xe máy': '🅿️',
  'bảo vệ': '💂', 'an ninh': '💂',
  camera: '📷', 'ban công': '🌿', 'tủ lạnh': '🧊',
};

const getIcon = (name = '') => {
  const k = name.toLowerCase();
  return Object.entries(amenityIcons).find(([key]) => k.includes(key))?.[1] ?? '✅';
};

const fmt = (p) => (p ? Number(p).toLocaleString('vi-VN') + 'đ' : '—');

export default function RoomGridCard({ room }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  // ── Images ──
  const getImages = () => {
    if (room.roomMedia?.length) {
      const urls = room.roomMedia
        .filter((m) => {
          if (!m.mediaType) return true;
          const t = m.mediaType.toLowerCase();
          return t === 'image' || t.startsWith('image/');
        })
        .map((m) => m.url ?? m.mediaUrl)
        .filter(Boolean);
      if (urls.length) return urls;
    }
    if (room.images?.length) return room.images;
    return ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'];
  };

  const images = getImages();

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };
  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % images.length);
  };
  const getImage = (room) => {
  const media = room.roomMedia;

  if (!media || media.length === 0) {
    return "http://localhost:8080/images/default.jpg";
  }

  const url = media[0].url;

  // ❌ domain chết
  if (url.includes("storage.troapp.vn")) {
    // tìm ảnh local fallback
    const local = media.find(m => m.url.startsWith("/images"));
    if (local) {
      return `http://localhost:8080${local.url}`;
    }
    return "http://localhost:8080/images/default.jpg";
  }

  // local
  if (url.startsWith("/images")) {
    return `http://localhost:8080${url}`;
  }

  return url;
};

  const statusKey = (room.Status ?? room.status ?? '').toLowerCase();
  const statusInfo = badgeColors[statusKey] ?? null;
  const amenities = room.amenities ?? [];
  const maxShow = 3;

  return (
    <div
      onClick={() => navigate(`/rooms/${room.roomId}/detail`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 12px 40px rgba(29,78,216,0.12)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        border: `1.5px solid ${hovered ? '#bfdbfe' : '#f1f5f9'}`,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Image section ── */}
      <div style={{
        position: 'relative', height: 200,
        overflow: 'hidden', background: '#e2e8f0',
      }}>
        <img
          src={getImage(room)}
          alt={room.roomName}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
          }}
        />

        {/* Status badge */}
        {statusInfo && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            fontSize: 11, fontWeight: 700, padding: '4px 10px',
            borderRadius: 20, background: statusInfo.bg, color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2,
          }}>
            {statusInfo.label}
          </span>
        )}

        {/* Price badge */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          padding: '5px 12px', borderRadius: 10,
          backdropFilter: 'blur(4px)',
          fontSize: 14, fontWeight: 700, zIndex: 2,
        }}>
          {fmt(room.price)}
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>/th</span>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && hovered && (
          <>
            <button onClick={prevImg} style={navStyle('left')}>‹</button>
            <button onClick={nextImg} style={navStyle('right')}>›</button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%',
            transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 2,
          }}>
            {images.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === imgIdx ? 16 : 6, height: 6, borderRadius: 3,
                  background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Info section ── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Name */}
        <div style={{
          fontSize: 17, fontWeight: 700, color: '#0f172a',
          lineHeight: 1.3,
        }}>
          {room.roomName}
        </div>

        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap',
          gap: 10, fontSize: 12, color: '#64748b',
        }}>
          {room.area && <span>📐 {room.area} m²</span>}
          {room.floorId && <span>🏢 Tầng {room.floorId}</span>}
          {room.maxPeople && <span>👥 Tối đa {room.maxPeople}</span>}
        </div>

        {/* Description */}
        {room.description && (
          <p style={{
            fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {amenities.slice(0, maxShow).map((a) => (
              <span
                key={a.amenityId ?? a.amenityName}
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: '#f0f4ff', color: '#3b82f6', fontWeight: 500,
                  border: '1px solid #e0e7ff',
                }}
              >
                {getIcon(a.amenityName)} {a.amenityName}
              </span>
            ))}
            {amenities.length > maxShow && (
              <span style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                background: '#f1f5f9', color: '#64748b', fontWeight: 600,
              }}>
                +{amenities.length - maxShow}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid #f1f5f9', marginTop: 'auto',
        }}>
          <span style={{
            fontSize: 11, color: '#64748b', background: '#f8fafc',
            padding: '3px 10px', borderRadius: 20, fontWeight: 500,
          }}>
            🏘 {room.branch?.branchName ?? '—'}
          </span>
          <span style={{
            fontSize: 12, color: '#3b82f6', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            Chi tiết →
          </span>
        </div>
      </div>
    </div>
  );
}

const navStyle = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 10,
  background: 'rgba(255,255,255,0.9)', border: 'none',
  borderRadius: '50%', width: 30, height: 30,
  fontSize: 16, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 3,
  color: '#334155', transition: 'transform 0.15s',
});