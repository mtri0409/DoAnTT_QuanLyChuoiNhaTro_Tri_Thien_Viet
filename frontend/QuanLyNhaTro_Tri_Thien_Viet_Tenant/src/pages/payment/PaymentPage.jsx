import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCreditCard,
  FaArrowLeft,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";

import { createVNPayUrl, confirmVNPayPayment } from "../../api/apiPayment";

const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—");

// ─── Màn hình kết quả sau khi VNPay redirect về ───────────────────────────
function ResultScreen({ searchParams }) {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");
  const rawAmount = searchParams.get("vnp_Amount");
  const amount = rawAmount ? Number(rawAmount) / 100 : null;

  const isSuccess = responseCode === "00";
  const isCancelled = responseCode === "24"; // người dùng bấm Hủy trên VNPay

  // Nếu hủy → tự động quay về trang hóa đơn
  useEffect(() => {
    if (!isCancelled) return;
    window.location.replace(`/user/bills/${invoiceId}`);
  }, [isCancelled, invoiceId]);

  const confirmedRef = useRef(false);
  const [confirmStatus, setConfirmStatus] = useState("idle");

  useEffect(() => {
    if (!isSuccess || confirmedRef.current) return;
    confirmedRef.current = true;
    setConfirmStatus("loading");

    confirmVNPayPayment(invoiceId, amount, txnRef)
      .then(() => setConfirmStatus("done"))
      .catch((err) => {
        console.error("Lỗi confirm VNPay:", err);
        const status = err?.response?.status;
        if (status === 409 || status === 200) {
          setConfirmStatus("done");
        } else {
          setConfirmStatus("error");
        }
      });
  }, [isSuccess, invoiceId, amount, txnRef]);

  if (isCancelled) {
    return (
      <div
        className="card shadow-sm border-0 p-4 p-md-5 text-center"
        style={{ maxWidth: 480, width: "100%" }}
      >
        <FaSpinner
          className="spin-icon text-secondary mb-3"
          style={{ fontSize: 36 }}
        />
        <p className="text-muted mb-0">Đang quay lại hóa đơn...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div
        className="card shadow-sm border-0 p-4 p-md-5 text-center"
        style={{ maxWidth: 480, width: "100%" }}
      >
        <FaCheckCircle className="text-success mb-3" style={{ fontSize: 56 }} />
        <h4 className="fw-bold mb-1">Thanh toán thành công!</h4>
        <p className="text-muted mb-4">Hóa đơn của bạn đã được ghi nhận.</p>

        <div className="bg-light rounded-3 p-3 mb-4 text-start">
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted small">Mã giao dịch</span>
            <strong className="small">{txnRef}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted small">Số tiền</span>
            <strong className="text-success">{fmt(amount)}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted small">Trạng thái cập nhật</span>
            {confirmStatus === "loading" && (
              <span className="text-warning small d-flex align-items-center gap-1">
                <FaSpinner className="spin-icon" /> Đang cập nhật...
              </span>
            )}
            {confirmStatus === "done" && (
              <span className="text-success small fw-semibold">
                ✅ Đã cập nhật hóa đơn
              </span>
            )}
            {confirmStatus === "error" && (
              <span className="text-danger small">
                ⚠️ Vui lòng liên hệ quản lý
              </span>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={() => navigate(`/user/bills/${invoiceId}`)}
        >
          Xem lại hóa đơn
        </button>
      </div>
    );
  }

  return (
    <div
      className="card shadow-sm border-0 p-4 p-md-5 text-center"
      style={{ maxWidth: 480, width: "100%" }}
    >
      <FaTimesCircle className="text-danger mb-3" style={{ fontSize: 56 }} />
      <h4 className="fw-bold mb-1">Thanh toán thất bại</h4>
      <p className="text-muted mb-4">
        Giao dịch không thành công (mã lỗi: <strong>{responseCode}</strong>).
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/user/bills/${invoiceId}`)}
        >
          <FaArrowLeft className="me-1" /> Quay lại hóa đơn
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/payment/${invoiceId}?amount=${amount}`)}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

// ─── Màn hình form thanh toán VNPay ──────────────────────────────────────
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
      const url = await createVNPayUrl(invoiceId, amount);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể kết nối VNPay. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <button
        className="btn btn-link text-secondary text-decoration-none ps-0 mb-3 d-flex align-items-center gap-1"
        onClick={() => navigate(`/user/bills/${invoiceId}`)}
      >
        <FaArrowLeft /> Quay lại hóa đơn
      </button>

      <div className="card shadow-sm border-0 p-4">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
            style={{ width: 48, height: 48, flexShrink: 0 }}
          >
            <FaCreditCard className="text-primary" style={{ fontSize: 20 }} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Thanh toán qua VNPay</h5>
            <p className="text-muted small mb-0">
              Hóa đơn <strong>#{invoiceId}</strong>
            </p>
          </div>
        </div>

        {/* Amount box */}
        <div className="bg-primary rounded-3 p-3 mb-4 text-white">
          <div
            className="small text-white-50 text-uppercase mb-1"
            style={{ letterSpacing: "0.05em" }}
          >
            Số tiền thanh toán
          </div>
          <div className="fs-3 fw-bold">{fmt(amount)}</div>
        </div>

        {/* Payment methods */}
        <ul className="list-unstyled mb-4">
          {[
            "ATM / Internet Banking nội địa",
            "Visa, MasterCard, JCB quốc tế",
            "QR Code (NAPAS, VietQR)",
            "Ví điện tử liên kết",
          ].map((method) => (
            <li
              key={method}
              className="d-flex align-items-center gap-2 bg-light rounded-2 px-3 py-2 mb-2 small text-secondary"
            >
              <span className="text-success">✓</span> {method}
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* CTA */}
        <button
          className="btn btn-primary w-100 py-2 fw-semibold"
          onClick={handleVNPay}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="spin-icon me-2" /> Đang kết nối VNPay...
            </>
          ) : (
            "Tiếp tục thanh toán →"
          )}
        </button>

        <p className="text-center text-muted small mt-3 mb-0 d-flex align-items-center justify-content-center gap-1">
          <FaShieldAlt /> Kết nối bảo mật SSL. Thông tin của bạn được mã hóa an
          toàn.
        </p>
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

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.7s linear infinite; }
      `}</style>
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
        {isVNPayReturn ? (
          <ResultScreen searchParams={searchParams} />
        ) : (
          <PaymentForm invoiceId={invoiceId} amount={amountFromQuery} />
        )}
      </div>
    </>
  );
}
