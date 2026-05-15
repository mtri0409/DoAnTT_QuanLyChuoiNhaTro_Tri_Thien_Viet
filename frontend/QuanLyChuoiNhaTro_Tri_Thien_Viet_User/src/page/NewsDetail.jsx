import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../services/userService";
import { imgURL } from "../services/userConfig";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop";

const buildImageUrl = url => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;

  const base = imgURL.endsWith("/") ? imgURL.slice(0, -1) : imgURL;
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${base}${path}`;
};

const formatDate = value => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
};

const getImages = post => {
  const images =
    post?.images ??
    post?.postImages ??
    post?.post_images ??
    post?.postImage ??
    [];

  return Array.isArray(images) ? images : [];
};

const getPrimaryImage = post => {
  const images = getImages(post);

  if (images.length > 0) {
    const primary = images.find(
      image => image.isPrimary === true || image.is_primary === true
    );

    const imageUrl =
      primary?.imageUrl ??
      primary?.image_url ??
      images[0]?.imageUrl ??
      images[0]?.image_url;

    return buildImageUrl(imageUrl);
  }

  return buildImageUrl(post?.thumbnailUrl ?? post?.thumbnail_url);
};

export default function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    userService
      .getNewsPostBySlug(slug)
      .then(res => {
        if (!active) return;

        setPost(res || null);
        setError(null);
      })
      .catch(err => {
        if (!active) return;

        console.error("Fetch news detail error:", err);
        setPost(null);
        setError("Không thể tải chi tiết bài viết. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) {
          setLoadingDetail(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const galleryImages = useMemo(() => {
    return getImages(post)
      .sort(
        (a, b) =>
          (a.displayOrder ?? a.display_order ?? 0) -
          (b.displayOrder ?? b.display_order ?? 0)
      )
      .map(image => ({
        ...image,
        fullUrl: buildImageUrl(image.imageUrl ?? image.image_url),
      }));
  }, [post]);

  const handleRetry = () => {
    setLoadingDetail(true);
    setError(null);

    userService
      .getNewsPostBySlug(slug)
      .then(res => {
        setPost(res || null);
        setError(null);
      })
      .catch(err => {
        console.error("Fetch news detail error:", err);
        setPost(null);
        setError("Không thể tải chi tiết bài viết. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  };

  return (
    <main className="news-detail-page">
      <style>{`
        .news-detail-page {
          min-height: 100vh;
          background: #fffaf5;
          font-family: "Times New Roman", Times, serif;
          color: #2f241d;
        }

        .news-detail-wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 34px 24px 56px;
        }

        .news-detail-back {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 8px 14px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 18px;
        }

        .news-detail-back:hover {
          background: #fff0dc;
          border-color: #df7a35;
          color: #b85618;
        }

        .news-detail-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 26px rgba(72,45,25,.10);
        }

        .news-detail-hero {
          height: 430px;
          position: relative;
          background: #f2ebe5;
          overflow: hidden;
        }

        .news-detail-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .news-detail-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(47,36,29,.86), rgba(47,36,29,.24), transparent);
        }

        .news-detail-hero-content {
          position: absolute;
          left: 34px;
          right: 34px;
          bottom: 32px;
          color: #fff;
          max-width: 820px;
        }

        .news-detail-tag {
          display: inline-block;
          background: #df7a35;
          color: #fff;
          border-radius: 5px;
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .news-detail-title {
          margin: 0 0 12px;
          font-size: 38px;
          line-height: 1.24;
          font-weight: 700;
        }

        .news-detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: #eadfd4;
          font-size: 14px;
          font-weight: 600;
        }

        .news-detail-body {
          padding: 28px 34px 34px;
        }

        .news-detail-summary {
          margin: 0 0 22px;
          padding: 16px 18px;
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          border-radius: 8px;
          color: #6f5f52;
          font-size: 18px;
          line-height: 1.65;
          font-weight: 700;
        }

        .news-detail-content {
          color: #3f3027;
          font-size: 18px;
          line-height: 1.8;
          white-space: pre-line;
        }

        .news-detail-gallery {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #f0e4d8;
        }

        .news-detail-gallery h3 {
          margin: 0 0 14px;
          color: #2f241d;
          font-size: 22px;
          font-weight: 700;
        }

        .news-detail-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        .news-detail-gallery-item {
          height: 170px;
          border-radius: 8px;
          overflow: hidden;
          background: #f2ebe5;
          border: 1px solid #eadfd4;
        }

        .news-detail-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .news-detail-info {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid #f0e4d8;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .news-detail-info-item {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          border-radius: 7px;
          padding: 12px 14px;
        }

        .news-detail-info-label {
          color: #8b7665;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .news-detail-info-value {
          color: #2f241d;
          font-size: 16px;
          font-weight: 700;
        }

        .news-detail-empty,
        .news-detail-error,
        .news-detail-skeleton {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 42px 20px;
          text-align: center;
          color: #6f5f52;
          font-size: 16px;
        }

        .news-detail-error p,
        .news-detail-empty p {
          margin: 0 0 14px;
          font-weight: 700;
        }

        .news-detail-retry {
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

        .news-detail-skeleton {
          height: 520px;
          background: linear-gradient(90deg,#f8f1ea 25%,#efe3d8 50%,#f8f1ea 75%);
          background-size: 200% 100%;
          animation: news-detail-shimmer 1.4s infinite;
        }

        @keyframes news-detail-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 700px) {
          .news-detail-wrap {
            padding: 24px 14px 42px;
          }

          .news-detail-hero {
            height: 360px;
          }

          .news-detail-hero-content {
            left: 18px;
            right: 18px;
            bottom: 24px;
          }

          .news-detail-title {
            font-size: 27px;
          }

          .news-detail-body {
            padding: 22px 18px 26px;
          }

          .news-detail-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="news-detail-wrap">
        <button
          type="button"
          className="news-detail-back"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>

        {loadingDetail && <div className="news-detail-skeleton" />}

        {!loadingDetail && error && (
          <div className="news-detail-error">
            <p>{error}</p>
            <button type="button" onClick={handleRetry} className="news-detail-retry">
              Thử lại
            </button>
          </div>
        )}

        {!loadingDetail && !error && !post && (
          <div className="news-detail-empty">
            <p>Không tìm thấy bài viết.</p>
          </div>
        )}

        {!loadingDetail && !error && post && (
          <article className="news-detail-card">
            <div className="news-detail-hero">
              <img
                src={getPrimaryImage(post)}
                alt={post.title}
                onError={e => {
                  e.currentTarget.src = DEFAULT_IMAGE;
                }}
              />

              <div className="news-detail-shade" />

              <div className="news-detail-hero-content">
                <span className="news-detail-tag">
                  {post.type === "BANNER" ? "Tâm điểm" : "Tin tức"} ·{" "}
                  {post.category?.name ?? "Tin tức"}
                </span>

                <h1 className="news-detail-title">{post.title}</h1>

                <div className="news-detail-meta">
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                  <span>Tác giả: {post.authorName ?? "Admin"}</span>
                  <span>5 phút đọc</span>
                </div>
              </div>
            </div>

            <div className="news-detail-body">
              {post.summary && (
                <p className="news-detail-summary">{post.summary}</p>
              )}

              <div className="news-detail-content">
                {post.content ?? "Bài viết chưa có nội dung."}
              </div>

              {galleryImages.length > 1 && (
                <div className="news-detail-gallery">
                  <h3>Hình ảnh bài viết</h3>

                  <div className="news-detail-gallery-grid">
                    {galleryImages.map(image => (
                      <div
                        key={image.imageId ?? image.imageUrl}
                        className="news-detail-gallery-item"
                      >
                        <img
                          src={image.fullUrl}
                          alt={image.altText ?? post.title}
                          onError={e => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="news-detail-info">
                <div className="news-detail-info-item">
                  <div className="news-detail-info-label">Danh mục</div>
                  <div className="news-detail-info-value">
                    {post.category?.name ?? "Tin tức"}
                  </div>
                </div>

                <div className="news-detail-info-item">
                  <div className="news-detail-info-label">Trạng thái</div>
                  <div className="news-detail-info-value">
                    {post.publishStatus ?? "PUBLISHED"}
                  </div>
                </div>

                <div className="news-detail-info-item">
                  <div className="news-detail-info-label">Ngày đăng</div>
                  <div className="news-detail-info-value">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </div>
                </div>

                <div className="news-detail-info-item">
                  <div className="news-detail-info-label">Tác giả</div>
                  <div className="news-detail-info-value">
                    {post.authorName ?? "Admin"}
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}