import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PostCard from "./PostCard";
import userService from "../services/userService";

const PAGE_SIZE = 6;

const pageBtn = {
  padding: "7px 13px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  border: "1.5px solid #e2e8f0",
  background: "#fff",
  color: "#64748b",
  fontFamily: "inherit",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
};

export default function PostList({ activeBranchId }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    setError(null);
    userService
      .getActivePosts(page, PAGE_SIZE, null, activeBranchId || null)
      .then((res) => {
        const data = res?.data ?? res;
        const content = data?.content ?? [];
        setPosts(Array.isArray(content) ? content : []);
        setTotalPages(Math.max(1, data?.totalPages ?? 1));
      })
      .catch(() => setError("Không thể tải danh sách bài đăng."))
      .finally(() => setLoading(false));
  }, [page, activeBranchId]);

  useEffect(() => {
    setPage(0);
  }, [activeBranchId]);
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1a2236",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🤝 Tìm bạn ghép phòng
        {!loading && posts.length > 0 && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#64748b",
              background: "#f1f4f9",
              padding: "2px 10px",
              borderRadius: 20,
            }}
          >
            {posts.length} bài
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 140,
                borderRadius: 14,
                background: "#e2e8f0",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
          <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 14 }}>
            {error}
          </p>
          <button
            onClick={fetchPosts}
            style={{
              background: "#1d6cf0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 22px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>
            Chưa có bài đăng tìm bạn ghép phòng nào.
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && posts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              onClick={() => navigate(`/bai-dang/${post.postId}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ ...pageBtn, opacity: page === 0 ? 0.4 : 1 }}
          >
            <FaChevronLeft size={11} /> Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                ...pageBtn,
                background: page === i ? "#1d6cf0" : "#fff",
                color: page === i ? "#fff" : "#64748b",
                borderColor: page === i ? "#1d6cf0" : "#e2e8f0",
                fontWeight: page === i ? 700 : 500,
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{ ...pageBtn, opacity: page === totalPages - 1 ? 0.4 : 1 }}
          >
            Tiếp <FaChevronRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
