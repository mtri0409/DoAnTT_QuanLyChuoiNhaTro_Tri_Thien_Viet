// pages/tenant/ListMaintenanceRequest.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaTools,
  FaEye,
  FaBan,
  FaClock,
  FaHome,
} from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpiner";
import { STATUS_CONFIG } from "../../utils/maintenanceUtils";
import { formatDate } from "../../utils/dateUtils";
import ActionBtn from "../../components/common/ActionBtn";
import MaintenanceFilterSidebar from "../../components/maintenance/MaintenanceFilterSidebar";
import useMaintenanceList from "../../../hooks/useMaintenanceList";
import "./maintenance.css";

export default function ListMaintenanceRequest() {
  const {
    requests,
    loading,
    error,
    pageNumber,
    totalPages,
    filterStatus,
    searchText,
    hoveredCard,
    filteredRequests,
    fetchRequests,
    cancelRequest,
    changePage,
    changeFilterStatus,
    handleSearch,
    handleMouseEnter,
    handleMouseLeave,
    getCountByStatus,
  } = useMaintenanceList();

  const pendingCount = getCountByStatus("PENDING");
  const processingCount = getCountByStatus("PROCESSING");

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      {/* Sticky Header */}
      <div className="bg-white px-3 px-md-4 py-3 shadow-sm border-bottom sticky-top-custom">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
              style={{ width: 44, height: 44 }}
            >
              <FaTools className="text-primary" size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Báo hỏng &amp; Sửa chữa</h5>
              <p className="mb-0 small text-secondary">
                {requests.length} yêu cầu · {pendingCount} chờ xử lý ·{" "}
                {processingCount} đang xử lý
              </p>
            </div>
          </div>
          <Link
            to="/user/requests/create"
            className="btn bg-primary text-white d-flex align-items-center gap-2 px-4 rounded-3 shadow-sm fw-semibold"
          >
            <FaPlus size={12} /> Gửi yêu cầu
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="container-fluid flex-grow-1 py-4 px-3 px-md-4">
        <div className="row g-4 align-items-start">
          {/* Sticky Sidebar */}
          <div className="col-lg-3 col-md-4 sticky-sidebar">
            <MaintenanceFilterSidebar
              searchText={searchText}
              onSearchChange={handleSearch}
              filterStatus={filterStatus}
              onFilterChange={changeFilterStatus}
              getCountByStatus={getCountByStatus}
              requestsLength={requests.length}
              pendingCount={pendingCount}
              processingCount={processingCount}
            />
          </div>

          {/* List Column */}
          <div className="col-lg-9 col-md-8">
            {/* Error */}
            {error && (
              <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 small mb-3">
                {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-auto"
                  onClick={fetchRequests}
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && <LoadingSpinner />}

            {/* Empty state */}
            {!loading && !error && filteredRequests.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <div className="card-body">
                  <div className="fs-1 mb-3">
                    {searchText || filterStatus !== "ALL" ? "🔍" : "🔧"}
                  </div>
                  <h6 className="fw-semibold mb-1 text-dark">
                    {searchText || filterStatus !== "ALL"
                      ? "Không tìm thấy kết quả"
                      : "Chưa có yêu cầu nào"}
                  </h6>
                  <p className="text-muted small mb-3">
                    {searchText || filterStatus !== "ALL"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                      : "Khi có sự cố trong phòng, hãy gửi yêu cầu để được hỗ trợ nhanh chóng."}
                  </p>
                  {!searchText && filterStatus === "ALL" && (
                    <Link
                      to="/user/requests/create"
                      className="btn btn-warning text-dark btn-sm px-4 rounded-3 fw-semibold"
                    >
                      <FaPlus size={11} className="me-1" /> Gửi yêu cầu ngay
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Request list */}
            {!loading && filteredRequests.length > 0 && (
              <div className="d-flex flex-column gap-3">
                {filteredRequests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] ?? {
                    label: req.status,
                    badge: "bg-light text-dark",
                    dot: "#ccc",
                  };
                  const isHov = hoveredCard === req.requestId;
                  const canCancel = req.status === "PENDING";
                  const isCancelled = req.status === "CANCELLED";

                  return (
                    <div
                      key={req.requestId}
                      className={`card border-0 rounded-4 bg-white card-hover-shadow ${
                        isCancelled ? "card-cancelled" : ""
                      }`}
                      onMouseEnter={() => handleMouseEnter(req.requestId)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex gap-3 align-items-start">
                          {/* Status dot */}
                          <div className="flex-shrink-0 pt-1">
                            <span
                              className="rounded-circle d-block"
                              style={{
                                width: 10,
                                height: 10,
                                background: cfg.dot,
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                              <span className="fw-semibold text-dark small">
                                <FaHome size={12} className="me-1 text-warning" />
                                {req.roomName}
                              </span>
                              <span className={`badge rounded-pill ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              {req.images?.length > 0 && (
                                <span className="badge rounded-pill bg-light text-muted">
                                  {req.images.length} ảnh
                                </span>
                              )}
                            </div>

                            <p className="description-line-clamp text-secondary mb-2">
                              {req.description}
                            </p>

                            <div className="d-flex align-items-center gap-3 flex-wrap small">
                              <span className="d-flex align-items-center gap-1 text-secondary">
                                <FaClock size={10} /> {formatDate(req.createdAt)}
                              </span>
                              <span className="text-secondary">
                                #REQ-{req.requestId}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action bar */}
                        <div
                          className={`action-bar-slide ${
                            isHov ? "action-bar-show" : "action-bar-hide"
                          }`}
                        >
                          <div className="d-flex gap-2 flex-wrap pt-3 mt-3 border-top">
                            <ActionBtn
                              to={`/user/requests/${req.requestId}`}
                              icon={<FaEye size={12} />}
                              label="Xem chi tiết"
                              variant="primary"
                            />
                            {canCancel && (
                              <ActionBtn
                                icon={<FaBan size={12} />}
                                label="Hủy yêu cầu"
                                variant="danger"
                                onClick={() => cancelRequest(req.requestId)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === 1}
                  onClick={() => changePage(pageNumber - 1)}
                >
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i + 1)}
                    className={`btn btn-sm px-3 rounded-3 ${
                      i + 1 === pageNumber
                        ? "btn-warning text-dark shadow-sm fw-semibold"
                        : "btn-outline-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === totalPages}
                  onClick={() => changePage(pageNumber + 1)}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}