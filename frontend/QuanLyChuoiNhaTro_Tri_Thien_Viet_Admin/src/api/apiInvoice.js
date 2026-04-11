import axiosInstance from "./axios";

const apiInvoice = {
  // ── TẠO HÓA ĐƠN ──────────────────────────────────────────────────────────

  createManual: (contractId, month, year) =>
    axiosInstance.post("/admin/invoices/manual", null, {
      params: { contractId, month, year },
    }),

  autoGenerate: (month, year) =>
    axiosInstance.post("/admin/invoices/auto-generate", null, {
      params: { month, year },
    }),

  /** Tạo hóa đơn tiền cọc → status DRAFT */
  createDeposit: (contractId, depositId) =>
    axiosInstance.post("/admin/invoices/deposit", null, {
      params: { contractId, depositId },
    }),

  // ── XEM HÓA ĐƠN ──────────────────────────────────────────────────────────

  getById: (invoiceId) => axiosInstance.get(`/admin/invoices/${invoiceId}`),

  getByContract: (
    contractId,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "periodYear",
    sortOrder = "desc",
  ) =>
    axiosInstance.get(`/admin/invoices/contract/${contractId}`, {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    }),

  /**
   * Lọc hóa đơn — hỗ trợ param `type`: MONTHLY | DEPOSIT | REPAIR
   */
  filter: (
    { type, status, month, year, contractId, branchId } = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  ) =>
    axiosInstance.get("/admin/invoices", {
      params: {
        ...(type && { type }),
        ...(status && { status }),
        ...(month && { month }),
        ...(year && { year }),
        ...(contractId && { contractId }),
        ...(branchId && { branchId }),
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    }),

  // ── WORKFLOW MONTHLY: DRAFT → PENDING → PAID ──────────────────────────────

  /** DRAFT → PENDING: tính lại total, set dueDate */
  send: (invoiceId) => axiosInstance.put(`/admin/invoices/${invoiceId}/send`),
  sendAll :() => axiosInstance.put(`/admin/invoices/send`),
  /** PENDING → PAID (chỉ MONTHLY / REPAIR) */
  markPaid: (invoiceId) =>
    axiosInstance.put(`/admin/invoices/${invoiceId}/mark-paid`),

  /** Hủy hóa đơn (không hủy được khi PAID / REFUNDED) */
  cancel: (invoiceId) =>
    axiosInstance.put(`/admin/invoices/${invoiceId}/cancel`),

  /** Tính lại totalAmount từ các InvoiceDetail */
  recalculate: (invoiceId) =>
    axiosInstance.put(`/admin/invoices/${invoiceId}/recalculate`),

  // ── WORKFLOW DEPOSIT ──────────────────────────────────────────────────────

  /**
   * Ghi nhận 1 lần nộp tiền cọc (có thể nộp nhiều lần).
   * - paidAmount < totalAmount → PARTIAL
   * - paidAmount >= totalAmount → PAID
   */
  depositPayment: (invoiceId, amount) =>
    axiosInstance.put(`/admin/invoices/${invoiceId}/deposit-payment`, null, {
      params: { amount },
    }),

  /**
   * Hoàn trả tiền cọc: PAID → REFUNDED.
   * @param {string} [note] lý do hoàn cọc
   */
  refund: (invoiceId, note) =>
    axiosInstance.put(`/admin/invoices/${invoiceId}/refund`, null, {
      params: { ...(note && { note }) },
    }),
};

export default apiInvoice;
