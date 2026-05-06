import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTools,
  FaCalendarAlt,
  FaHome,
  FaBan,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import { imgURL } from "../../api/config";
import { notify } from "../../utils/swalUtils";

/* ─── Status badge ─── */
const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", bg: "#fff3cd", color: "#856404" },
  PROCESSING: { label: "Đang xử lý", bg: "#cfe2ff", color: "#084298" },
  COMPLETED: { label: "Hoàn thành", bg: "#d1e7dd", color: "#0a3622" },
  CANCELLED: { label: "Đã hủy", bg: "#e2e3e5", color: "#41464b" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || {
    label: status,
    bg: "#f8f9fa",
    color: "#333",
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "5px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {s.label}
    </span>
  );
};

/* ─── Lightbox ─── */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images, onClose]);

  const src = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Nút đóng */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaTimes size={16} />
      </button>

      {/* Prev */}
      {idx > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx - 1);
          }}
          style={{
            position: "absolute",
            left: 20,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaChevronLeft size={18} />
        </button>
      )}

      {/* Ảnh chính */}
      <img
        src={src(images[idx])}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "88vw",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 12,
          boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
        }}
      />

      {/* Next */}
      {idx < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx + 1);
          }}
          style={{
            position: "absolute",
            right: 20,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaChevronRight size={18} />
        </button>
      )}

      {/* Counter + thumbnails */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
          {idx + 1} / {images.length}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {images.map((img, i) => (
            <img
              key={img.imageId}
              src={src(img)}
              alt=""
              onClick={() => setIdx(i)}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 8,
                cursor: "pointer",
                border: i === idx ? "2px solid #fff" : "2px solid transparent",
                opacity: i === idx ? 1 : 0.5,
                transition: "all 0.15s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Trang chính ─── */
const MaintenanceRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiMaintenanceRequest
      .getRequestById(requestId)
      .then(setRequest)
      .catch(() => setError("Không thể tải thông tin yêu cầu"))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;
    setCancelling(true);
    try {
      const updated = await apiMaintenanceRequest.cancelRequest(requestId);
      setRequest(updated);
    } catch (err) {
      notify(err?.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setCancelling(false);
    }
  };

  const imgSrc = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  const formatDate = (dt) =>
    dt
      ? new Date(dt).toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-warning" />
      </div>
    );

  if (error)
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error}</p>
        <button
          className="btn btn-light rounded-3"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div
      style={{ background: "#f5f6fa", minHeight: "100vh", paddingBottom: 48 }}
    >
      {/* Lightbox */}
      {lightbox.open && request?.images?.length > 0 && (
        <Lightbox
          images={request.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      {/* Top bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "14px 0",
        }}
      >
        <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between">
          <button
            className="btn btn-light btn-sm rounded-3 d-flex align-items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={13} />
            <span className="small">Quay lại</span>
          </button>
          <span className="text-muted small fw-semibold">
            Yêu cầu #{request?.requestId}
          </span>
        </div>
      </div>

      <div
        className="container-fluid px-3 px-md-4 mt-4"
        style={{ maxWidth: 760 }}
      >
        {/* Card chính */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Header card */}
          <div
            style={{
              background: "linear-gradient(135deg, #fffbea 0%, #fff8e1 100%)",
              padding: "24px 28px",
              borderBottom: "1px solid #f0e6c0",
            }}
          >
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaTools color="#f59e0b" size={20} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ fontSize: 17 }}>
                    Yêu cầu sửa chữa
                  </h5>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FaHome size={11} />
                    <span>{request?.roomName}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={request?.status} />
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px" }}>
            {/* Mô tả */}
            <div className="mb-4">
              <p
                className="mb-2 fw-semibold"
                style={{
                  fontSize: 11,
                  letterSpacing: 1,
                  color: "#aaa",
                  textTransform: "uppercase",
                }}
              >
                Mô tả sự cố
              </p>
              <p
                style={{
                  background: "#f8f9fa",
                  borderRadius: 12,
                  padding: "14px 16px",
                  margin: 0,
                  lineHeight: 1.7,
                  fontSize: 15,
                  color: "#333",
                }}
              >
                {request?.description}
              </p>
            </div>

            {/* Thông tin dạng grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Ngày gửi
                </p>
                <p className="mb-0 fw-semibold small d-flex align-items-center gap-2">
                  <FaCalendarAlt size={12} color="#f59e0b" />
                  {formatDate(request?.createdAt)}
                </p>
              </div>

              {request?.updatedAt && (
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Cập nhật lúc
                  </p>
                  <p className="mb-0 fw-semibold small d-flex align-items-center gap-2">
                    <FaCalendarAlt size={12} color="#6c757d" />
                    {formatDate(request?.updatedAt)}
                  </p>
                </div>
              )}

              {request?.assetName && (
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Tài sản liên quan
                  </p>
                  <p className="mb-0 fw-semibold small">{request.assetName}</p>
                </div>
              )}
            </div>

            {/* Ảnh đính kèm */}
            {request?.images?.length > 0 && (
              <div>
                <p
                  className="mb-3 fw-semibold"
                  style={{
                    fontSize: 11,
                    letterSpacing: 1,
                    color: "#aaa",
                    textTransform: "uppercase",
                  }}
                >
                  Ảnh đính kèm ({request.images.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {request.images.map((img, i) => (
                    <div
                      key={img.imageId}
                      onClick={() => setLightbox({ open: true, index: i })}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        position: "relative",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <img
                        src={imgSrc(img)}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.parentElement.style.background = "#f0f0f0";
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer action */}
          {request?.status === "PENDING" && (
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                padding: "16px 28px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  background: "#fff1f1",
                  color: "#dc3545",
                  border: "1px solid #f5c2c7",
                  borderRadius: 10,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {cancelling ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FaBan size={12} />
                )}
                Hủy yêu cầu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRequestDetail;
