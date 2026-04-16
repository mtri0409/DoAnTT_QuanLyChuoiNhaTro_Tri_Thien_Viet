import axiosInstance from "./axios";

/**
 * API hóa đơn dành riêng cho user (không phải admin).
 * Tất cả endpoint đều đi qua /user/invoices/...
 * Backend xác định user qua JWT token.
 */
const apiUserInvoice = {
  /**
   * Lấy danh sách hóa đơn của user đang đăng nhập.
   * Mặc định backend đã lọc bỏ DRAFT — chỉ trả PENDING, PARTIAL, PAID, REFUNDED, CANCELLED.
   */
  getMyInvoices: (
    { status, type, month, year } = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  ) =>
    axiosInstance.get("/user/invoices/my", {
      // ✅ đúng endpoint
      params: {
        ...(status && { status }),
        ...(type && { type }),
        ...(month && { month }),
        ...(year && { year }),
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    }),

  /**
   * Xem chi tiết 1 hóa đơn — backend validate invoice thuộc về user.
   */
  getById: (invoiceId) => axiosInstance.get(`/user/invoices/${invoiceId}`), // ✅ đúng endpoint
};

export default apiUserInvoice;
