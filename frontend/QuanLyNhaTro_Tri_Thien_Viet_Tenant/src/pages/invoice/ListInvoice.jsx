import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaClipboardList,
  FaEye,
  FaBell,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";
import { STATUS_META, TABS, TYPE_META } from "../../utils/invoiceUtils";
import LoadingSpinner from "../../components/common/LoadingSpiner";
import useInvoiceList from "../../../hooks/useInvoiceList";
import "./invoice.css"; // Import CSS dùng chung
import InvoiceCard from "../../components/invoice/InvoiceCard";



export default function ListInvoice() {

  const {
    invoices,
    loading,
    pageNumber,
    totalPages,
    totalElements,
    activeTab,
    urgentCount,
    hoveredId,
    changeTab,
    changeYear,
    changePage,
    handleMouseEnter,
    handleMouseLeave,
  } = useInvoiceList();

  if (loading) {
    return <LoadingSpinner />;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      <div className="container-fluid py-4 px-3 px-md-5" style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-3 bg-primary-subtle invoice-icon-wrapper">
              <FaFileInvoiceDollar className="text-primary fs-5" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 invoice-title">Hóa đơn của tôi</h5>
              <div className="text-muted small">Quản lý và thanh toán các hóa đơn phòng trọ</div>
            </div>
          </div>

          {activeTab !== "ALL" && (
            <select
              className="form-select form-select-sm rounded-3 w-auto"
              style={{ fontSize: 13 }}
              value={currentYear}
              onChange={(e) => changeYear(Number(e.target.value))}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Urgent Banner */}
        {urgentCount > 0 && activeTab !== "NEED_PAY" && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between rounded-3 py-2 px-3 mb-3 small">
            <span className="d-flex align-items-center gap-2">
              <FaBell />
              Bạn có <strong>{urgentCount} hóa đơn</strong> cần thanh toán
            </span>
            <button
              className="btn btn-warning btn-sm rounded-3 fw-semibold"
              style={{ fontSize: 12 }}
              onClick={() => changeTab("NEED_PAY")}
            >
              Xem ngay
            </button>
          </div>
        )}

        {/* Row: sidebar + list */}
        <div className="row g-3">
          {/* Sidebar */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-2">
              <div className="small fw-semibold text-uppercase text-muted px-2 pt-1 pb-2 invoice-sidebar-title">
                Lọc theo trạng thái
              </div>
              <div className="d-flex flex-column gap-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => changeTab(tab.key)}
                      className={`btn btn-sm text-start rounded-3 d-flex align-items-center justify-content-between px-3 py-2 ${
                        isActive ? "btn-primary fw-semibold" : "btn-light text-secondary fw-medium"
                      }`}
                      style={{ fontSize: 13 }}
                    >
                      <span className="d-flex align-items-center gap-2">
                        {tab.urgent && <FaBell size={11} />}
                        {tab.label}
                      </span>
                      {tab.urgent && urgentCount > 0 && (
                        <span className={`badge rounded-pill ${isActive ? "bg-white text-primary" : "bg-danger text-white"}`} style={{ fontSize: 10 }}>
                          {urgentCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="col-12 col-md-9">
            {/* Summary row */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">{totalElements} hóa đơn</span>
            </div>

            {/* Empty state */}
            {!loading && invoices.length === 0 && (
              <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                <FaFileInvoiceDollar size={36} className="text-muted mb-3 mx-auto" />
                <p className="text-muted mb-0">Không có hóa đơn nào</p>
              </div>
            )}

            {/* Invoice list */}
            {!loading && invoices.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {invoices.map((inv, idx) => {
                  return <InvoiceCard 
                    key={idx}
                    invoice={inv}  
                    isHover={hoveredId === inv.invoiceId}
                    onMouseEnter={() => handleMouseEnter(inv.invoiceId)}
                    onMouseLeave={handleMouseLeave}/>
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && activeTab !== "NEED_PAY" && activeTab !== "ALL" && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  disabled={pageNumber === 1}
                  onClick={() => changePage(pageNumber - 1)}
                >
                  ← Trước
                </button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => changePage(pageNum)}
                      className={`btn btn-sm px-3 rounded-3 ${
                        pageNum === pageNumber ? "btn-primary shadow-sm fw-semibold" : "btn-outline-secondary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="btn btn-sm px-2">...</span>}
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