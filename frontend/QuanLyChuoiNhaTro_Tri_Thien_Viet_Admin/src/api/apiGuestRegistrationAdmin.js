import axiosInstance from "./axios";

const apiGuestRegistrationAdmin = {
  /**
   * Lấy danh sách đơn chờ duyệt
   * GET /admin/guests/pending
   */
  getPendingRegistrations: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get("/admin/guests/pending", {
      params: { pageNumber, pageSize },
    }),

  /**
   * Duyệt đơn đăng ký
   * PATCH /admin/guests/{memberId}/approve
   */
  approveRegistration: (memberId) =>
    axiosInstance.patch(`/admin/guests/${memberId}/approve`),

  /**
   * Từ chối đơn đăng ký
   * PATCH /admin/guests/{memberId}/reject
   */
  rejectRegistration: (memberId, rejectionReason) =>
    axiosInstance.patch(`/admin/guests/${memberId}/reject`, {
      rejectionReason,
    }),

  /**
   * Lấy chi tiết đơn đăng ký
   * GET /guests/{memberId}
   */
  getRegistrationDetail: (memberId) =>
    axiosInstance.get(`/guests/${memberId}`),
};

export default apiGuestRegistrationAdmin;
