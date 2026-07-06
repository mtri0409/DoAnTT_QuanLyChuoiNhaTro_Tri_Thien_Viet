// pages/tenant/RoommatePosts.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTimes,
  FaTrash,
  FaDoorOpen,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaEye,
  FaRedo,
} from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpiner";
import SearchBox from "../../components/common/SearchBox";
import FilterTab from "../../components/common/FilterTab";
import StatsCard from "../../components/common/StatsCard";
import ActionBtn from "../../components/common/ActionBtn";
import { STATUS_CONFIG, FILTER_OPTIONS } from "../../utils/postUtils";
import { formatDate } from "../../utils/dateUtils";
import "./roomate-posts.css";
import useRoommatePosts from "../../../hooks/useRoommatePosts";
import PostCard from "../../components/post/PostCard";

export default function RoommatePosts() {
  const {
    posts,
    loading,
    error,
    page,
    totalPages,
    filterStatus,
    searchText,
    hoveredCard,
    toast,
    filteredPosts,
    urgentCount,
    fetchPosts,
    closePost,
    deletePost,
    repost,
    changePage,
    changeFilterStatus,
    handleSearch,
    handleMouseEnter,
    handleMouseLeave,
    getCountByStatus,
    daysLeft,
    setToast,
  } = useRoommatePosts();

  // Prepare filter options
  const filterOptions = FILTER_OPTIONS.map(({ key, label, dot }) => ({
    key,
    label,
    dot,
    count: getCountByStatus(key),
  }));

  // Prepare stats
  const stats = [
    {
      label: "Tổng bài đăng",
      value: posts.length,
      bg: "bg-light",
      color: "text-primary",
    },
    {
      label: "Đang hoạt động",
      value: getCountByStatus("ACTIVE"),
      bg: "bg-success bg-opacity-10",
      color: "text-success",
    },
    {
      label: "Sắp hết hạn",
      value: urgentCount,
      bg: "bg-danger bg-opacity-10",
      color: "text-danger",
    },
  ];

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 end-0 m-3 toast-slide" style={{ zIndex: 9998, minWidth: 260 }}>
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small shadow-sm rounded-3 mb-0 border-0">
            <FaCheckCircle className="text-success flex-shrink-0" />
            <span>{toast}</span>
            <button className="btn-close btn-sm ms-auto" onClick={() => setToast(null)} />
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white px-3 px-md-4 py-3 shadow-sm border-bottom sticky-top-custom">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: 44, height: 44 }}>
              <FaUsers className="text-primary" size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Bài đăng của tôi</h5>
              <p className="mb-0 small text-secondary">
                {posts.length} bài · {getCountByStatus("ACTIVE")} đang tìm bạn ghép phòng
              </p>
            </div>
          </div>
          <Link
            to="/user/posts/create"
            className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3 shadow-sm fw-medium"
          >
            <FaPlus size={12} /> Đăng bài mới
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="container-fluid flex-grow-1 py-4 px-3 px-md-4">
        <div className="row g-4 align-items-start">
          {/* Sticky Sidebar */}
          <div className="col-lg-3 col-md-4 sticky-sidebar">
            <SearchBox
              value={searchText}
              onChange={handleSearch}
              placeholder="Tìm bài đăng..."
              className="mb-3"
            />
            
            <FilterTab
              options={filterOptions}
              activeKey={filterStatus}
              onChange={changeFilterStatus}
              title="Trạng thái"
              showIcon={true}
              className="mb-3"
              activeClass="bg-primary bg-opacity-10 text-primary fw-semibold"
              badgeActiveClass="bg-primary text-white"
            />
            
            <StatsCard stats={stats} title="Tổng quan" />
          </div>

          {/* List Column */}
          <div className="col-lg-9 col-md-8">
            {/* Error */}
            {error && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 small mb-3">
                {error}
                <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => fetchPosts(page)}>
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && <LoadingSpinner />}

            {/* Empty state */}
            {!loading && !error && filteredPosts.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="card-body">
                  <div className="fs-1 mb-3">
                    {searchText || filterStatus !== "ALL" ? "🔍" : "📋"}
                  </div>
                  <h6 className="fw-semibold mb-1 text-dark">
                    {searchText || filterStatus !== "ALL"
                      ? "Không tìm thấy kết quả"
                      : "Chưa có bài đăng nào"}
                  </h6>
                  <p className="text-muted small mb-3">
                    {searchText || filterStatus !== "ALL"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Hãy đăng bài để tìm người ghép phòng nhé!"}
                  </p>
                  {!searchText && filterStatus === "ALL" && (
                    <Link to="/user/posts/create" className="btn btn-primary btn-sm px-4 rounded-3">
                      <FaPlus size={11} className="me-1" /> Đăng bài ngay
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Post cards */}
            {!loading && filteredPosts.length > 0 && (
              <div className="d-flex flex-column gap-3">
                {filteredPosts.map((post) => (
                  <PostCard
                      key={post.postId}
                      post={post}
                      isHovered={hoveredCard === post.postId}
                      onMouseEnter={() => handleMouseEnter(post.postId)}
                      onMouseLeave={handleMouseLeave}
                      onClose={closePost}
                      onDelete={deletePost}
                      onRepost={repost}
                      daysLeft={daysLeft}
                    />
                  )       
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={page === 0}
                  onClick={() => changePage(page - 1)}
                >
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i)}
                    className={`btn btn-sm px-3 rounded-3 ${
                      i === page
                        ? "btn-primary shadow-sm fw-semibold"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={page === totalPages - 1}
                  onClick={() => changePage(page + 1)}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}