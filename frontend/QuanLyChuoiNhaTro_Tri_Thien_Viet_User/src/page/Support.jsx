import React, { useState } from "react";

export default function SupportPage() {
  // Dữ liệu cho phần Câu hỏi thường gặp (FAQ)
  const faqs = [
    {
      id: 1,
      question: "Làm sao để tôi đăng tin cho thuê phòng?",
      answer: "Bạn cần tạo tài khoản, sau đó vào mục 'Đăng tin mới', điền đầy đủ thông tin mô tả, hình ảnh và giá cả. Tin của bạn sẽ được duyệt trong vòng 30 phút.",
    },
    {
      id: 2,
      question: "Tôi muốn báo cáo một tin đăng lừa đảo thì làm thế nào?",
      answer: "Tại mỗi bài đăng đều có nút 'Báo cáo vi phạm'. Bạn click vào đó, chọn lý do (ví dụ: Địa chỉ giả, sai giá, lừa đảo cọc) và gửi cho chúng tôi. Đội ngũ admin sẽ xử lý ngay lập tức.",
    },
    {
      id: 3,
      question: "Phí dịch vụ đẩy tin VIP được tính như thế nào?",
      answer: "Gói VIP có nhiều mức giá khác nhau tùy thuộc vào vị trí hiển thị và thời gian. Vui lòng xem chi tiết tại bảng giá dịch vụ trong trang quản lý cá nhân.",
    },
    {
      id: 4,
      question: "Làm sao để thay đổi số điện thoại liên hệ?",
      answer: "Vào phần 'Cài đặt tài khoản' -> 'Thông tin cá nhân' để cập nhật lại số điện thoại. Lưu ý bạn cần xác minh mã OTP gửi về số mới để hoàn tất.",
    },
  ];

  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  // CSS nội trú cho các hiệu ứng
  const customStyles = `
    .support-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
    .faq-item { border-bottom: 1px solid #e2e8f0; padding: 16px 0; cursor: pointer; transition: background 0.2s; }
    .faq-item:last-child { border-bottom: none; }
    .faq-question { display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: #1e293b; font-size: 16px; }
    .faq-question:hover { color: #3b82f6; }
    .contact-link { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; text-decoration: none; color: #334155; font-weight: 600; transition: background 0.2s; }
    .contact-link:hover { background: #f1f5f9; color: #1d4ed8; }
    .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  `;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{customStyles}</style>

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", padding: "60px 20px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px 0" }}>Hỗ trợ & Liên hệ</h1>
        <p style={{ fontSize: 16, maxWidth: 600, margin: "0 auto", opacity: 0.9, lineHeight: 1.5 }}>
          Cần hỗ trợ? Hãy xem qua các câu hỏi thường gặp hoặc liên hệ trực tiếp với chúng tôi qua các kênh dưới đây.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "-30px auto 40px", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 30, alignItems: "start" }}>
          
          {/* CỘT TRÁI - THÔNG TIN LIÊN HỆ & FAQ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            
            {/* Các kênh liên hệ */}
            <div className="support-card" style={{ position: "relative", zIndex: 10, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", padding: "20px 16px", borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", opacity: 0.9 }}>Hotline Hỗ trợ</div>
                  <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0" }}>1900 1234</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Hoạt động 24/7</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a href="#" className="contact-link" style={{ padding: "8px 12px" }}>
                    <div className="icon-box" style={{ background: "#e8f0fe", color: "#1a73e8", width: 36, height: 36, fontSize: 16 }}>📘</div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Fanpage</div>
                      <div style={{ fontSize: 14 }}>fb.com/thuetro</div>
                    </div>
                  </a>
                  <a href="#" className="contact-link" style={{ padding: "8px 12px" }}>
                    <div className="icon-box" style={{ background: "#e6f8ef", color: "#059669", width: 36, height: 36, fontSize: 16 }}>💬</div>
                    <div>
                      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Zalo OA</div>
                      <div style={{ fontSize: 14 }}>Hỗ trợ Thuê Trọ</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Câu hỏi thường gặp (FAQ) */}
            <div className="support-card">
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginTop: 0, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                💡 Câu hỏi thường gặp
              </h2>
              <div>
                {faqs.map((faq) => (
                  <div key={faq.id} className="faq-item" onClick={() => toggleFaq(faq.id)}>
                    <div className="faq-question">
                      {faq.question}
                      <span style={{ fontSize: 20, transform: activeFaq === faq.id ? "rotate(45deg)" : "none", transition: "transform 0.3s" }}>
                        +
                      </span>
                    </div>
                    <div style={{
                      maxHeight: activeFaq === faq.id ? "200px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.3s ease-in-out",
                      color: "#64748b",
                      fontSize: 15,
                      lineHeight: 1.5,
                      marginTop: activeFaq === faq.id ? 10 : 0
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI - BẢN ĐỒ VÀ ĐỊA CHỈ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div className="support-card" style={{ padding: 0, overflow: "hidden", position: "relative", zIndex: 10 }}>
              <div style={{ padding: "24px 24px 20px" }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#0f172a" }}>
                  📍 Vị trí văn phòng
                </h3>
                <div style={{ marginTop: 12, fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
                  <strong>Trụ sở chính:</strong> Tòa nhà ABC, 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </div>
                <div style={{ marginTop: 8, fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                  🕒 <strong>Giờ làm việc:</strong> 08:00 - 17:30 (Thứ 2 - Thứ 6)
                </div>
              </div>
              
              {/* Google Maps nhúng chuẩn, có thể hoạt động thực tế */}
              <iframe
                title="Google Map"
                src="https://maps.google.com/maps?q=123%20Nguyễn%20Huệ,%20Quận%201,%20Hồ%20Chí%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                style={{
                  width: "100%",
                  height: 400,
                  border: "none",
                  display: "block",
                  borderTop: "1px solid #f1f5f9"
                }}
                loading="lazy"
              ></iframe>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}