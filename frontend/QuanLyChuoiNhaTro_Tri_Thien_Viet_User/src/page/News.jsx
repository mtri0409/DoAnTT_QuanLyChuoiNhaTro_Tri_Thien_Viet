

export default function NewsPage() {
  const news = [
    {
      id: 1,
      title: "Giá phòng trọ 2026 tăng nhẹ tại TP.HCM",
      desc: "Theo khảo sát mới nhất, giá phòng trọ khu vực trung tâm tăng từ 5-10% so với năm ngoái.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      date: "09/04/2026",
    },
    {
      id: 2,
      title: "Top 5 khu vực thuê phòng giá rẻ cho sinh viên",
      desc: "Các khu vực gần trường đại học vẫn là lựa chọn hàng đầu với mức giá hợp lý.",
      image: "https://images.unsplash.com/photo-1507089947367-19c1da9775ae",
      date: "08/04/2026",
    },
    {
      id: 3,
      title: "Xu hướng phòng trọ full nội thất lên ngôi",
      desc: "Người thuê ngày càng ưu tiên phòng có sẵn nội thất để tiết kiệm chi phí ban đầu.",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      date: "07/04/2026",
    },
  ];

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
          📰 Tin tức phòng trọ
        </h1>

        {/* Featured */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            marginBottom: 30,
          }}
        >
          {/* Main news */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <img
              src={news[0].image}
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 20,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: 12 }}>{news[0].date}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {news[0].title}
              </div>
            </div>
          </div>

          {/* Side news */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {news.slice(1).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 12,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={item.image}
                  style={{
                    width: 100,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a2236",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {item.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
            gap: 20,
          }}
        >
          {news.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                cursor: "pointer",
              }}
            >
              <img
                src={item.image}
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: 15 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 6,
                    color: "#1a2236",
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  {item.desc}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#1d6cf0",
                    fontWeight: 600,
                  }}
                >
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}