export default function Footer() {
  const branches = [
    "Quận 1 – Trung tâm",
    "Quận 7 – Phú Mỹ Hưng",
    "Bình Thạnh",
    "Thủ Đức – ĐH Quốc Gia",
    "Gò Vấp",
    "Tân Bình – Gần Sân Bay",
    "Bình Dương",
  ];

  const infoLinks = [
    "Điều khoản sử dụng",
    "Chính sách bảo mật",
    "Hướng dẫn đăng tin",
    "Hướng dẫn tìm phòng",
    "Quy chế hoạt động",
    "Giải quyết khiếu nại",
    "Câu hỏi thường gặp",
  ];

  const socials = [
    { icon: "📘", label: "Facebook" },
    { icon: "💬", label: "Zalo" },
    { icon: "📧", label: "Gmail" },
    { icon: "📺", label: "YouTube" },
    { icon: "🎵", label: "TikTok" },
  ];

  return (
    <footer style={{ background: "#0f1c2e", color: "#94a3b8", marginTop: 48 }}>
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 24px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
          gap: 40,
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Phòng Trọ{" "}
            <span style={{ color: "#4d8ef5" }}>Rẻ</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Nền tảng tìm kiếm phòng trọ hàng đầu TP.HCM. Kết nối hàng nghìn chủ trọ và người thuê mỗi ngày với giá cả minh bạch, thông tin chính xác.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                title={s.label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "#fff",
                  transition: "background 0.2s",
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div>
          <h5
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 16,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Chi nhánh cho thuê
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {branches.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4d8ef5",
                    flexShrink: 0,
                  }}
                />
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h5
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 16,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Thông tin
          </h5>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {infoLinks.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "#4d8ef5" }}>›</span> {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 16,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Liên hệ
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { ic: "📱", text: <>Hotline: <strong style={{ color: "#e2e8f0" }}>0901 234 567</strong></> },
              { ic: "💬", text: <>Zalo OA: <strong style={{ color: "#e2e8f0" }}>Phòng Trọ Rẻ</strong></> },
              { ic: "📧", text: "phongtroke@gmail.com" },
              { ic: "🏢", text: "123 Nguyễn Huệ, Q.1, TP.HCM" },
              { ic: "🕐", text: "7:00 – 22:00, Thứ 2 – Chủ nhật" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13 }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.ic}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "#475569",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        © 2026 Phòng Trọ Rẻ. Tất cả quyền được bảo lưu. · Được xây dựng với ❤️ tại TP.HCM
      </div>
    </footer>
  );
}