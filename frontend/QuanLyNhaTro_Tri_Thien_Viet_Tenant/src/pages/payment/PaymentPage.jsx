import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCreditCard,
  FaArrowLeft,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMobileAlt,
  FaUniversity,
  FaQrcode,
} from "react-icons/fa";

const VNPAY_PROXY =
  import.meta.env.VITE_VNPAY_PROXY_URL || "http://localhost:3001";

const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—");

// ─── ResultScreen ──────────────────────────────────────────────────────────
// Confirm API đã được server xử lý trong /payment/callback/web/:invoiceId
// Frontend chỉ cần hiển thị kết quả từ query params VNPay trả về
function ResultScreen({ searchParams }) {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");
  const rawAmount = searchParams.get("vnp_Amount");
  const amount = rawAmount ? Number(rawAmount) / 100 : null;
  const isSuccess = responseCode === "00";

  // confirmStatus lấy từ query param do server inject (nếu có)
  // hoặc mặc định "done" khi success vì server đã confirm rồi
  const serverConfirm = searchParams.get("confirmStatus"); // optional
  const confirmStatus = isSuccess
    ? serverConfirm === "error"
      ? "error"
      : "done"
    : null;

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: 520 }}>
        {isSuccess ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 bg-success-subtle"
                style={{ width: 72, height: 72 }}
              >
                <FaCheckCircle size={36} className="text-success" />
              </div>
              <h5 className="fw-bold mb-1">Thanh toán thành công!</h5>
              <p className="text-muted small mb-4">
                Hóa đơn của bạn đã được ghi nhận.
              </p>

              <div
                className="rounded-3 p-3 mb-4 text-start"
                style={{ background: "#f8fafc" }}
              >
                <div
                  className="small fw-semibold text-uppercase text-muted mb-2"
                  style={{ letterSpacing: 1 }}
                >
                  Chi tiết giao dịch
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Mã giao dịch</span>
                    <strong className="small">{txnRef}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Số tiền</span>
                    <strong className="text-success small">
                      {fmt(amount)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span className="text-muted small">
                      Trạng thái cập nhật
                    </span>
                    {confirmStatus === "done" && (
                      <span className="text-success small fw-semibold">
                        ✅ Đã cập nhật
                      </span>
                    )}
                    {confirmStatus === "error" && (
                      <span className="text-danger small">
                        ⚠️ Thất bại — liên hệ quản lý
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary fw-semibold w-100 rounded-3"
                onClick={() => navigate(`/user/bills/${invoiceId}`)}
              >
                Xem lại hóa đơn
              </button>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 bg-danger-subtle"
                style={{ width: 72, height: 72 }}
              >
                <FaTimesCircle size={36} className="text-danger" />
              </div>
              <h5 className="fw-bold mb-1">Thanh toán thất bại</h5>
              <p className="text-muted small mb-4">
                Giao dịch không thành công (mã lỗi:{" "}
                <strong>{responseCode}</strong>).
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2"
                  onClick={() => navigate(`/user/bills/${invoiceId}`)}
                >
                  <FaArrowLeft size={12} /> Quay lại
                </button>
                <button
                  className="btn btn-primary rounded-3"
                  onClick={() =>
                    navigate(`/payment/${invoiceId}?amount=${amount}`)
                  }
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PaymentForm ──────────────────────────────────────────────────────────
function PaymentForm({ invoiceId, amount }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVNPay = async () => {
    if (!amount || amount <= 0) {
      setError("Số tiền không hợp lệ. Vui lòng quay lại hóa đơn.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Key "authToken" khớp với AuthProvider (xem axios.js)
      const token = localStorage.getItem("authToken") || "";

      // KHÔNG truyền returnUrl — để server tự chọn callback route đúng
      // Truyền source=web để server biết dùng /payment/callback/web/:id
      const params = new URLSearchParams({
        amount,
        invoiceId,
        source: "web",
        ...(token ? { token: encodeURIComponent(token) } : {}),
      });

      const res = await fetch(`${VNPAY_PROXY}/payment?${params}`);
      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Không nhận được URL thanh toán từ server.");
      }
    } catch (err) {
      setError(err.message || "Không thể kết nối VNPay. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const methods = [
    { icon: <FaUniversity />, label: "ATM / Internet Banking nội địa" },
    { icon: <FaCreditCard />, label: "Visa, MasterCard, JCB quốc tế" },
    { icon: <FaQrcode />, label: "QR Code (NAPAS, VietQR)" },
    { icon: <FaMobileAlt />, label: "Ví điện tử liên kết" },
  ];

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      <div className="container py-4" style={{ maxWidth: 520 }}>
        <button
          className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-2 small"
          style={{ textDecoration: "none" }}
          onClick={() => navigate(`/user/bills/${invoiceId}`)}
        >
          <FaArrowLeft size={12} /> Quay lại hóa đơn
        </button>

        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center bg-primary-subtle flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaCreditCard
                      className="text-primary"
                      style={{ fontSize: 20 }}
                    />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-0"
                      style={{ letterSpacing: "-0.3px" }}
                    >
                      Thanh toán qua VNPay
                    </h5>
                    <div className="text-muted small">
                      Hóa đơn <strong>#{invoiceId}</strong>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-3 p-3 mb-4"
                  style={{ background: "#eff6ff" }}
                >
                  <div className="text-primary small fw-semibold mb-1">
                    Số tiền thanh toán
                  </div>
                  <div
                    className="fw-bold"
                    style={{
                      fontSize: 28,
                      color: "#1e3a8a",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {fmt(amount)}
                  </div>
                </div>

                <div
                  className="small fw-semibold text-uppercase text-muted mb-2"
                  style={{ letterSpacing: 1 }}
                >
                  Phương thức hỗ trợ
                </div>
                <div className="d-flex flex-column gap-2 mb-4">
                  {methods.map((m, i) => (
                    <div
                      key={i}
                      className="d-flex align-items-center gap-3 rounded-3 px-3 py-2"
                      style={{ background: "#f8fafc", fontSize: 13 }}
                    >
                      <span className="text-primary">{m.icon}</span>
                      <span className="text-secondary">{m.label}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 small mb-3 py-2">
                    <FaExclamationTriangle /> {error}
                  </div>
                )}

                <button
                  className="btn btn-primary fw-semibold w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ padding: "12px" }}
                  onClick={handleVNPay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Đang kết nối VNPay...
                    </>
                  ) : (
                    <>Tiếp tục thanh toán →</>
                  )}
                </button>

                <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                  <FaShieldAlt className="text-success" size={12} />
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Kết nối bảo mật SSL. Thông tin được mã hóa an toàn.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();

  const amountFromQuery = Number(searchParams.get("amount") || 0);
  const isVNPayReturn = searchParams.get("vnp_ResponseCode") !== null;

  return isVNPayReturn ? (
    <ResultScreen searchParams={searchParams} />
  ) : (
    <PaymentForm invoiceId={invoiceId} amount={amountFromQuery} />
  );
}
