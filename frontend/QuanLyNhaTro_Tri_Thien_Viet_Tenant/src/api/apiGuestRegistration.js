import axiosInstance from "./axios";

const apiGuestRegistration = {
  /**
   * Đăng ký người thân mới
   * POST /tenant/guests/register
   */
  registerGuest: (data) =>
    axiosInstance.post("/tenant/guests/register", data)
 ,

  /**
   * Upload ảnh CCCD mặt trước
   * PUT /tenant/guests/{memberId}/id-front
   */
  uploadGuestIdFront: (memberId, formData) =>
    axiosInstance.put(`/tenant/guests/${memberId}/id-front`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),

  /**
   * Upload ảnh CCCD mặt sau
   * PUT /tenant/guests/{memberId}/id-back
   */
  uploadGuestIdBack: (memberId, formData) =>
    axiosInstance.put(`/tenant/guests/${memberId}/id-back`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),

  /**
   * Lấy danh sách người thân của phòng (tất cả trạng thái)
   * GET /tenant/guests
   * Backend tự lấy roomId từ token
   */
  getMyGuests: () =>
    axiosInstance.get("/tenant/guests"),

  /**
   * Lấy danh sách người thân đã duyệt
   * GET /tenant/guests/approved
   * Backend tự lấy roomId từ token
   */
  getMyApprovedGuests: () =>
    axiosInstance.get("/tenant/guests/approved"),

  /**
   * Lấy chi tiết đơn đăng ký
   * GET /guests/{memberId}
   */
  getRegistrationDetail: (memberId) =>
    axiosInstance.get(`/guests/${memberId}`),

  /**
   * Hủy đơn đăng ký
   * PATCH /guests/{memberId}/cancel
   */
  cancelRegistration: (memberId) =>
    axiosInstance.patch(`/guests/${memberId}/cancel`),

  // ===================== ADMIN ONLY =====================

  /**
   * Lấy danh sách đơn chờ duyệt (Admin)
   * GET /admin/guests/pending
   */
  getPendingRegistrations: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get("/admin/guests/pending", {
      params: { pageNumber, pageSize },
    }).then(res => res.data?.data),

  /**
   * Duyệt đơn đăng ký (Admin)
   * PATCH /admin/guests/{memberId}/approve
   */
  approveRegistration: (memberId) =>
    axiosInstance.patch(`/admin/guests/${memberId}/approve`)
      .then(res => res.data?.data),

  /**
   * Từ chối đơn đăng ký (Admin)
   * PATCH /admin/guests/{memberId}/reject
   */
  rejectRegistration: (memberId, rejectionReason) =>
    axiosInstance.patch(`/admin/guests/${memberId}/reject`, {
      rejectionReason,
    }).then(res => res.data?.data),
};

export default apiGuestRegistration;


