import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import userService from "../services/userService";
import { imgURL } from "../services/userConfig";

const FETCH_SIZE = 100;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop";

const getContent = (res) => {
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  if (Array.isArray(res)) return res;

  return [];
};

const buildImageUrl = (url) => {
  console.log("Building image URL for:", url);
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;

  const base = imgURL.endsWith("/") ? imgURL.slice(0, -1) : imgURL;
  const path = url.startsWith("/") ? url : `/${url}`;
  console.log("Building image URL:", { base, path });
  return `${base}${path}`;
};

const getImage = (item) => {
  return buildImageUrl(
    item.thumbnailUrl ??
      item.thumbnail_url ??
      item.imageUrl ??
      item.image_url ??
      item.image,
  );
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
};

export default function NewsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      userService.getNewsPosts({
        pageNumber: 1,
        pageSize: FETCH_SIZE,
        type: "BANNER",
      }),
      userService.getNewsPosts({
        pageNumber: 1,
        pageSize: FETCH_SIZE,
        type: "ARTICLE",
      }),
      userService.getNewsCategories(),
    ])
      .then(([bannerRes, articleRes, categoryRes]) => {
        if (!active) return;

        console.log("RAW BANNER RES:", bannerRes);
        console.log("RAW ARTICLE RES:", articleRes);
        console.log("RAW CATEGORY RES:", categoryRes);

        const bannerData = getContent(bannerRes);
        const articleData = getContent(articleRes);
        const categoryData = getContent(categoryRes);

        console.log("NEWS BANNERS:", bannerData);
        console.log("NEWS ARTICLES:", articleData);
        console.log("NEWS CATEGORIES:", categoryData);

        setBanners(bannerData);
        setArticles(articleData);
        setCategories(
          categoryData
            .filter((category) => category.active !== false)
            .sort(
              (a, b) =>
                (a.displayOrder ?? a.display_order ?? 0) -
                (b.displayOrder ?? b.display_order ?? 0),
            ),
        );

        setError(null);
      })
      .catch((err) => {
        if (!active) return;

        console.error("Fetch news error:", err);
        setBanners([]);
        setArticles([]);
        setCategories([]);
        setError("Không thể tải tin tức. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) {
          setLoadingNews(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        return next >= banners.length ? 0 : next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const activeCategory = useMemo(() => {
    if (!slug) return null;

    return categories.find((category) => category.slug === slug) ?? null;
  }, [slug, categories]);

  const displayedArticles = useMemo(() => {
    if (!activeCategory) return articles;

    return articles.filter((article) => {
      if (article.categorySlug) {
        return article.categorySlug === activeCategory.slug;
      }

      if (article.categoryId) {
        return String(article.categoryId) === String(activeCategory.categoryId);
      }

      return false;
    });
  }, [articles, activeCategory]);

  const trendingArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => {
        if ((a.pinned ?? false) !== (b.pinned ?? false)) {
          return a.pinned ? -1 : 1;
        }

        const dateA = new Date(a.publishedAt ?? a.createdAt ?? 0).getTime();
        const dateB = new Date(b.publishedAt ?? b.createdAt ?? 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [articles]);

  const safeCurrentSlide = banners.length
    ? Math.min(currentSlide, banners.length - 1)
    : 0;

  const handleCategoryChange = (category) => {
    if (!category) {
      navigate("/tin-tuc");
      return;
    }

    navigate(`/tin-tuc/danh-muc/${category.slug}`);
  };

  const handleRetry = () => {
    setLoadingNews(true);
    setError(null);

    Promise.all([
      userService.getNewsPosts({
        pageNumber: 1,
        pageSize: FETCH_SIZE,
        type: "BANNER",
      }),
      userService.getNewsPosts({
        pageNumber: 1,
        pageSize: FETCH_SIZE,
        type: "ARTICLE",
      }),
      userService.getNewsCategories(),
    ])
      .then(([bannerRes, articleRes, categoryRes]) => {
        setBanners(getContent(bannerRes));
        setArticles(getContent(articleRes));
        setCategories(
          getContent(categoryRes)
            .filter((category) => category.active !== false)
            .sort(
              (a, b) =>
                (a.displayOrder ?? a.display_order ?? 0) -
                (b.displayOrder ?? b.display_order ?? 0),
            ),
        );
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch news error:", err);
        setBanners([]);
        setArticles([]);
        setCategories([]);
        setError("Không thể tải tin tức. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoadingNews(false);
      });
  };

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

        .news-banner button,
        .news-retry-btn {
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

        .news-empty,
        .news-error {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 32px 20px;
          color: #6f5f52;
          font-size: 16px;
          text-align: center;
        }

        .news-error p,
        .news-empty p {
          margin: 0 0 14px;
          font-weight: 700;
        }

        .news-skeleton {
          min-height: 190px;
          border-radius: 8px;
          border: 1px solid #eadfd4;
          background: linear-gradient(90deg,#f8f1ea 25%,#efe3d8 50%,#f8f1ea 75%);
          background-size: 200% 100%;
          animation: news-shimmer 1.4s infinite;
        }

        @keyframes news-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
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
        {loadingNews && <div className="news-slider news-skeleton" />}

        {!loadingNews && error && (
          <div className="news-error" style={{ marginBottom: 28 }}>
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="news-retry-btn"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loadingNews && !error && banners.length > 0 && (
          <div className="news-slider">
            {banners.map((slide, index) => (
              <div
                key={slide.postId}
                className="news-slide"
                onClick={() => navigate(`/tin-tuc/${slide.slug}`)}
                style={{
                  opacity: index === safeCurrentSlide ? 1 : 0,
                  zIndex: index === safeCurrentSlide ? 1 : 0,
                }}
              >
                <img
                  src={getImage(slide)}
                  alt={slide.title || "Banner tin tức"}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />

                <div className="news-shade" />

                <div className="news-slide-content">
                  <span className="news-tag">
                    Tâm điểm · {slide.categoryName ?? "Tin tức"}
                  </span>

                  <h2>{slide.title}</h2>

                  <p>
                    {slide.summary ??
                      "Khám phá thông tin mới nhất về phòng trọ."}
                  </p>

                  <div className="news-meta">
                    <span>
                      {formatDate(slide.publishedAt ?? slide.createdAt)}
                    </span>
                    <span>5 phút</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="news-dots">
              {banners.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`news-dot ${idx === safeCurrentSlide ? "active" : ""}`}
                  style={{ width: idx === safeCurrentSlide ? 24 : 8 }}
                />
              ))}
            </div>
          </div>
        )}

        {!loadingNews && !error && banners.length === 0 && (
          <div className="news-empty" style={{ marginBottom: 28 }}>
            <p>Chưa có banner tin tức.</p>
          </div>
        )}

        <div className="news-categories">
          <button
            type="button"
            className={!activeCategory ? "active" : ""}
            onClick={() => handleCategoryChange(null)}
          >
            Tất cả
          </button>

          {categories.map((category) => (
            <button
              key={category.categoryId}
              type="button"
              className={activeCategory?.slug === category.slug ? "active" : ""}
              onClick={() => handleCategoryChange(category)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="news-main">
          <div>
            <h3 className="news-heading">
              {!activeCategory
                ? "Tin tức mới nhất"
                : `Chuyên mục: ${activeCategory.name}`}
            </h3>

            {loadingNews && (
              <div className="news-grid">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="news-skeleton" />
                ))}
              </div>
            )}

            {!loadingNews && !error && (
              <div className="news-grid">
                {displayedArticles.length > 0 ? (
                  displayedArticles.map((item) => (
                    <NewsCard key={item.postId} item={item} />
                  ))
                ) : (
                  <div style={{ color: "#6f5f52", padding: "20px 0" }}>
                    Chưa có bài viết nào trong chuyên mục này.
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="news-sidebar">
            <h3>Đọc nhiều tuần qua</h3>

            {loadingNews && (
              <>
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="news-skeleton"
                    style={{ minHeight: 62, marginBottom: 10 }}
                  />
                ))}
              </>
            )}

            {!loadingNews && !error && trendingArticles.length > 0 && (
              <>
                {trendingArticles.map((item, index) => (
                  <div
                    key={item.postId}
                    className="news-trending"
                    onClick={() => navigate(`/tin-tuc/${item.slug}`)}
                  >
                    <div className="news-number">0{index + 1}</div>

                    <div>
                      <h5 className="news-trending-title">{item.title}</h5>
                      <div className="news-trending-meta">
                        {item.categoryName ?? "Tin tức"} ·{" "}
                        {formatDate(item.publishedAt ?? item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {!loadingNews && !error && trendingArticles.length === 0 && (
              <div style={{ color: "#6f5f52", fontSize: 14 }}>
                Chưa có bài viết nổi bật.
              </div>
            )}

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
