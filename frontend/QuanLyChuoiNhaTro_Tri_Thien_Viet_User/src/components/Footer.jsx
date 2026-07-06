export default function Footer() {
  const branches = [
    "Quận 1 - Trung tâm",
    "Quận 7 - Phú Mỹ Hưng",
    "Bình Thạnh",
    "Thủ Đức - ĐH Quốc Gia",
    "Gò Vấp",
    "Tân Bình - Gần Sân Bay",
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

  const socials = ["Facebook", "Zalo", "Gmail", "YouTube", "TikTok"];

  return (
    <footer className="site-footer">
      <style>{`
        .site-footer {
          margin-top: 48px;
          background: #fff8f0;
          border-top: 1px solid #eadfd4;
          color: #6f5f52;
          font-family: inherit;
        }

        .site-footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 22px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 32px;
        }

        .site-footer-brand {
          color: #2f241d;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .site-footer-brand span {
          color: #d86622;
        }

        .site-footer p {
          font-size: 13px;
          line-height: 1.7;
          margin: 0 0 14px;
        }

        .site-footer-social {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .site-footer-social a,
        .site-footer a {
          color: #6f5f52;
          text-decoration: none;
        }

        .site-footer-social a {
          border: 1px solid #eadfd4;
          border-radius: 6px;
          background: #fff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .site-footer-social a:hover,
        .site-footer a:hover {
          color: #c96523;
        }

        .site-footer h5 {
          margin: 0 0 14px;
          color: #3c2d23;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .site-footer-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          font-size: 13px;
        }

        .site-footer ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .site-footer-contact {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
          line-height: 1.45;
        }

        .site-footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 24px;
          border-top: 1px solid #eadfd4;
          text-align: center;
          font-size: 12px;
          color: #9a8776;
        }

        @media (max-width: 980px) {
          .site-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .site-footer-grid {
            grid-template-columns: 1fr;
            padding: 32px 16px 18px;
          }

          .site-footer-bottom {
            padding: 14px 16px;
          }
        }
      `}</style>

      <div className="site-footer-grid">
        <div>
          <div className="site-footer-brand">
            Phòng Trọ <span>Rẻ</span>
          </div>
          <p>
            Nền tảng tìm kiếm phòng trọ tại TP.HCM với thông tin rõ ràng,
            thao tác nhanh và trải nghiệm dễ dùng cho người thuê.
          </p>
          <div className="site-footer-social">
            {socials.map((item) => (
              <a key={item} href="#">
                {item}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5>Chi nhánh</h5>
          <div className="site-footer-list">
            {branches.map((branch) => (
              <span key={branch}>{branch}</span>
            ))}
          </div>
        </div>

        <div>
          <h5>Thông tin</h5>
          <ul className="site-footer-list">
            {infoLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5>Liên hệ</h5>
          <div className="site-footer-contact">
            <span>Hotline: 0901 234 567</span>
            <span>Zalo OA: Phòng Trọ Rẻ</span>
            <span>Email: lbin373@gmail.com</span>
            <span>Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM</span>
            <span>Thời gian: 7:00 - 22:00, Thứ 2 - Chủ nhật</span>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        © 2026 Phòng Trọ Rẻ. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
}
