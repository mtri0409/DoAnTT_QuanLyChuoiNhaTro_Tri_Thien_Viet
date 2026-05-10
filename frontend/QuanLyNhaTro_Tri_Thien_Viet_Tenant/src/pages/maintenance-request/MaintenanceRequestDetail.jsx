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
  FaClock,
  FaImage,
  FaFileAlt,
  FaInfoCircle,
} from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import { imgURL } from "../../api/config";

/**
 * STATUS_CONFIG — every color expressed as Bootstrap utility classes.
 * dot:      background class for the colour dot
 * badge:    for the pill badge in the status card
 * chipBg:   background of the header status chip
 * chipText: text colour of the header status chip
 */
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    badge: "bg-warning-subtle text-warning",
    chipBg: "bg-warning bg-opacity-10",
    chipText: "text-warning-emphasis",
    dot: "bg-warning",
  },
  PROCESSING: {
    label: "Đang xử lý",
    badge: "bg-primary-subtle text-primary",
    chipBg: "bg-primary bg-opacity-10",
    chipText: "text-primary",
    dot: "bg-primary",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-success-subtle text-success",
    chipBg: "bg-success bg-opacity-10",
    chipText: "text-success-emphasis",
    dot: "bg-success",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-secondary-subtle text-secondary",
    chipBg: "bg-secondary bg-opacity-10",
    chipText: "text-secondary",
    dot: "bg-secondary",
  },
};

const HINTS = {
  PENDING: "Yêu cầu đã được ghi nhận, đang chờ phân công kỹ thuật viên.",
  PROCESSING: "Kỹ thuật viên đang tiến hành xử lý sự cố.",
  COMPLETED: "Sự cố đã được khắc phục thành công.",
  CANCELLED: "Yêu cầu đã bị hủy.",
};

