import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCreditCard,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";
import axiosInstance from "../../api/axios"; // ✅ dùng axiosInstance để gửi JWT

const VNPAY_PROXY =
  import.meta.env.VITE_VNPAY_PROXY_URL || "http://localhost:3001";

const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—");

// ─── Màn hình kết quả sau khi VNPay redirect về ───────────────────────────
function ResultScreen({ searchParams }) {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");
  const rawAmount = searchParams.get("vnp_Amount");
  const amount = rawAmount ? Number(rawAmount) / 100 : null; // VNPay gửi x100

  const isSuccess = responseCode === "00";

  // ✅ Gọi API confirm để insert Payment vào DB — chỉ gọi 1 lần
  const confirmedRef = useRef(false);
  const [confirmStatus, setConfirmStatus] = useState("idle"); // idle | loading | done | error

  useEffect(() => {
    if (!isSuccess || confirmedRef.current) return;
    confirmedRef.current = true;

    setConfirmStatus("loading");

    axiosInstance
      .put(`/user/invoices/${invoiceId}/confirm-vnpay`, null, {
        params: {
          amount: amount,
          transactionCode: txnRef,
        },
      })
      .then(() => setConfirmStatus("done"))
      .catch((err) => {
        console.error("Lỗi confirm VNPay:", err);
        // Nếu lỗi 409 (idempotent — đã PAID rồi) cũng coi là done
        if (err?.response?.status === 409 || err?.response?.status === 200) {
          setConfirmStatus("done");
        } else {
          setConfirmStatus("error");
        }
      });
  }, [isSuccess, invoiceId, amount, txnRef]);

  return (
    <div className="pp-result-wrap">
      {isSuccess ? (
        <>
          <FaCheckCircle className="pp-result-icon pp-result-icon--success" />
          <h3 className="pp-result-title">Thanh toán thành công!</h3>
          <p className="pp-result-sub">Hóa đơn của bạn đã được ghi nhận.</p>

          <div className="pp-result-info">
            <div className="pp-result-row">
              <span>Mã giao dịch</span>
              <strong>{txnRef}</strong>
            </div>
            <div className="pp-result-row">
              <span>Số tiền</span>
              <strong style={{ color: "#10b981" }}>{fmt(amount)}</strong>
            </div>
            <div className="pp-result-row">
              <span>Trạng thái cập nhật</span>
              {confirmStatus === "loading" && (
                <span
                  style={{
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FaSpinner className="pp-spin" /> Đang cập nhật...
                </span>
              )}
              {confirmStatus === "done" && (
                <strong style={{ color: "#10b981" }}>
                  ✅ Đã cập nhật hóa đơn
                </strong>
              )}
              {confirmStatus === "error" && (
                <span style={{ color: "#ef4444" }}>
                  ⚠️ Cập nhật thất bại — vui lòng liên hệ quản lý
                </span>
              )}
            </div>
          </div>

          {/* ✅ Bỏ ghi chú "chờ admin xác nhận" — VNPay tự động cập nhật */}

          <button
            className="pp-btn pp-btn--primary"
            onClick={() => navigate(`/user/bills/${invoiceId}`)}
          >
            Xem lại hóa đơn
          </button>
        </>
      ) : (
        <>
          <FaTimesCircle className="pp-result-icon pp-result-icon--fail" />
          <h3 className="pp-result-title">Thanh toán thất bại</h3>
          <p className="pp-result-sub">
            Giao dịch không thành công (mã lỗi: <strong>{responseCode}</strong>
            ).
          </p>

          <div className="pp-result-actions">
            <button
              className="pp-btn pp-btn--outline"
              onClick={() => navigate(`/user/bills/${invoiceId}`)}
            >
              <FaArrowLeft /> Quay lại hóa đơn
            </button>
            <button
              className="pp-btn pp-btn--primary"
              onClick={() => navigate(`/payment/${invoiceId}?amount=${amount}`)}
            >
              Thử lại
            </button>
          </div>
        </>
      )}
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
      const returnUrl = encodeURIComponent(
        `${window.location.origin}/payment/${invoiceId}`,
      );

      const res = await fetch(
        `${VNPAY_PROXY}/payment?amount=${amount}&invoiceId=${invoiceId}&returnUrl=${returnUrl}`,
      );

      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Không nhận được URL thanh toán từ server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể kết nối VNPay. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="pp-form-wrap">
      <button
        className="pp-back-link"
        onClick={() => navigate(`/user/bills/${invoiceId}`)}
      >
        <FaArrowLeft /> Quay lại hóa đơn
      </button>

      <div className="pp-form-card">
        <div className="pp-form-header">
          <FaCreditCard className="pp-form-icon" />
          <div>
            <h4 className="pp-form-title">Thanh toán qua VNPay</h4>
            <p className="pp-form-sub">
              Hóa đơn <strong>#{invoiceId}</strong>
            </p>
          </div>
        </div>

        <div className="pp-amount-box">
          <span className="pp-amount-label">Số tiền thanh toán</span>
          <span className="pp-amount-val">{fmt(amount)}</span>
        </div>

        <ul className="pp-method-list">
          <li>✅ ATM / Internet Banking nội địa</li>
          <li>✅ Visa, MasterCard, JCB quốc tế</li>
          <li>✅ QR Code (NAPAS, VietQR)</li>
          <li>✅ Ví điện tử liên kết</li>
        </ul>

        {error && (
          <div className="pp-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <button
          className="pp-btn pp-btn--primary pp-btn--full"
          onClick={handleVNPay}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="pp-spin" /> Đang kết nối VNPay...
            </>
          ) : (
            <>Tiếp tục thanh toán →</>
          )}
        </button>

        <p className="pp-secure-note">
          🔒 Kết nối bảo mật SSL. Thông tin của bạn được mã hóa an toàn.
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
      <style>{CSS}</style>
      <div className="pp-root">
        {isVNPayReturn ? (
          <ResultScreen searchParams={searchParams} />
        ) : (
          <PaymentForm invoiceId={invoiceId} amount={amountFromQuery} />
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CSS = `
  .pp-root {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .pp-form-wrap { width: 100%; max-width: 460px; }

  .pp-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 13px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    transition: color 0.15s;
  }
  .pp-back-link:hover { color: #0ea5e9; }

  .pp-form-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }

  .pp-form-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
  }
  .pp-form-icon { font-size: 32px; color: #0ea5e9; flex-shrink: 0; }
  .pp-form-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
  .pp-form-sub   { font-size: 13px; color: #94a3b8; margin: 0; }

  .pp-amount-box {
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .pp-amount-label { font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.06em; }
  .pp-amount-val   { font-size: 28px; font-weight: 700; color: #fff; }

  .pp-method-list {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pp-method-list li { font-size: 14px; color: #475569; padding: 8px 12px; background: #f8fafc; border-radius: 8px; }

  .pp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .pp-btn--primary {
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    color: #fff;
    box-shadow: 0 4px 14px rgba(14,165,233,0.35);
  }
  .pp-btn--primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14,165,233,0.45); }
  .pp-btn--primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .pp-btn--outline { background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; }
  .pp-btn--outline:hover { background: #f8fafc; }
  .pp-btn--full { width: 100%; }

  .pp-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
    border: 1px solid #fecaca;
  }

  .pp-secure-note { text-align: center; font-size: 12px; color: #94a3b8; margin: 14px 0 0; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .pp-spin { animation: spin 0.7s linear infinite; }

  .pp-result-wrap {
    width: 100%;
    max-width: 440px;
    background: #fff;
    border-radius: 20px;
    padding: 48px 32px;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }
  .pp-result-icon        { font-size: 56px; margin-bottom: 20px; display: block; }
  .pp-result-icon--success { color: #10b981; }
  .pp-result-icon--fail    { color: #ef4444; }

  .pp-result-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
  .pp-result-sub   { font-size: 14px; color: #64748b; margin: 0 0 24px; }

  .pp-result-info {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 24px;
    text-align: left;
  }
  .pp-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #64748b;
    padding: 6px 0;
  }
  .pp-result-row:not(:last-child) { border-bottom: 1px solid #e2e8f0; }

  .pp-result-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 8px;
  }
`;
