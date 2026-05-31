import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { imgURL } from '../services/userConfig';

const badgeColors = {
  available: { bg: '#eaf7ea', color: '#287a35', label: 'Còn phòng' },
  occupied: { bg: '#f4e5e3', color: '#9b3026', label: 'Đã thuê' },
  maintenance: { bg: '#fff0dc', color: '#a95a13', label: 'Bảo trì' },
  shared: { bg: '#fff0dc', color: '#a95a13', label: 'Ở ghép' },
  deposited: { bg: '#ece9f6', color: '#5a4a9b', label: 'Đã cọc' },
};

const fmt = (p) => (p ? Number(p).toLocaleString('vi-VN') + 'đ' : '—');

export default function RoomGridCard({ room, floors = [], branches = [] }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const currentFloor = useMemo(() => {
    return floors.find(floor =>
      String(floor.floorId ?? floor.id) === String(room.floorId),
    );
  }, [floors, room.floorId]);

  const currentBranch = useMemo(() => {
    const branchId =
      room.branchId ??
      room.branch?.branchId ??
      currentFloor?.branchId ??
      currentFloor?.branch?.branchId;

    if (branchId == null) return room.branch ?? null;

    return branches.find(branch =>
      String(branch.branchId ?? branch.id) === String(branchId),
    ) ?? room.branch ?? null;
  }, [branches, currentFloor, room.branch, room.branchId]);

  const floorNumber =
    room.floor?.floorNumber ??
    currentFloor?.floorNumber ??
    room.floorNumber ??
    null;

  const branchName =
    currentBranch?.branchName ??
    room.branchName ??
    'Chưa có chi nhánh';

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
      return `${imgURL}/images/default.jpg`;
    }

    const url = media[imgIdx]?.url ?? media[0]?.url;

    if (!url) return `${imgURL}/images/default.jpg`;

    if (url.includes('storage.troapp.vn')) {
      const local = media.find(m => m.url?.startsWith('/images'));
      if (local) return `${imgURL}${local.url}`;
      return `${imgURL}/images/default.jpg`;
    }

    if (url.startsWith('/images')) {
      return `${imgURL}${url}`;
    }

    return url;
  };

  const statusKey = (room.Status ?? room.status ?? '').toLowerCase();
  const statusInfo = badgeColors[statusKey] ?? null;
  const amenities = room.amenities ?? [];
  const maxShow = 3;

  return (
    <article
      className="rg-card"
      onClick={() => navigate(`/phong/${room.roomId}/chi-tiet`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        .rg-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
          cursor: pointer;
          transition: transform .18s, box-shadow .18s, border-color .18s;
          display: flex;
          flex-direction: column;
          font-family: "Times New Roman", Times, serif;
          text-align: left;
        }

        .rg-card:hover {
          border-color: #e5c4a8;
          box-shadow: 0 8px 24px rgba(102,64,35,.10);
          transform: translateY(-2px);
        }

        .rg-media {
          position: relative;
          height: 198px;
          overflow: hidden;
          background: #f2ebe5;
        }

        .rg-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .35s;
        }

        .rg-card:hover .rg-media img {
          transform: scale(1.035);
        }

        .rg-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          font-size: 13px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,.75);
        }

        .rg-price {
          position: absolute;
          right: 10px;
          bottom: 10px;
          background: rgba(47,36,29,.82);
          color: #fff;
          padding: 6px 10px;
          border-radius: 5px;
          font-size: 15px;
          font-weight: 800;
        }

        .rg-price span {
          font-size: 12px;
          font-weight: 500;
          opacity: .8;
        }

        .rg-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          border: 1px solid #eadfd4;
          background: rgba(255,255,255,.92);
          color: #3c2d23;
          width: 30px;
          height: 30px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 700;
          z-index: 3;
        }

        .rg-nav.left { left: 10px; }
        .rg-nav.right { right: 10px; }

        .rg-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 2;
        }

        .rg-dot {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,.55);
          transition: width .18s, background .18s;
        }

        .rg-dot.active {
          background: #fff;
          width: 16px;
        }

        .rg-body {
          padding: 15px 16px;
          display: flex;
          flex-direction: column;
          gap: 9px;
          flex: 1;
        }

        .rg-title {
          color: #2f241d;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.35;
          text-align: left;
        }

        .rg-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          color: #6f5f52;
          font-size: 14px;
        }

        .rg-meta span {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          border-radius: 5px;
          padding: 4px 8px;
        }

        .rg-desc {
          color: #6f5f52;
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rg-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .rg-amenities span {
          color: #6f5f52;
          background: #f7f1eb;
          border: 1px solid #eadfd4;
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .rg-foot {
          margin-top: auto;
          padding-top: 11px;
          border-top: 1px solid #f0e4d8;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }

        .rg-location {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          min-width: 0;
        }

        .rg-location span {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          color: #6f5f52;
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 13px;
          font-weight: 600;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rg-link {
          color: #c96523;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 620px) {
          .rg-media { height: 210px; }
          .rg-foot { align-items: flex-start; flex-direction: column; }
          .rg-location span { max-width: 100%; }
        }
      `}</style>

      <div className="rg-media">
        <img
          src={getImage(room)}
          alt={room.roomName}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
          }}
        />

        {statusInfo && (
          <span className="rg-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        )}

        <div className="rg-price">
          {fmt(room.price)} <span>/tháng</span>
        </div>

        {images.length > 1 && hovered && (
          <>
            <button type="button" onClick={prevImg} className="rg-nav left">‹</button>
            <button type="button" onClick={nextImg} className="rg-nav right">›</button>
          </>
        )}

        {images.length > 1 && (
          <div className="rg-dots">
            {images.map((_, i) => (
              <div
                key={i}
                className={`rg-dot ${i === imgIdx ? 'active' : ''}`}
                style={{ width: i === imgIdx ? 16 : 6 }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rg-body">
        <div className="rg-title">{room.roomName}</div>

        <div className="rg-meta">
          {room.area && <span>{room.area} m²</span>}
          {floorNumber != null && <span>Tầng {floorNumber}</span>}
          {room.maxPeople && <span>Tối đa {room.maxPeople} người</span>}
        </div>

        {room.description && (
          <p className="rg-desc">{room.description}</p>
        )}

        {amenities.length > 0 && (
          <div className="rg-amenities">
            {amenities.slice(0, maxShow).map((a) => (
              <span key={a.amenityId ?? a.amenityName}>{a.amenityName}</span>
            ))}
            {amenities.length > maxShow && (
              <span>+{amenities.length - maxShow}</span>
            )}
          </div>
        )}

        <div className="rg-foot">
          <div className="rg-location">
            <span>{branchName}</span>
          </div>
          <span className="rg-link">Chi tiết</span>
        </div>
      </div>
    </article>
  );
}
