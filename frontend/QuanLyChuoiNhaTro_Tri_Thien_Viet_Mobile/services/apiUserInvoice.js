// services/apiUserInvoice.js
import axiosInstance from "./axios";

const apiUserInvoice = {
  getMyInvoices: (
    { status, type, month, year } = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  ) =>
    axiosInstance.get("/user/invoices/my", {
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

  getById: (invoiceId) => axiosInstance.get(`/user/invoices/${invoiceId}`),

  confirmVNPay: (invoiceId, amount, transactionCode) =>
    axiosInstance.put(`/user/invoices/${invoiceId}/confirm-vnpay`, null, {
      params: { amount, transactionCode },
    }),
};

export default apiUserInvoice;
