// pages/tenant/MaintenanceRequestDetail.jsx
import React from "react";
import { useParams,useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTools,
  FaCalendarAlt,
  FaHome,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaImage,
  FaFileAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { imgURL } from "../../api/config";
import LoadingSpinner from "../../components/common/LoadingSpiner";
// import "./maintenance-detail.css";
import { HINTS, STATUS_CONFIG } from "../../utils/maintenanceUtils";
import Lightbox from "../../components/maintenance/LightBox";
import useMaintenanceDetail from "../../../hooks/useMaintenanceDetail";
import { formatDate } from "../../utils/dateUtils";


const InfoBox = ({ label, children }) => (
  <div className="col-12">
    <div className="rounded-3 p-3 bg-light border">
      <p className="text-muted fw-semibold text-uppercase mb-1 small">
        {label}
      </p>
      <div className="fw-semibold small d-flex align-items-center gap-2">
        {children}
      </div>
    </div>
  </div>
);

export default function MaintenanceRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const {
    request,
    loading,
    error,
    lightbox,
    cancelling,
    cancelRequest,
    openLightbox,
    closeLightbox,
    setLightboxIndex,
  } = useMaintenanceDetail(requestId);

  if (loading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="maintenance-detail-header">
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => navigate(-1)} className="back-button">
              <FaArrowLeft className="text-muted" />
            </button>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="maintenance-detail-header">
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => navigate(-1)} className="back-button">
              <FaArrowLeft className="text-muted" />
            </button>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
          </div>
        </div>
        <div className="alert alert-warning rounded-3">{error}</div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[request?.status] ?? {
    label: request?.status,
    badge: "bg-light text-dark",
    chipBg: "bg-light",
    chipText: "text-secondary",
    dot: "bg-secondary",
  };
  const hint = HINTS[request?.status] ?? "";
  const images = request?.images ?? [];
  const curIdx = lightbox.index;

  const imgSrc = (img) => `${imgURL}/api/v1/maintenance/images/${img.imageName}`;

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Lightbox */}
      {lightbox.open && images.length > 0 && (
        <Lightbox
          images={images}
          startIndex={curIdx}
          onClose={closeLightbox}
        />
      )}

      {/* Header */}
      <div className="maintenance-detail-header">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">CHI TIẾT YÊU CẦU</h4>
            <span className="badge bg-warning-subtle text-warning">
              #REQ-{requestId}
            </span>
          </div>
        </div>

        <div className={`status-badge ${cfg.chipBg}`}>
          <span className={`status-dot ${cfg.dot}`} />
          <span className={`small fw-semibold ${cfg.chipText}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="row g-4">
        {/* Left column */}
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Gallery */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {images.length > 0 ? (
              <>
                <div className="gallery-container">
                  <img
                    src={imgSrc(images[curIdx] ?? images[0])}
                    alt=""
                    className="gallery-image"
                    onClick={() => openLightbox(curIdx)}
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
                      <button
                        className="gallery-nav-btn position-absolute top-50 start-0 translate-middle-y ms-2"
                        onClick={() => setLightboxIndex(Math.max(0, curIdx - 1))}
                      >
                        <FaChevronLeft size={12} />
                      </button>

                      <button
                        className="gallery-nav-btn position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setLightboxIndex(Math.min(images.length - 1, curIdx + 1))}
                      >
                        <FaChevronRight size={12} />
                      </button>

                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-1">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            className={`gallery-dot ${i === curIdx ? "gallery-dot-active" : "gallery-dot-inactive"}`}
                            onClick={() => setLightboxIndex(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-dark bg-opacity-50 text-white rounded-3 small">
                      {curIdx + 1}/{images.length} ảnh
                    </span>
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="p-3 d-flex gap-2 flex-wrap bg-light">
                    {images.map((img, i) => (
                      <div
                        key={img.imageId}
                        onClick={() => setLightboxIndex(i)}
                        className={`gallery-thumbnail ${
                          i === curIdx
                            ? "gallery-thumbnail-active"
                            : "gallery-thumbnail-inactive"
                        }`}
                      >
                        <img
                          src={imgSrc(img)}
                          alt=""
                          className="gallery-thumbnail-img"
                          onError={(e) => {
                            e.target.parentElement.classList.add("bg-secondary-subtle");
                            e.target.classList.add("d-none");
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="gallery-empty">
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
            <p className="description-text">{request?.description}</p>
          </div>
        </div>

        {/* Right column */}
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

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className={`rounded-circle d-inline-block flex-shrink-0 ${cfg.dot}`} style={{ width: 10, height: 10 }} />
              <span className={`badge rounded-pill px-3 py-2 small ${cfg.badge}`}>
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

          {/* Cancel action - dùng confirmAction từ hook */}
          {request?.status === "PENDING" && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold mb-3 border-bottom pb-3 d-flex align-items-center gap-2">
                <FaTools className="text-muted" /> Thao tác
              </h6>
              <button
                className="btn btn-outline-danger rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 fw-medium small"
                onClick={cancelRequest}
                disabled={cancelling}
              >
                {cancelling ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FaBan size={12} />
                )}
                Hủy yêu cầu này
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