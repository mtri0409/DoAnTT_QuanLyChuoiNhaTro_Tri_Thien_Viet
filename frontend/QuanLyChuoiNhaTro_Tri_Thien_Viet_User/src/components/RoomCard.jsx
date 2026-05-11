import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8080';

const getImage = (room) => {
  const media = room.roomMedia;
  if (!media || media.length === 0) return `${BASE_URL}/images/default.jpg`;

  const local = media.find(m => m.url?.startsWith('/images'));
  if (local) return `${BASE_URL}${local.url}`;

  const first = media[0]?.url;
  if (!first || first.includes('storage.troapp.vn')) return `${BASE_URL}/images/default.jpg`;

  return first.startsWith('http') ? first : `${BASE_URL}${first}`;
};

const formatPrice = (price) =>
  price ? Number(price).toLocaleString('vi-VN') + 'đ' : '—';

export default function RoomCard({ room, tag }) {
  const navigate = useNavigate();

  const branchName = room.branch?.branchName ?? room.branchName ?? null;
  const floorName = room.floor?.floorName
    ?? (room.floor?.floorNumber != null ? `Tầng ${room.floor.floorNumber}` : null)
    ?? room.floorName
    ?? null;

  const statusMap = {
    available: { bg: '#eaf7ea', color: '#287a35', label: 'Còn phòng' },
    shared: { bg: '#fff0dc', color: '#a95a13', label: 'Ở ghép' },
    occupied: { bg: '#f4e5e3', color: '#9b3026', label: 'Đã thuê' },
    maintenance: { bg: '#fff0dc', color: '#a95a13', label: 'Bảo trì' },
    deposited: { bg: '#ece9f6', color: '#5a4a9b', label: 'Đã cọc' },
  };

  const badge = tag ?? statusMap[(room.status ?? '').toLowerCase()] ?? null;

  return (
    <article className="room-card">
      <style>{`
        .room-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 250px 1fr;
          box-shadow: 0 2px 10px rgba(102, 64, 35, .05);
          transition: box-shadow .18s, transform .18s, border-color .18s;
          font-family: "Times New Roman", Times, serif;
          text-align: left;
        }

        .room-card:hover {
          border-color: #e5c4a8;
          box-shadow: 0 8px 24px rgba(102, 64, 35, .1);
          transform: translateY(-1px);
        }

        .room-card-image {
          position: relative;
          height: 190px;
          background: #f2ebe5;
          overflow: hidden;
        }

        .room-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .room-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          font-size: 13px;
          font-weight: 800;
          padding: 4px 9px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,.75);
        }

        .room-card-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          text-align: left;
          align-items: stretch;
        }

        .room-card-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: start;
          text-align: left;
        }

        .room-card-title {
          color: #2f241d;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.35;
          min-width: 0;
          text-align: left;
        }

        .room-card-price {
          color: #d86622;
          font-size: 20px;
          font-weight: 900;
          white-space: nowrap;
          text-align: right;
        }

        .room-card-price span {
          color: #8b7665;
          font-size: 13px;
          font-weight: 600;
        }

        .room-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: #6f5f52;
          font-size: 15px;
          text-align: left;
        }

        .room-card-meta span,
        .room-card-chip {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          border-radius: 5px;
          padding: 4px 8px;
        }

        .room-card-desc {
          margin: 0;
          color: #6f5f52;
          font-size: 16px;
          line-height: 1.55;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .room-card-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: flex-start;
          text-align: left;
        }

        .room-card-amenities span {
          color: #6f5f52;
          background: #f7f1eb;
          border: 1px solid #eadfd4;
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .room-card-foot {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f0e4d8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
        }

        .room-card-path {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          color: #8b7665;
          font-size: 14px;
          min-width: 0;
          text-align: left;
        }

        .room-card-path span {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          border-radius: 5px;
          padding: 4px 8px;
          font-weight: 600;
        }

        .room-card-action {
          border: 0;
          border-radius: 6px;
          background: #df7a35;
          color: #fff;
          font-family: "Times New Roman", Times, serif;
          font-size: 15px;
          font-weight: 800;
          padding: 9px 14px;
          cursor: pointer;
          white-space: nowrap;
        }

        .room-card-action:hover {
          background: #c96523;
        }

        @media (max-width: 860px) {
          .room-card {
            grid-template-columns: 210px 1fr;
          }

          .room-card-image {
            height: 200px;
          }

          .room-card-head {
            grid-template-columns: 1fr;
          }

          .room-card-price {
            text-align: left;
          }

          .room-card-foot {
            align-items: flex-start;
            flex-direction: column;
          }

          .room-card-action {
            width: 100%;
          }
        }

        @media (max-width: 620px) {
          .room-card {
            grid-template-columns: 1fr;
          }

          .room-card-image {
            height: 210px;
          }

          .room-card-body {
            padding: 14px;
          }
        }
      `}</style>

      <div className="room-card-image">
        <img
          src={getImage(room)}
          alt={room.roomName}
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
          }}
        />
        {badge && (
          <span
            className="room-card-badge"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="room-card-body">
        <div className="room-card-head">
          <div className="room-card-title">{room.roomName}</div>
          <div className="room-card-price">
            {formatPrice(room.price)}
            <span>/tháng</span>
          </div>
        </div>

        <div className="room-card-meta">
          {room.area && <span>{room.area}</span>}
          {room.address && <span>{room.address}</span>}
        </div>

        {room.description && (
          <p className="room-card-desc">{room.description}</p>
        )}

        {room.amenities?.length > 0 && (
          <div className="room-card-amenities">
            {room.amenities.map(a => (
              <span key={a.amenityId ?? a.amenityName}>
                {a.amenityName}
              </span>
            ))}
          </div>
        )}

        <div className="room-card-foot">
          <div className="room-card-path">
            {branchName && <span>{branchName}</span>}
            {floorName && <span>{floorName}</span>}
            <span>{room.roomName}</span>
          </div>

          <button
            type="button"
            className="room-card-action"
            onClick={() => navigate(`/phong/${room.roomId}/chi-tiet`)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}
