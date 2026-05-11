import React, { useState } from "react";

export default function SupportPage() {
  const faqs = [
    {
      id: 1,
      question: "Làm sao để tôi đăng tin cho thuê phòng?",
      answer: "Bạn cần tạo tài khoản, sau đó vào mục 'Đăng tin mới', điền đầy đủ thông tin mô tả, hình ảnh và giá cả. Tin của bạn sẽ được duyệt trong vòng 30 phút.",
    },
    {
      id: 2,
      question: "Tôi muốn báo cáo một tin đăng lừa đảo thì làm thế nào?",
      answer: "Tại mỗi bài đăng đều có nút 'Báo cáo vi phạm'. Bạn click vào đó, chọn lý do và gửi cho chúng tôi. Đội ngũ admin sẽ xử lý ngay lập tức.",
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

  return (
    <main className="support-page">
      <style>{`
        .support-page {
          min-height: 100vh;
          background: #fffaf5;
          color: #2f241d;
          font-family: "Times New Roman", Times, serif;
        }

        .support-hero {
          background: #fff0dc;
          border-bottom: 1px solid #f0d8bd;
          padding: 46px 20px;
          text-align: center;
        }

        .support-hero h1 {
          margin: 0 0 10px;
          color: #2f241d;
          font-size: 36px;
          font-weight: 700;
        }

        .support-hero p {
          margin: 0 auto;
          max-width: 640px;
          color: #6f5f52;
          font-size: 17px;
          line-height: 1.55;
        }

        .support-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 24px 48px;
        }

        .support-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .support-stack {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .support-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .support-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .support-hotline {
          background: #fff0dc;
          border: 1px solid #f0d8bd;
          color: #2f241d;
          padding: 18px;
          border-radius: 8px;
        }

        .support-hotline-label {
          color: #8b7665;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .support-hotline-number {
          color: #c96523;
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .support-link-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .support-contact-link {
          display: block;
          border: 1px solid #eadfd4;
          background: #fff;
          border-radius: 6px;
          padding: 10px 12px;
          text-decoration: none;
          color: #2f241d;
        }

        .support-contact-link:hover {
          background: #fff4ea;
          color: #b85618;
        }

        .support-contact-link small {
          display: block;
          color: #8b7665;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .support-card h2,
        .support-card h3 {
          margin: 0 0 14px;
          color: #2f241d;
          font-size: 22px;
          font-weight: 700;
        }

        .faq-item {
          border-bottom: 1px solid #f0e4d8;
          padding: 15px 0;
          cursor: pointer;
        }

        .faq-item:last-child {
          border-bottom: 0;
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          color: #2f241d;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.35;
        }

        .faq-question:hover {
          color: #c96523;
        }

        .faq-toggle {
          color: #c96523;
          font-size: 20px;
          line-height: 1;
          transition: transform .22s;
        }

        .faq-answer {
          overflow: hidden;
          transition: max-height .25s ease, margin-top .25s ease;
          color: #6f5f52;
          font-size: 16px;
          line-height: 1.55;
        }

        .support-address {
          color: #6f5f52;
          font-size: 16px;
          line-height: 1.6;
        }

        .support-address strong {
          color: #2f241d;
        }

        .support-map {
          width: 100%;
          height: 390px;
          border: none;
          display: block;
          border-top: 1px solid #eadfd4;
        }

        @media (max-width: 860px) {
          .support-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .support-hero {
            padding: 34px 16px;
          }

          .support-hero h1 {
            font-size: 30px;
          }

          .support-wrap {
            padding: 22px 14px 40px;
          }

          .support-contact-grid {
            grid-template-columns: 1fr;
          }

          .support-map {
            height: 320px;
          }
        }
      `}</style>

      <section className="support-hero">
        <h1>Hỗ trợ và liên hệ</h1>
        <p>
          Cần hỗ trợ? Hãy xem các câu hỏi thường gặp hoặc liên hệ trực tiếp với chúng tôi qua các kênh bên dưới.
        </p>
      </section>

      <div className="support-wrap">
        <div className="support-grid">
          <div className="support-stack">
            <div className="support-card">
              <div className="support-contact-grid">
                <div className="support-hotline">
                  <div className="support-hotline-label">Hotline hỗ trợ</div>
                  <div className="support-hotline-number">1900 1234</div>
                  <div style={{ color: '#8b7665', fontSize: 14 }}>Hoạt động 24/7</div>
                </div>

                <div className="support-link-list">
                  <a href="#" className="support-contact-link">
                    <small>Fanpage</small>
                    fb.com/thuetro
                  </a>
                  <a href="#" className="support-contact-link">
                    <small>Zalo OA</small>
                    Hỗ trợ Thuê Trọ
                  </a>
                </div>
              </div>
            </div>

            <div className="support-card">
              <h2>Câu hỏi thường gặp</h2>

              {faqs.map((faq) => (
                <div key={faq.id} className="faq-item" onClick={() => toggleFaq(faq.id)}>
                  <div className="faq-question">
                    <span>{faq.question}</span>
                    <span
                      className="faq-toggle"
                      style={{ transform: activeFaq === faq.id ? 'rotate(45deg)' : 'none' }}
                    >
                      +
                    </span>
                  </div>

                  <div
                    className="faq-answer"
                    style={{
                      maxHeight: activeFaq === faq.id ? '220px' : '0',
                      marginTop: activeFaq === faq.id ? 10 : 0,
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="support-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 20 }}>
              <h3>Vị trí văn phòng</h3>
              <div className="support-address">
                <div>
                  <strong>Trụ sở chính:</strong> Tòa nhà ABC, 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Giờ làm việc:</strong> 08:00 - 17:30, Thứ 2 - Thứ 6
                </div>
              </div>
            </div>

            <iframe
              title="Google Map"
              src="https://maps.google.com/maps?q=123%20Nguyễn%20Huệ,%20Quận%201,%20Hồ%20Chí%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="support-map"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
