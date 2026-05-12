// hooks/useMaintenanceDetail.js
import { useState, useEffect, useCallback } from "react";
import apiMaintenanceRequest from "../src/api/apiMaintenanceaRequest";
import { confirmAction, notify } from "../src/utils/swalUtils";

const useMaintenanceDetail = (requestId) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [cancelling, setCancelling] = useState(false);

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiMaintenanceRequest.getRequestById(requestId);
      setRequest(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải thông tin yêu cầu");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const cancelRequest = useCallback(async () => {
    // Hiển thị confirm dialog trước khi hủy
    const result = await confirmAction({
      title: "Hủy yêu cầu sửa chữa?",
      text: "Sau khi hủy, bạn không thể khôi phục lại yêu cầu này. Bạn có chắc chắn muốn hủy?",
      icon: "warning",
      confirmText: "Hủy yêu cầu",
      cancelText: "Quay lại",
      confirmColor: "#dc3545",
    });

    if (!result.isConfirmed) return false;

    setCancelling(true);
    try {
      const updated = await apiMaintenanceRequest.cancelRequest(requestId);
      setRequest(updated);
      notify("Đã hủy yêu cầu thành công!", "success");
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể hủy yêu cầu", "error");
      return false;
    } finally {
      setCancelling(false);
    }
  }, [requestId]);

  const openLightbox = useCallback((index) => {
    setLightbox({ open: true, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox({ open: false, index: 0 });
  }, []);

  const setLightboxIndex = useCallback((index) => {
    setLightbox((prev) => ({ ...prev, index }));
  }, []);

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId, fetchRequest]);

  return {
    // State
    request,
    loading,
    error,
    lightbox,
    cancelling,
    
    // Functions
    fetchRequest,
    cancelRequest,
    openLightbox,
    closeLightbox,
    setLightboxIndex,
  };
};

export default useMaintenanceDetail;