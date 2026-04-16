import express from "express";
import cors from "cors";
import "dotenv/config";
import { VNPay } from "vnpay";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  testMode: true,
});

/**
 * GET /payment
 * Query params:
 *   - amount     : số tiền (VND)
 *   - invoiceId  : mã hóa đơn (để truyền vào returnUrl)
 *   - returnUrl  : URL frontend muốn VNPay redirect về (optional, có default)
 */
app.get("/payment", (req, res) => {
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const amount = Number(req.query.amount || 0);
  const invoiceId = req.query.invoiceId || "unknown";
  // Ưu tiên URL đã đăng ký với VNPay (trong .env), append invoiceId để redirect đúng trang
  const baseReturn = process.env.VNP_RETURN_URL || "http://localhost:3000";
  const returnUrl = `${baseReturn}/payment/${invoiceId}`;

  console.log(`>>> VNPay request: invoiceId=${invoiceId} amount=${amount}`);

  const vnpUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: `${invoiceId}-${Date.now()}`, // invoiceId ghép vào txnRef
    vnp_OrderInfo: `Thanh toan hoa don ${invoiceId}`, // dùng để parse lại invoiceId
    vnp_ReturnUrl: returnUrl,
  });

  console.log("✅ Payment URL built for invoiceId:", invoiceId);
  res.json({ url: vnpUrl });
});

app.listen(PORT, () => {
  console.log(`🚀 VNPay proxy running at http://localhost:${PORT}`);
});
