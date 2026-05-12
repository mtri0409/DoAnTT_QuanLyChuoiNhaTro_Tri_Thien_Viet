import { useState, useEffect, useCallback } from "react";

import apiPost from "../src/api/apiPost";
import { confirmAction, notify } from "../src/utils/swalUtils";

const useRoommatePosts = (initialPage = 0) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost.getMyPosts(pageNum, 20);
      setPosts(res?.content ?? res?.data?.content ?? []);
      setTotalPages(res?.totalPages ?? res?.data?.totalPages ?? 0);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải bài đăng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Close post
  const closePost = useCallback(async (postId) => {
    const result = await confirmAction({
      title: "Đóng bài đăng?",
      text: "Bài sẽ chuyển sang trạng thái Đã đóng, không còn hiển thị công khai.",
      icon: "warning",
      confirmText: "Đóng bài",
      confirmColor: "#f59e0b",
    });
    
    if (!result.isConfirmed) return false;
    
    try {
      await apiPost.closePost(postId);
      notify("Đã đóng bài đăng thành công!", "success");
      await fetchPosts(page);
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể đóng bài đăng", "error");
      return false;
    }
  }, [fetchPosts, page]);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    const result = await confirmAction({
      title: "Xóa bài đăng?",
      text: "Bài sẽ bị xóa vĩnh viễn, không thể khôi phục.",
      icon: "error",
      confirmText: "Xóa bài",
      confirmColor: "#dc3545",
    });
    
    if (!result.isConfirmed) return false;
    
    try {
      await apiPost.deletePost(postId);
      notify("Đã xóa bài đăng thành công!", "success");
      await fetchPosts(page);
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể xóa bài đăng", "error");
      return false;
    }
  }, [fetchPosts, page]);

  // Repost
  const repost = useCallback(async (postId) => {
    const result = await confirmAction({
      title: "Đăng lại bài?",
      text: "Bài mới sẽ được tạo từ nội dung cũ, hiệu lực 30 ngày.",
      icon: "question",
      confirmText: "Đăng lại",
      confirmColor: "#0d6efd",
    });
    
    if (!result.isConfirmed) return false;
    
    try {
      await apiPost.repost(postId);
      notify("Đã đăng lại bài thành công!", "success");
      await fetchPosts(page);
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể đăng lại bài", "error");
      return false;
    }
  }, [fetchPosts, page]);

  // Auto clear toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // Filtered posts
  const filteredPosts = posts.filter(
    (p) =>
      (filterStatus === "ALL" || p.status === filterStatus) &&
      (!searchText ||
        p.roomName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Count by status
  const getCountByStatus = useCallback((status) => {
    if (status === "ALL") return posts.length;
    return posts.filter((p) => p.status === status).length;
  }, [posts]);

  // Urgent count (active and expiring within 5 days)
  const daysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    return Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000));
  };
  
  const urgentCount = posts.filter(
    (p) => p.status === "ACTIVE" && (daysLeft(p.expiresAt) ?? 99) <= 5
  ).length;

  // Change page
  const changePage = useCallback((newPage) => {
    fetchPosts(newPage);
  }, [fetchPosts]);

  // Change filter
  const changeFilterStatus = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // Search
  const handleSearch = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Hover handlers
  const handleMouseEnter = useCallback((id) => {
    setHoveredCard(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  return {
    // State
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
    
    // Functions
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
    
    // Setters
    setToast,
  };
};

export default useRoommatePosts;