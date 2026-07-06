import axiosInstance from "./axios";

const apiExpenses = {
  // ── TẠO CHI PHÍ ──────────────────────────────────────────────────────────

  /**
   * Tạo chi phí mới.
   * - payer = "TENANT_FAULT" → cần maintenanceRequestId → tạo Invoice REPAIR
   * - payer = "OWNER_COST"   → cần branchId → chỉ lưu chi phí nội bộ
   */
  create: ({
    payer,
    expenseCategory,
    amount,
    paymentDate,
    payeeName,
    evidenceUrl,
    description,
    maintenanceRequestId,
    branchId,
  }) =>
    axiosInstance.post("/admin/expenses", null, {
      params: {
        payer,
        expenseCategory,
        amount,
        ...(paymentDate && { paymentDate }),
        ...(payeeName && { payeeName }),
        ...(evidenceUrl && { evidenceUrl }),
        ...(description && { description }),
        ...(maintenanceRequestId && { maintenanceRequestId }),
        ...(branchId && { branchId }),
      },
    }),

  // ── XEM CHI PHÍ ──────────────────────────────────────────────────────────

  /** Xem chi tiết 1 chi phí */
  getById: (expenseId) => axiosInstance.get(`/admin/expenses/${expenseId}`),

  /**
   * Lọc danh sách chi phí
   * @param {Object} filters - { payer, category, branchId, from, to }
   */
  filter: (
    { payer, category, branchId, from, to } = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  ) =>
    axiosInstance.get("/admin/expenses", {
      params: {
        ...(payer && { payer }),
        ...(category && { category }),
        ...(branchId && { branchId }),
        ...(from && { from }),
        ...(to && { to }),
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    }),

  /** Lấy chi phí theo yêu cầu sửa chữa */
  getByMaintenanceRequest: (requestId, pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/admin/expenses/maintenance/${requestId}`, {
      params: { pageNumber, pageSize },
    }),

  // ── CẬP NHẬT / XÓA ───────────────────────────────────────────────────────

  /**
   * Cập nhật metadata chi phí (không đổi payer / invoice)
   */
  update: (
    expenseId,
    {
      expenseCategory,
      amount,
      paymentDate,
      payeeName,
      evidenceUrl,
      description,
    },
  ) =>
    axiosInstance.patch(`/admin/expenses/${expenseId}`, null, {
      params: {
        ...(expenseCategory && { expenseCategory }),
        ...(amount !== undefined && amount !== null && { amount }),
        ...(paymentDate && { paymentDate }),
        ...(payeeName && { payeeName }),
        ...(evidenceUrl && { evidenceUrl }),
        ...(description && { description }),
      },
    }),

  /** Xóa chi phí */
  delete: (expenseId) => axiosInstance.delete(`/admin/expenses/${expenseId}`),
};

export default apiExpenses;
