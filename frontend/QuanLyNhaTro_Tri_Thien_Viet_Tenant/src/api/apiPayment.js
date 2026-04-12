import axiosInstance from "./axios";

const VNPAY_PROXY =
  import.meta.env.VITE_VNPAY_PROXY_URL || "http://localhost:3001";

export async function createVNPayUrl(invoiceId, amount) {
  const returnUrl = encodeURIComponent(
    `${window.location.origin}/payment/${invoiceId}`,
  );

  const res = await fetch(
    `${VNPAY_PROXY}/payment?amount=${amount}&invoiceId=${invoiceId}&returnUrl=${returnUrl}`,
  );

  if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);

  const data = await res.json();

  if (!data?.url) throw new Error("Không nhận được URL thanh toán từ server.");

  return data.url;
}

export async function confirmVNPayPayment(invoiceId, amount, txnRef) {
  await axiosInstance.put(`/user/invoices/${invoiceId}/confirm-vnpay`, null, {
    params: { amount, transactionCode: txnRef },
  });
}
