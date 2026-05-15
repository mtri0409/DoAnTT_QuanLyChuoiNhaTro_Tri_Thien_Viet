import React from "react";
import { useNavigate } from "react-router-dom";
import { imgURL } from "../services/userConfig";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop";

const buildImageUrl = url => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;

  const base = imgURL.endsWith("/") ? imgURL.slice(0, -1) : imgURL;
  const path = url.startsWith("/") ? url : `/${url}`;

  return `${base}${path}`;
};

const getImage = item => {
  return buildImageUrl(
    item.thumbnailUrl ??
      item.thumbnail_url ??
      item.imageUrl ??
      item.image_url ??
      item.image
  );
};

const formatDate = value => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
};

export default function NewsCard({ item }) {
  const navigate = useNavigate();

  const handleOpenDetail = () => {
    if (!item.slug) return;
    navigate(`/tin-tuc/${item.slug}`);
  };

  return (
    <article className="news-card" onClick={handleOpenDetail}>
      <div className="news-card-img">
        <img
          src={getImage(item)}
          alt={item.title || "Tin tức"}
          onError={e => {
            e.currentTarget.src = DEFAULT_IMAGE;
          }}
        />

        <div className="news-card-category">
          {item.categoryName ?? item.category?.name ?? "Tin tức"}
        </div>
      </div>

      <div className="news-card-body">
        <div className="news-card-date">
          {formatDate(item.publishedAt ?? item.createdAt)} · 5 phút
        </div>

        <h4>{item.title}</h4>

        <p>{item.summary ?? "Chưa có mô tả ngắn cho bài viết này."}</p>
      </div>
    </article>
  );
}