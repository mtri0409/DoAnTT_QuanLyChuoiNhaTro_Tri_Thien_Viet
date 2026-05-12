// hooks/useMaintenanceList.js
import { useState, useEffect, useCallback } from "react";
import apiMaintenanceRequest from "../src/api/apiMaintenanceaRequest";
import { confirmAction, notify } from "../src/utils/swalUtils";


const useMaintenanceList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiMaintenanceRequest.getMyRequests({
        pageNumber,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setRequests(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  // Cancel request with SweetAlert2 confirmation
  const cancelRequest = useCallback(async (requestId) => {
    const result = await confirmAction({
      title: "Hủy yêu cầu sửa chữa?",
      text: "Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác.",
      icon: "warning",
      confirmText: "Hủy yêu cầu",
      cancelText: "Quay lại",
      confirmColor: "#dc3545",
    });

    if (!result.isConfirmed) return false;

    try {
      await apiMaintenanceRequest.cancelRequest(requestId);
      notify("Đã hủy yêu cầu thành công!", "success");
      await fetchRequests();
      return true;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Không thể hủy yêu cầu";
      notify(errorMsg, "error");
      return false;
    }
  }, [fetchRequests]);

  // Auto fetch when page changes
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filtered requests
  const filteredRequests = requests.filter(
    (r) =>
      (filterStatus === "ALL" || r.status === filterStatus) &&
      (!searchText ||
        r.roomName?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Count by status
  const getCountByStatus = useCallback((status) => {
    if (status === "ALL") return requests.length;
    return requests.filter((r) => r.status === status).length;
  }, [requests]);

  // Change page
  const changePage = useCallback((newPage) => {
    setPageNumber(newPage);
  }, []);

  // Change filter
  const changeFilterStatus = useCallback((status) => {
    setFilterStatus(status);
    setPageNumber(1);
  }, []);

  // Search
  const handleSearch = useCallback((text) => {
    setSearchText(text);
    setPageNumber(1);
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
    requests,
    loading,
    error,
    pageNumber,
    totalPages,
    filterStatus,
    searchText,
    hoveredCard,
    filteredRequests,
    
    // Functions
    fetchRequests,
    cancelRequest,
    changePage,
    changeFilterStatus,
    handleSearch,
    handleMouseEnter,
    handleMouseLeave,
    getCountByStatus,
    
    // Setters (nếu cần)
    setSearchText,
    setFilterStatus,
  };
};

export default useMaintenanceList;