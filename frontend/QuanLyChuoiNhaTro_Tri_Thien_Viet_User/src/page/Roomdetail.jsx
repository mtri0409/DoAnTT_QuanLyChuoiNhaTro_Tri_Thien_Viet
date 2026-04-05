import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiRoom from "../../../QuanLyChuoiNhaTro_Tri_Thien_Viet_Admin/src/api/apiRoom";

export default function RoomDetail() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    apiRoom.getRoomById(roomId).then((res) => {
      setRoom(res);
    });
  }, [roomId]);

  // gọi phòng cùng chi nhánh
  useEffect(() => {
    if (!room?.floor?.branchId) return;

    apiRoom
      .getAllRooms(0, 6, "roomName", "asc", room.floor.branchId)
      .then((res) => {
        setRelatedRooms(res.content || []);
      });
  }, [room]);

  if (!room) return <div style={{ padding: 40 }}>Đang tải...</div>;

  const images =
    room.images?.length > 0
      ? room.images
      : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"];

  const phone = "0385018194"; // TODO: lấy từ backend nếu có
  const zaloLink = `https://zalo.me/${phone}`;

  const handleCall = () => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      window.location.href = `tel:${phone}`;
    } else {
      navigator.clipboard.writeText(phone);
      alert("Đã copy số điện thoại!");
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        
        {/* LEFT */}
        <div>
          {/* Gallery */}
          <div style={{ marginBottom: 16 }}>
            <img
              src={images[imgIdx]}
              style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 12 }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: 80,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: imgIdx === i ? "2px solid #1d6cf0" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1>{room.roomName}</h1>
          <h2 style={{ color: "#1d6cf0" }}>
            {Number(room.price).toLocaleString()}đ/tháng
          </h2>

          {/* Info */}
          <div style={{ display: "flex", gap: 20, margin: "16px 0" }}>
            <span>📐 {room.area}</span>
            <span>🏢 {room.floor?.floorNumber}</span>
            <span>🏘 CN: {room.floor?.branchId}</span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <h3>Mô tả</h3>
            <p>{room.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3>Tiện nghi</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {room.amenities?.map((a) => (
                <span
                  key={a.amenityId}
                  style={{
                    padding: "6px 12px",
                    background: "#e8f0fe",
                    borderRadius: 6,
                  }}
                >
                  {a.amenityName}
                </span>
              ))}
            </div>
          </div>

          {/* Related */}
          <div style={{ marginTop: 40 }}>
            <h3>Phòng cùng chi nhánh</h3>
            <div style={{ display: "flex", gap: 12 }}>
              {relatedRooms.map((r) => (
                <div key={r.roomId} style={{ width: 200 }}>
                  <img src={r.images?.[0]} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                  <div>{r.roomName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: "sticky", top: 100 }}>
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              background: "#fff",
            }}
          >
            <h3>Liên hệ</h3>

            {/* Phone */}
            <button
              onClick={handleCall}
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 10,
                background: "#1d6cf0",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              📞 {phone}
            </button>

            {/* Zalo */}
            <a
              href={zaloLink}
              target="_blank"
              style={{
                display: "block",
                textAlign: "center",
                padding: 12,
                background: "#00a884",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              💬 Chat Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}