/* ─── Lightbox ─────────────────────────────────────────────────── */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const src = (img) => `${imgURL}/api/maintenance/images/${img.imageName}`;

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [images, onClose]);

  /* Transparent circular nav button — reused three times */
  const NavBtn = ({ onClick, className, children }) => (
    <button
      onClick={onClick}
      className={`btn border-0 rounded-circle d-flex align-items-center justify-content-center text-white ${className}`}
      style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)" }}
    >
      {children}
    </button>
  );

  return (
    <div
      onClick={onClose}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,.92)", zIndex: 9999 }}
    >
      <NavBtn onClick={onClose} className="position-absolute top-0 end-0 m-3">
        <FaTimes size={16} />
      </NavBtn>

      {idx > 0 && (
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx - 1);
          }}
          className="position-absolute start-0 ms-3"
        >
          <FaChevronLeft size={18} />
        </NavBtn>
      )}

      <img
        src={src(images[idx])}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="rounded-3 shadow-lg"
        style={{ maxWidth: "88vw", maxHeight: "80vh", objectFit: "contain" }}
      />

      {idx < images.length - 1 && (
        <NavBtn
          onClick={(e) => {
            e.stopPropagation();
            setIdx(idx + 1);
          }}
          className="position-absolute end-0 me-3"
        >
          <FaChevronRight size={18} />
        </NavBtn>
      )}

      <div
        className="position-absolute bottom-0 mb-4 d-flex flex-column align-items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <small className="text-white-50">
          {idx + 1} / {images.length}
        </small>
        <div className="d-flex gap-2">
          {images.map((img, i) => (
            <img
              key={img.imageId}
              src={src(img)}
              alt=""
              onClick={() => setIdx(i)}
              className={`rounded-2 ${i === idx ? "opacity-100 border border-2 border-white" : "opacity-50"}`}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                cursor: "pointer",
                transition: "all .15s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── InfoBox — labelled info row inside the status card ────────── */
function InfoBox({ label, children }) {
  return (
    <div className="col-12">
      <div className="rounded-3 p-3 bg-light border">
        <p
          className="text-muted fw-semibold text-uppercase mb-1"
          style={{ fontSize: 10, letterSpacing: 1 }}
        >
          {label}
        </p>
        <div className="fw-semibold small d-flex align-items-center gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════ */
export default function MaintenanceRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [cancelling, setCancelling] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    apiMaintenanceRequest
      .getRequestById(requestId)
      .then(setRequest)
      .catch(() => setError("Không thể tải thông tin yêu cầu"))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const updated = await apiMaintenanceRequest.cancelRequest(requestId);
      setRequest(updated);
      setConfirm(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể hủy yêu cầu");
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

  /* ── Loading ── */
  if (loading)
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm">
          <div className="btn btn-light border-0 rounded-circle p-2 shadow-sm">
            <FaArrowLeft className="text-muted" />
          </div>
          <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-warning" />
            <p className="text-muted mt-2 small">Đang tải...</p>
          </div>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error)
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
        </div>
        <div className="alert alert-warning rounded-3">{error}</div>
      </div>
    );

  const cfg = STATUS_CONFIG[request?.status] ?? {
    label: request?.status,
    badge: "bg-light text-dark",
    chipBg: "bg-light",
    chipText: "text-secondary",
    dot: "bg-secondary",
  };
  const hint = HINTS[request?.status] ?? "";
  const images = request?.images ?? [];
  const curIdx = lightbox.index ?? 0;

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* ── Lightbox ── */}
      {lightbox.open && images.length > 0 && (
        <Lightbox
          images={images}
          startIndex={curIdx}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      {/* ── Confirm cancel modal ── */}
      {confirm && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,.4)", zIndex: 9998 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-body text-center p-4">
                <div className="fs-1 mb-3">⚠️</div>
                <h6 className="fw-bold mb-1">Hủy yêu cầu này?</h6>
                <p className="text-muted small mb-4">
                  Sau khi hủy bạn không thể khôi phục lại yêu cầu.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-outline-secondary btn-sm px-4 rounded-3"
                    onClick={() => setConfirm(false)}
                  >
                    Không
                  </button>
                  <button
                    className="btn btn-danger btn-sm px-4 rounded-3 d-flex align-items-center gap-2"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FaBan size={12} />
                    )}
                    Hủy yêu cầu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Header ══ */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
            <span className="badge bg-warning-subtle text-warning">
              #REQ-{requestId}
            </span>
          </div>
        </div>

        {/* Status chip — pure Bootstrap */}
        <div
          className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${cfg.chipBg}`}
        >
          <span
            className={`rounded-circle d-inline-block flex-shrink-0 ${cfg.dot}`}
            style={{ width: 8, height: 8 }}
          />
          <span className={`small fw-semibold ${cfg.chipText}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* ══ Content row ══ */}
      <div className="row g-4">
        {/* ── Left col: gallery + description ── */}
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Gallery */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {images.length > 0 ? (
              <>
                {/* Main image area */}
                <div
                  className="position-relative bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                  style={{ aspectRatio: "16/10" }}
                >
                  <img
                    src={imgSrc(images[curIdx] ?? images[0])}
                    alt=""
                    className="w-100 h-100"
                    style={{ objectFit: "cover", cursor: "zoom-in" }}
                    onClick={() => setLightbox({ open: true, index: curIdx })}
                    onError={(e) => {
                      e.target.parentElement.classList.replace(
                        "bg-secondary",
                        "bg-light",
                      );
                      e.target.classList.add("d-none");
                    }}
                  />

                  {images.length > 1 && (
                    <>
                      {/* Prev arrow */}
                      <button
                        className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75"
                        style={{ width: 34, height: 34 }}
                        onClick={() =>
                          setLightbox((l) => ({
                            ...l,
                            index: Math.max(0, l.index - 1),
                          }))
                        }
                      >
                        <FaChevronLeft size={12} />
                      </button>

                      {/* Next arrow */}
                      <button
                        className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75"
                        style={{ width: 34, height: 34 }}
                        onClick={() =>
                          setLightbox((l) => ({
                            ...l,
                            index: Math.min(images.length - 1, l.index + 1),
                          }))
                        }
                      >
                        <FaChevronRight size={12} />
                      </button>

                      {/* Dot indicators */}
                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-1">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            className={`p-0 border-0 rounded-circle ${i === curIdx ? "bg-white" : "bg-white opacity-50"}`}
                            style={{ width: 8, height: 8, cursor: "pointer" }}
                            onClick={() =>
                              setLightbox((l) => ({ ...l, index: i }))
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Counter */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-dark bg-opacity-50 text-white rounded-3 small">
                      {curIdx + 1}/{images.length} ảnh
                    </span>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="p-3 d-flex gap-2 flex-wrap bg-light">
                    {images.map((img, i) => (
                      <div
                        key={img.imageId}
                        onClick={() => setLightbox((l) => ({ ...l, index: i }))}
                        className={`rounded-3 overflow-hidden flex-shrink-0 border ${
                          i === curIdx
                            ? "border-warning opacity-100"
                            : "opacity-50"
                        }`}
                        style={{
                          width: 56,
                          height: 56,
                          cursor: "pointer",
                          transition: "opacity .15s",
                        }}
                      >
                        <img
                          src={imgSrc(img)}
                          alt=""
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.parentElement.classList.add(
                              "bg-secondary-subtle",
                            );
                            e.target.classList.add("d-none");
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="d-flex align-items-center justify-content-center flex-column gap-2 text-muted"
                style={{ aspectRatio: "16/10" }}
              >
                <FaImage size={48} className="opacity-25" />
                <span className="small">Không có ảnh đính kèm</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaFileAlt className="text-warning" /> Mô tả sự cố
            </h6>
            <p
              className="mb-0 text-secondary lh-lg small"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {request?.description}
            </p>
          </div>
        </div>

        {/* ── Right col: room + status + action ── */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Room info */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaHome className="text-warning" /> Thông tin phòng
            </h6>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                <FaHome size={16} />
              </div>
              <div>
                <div className="fw-semibold">{request?.roomName}</div>
                <div className="text-muted small">Phòng đang thuê</div>
              </div>
            </div>
          </div>

          {/* Status + dates */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaInfoCircle className="text-warning" /> Trạng thái
            </h6>

            {/* Status badge row */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className={`rounded-circle d-inline-block flex-shrink-0 ${cfg.dot}`}
                style={{ width: 10, height: 10 }}
              />
              <span
                className={`badge rounded-pill px-3 py-2 small ${cfg.badge}`}
              >
                {cfg.label}
              </span>
            </div>

            {hint && <p className="text-muted small mb-3 lh-base">{hint}</p>}

            <div className="row g-3">
              <InfoBox label="Ngày gửi">
                <FaCalendarAlt size={11} className="text-warning" />
                {formatDate(request?.createdAt)}
              </InfoBox>

              {request?.updatedAt && (
                <InfoBox label="Cập nhật lúc">
                  <FaClock size={11} className="text-muted" />
                  {formatDate(request?.updatedAt)}
                </InfoBox>
              )}

              {request?.assetName && (
                <InfoBox label="Tài sản liên quan">{request.assetName}</InfoBox>
              )}
            </div>
          </div>

          {/* Cancel action */}
          {request?.status === "PENDING" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
                <FaTools className="text-muted" /> Thao tác
              </h6>
              <button
                className="btn btn-outline-danger rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 fw-medium small"
                onClick={() => setConfirm(true)}
                disabled={cancelling}
              >
                <FaBan size={12} /> Hủy yêu cầu này
              </button>
              <p className="text-muted small mt-2 mb-0 text-center">
                Chỉ có thể hủy khi yêu cầu đang ở trạng thái chờ xử lý
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
