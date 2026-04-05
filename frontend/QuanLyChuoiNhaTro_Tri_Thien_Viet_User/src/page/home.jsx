import { useState } from "react";

const rooms = [
  {
    id: 1,
    name: "Phòng Trọ Quận 1 - Cao Cấp",
    price: "3.500.000",
    priceVal: 3.5,
    area: "25m²",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    description:
      "Phòng rộng rãi, thoáng mát, nội thất đầy đủ. Gần trung tâm thương mại, siêu thị tiện lợi. An ninh 24/7, có camera giám sát, thang máy. Phù hợp cho người đi làm hoặc sinh viên.",
    amenities: ["Wifi", "Nóng lạnh", "Máy lạnh", "WC riêng"],
    branch: "Quận 1",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
    ],
    badge: "Nổi bật",
  },
  {
    id: 2,
    name: "Phòng Trọ Bình Thạnh - Giá Tốt",
    price: "2.200.000",
    priceVal: 2.2,
    area: "18m²",
    address: "45 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM",
    description:
      "Phòng gần ĐH Hutech, ĐH Văn Lang. Hẻm xe hơi vào được, yên tĩnh, sạch sẽ. Có gác lửng tối ưu không gian. Điện nước giá nhà nước, không phát sinh phí.",
    amenities: ["Wifi", "Máy lạnh", "Gác lửng"],
    branch: "Bình Thạnh",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80",
    ],
    badge: "Giá tốt",
  },
  {
    id: 3,
    name: "Studio Thủ Đức - Full Nội Thất",
    price: "4.800.000",
    priceVal: 4.8,
    area: "30m²",
    address: "78 Võ Văn Ngân, Thủ Đức, TP.HCM",
    description:
      "Studio cao cấp full nội thất, bếp riêng, ban công rộng. Gần ĐHQG TP.HCM, Metro Thủ Đức. Tòa nhà mới xây 2023, thang máy, hầm xe. Môi trường văn minh, chuyên nghiệp.",
    amenities: ["Wifi", "Nóng lạnh", "Máy lạnh", "WC riêng", "Bếp riêng"],
    branch: "Thủ Đức",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80",
    ],
    badge: "Mới",
  },
  {
    id: 4,
    name: "Phòng Trọ Gò Vấp - Tiện Nghi",
    price: "1.800.000",
    priceVal: 1.8,
    area: "15m²",
    address: "22 Quang Trung, Gò Vấp, TP.HCM",
    description:
      "Phòng nhỏ gọn phù hợp 1 người ở. Khu vực an ninh tốt, chủ nhà thân thiện. Gần chợ Gò Vấp, tiện mua sắm. Xe máy, xe đạp có chỗ để riêng, không tính phí.",
    amenities: ["Wifi", "Nóng lạnh"],
    branch: "Gò Vấp",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80",
      "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=400&q=80",
    ],
    badge: null,
  },
  {
    id: 5,
    name: "Phòng Trọ Tân Bình - Gần Sân Bay",
    price: "6.500.000",
    priceVal: 6.5,
    area: "40m²",
    address: "89 Trường Chinh, Tân Bình, TP.HCM",
    description:
      "Phòng rộng cao cấp gần sân bay Tân Sơn Nhất. Phù hợp cho nhóm 2–3 người hoặc cặp đôi. Nội thất hiện đại, giường đôi king size. Dịch vụ vệ sinh hàng tuần bao gồm trong giá.",
    amenities: ["Wifi", "Nóng lạnh", "Máy lạnh", "WC riêng", "Bếp riêng"],
    branch: "Tân Bình",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&q=80",
    ],
    badge: "Cao cấp",
  },
];

const branches = ["Tất cả", "Quận 1", "Bình Thạnh", "Thủ Đức", "Gò Vấp", "Tân Bình", "Quận 7"];

const priceRanges = [
  { label: "Dưới 2 triệu", min: 0, max: 2 },
  { label: "2 – 5 triệu", min: 2, max: 5 },
  { label: "5 – 8 triệu", min: 5, max: 8 },
  { label: "8 – 10 triệu", min: 8, max: 10 },
  { label: "Trên 10 triệu", min: 10, max: 999 },
];

