import React, { useState, useEffect } from "react";

export default function EnhancedNewsPage() {
  const news = [
    {
      id: 1,
      title: "Dự báo giá phòng trọ 2026 tăng nhẹ tại khu vực trung tâm TP.HCM",
      desc: "Theo khảo sát mới nhất, giá phòng trọ khu vực trung tâm tăng từ 5-10% do nhu cầu đổ về thành phố sau Tết tăng vọt.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop",
      date: "09/04/2026",
      category: "Thị trường",
      readTime: "5 phút",
      isFeatured: true,
    },
    {
      id: 2,
      title: "Top 5 khu vực thuê phòng giá rẻ, an ninh tốt cho tân sinh viên",
      desc: "Các khu vực lân cận Làng Đại học, Gò Vấp và Quận 9 vẫn là lựa chọn hàng đầu với mức giá hợp lý và tiện ích đầy đủ.",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
      date: "08/04/2026",
      category: "Cẩm nang",
      readTime: "3 phút",
      isFeatured: true,
    },
    {
      id: 3,
      title: "Xu hướng 'Sleepbox' cao cấp: Giải pháp cho người độc thân",
      desc: "Mô hình hộp ngủ phiên bản nâng cấp với đầy đủ tiện nghi khép kín đang thu hút giới văn phòng trẻ tuổi.",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop",
      date: "07/04/2026",
      category: "Xu hướng",
      readTime: "4 phút",
      isFeatured: true,
    },
    {
      id: 4,
      title: "Kinh nghiệm đàm phán giá thuê nhà nguyên căn để ở ghép",
      desc: "Những mẹo nhỏ giúp bạn thương lượng được mức giá tốt nhất khi thuê nhà nguyên căn và chia phòng.",
      image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1000&auto=format&fit=crop",
      date: "06/04/2026",
      category: "Kinh nghiệm",
      readTime: "6 phút",
      isFeatured: false,
    },
    {
      id: 5,
      title: "Cẩn thận với những chiêu trò lừa đảo cọc phòng trọ đầu năm",
      desc: "Nhiều đối tượng lợi dụng nhu cầu tìm trọ cao điểm để thực hiện các hành vi lừa đảo tinh vi.",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop",
      date: "05/04/2026",
      category: "Cảnh báo",
      readTime: "8 phút",
      isFeatured: false,
    },
    {
      id: 6,
      title: "Cải tạo phòng trọ 15m2 cũ thành 'Studio' chuẩn Hàn Quốc",
      desc: "Chỉ với 5 triệu đồng, cô gái trẻ đã biến căn phòng trọ xập xệ thành không gian sống cực chill.",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop",
      date: "04/04/2026",
      category: "Decor",
      readTime: "4 phút",
      isFeatured: false,
    },
    {
      id: 7,
      title: "Bí quyết tiết kiệm điện nước mùa nắng nóng cho sinh viên ở trọ",
      desc: "Áp dụng ngay những mẹo nhỏ này để hóa đơn tiền điện không còn là nỗi ám ảnh mỗi tháng hè.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
      date: "03/04/2026",
      category: "Cẩm nang",
      readTime: "4 phút",
      isFeatured: false,
    },
    {
      id: 8,
      title: "Đánh giá chi tiết khu vực trọ quanh Đại học Bách Khoa TP.HCM",
      desc: "Phân tích ưu nhược điểm, mức giá trung bình và các tiện ích xung quanh khu vực Quận 10 và Tân Bình.",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
      date: "02/04/2026",
      category: "Thị trường",
      readTime: "7 phút",
      isFeatured: false,
    },
    {
      id: 9,
      title: "5 điều khoản 'bắt buộc phải có' trong hợp đồng thuê phòng",
      desc: "Đừng vội đặt bút ký nếu hợp đồng thuê nhà của bạn chưa có đầy đủ các điều khoản bảo vệ quyền lợi này.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop",
      date: "01/04/2026",
      category: "Kinh nghiệm",
      readTime: "6 phút",
      isFeatured: false,
    },
  ];

  const featuredNews = news.filter((item) => item.isFeatured);
  const standardNews = news.filter((item) => !item.isFeatured);
  const categories = ["Tất cả", "Thị trường", "Cẩm nang", "Xu hướng", "Kinh nghiệm", "Decor", "Cảnh báo"];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === featuredNews.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [featuredNews.length]);

  const displayedStandardNews = activeCategory === "Tất cả"
    ? standardNews
    : standardNews.filter(item => item.category === activeCategory);

  return (
    <main className="news-page">
      <style>{`
        .news-page {
          min-height: 100vh;
          background: #fffaf5;
          font-family: "Times New Roman", Times, serif;
          color: #2f241d;
        }

        .news-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 34px 24px 56px;
        }

        .news-slider {
          position: relative;
          height: 420px;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid #eadfd4;
          box-shadow: 0 10px 26px rgba(72,45,25,.12);
          margin-bottom: 28px;
          background: #f2ebe5;
        }

        .news-slide {
          position: absolute;
          inset: 0;
          transition: opacity .75s ease;
        }

        .news-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .news-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(47,36,29,.88), rgba(47,36,29,.28), transparent);
        }

        .news-slide-content {
          position: absolute;
          left: 36px;
          right: 36px;
          bottom: 34px;
          color: #fff;
          max-width: 760px;
          text-align: left;
        }

        .news-tag {
          display: inline-block;
          background: #df7a35;
          color: #fff;
          border-radius: 5px;
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .news-slide-content h2 {
          margin: 0 0 10px;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 700;
        }

        .news-slide-content p {
          margin: 0 0 14px;
          font-size: 16px;
          line-height: 1.55;
          color: #f4e7dc;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: #eadfd4;
          font-size: 14px;
        }

        .news-dots {
          position: absolute;
          right: 36px;
          bottom: 34px;
          z-index: 5;
          display: flex;
          gap: 7px;
        }

        .news-dot {
          height: 7px;
          border-radius: 4px;
          background: rgba(255,255,255,.45);
          cursor: pointer;
          transition: width .2s, background .2s;
        }

        .news-dot.active {
          width: 24px;
          background: #fff;
        }

        .news-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 26px;
        }

        .news-categories button {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 8px 14px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .news-categories button.active {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .news-main {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        .news-heading {
          margin: 0 0 18px;
          font-size: 24px;
          color: #2f241d;
          font-weight: 700;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }

        .news-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
          transition: transform .18s, box-shadow .18s, border-color .18s;
          text-align: left;
        }

        .news-card:hover {
          transform: translateY(-2px);
          border-color: #e5c4a8;
          box-shadow: 0 8px 22px rgba(102,64,35,.10);
        }

        .news-card-img {
          height: 190px;
          position: relative;
          overflow: hidden;
          background: #f2ebe5;
        }

        .news-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .35s;
        }

        .news-card:hover img {
          transform: scale(1.035);
        }

        .news-card-category {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #fff;
          color: #b85618;
          border: 1px solid #f0d8bd;
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 700;
        }

        .news-card-body {
          padding: 16px;
        }

        .news-card-date {
          color: #8b7665;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .news-card h4 {
          color: #2f241d;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 9px;
        }

        .news-card p {
          color: #6f5f52;
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
        }

        .news-sidebar {
          position: sticky;
          top: 104px;
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 18px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .news-sidebar h3 {
          margin: 0 0 16px;
          color: #2f241d;
          font-size: 20px;
          font-weight: 700;
        }

        .news-trending {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0e4d8;
          cursor: pointer;
        }

        .news-trending:last-child {
          border-bottom: 0;
        }

        .news-number {
          color: #d7c5b4;
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          min-width: 34px;
        }

        .news-trending-title {
          color: #2f241d;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 5px;
        }

        .news-trending:hover .news-trending-title {
          color: #c96523;
        }

        .news-trending-meta {
          color: #8b7665;
          font-size: 13px;
        }

        .news-banner {
          margin-top: 22px;
          background: #fff0dc;
          border: 1px solid #f0d8bd;
          border-radius: 8px;
          padding: 18px;
          text-align: center;
        }

        .news-banner h4 {
          margin: 0 0 6px;
          font-size: 18px;
          color: #2f241d;
        }

        .news-banner p {
          margin: 0 0 14px;
          color: #6f5f52;
          font-size: 14px;
        }

        .news-banner button {
          border: 0;
          background: #df7a35;
          color: #fff;
          border-radius: 6px;
          padding: 9px 18px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 960px) {
          .news-main {
            grid-template-columns: 1fr;
          }

          .news-sidebar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .news-wrap {
            padding: 24px 14px 42px;
          }

          .news-slider {
            height: 360px;
          }

          .news-slide-content {
            left: 18px;
            right: 18px;
            bottom: 24px;
          }

          .news-slide-content h2 {
            font-size: 25px;
          }

          .news-dots {
            left: 18px;
            right: auto;
            bottom: 12px;
          }
        }
      `}</style>

      <div className="news-wrap">
        <div className="news-slider">
          {featuredNews.map((slide, index) => (
            <div
              key={slide.id}
              className="news-slide"
              style={{
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img src={slide.image} alt={slide.title} />
              <div className="news-shade" />
              <div className="news-slide-content">
                <span className="news-tag">Tâm điểm · {slide.category}</span>
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
                <div className="news-meta">
                  <span>{slide.date}</span>
                  <span>{slide.readTime}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="news-dots">
            {featuredNews.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`news-dot ${idx === currentSlide ? 'active' : ''}`}
                style={{ width: idx === currentSlide ? 24 : 8 }}
              />
            ))}
          </div>
        </div>

        <div className="news-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={activeCategory === cat ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="news-main">
          <div>
            <h3 className="news-heading">
              {activeCategory === "Tất cả" ? "Tin tức mới nhất" : `Chuyên mục: ${activeCategory}`}
            </h3>

            <div className="news-grid">
              {displayedStandardNews.length > 0 ? (
                displayedStandardNews.map((item) => (
                  <article key={item.id} className="news-card">
                    <div className="news-card-img">
                      <img src={item.image} alt={item.title} />
                      <div className="news-card-category">{item.category}</div>
                    </div>
                    <div className="news-card-body">
                      <div className="news-card-date">{item.date} · {item.readTime}</div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div style={{ color: "#6f5f52", padding: "20px 0" }}>
                  Chưa có bài viết nào trong chuyên mục này.
                </div>
              )}
            </div>
          </div>

          <aside className="news-sidebar">
            <h3>Đọc nhiều tuần qua</h3>

            {news.slice(0, 5).map((item, index) => (
              <div key={item.id} className="news-trending">
                <div className="news-number">0{index + 1}</div>
                <div>
                  <h5 className="news-trending-title">{item.title}</h5>
                  <div className="news-trending-meta">{item.category} · {item.date}</div>
                </div>
              </div>
            ))}

            <div className="news-banner">
              <h4>Đăng tin cho thuê?</h4>
              <p>Tiếp cận người thuê nhanh hơn với thông tin rõ ràng.</p>
              <button type="button">Đăng ngay</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
