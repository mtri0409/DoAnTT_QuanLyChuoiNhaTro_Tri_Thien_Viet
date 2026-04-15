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

  const customStyles = `
    .news-card { transition: all 0.3s ease; background: #fff; }
    .news-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; }
    .img-wrapper { overflow: hidden; border-radius: 16px 16px 0 0; }
    .news-card:hover .card-img { transform: scale(1.08); }
    .card-img { transition: transform 0.5s ease; }
    .category-btn { transition: all 0.2s ease; }
    .category-btn:hover { background: #3b82f6; color: white; }
    .slide-dot { transition: all 0.3s ease; }
    .trending-item:hover .trending-title { color: #3b82f6; }
  `;

  // Filter tin tức bên dưới dựa trên category
  const displayedStandardNews = activeCategory === "Tất cả" 
    ? standardNews 
    : standardNews.filter(item => item.category === activeCategory);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <style>{customStyles}</style>


      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        
        {/* SLIDER */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 450, marginBottom: 40, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
          {featuredNews.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                position: "absolute",
                inset: 0,
                opacity: index === currentSlide ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img src={slide.image} alt={slide.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 50%, transparent 100%)" }} />
              
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "40px 50px", color: "white", maxWidth: 800 }}>
                <span style={{ background: "#3b82f6", padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, display: "inline-block" }}>
                  Tâm điểm • {slide.category}
                </span>
                <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px 0", lineHeight: 1.3, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {slide.title}
                </h2>
                <p style={{ fontSize: 16, color: "#cbd5e1", margin: "0 0 20px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {slide.desc}
                </p>
                <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
                  <span>📅 {slide.date}</span>
                  <span>⏱ {slide.readTime}</span>
                </div>
              </div>
            </div>
          ))}

          <div style={{ position: "absolute", bottom: 40, right: 50, zIndex: 10, display: "flex", gap: 8 }}>
            {featuredNews.map((_, idx) => (
              <div
                key={idx}
                className="slide-dot"
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: idx === currentSlide ? "#3b82f6" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {/* BỘ LỌC CATEGORY */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, overflowX: "auto", paddingBottom: 10 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className="category-btn"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "10px 24px",
                borderRadius: 100,
                border: "none",
                background: activeCategory === cat ? "#1e40af" : "#fff",
                color: activeCategory === cat ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                whiteSpace: "nowrap"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 40 }}>
          
          {/* LƯỚI TIN TỨC MỚI */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {activeCategory === "Tất cả" ? "Tin tức mới nhất" : `Chuyên mục: ${activeCategory}`}
              </h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {displayedStandardNews.length > 0 ? (
                displayedStandardNews.map((item) => (
                  <div key={item.id} className="news-card" style={{ borderRadius: 16, border: "1px solid #e2e8f0", cursor: "pointer" }}>
                    <div className="img-wrapper" style={{ height: 200, position: "relative" }}>
                      <img className="card-img" src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#1e40af" }}>
                        {item.category}
                      </div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>{item.date} • {item.readTime}</div>
                      <h4 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0", lineHeight: 1.4 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748b", padding: "20px 0" }}>Chưa có bài viết nào trong chuyên mục này.</div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", position: "sticky", top: 100 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
                🔥 Đọc nhiều tuần qua
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {news.slice(0, 5).map((item, index) => (
                  <div key={item.id} className="trending-item" style={{ display: "flex", gap: 16, cursor: "pointer" }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#e2e8f0", lineHeight: 1 }}>
                      0{index + 1}
                    </div>
                    <div>
                      <h5 className="trending-title" style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0", transition: "color 0.2s" }}>
                        {item.title}
                      </h5>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{item.category} • {item.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner */}
              <div style={{ marginTop: 32, height: 200, borderRadius: 12, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", padding: 20, textAlign: "center", flexDirection: "column" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Đăng tin cho thuê?</h4>
                <p style={{ margin: "0 0 16px 0", fontSize: 13, opacity: 0.9 }}>Tiếp cận 100.000+ sinh viên mỗi ngày</p>
                <button style={{ background: "white", color: "#1e40af", border: "none", padding: "8px 20px", borderRadius: 20, fontWeight: 700, cursor: "pointer" }}>
                  Đăng ngay
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}