const amenitiesList = [
  { key: "Wifi", icon: "📶", label: "Wifi miễn phí" },
  { key: "Nóng lạnh", icon: "🚿", label: "Nóng lạnh" },
  { key: "Máy lạnh", icon: "❄️", label: "Máy lạnh" },
  { key: "WC riêng", icon: "🚽", label: "WC riêng" },
  { key: "Bếp riêng", icon: "🍳", label: "Bếp riêng" },
  { key: "Gác lửng", icon: "🪜", label: "Gác lửng" },
];

const badgeColors = {
  "Nổi bật": { background: "#1d6cf0", color: "#fff" },
  "Giá tốt": { background: "#16a34a", color: "#fff" },
  Mới: { background: "#f59e0b", color: "#fff" },
  "Cao cấp": { background: "#7c3aed", color: "#fff" },
};

export default function Home() {
  const [activeBranch, setActiveBranch] = useState("Tất cả");
  const [activePrice, setActivePrice] = useState(null);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [imgIdx, setImgIdx] = useState({});

  const toggleAmenity = (key) =>
    setActiveAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );

  const nextImg = (e, room) => {
    e.stopPropagation();
    setImgIdx((prev) => ({
      ...prev,
      [room.id]: ((prev[room.id] || 0) + 1) % room.images.length,
    }));
  };

  const prevImg = (e, room) => {
    e.stopPropagation();
    setImgIdx((prev) => ({
      ...prev,
      [room.id]: ((prev[room.id] || 0) - 1 + room.images.length) % room.images.length,
    }));
  };

  const filteredRooms = rooms.filter((room) => {
    const branchOk = activeBranch === "Tất cả" || room.branch === activeBranch;
    const priceOk = !activePrice || (room.priceVal >= activePrice.min && room.priceVal < activePrice.max);
    const amenOk = activeAmenities.every((a) => room.amenities.includes(a));
    return branchOk && priceOk && amenOk;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 48px" }}>

      {/* Branch filter */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "0 2px 16px rgba(29,108,240,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginRight: 4 }}>
          📍 Chi nhánh:
        </span>
        {branches.map((b) => (
          <button
            key={b}
            onClick={() => setActiveBranch(b)}
            style={{
              padding: "7px 16px",
              borderRadius: 50,
              fontSize: 14,
              fontWeight: activeBranch === b ? 600 : 500,
              cursor: "pointer",
              border: `1.5px solid ${activeBranch === b ? "#1d6cf0" : "#e2e8f0"}`,
              background: activeBranch === b ? "#1d6cf0" : "#fff",
              color: activeBranch === b ? "#fff" : "#64748b",
              fontFamily: "inherit",
              transition: "all 0.18s",
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

        {/* Room list */}
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2236",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Danh sách phòng trọ
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#64748b",
                background: "#f1f4f9",
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              {filteredRooms.length} phòng
            </span>
          </div>

          {filteredRooms.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏚️</div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>
                Không tìm thấy phòng phù hợp. Hãy thử thay đổi bộ lọc.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filteredRooms.map((room) => {
                const curIdx = imgIdx[room.id] || 0;
                return (
                  <div
                    key={room.id}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      boxShadow: "0 2px 16px rgba(29,108,240,0.08)",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "280px 1fr",
                      border: "1.5px solid transparent",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(29,108,240,0.13)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = "#e8f0fe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 16px rgba(29,108,240,0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    {/* Image gallery */}
                    <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f1f4f9" }}>
                      <img
                        src={room.images[curIdx]}
                        alt={room.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                      />
                      {room.badge && (
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 20,
                            zIndex: 2,
                            ...badgeColors[room.badge],
                          }}
                        >
                          {room.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => prevImg(e, room)}
                        style={{
                          position: "absolute", top: "50%", transform: "translateY(-50%)", left: 8,
                          background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%",
                          width: 28, height: 28, fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                        }}
                      >‹</button>
                      <button
                        onClick={(e) => nextImg(e, room)}
                        style={{
                          position: "absolute", top: "50%", transform: "translateY(-50%)", right: 8,
                          background: "rgba(255,255,255,0.88)", border: "none", borderRadius: "50%",
                          width: 28, height: 28, fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                        }}
                      >›</button>
                      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                        {room.images.map((_, i) => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === curIdx ? "#fff" : "rgba(255,255,255,0.5)" }} />
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2236", lineHeight: 1.3 }}>
                          {room.name}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#1d6cf0", whiteSpace: "nowrap" }}>
                          {room.price}đ<span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>/tháng</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#64748b" }}>
                        <span>📐 {room.area}</span>
                        <span>📍 {room.address}</span>
                      </div>

                      <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {room.description}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {room.amenities.map((a) => (
                          <span key={a} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#e8f0fe", color: "#1d6cf0", fontWeight: 500 }}>
                            {amenitiesList.find((x) => x.key === a)?.icon} {a}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: 12, color: "#64748b", background: "#f1f4f9", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                          🏘 {room.branch}
                        </span>
                        <button
                          style={{
                            background: "#1d6cf0", color: "#fff", border: "none",
                            borderRadius: 8, padding: "8px 18px",
                            fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Xem chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Price filter */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(29,108,240,0.08)", padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2236", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              💰 Lọc theo giá
            </div>
            {priceRanges.map((p) => {
              const isActive = activePrice?.label === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => setActivePrice(isActive ? null : p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                    border: `1.5px solid ${isActive ? "#1d6cf0" : "#e2e8f0"}`,
                    marginBottom: 8, background: isActive ? "#e8f0fe" : "#fff",
                    color: isActive ? "#1d6cf0" : "#64748b",
                    fontFamily: "inherit", fontSize: 14, fontWeight: isActive ? 600 : 500,
                    width: "100%", textAlign: "left", transition: "all 0.18s",
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: `2px solid ${isActive ? "#1d6cf0" : "#cbd5e1"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {isActive && <span style={{ width: 8, height: 8, background: "#1d6cf0", borderRadius: "50%" }} />}
                  </span>
                  {p.label}
                </button>
              );
            })}
            {activePrice && (
              <button
                onClick={() => setActivePrice(null)}
                style={{
                  width: "100%", marginTop: 6, padding: 9,
                  border: "1.5px solid #e2e8f0", borderRadius: 8,
                  background: "none", color: "#64748b", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                ✕ Bỏ lọc giá
              </button>
            )}
          </div>

          {/* Amenities filter */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(29,108,240,0.08)", padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2236", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              ✨ Lọc theo tiện ích
            </div>
            {amenitiesList.map((a, i) => {
              const checked = activeAmenities.includes(a.key);
              return (
                <div
                  key={a.key}
                  onClick={() => toggleAmenity(a.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0",
                    borderBottom: i < amenitiesList.length - 1 ? "1px solid #e2e8f0" : "none",
                    cursor: "pointer", fontSize: 14,
                    color: checked ? "#1a2236" : "#64748b", fontWeight: 500,
                    userSelect: "none",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: `2px solid ${checked ? "#1d6cf0" : "#e2e8f0"}`,
                    background: checked ? "#1d6cf0" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 11, color: "#fff", fontWeight: 700,
                  }}>
                    {checked && "✓"}
                  </div>
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </div>
              );
            })}
            {activeAmenities.length > 0 && (
              <button
                onClick={() => setActiveAmenities([])}
                style={{
                  width: "100%", marginTop: 14, padding: 9,
                  border: "1.5px solid #e2e8f0", borderRadius: 8,
                  background: "none", color: "#64748b", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                ✕ Bỏ lọc tiện ích
              </button>
            )}
          </div>

          {/* Contact card */}
          <div style={{ background: "linear-gradient(135deg, #1d6cf0 0%, #1558cc 100%)", borderRadius: 14, padding: 20, color: "#fff" }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>📞 Liên hệ tư vấn ngay</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { ic: "📱", text: "0901 234 567" },
                { ic: "💬", text: "Zalo: 0901 234 567" },
                { ic: "🕐", text: "7:00 – 22:00 mỗi ngày" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 15 }}>{item.ic}</span> {item.text}
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", marginTop: 14, padding: 10,
              background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)",
              borderRadius: 8, color: "#fff", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Liên hệ ngay
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}