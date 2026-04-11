

export default function SupportPage() {
  return (
    <div style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#1a2236",
            marginBottom: 20,
          }}
        >
          📞 Hỗ trợ & Liên hệ
        </h1>

        {/* Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
          }}
        >
          {/* LEFT - MAP */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 15,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ marginBottom: 10 }}>📍 Vị trí chi nhánh</h3>

            <iframe
              title="map"
              src="https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed"
              style={{
                width: "100%",
                height: 350,
                border: "none",
                borderRadius: 12,
              }}
              loading="lazy"
            ></iframe>

            <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
              📌 123 Nguyễn Huệ, Quận 1, TP.HCM
            </div>
          </div>

          {/* RIGHT - CONTACT */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Hotline */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                ☎ Hotline
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1d6cf0",
                }}
              >
                0909 123 456
              </div>

              <div style={{ fontSize: 13, color: "#666" }}>
                Hỗ trợ 24/7
              </div>
            </div>

            {/* Social */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                🌐 Kết nối với chúng tôi
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href="#"
                  style={{
                    textDecoration: "none",
                    color: "#1877f2",
                    fontWeight: 600,
                  }}
                >
                  Facebook: fb.com/phongtrore
                </a>

                <a
                  href="#"
                  style={{
                    textDecoration: "none",
                    color: "#06c755",
                    fontWeight: 600,
                  }}
                >
                  Zalo: 0909 123 456
                </a>

                <a
                  href="mailto:support@phongtrore.com"
                  style={{
                    textDecoration: "none",
                    color: "#1a2236",
                    fontWeight: 600,
                  }}
                >
                  Email: support@phongtrore.com
                </a>
              </div>
            </div>

            {/* Note */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                fontSize: 14,
                color: "#555",
              }}
            >
              💬 Nếu bạn gặp sự cố khi thuê phòng, thanh toán hoặc cần hỗ trợ
              nhanh, hãy liên hệ hotline hoặc nhắn Zalo để được xử lý ngay.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}