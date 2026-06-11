import express from "express";
import cors from "cors";
import "dotenv/config";
import { VNPay } from "vnpay";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

//doi ip mang cua dt + may tinh
const BACKEND_API = process.env.BACKEND_API_URL || "http://192.168.1.161:8080";

const tokenStore = {};

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  testMode: true,
});

/**
 * GET /payment
 * Query params:
 *   - amount     : số tiền (VND)
 *   - invoiceId  : mã hóa đơn
 *   - token      : JWT của user (encoded)
 *   - returnUrl  : URL frontend muốn redirect về sau thanh toán (optional)
 *   - source     : "web" | "mobile" (default: "mobile")
 */
app.get("/payment", (req, res) => {
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const amount = Number(req.query.amount || 0);
  const invoiceId = req.query.invoiceId || "unknown";
  const token = req.query.token ? decodeURIComponent(req.query.token) : null;
  const source = req.query.source || "mobile"; // "web" hoặc "mobile"

  // Lưu token + source vào store
  if (token) {
    tokenStore[invoiceId] = { token, source };
    console.log(`>>> Token saved for invoiceId=${invoiceId} source=${source}`);
  }

  // Chọn returnUrl theo source
  let returnUrl;
  if (req.query.returnUrl) {
    // Nếu client tự truyền returnUrl → dùng callback server (để server confirm trước)
    // Web: /payment/callback/web/:id
    // Mobile: /payment/callback/:id
    returnUrl = decodeURIComponent(req.query.returnUrl);
  } else if (source === "web") {
    const serverBase =
      process.env.SERVER_BASE_URL || `http://localhost:${PORT}`;
    returnUrl = `${serverBase}/payment/callback/web/${invoiceId}`;
  } else {
    returnUrl = process.env.VNP_RETURN_URL
      ? `${process.env.VNP_RETURN_URL}/${invoiceId}`
      : `http://localhost:${PORT}/payment/callback/${invoiceId}`;
  }

  console.log(
    `>>> VNPay request: invoiceId=${invoiceId} amount=${amount} source=${source}`,
  );
  console.log(`>>> returnUrl: ${returnUrl}`);

  const vnpUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: `${invoiceId}-${Date.now()}`,
    vnp_OrderInfo: `Thanh toan hoa don ${invoiceId}`,
    vnp_ReturnUrl: returnUrl,
  });

  console.log("✅ Payment URL built for invoiceId:", invoiceId);
  res.json({ url: vnpUrl });
});

/**
 * Hàm dùng chung: gọi Backend API xác nhận thanh toán
 */
async function confirmPayment(invoiceId, amount, transactionNo, token) {
  const confirmUrl = `${BACKEND_API}/api/v1/user/invoices/${invoiceId}/vnpay-confirmations?amount=${amount}&transactionCode=${transactionNo}`;
  const confirmRes = await fetch(confirmUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`>>> Confirm API status: ${confirmRes.status}`);
  return confirmRes;
}

/**
 * GET /payment/callback/web/:invoiceId
 * Callback dành riêng cho Web:
 *   - Xác nhận với Backend API
 *   - Redirect về URL web frontend
 */
app.get("/payment/callback/web/:invoiceId", async (req, res) => {
  const { invoiceId } = req.params;
  const responseCode = req.query.vnp_ResponseCode;
  const isSuccess = responseCode === "00";
  const amount = req.query.vnp_Amount ? Number(req.query.vnp_Amount) / 100 : 0;
  const transactionNo = req.query.vnp_TransactionNo;

  const stored = tokenStore[invoiceId] || {};
  const token = stored.token || null;
  if (token) delete tokenStore[invoiceId];

  console.log(
    `>>> Web callback invoiceId=${invoiceId} responseCode=${responseCode}`,
  );
  console.log(`>>> token: ${token ? "có" : "NULL"}`);

  if (isSuccess && token) {
    try {
      await confirmPayment(invoiceId, amount, transactionNo, token);
    } catch (err) {
      console.log(`>>> Confirm API error: ${err.message}`);
    }
  }

  // Redirect về web frontend
  const webBaseUrl = process.env.WEB_BASE_URL || "http://localhost:5174";
  const query = new URLSearchParams(req.query).toString();
  res.redirect(`${webBaseUrl}/payment/${invoiceId}?${query}`);
});

/**
 * GET /payment/callback/:invoiceId
 * Callback dành riêng cho Mobile:
 *   - Xác nhận với Backend API
 *   - Redirect về app qua deep link
 */
app.get("/payment/callback/:invoiceId", async (req, res) => {
  const { invoiceId } = req.params;
  const query = new URLSearchParams(req.query).toString();
  const responseCode = req.query.vnp_ResponseCode;
  const isSuccess = responseCode === "00";
  const amount = req.query.vnp_Amount ? Number(req.query.vnp_Amount) / 100 : 0;
  const transactionNo = req.query.vnp_TransactionNo;

  const stored = tokenStore[invoiceId] || {};
  const token = stored.token || null;
  if (token) delete tokenStore[invoiceId];

  console.log(
    `>>> Mobile callback invoiceId=${invoiceId} responseCode=${responseCode}`,
  );
  console.log(`>>> token: ${token ? "có" : "NULL"}`);

  if (isSuccess && token) {
    try {
      await confirmPayment(invoiceId, amount, transactionNo, token);
    } catch (err) {
      console.log(`>>> Confirm API error: ${err.message}`);
    }
  }

  const deepLink = `exp+quanlynhatro://payment/${invoiceId}?${query}`;

  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
          .card { background: white; border-radius: 16px; padding: 32px 24px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 320px; width: 90%; }
          .icon { font-size: 48px; margin-bottom: 12px; }
          h2 { margin: 0 0 8px; color: #1e293b; font-size: 20px; }
          p { color: #64748b; font-size: 14px; margin: 0 0 24px; }
          a { display: block; background: #1e40af; color: white; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${isSuccess ? "✅" : "❌"}</div>
          <h2>${isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}</h2>
        </div>
        <script>
          setTimeout(() => { window.location.href = "${deepLink}"; }, 500);
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 VNPay proxy running at http://localhost:${PORT}`);
});
