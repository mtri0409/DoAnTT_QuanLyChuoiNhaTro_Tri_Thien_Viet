import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaPaperPlane,
  FaCheckDouble,
  FaEye,
  FaPlus,
  FaSync,
  FaCalendarAlt,
  FaClipboardList,
  FaShieldAlt,
  FaWrench,
  FaTimesCircle,
  FaMailBulk,
  FaBan,
} from "react-icons/fa";
import apiInvoice from "../../api/apiInvoice";
import apiBranches from "../../api/apiBranches";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";

// ── Constants ──────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  {
    value: "",
    label: "Tất cả",
    icon: <FaClipboardList />,
    color: "text-primary",
    bg: "bg-primary-subtle",
  },
  {
    value: "MONTHLY",
    label: "Hàng tháng",
    icon: <FaCalendarAlt />,
    color: "text-info",
    bg: "bg-info-subtle",
  },
  {
    value: "DEPOSIT",
    label: "Tiền cọc",
    icon: <FaShieldAlt />,
    color: "text-warning",
    bg: "bg-warning-subtle",
  },
  {
    value: "REPAIR",
    label: "Sửa chữa",
    icon: <FaWrench />,
    color: "text-danger",
    bg: "bg-danger-subtle",
  },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PARTIAL", label: "Thanh toán một phần" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn cọc" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_BADGE = {
  DRAFT: {
    cls: "bg-secondary-subtle text-secondary",
    label: "Nháp",
    style: {},
  },
  PENDING: {
    cls: "bg-warning-subtle text-warning",
    label: "Chờ thanh toán",
    style: {},
  },
  PARTIAL: {
    cls: "",
    label: "Thanh toán 1 phần",
    style: { background: "#ffe2cd", color: "#ff6600" },
  },
  PAID: {
    cls: "bg-success-subtle text-success",
    label: "Đã thanh toán",
    style: {},
  },
  REFUNDED: {
    cls: "",
    label: "Đã hoàn cọc",
    style: { background: "#8b5cf6", color: "#fff" },
  },
  CANCELLED: {
    cls: "bg-danger-subtle text-danger",
    label: "Đã hủy",
    style: {},
  },
};

const TYPE_BADGE = {
  MONTHLY: { cls: "bg-info-subtle text-info", label: "Hàng tháng" },
  DEPOSIT: { cls: "bg-warning-subtle text-warning", label: "Tiền cọc" },
  REPAIR: { cls: "bg-danger-subtle text-danger", label: "Sửa chữa" },
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));
const YEARS = [2024, 2025, 2026, 2027];

const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

// ── Component Chính ─────────────────────────────────────────────────────────────
export default function ListInvoice() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters
  const [invoiceType, setInvoiceType] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [branchId, setBranchId] = useState("");
  const [contractIdInput, setContractIdInput] = useState("");
  const [appliedContractId, setAppliedContractId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Branches
  const [branches, setBranches] = useState([]);
  useEffect(() => {
    apiBranches
      .getAllBranches(1, 100)
      .then((res) => setBranches(res?.content || res || []))
      .catch(() => {});
  }, []);

  // Modals
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMonth, setSendMonth] = useState(new Date().getMonth() + 1);
  const [sendYear, setSendYear] = useState(new Date().getFullYear());
  const [sendLoading, setSendLoading] = useState(false);

  // ── Fetch ──
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiInvoice.filter(
        {
          type: invoiceType || undefined,
          status: status || undefined,
          month: month || undefined,
          year: year || undefined,
          contractId: appliedContractId || undefined,
          branchId: branchId || undefined,
        },
        currentPage,
        10,
        sortBy,
        sortOrder,
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    invoiceType,
    status,
    month,
    year,
    appliedContractId,
    branchId,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ── Handlers ──
  const handleAction = async (invoiceId, action, label) => {
    if (!window.confirm(`Xác nhận: ${label}?`)) return;
    setActionLoading(invoiceId);
    try {
      await action(invoiceId);
      await fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || `Lỗi thực hiện: ${label}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoGenerate = async () => {
    setGenLoading(true);
    try {
      const res = await apiInvoice.autoGenerate(genMonth, genYear);
      toast.success(` Đã tạo ${res.length} hóa đơn tháng ${genMonth}/${genYear}`);
      setShowGenModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tạo hóa đơn");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSendAll = async () => {
    setSendLoading(true);
    try {
      const res = await apiInvoice.sendAll(sendMonth, sendYear);
      toast.success(` Đã gửi ${res.length} hóa đơn kỳ ${sendMonth}/${sendYear}`);
      setShowSendModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi gửi hóa đơn hàng loạt");
    } finally {
      setSendLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedContractId(contractIdInput);
  };

  const handleClearSearch = () => {
    setContractIdInput("");
    setAppliedContractId("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page + 1);

  return (
    <div className="container-fluid py-4">
      {/* ── Modal: Gửi tất cả ── */}
      {showSendModal && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            display: "flex !important",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 400 }}
          >
            <div className="modal-content border-0 shadow rounded-4 p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="bg-warning-subtle rounded-3 p-2 text-warning fs-5">
                  <FaMailBulk />
                </div>
                <h5 className="fw-bold mb-0">Gửi hóa đơn hàng loạt</h5>
              </div>
              <p className="text-muted small mb-4">
                Hệ thống sẽ gửi thông báo cho toàn bộ hóa đơn <b>NHÁP</b> của kỳ
                đã chọn.
              </p>
              <div className="row g-2 mb-4">
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={sendMonth}
                    onChange={(e) => setSendMonth(Number(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={sendYear}
                    onChange={(e) => setSendYear(Number(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => setShowSendModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-warning flex-fill fw-bold"
                  onClick={handleSendAll}
                  disabled={sendLoading}
                >
                  {sendLoading ? "Đang gửi..." : "Gửi ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Auto Generate ── */}
      {showGenModal && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 400 }}
          >
            <div className="modal-content border-0 shadow rounded-4 p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="bg-primary-subtle rounded-3 p-2 text-primary fs-5">
                  <FaSync />
                </div>
                <h5 className="fw-bold mb-0">Tạo hóa đơn hàng loạt</h5>
              </div>
              <p className="text-muted small mb-4">
                Tự động tạo hóa đơn cho toàn bộ hợp đồng đang hoạt động theo kỳ
                chọn.
              </p>
              <div className="row g-2 mb-4">
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={genMonth}
                    onChange={(e) => setGenMonth(Number(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={genYear}
                    onChange={(e) => setGenYear(Number(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => setShowGenModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary flex-fill fw-bold"
                  onClick={handleAutoGenerate}
                  disabled={genLoading}
                >
                  {genLoading ? "Đang tạo..." : "Tạo ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ HÓA ĐƠN</h4>
          <p className="text-muted small mb-0">
            Hệ thống quản lý hóa đơn thuê phòng, tiền cọc và sửa chữa
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-warning shadow-sm d-flex align-items-center gap-2"
            onClick={() => setShowSendModal(true)}
          >
            <FaMailBulk size={14} />{" "}
            <span className="d-none d-md-inline">Gửi theo kỳ</span>
          </button>
          <button
            className="btn btn-outline-secondary shadow-sm d-flex align-items-center gap-2"
            onClick={() => setShowGenModal(true)}
          >
            <FaSync size={14} />{" "}
            <span className="d-none d-md-inline">Auto tạo</span>
          </button>
          <button
            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/invoice/create")}
          >
            <FaPlus size={14} /> Tạo thủ công
          </button>
        </div>
      </div>

      {/* ── Tab Loại hóa đơn ── */}
      <ul className="nav nav-pills mb-4 bg-white p-1 rounded-3 shadow-sm d-inline-flex border">
        {TYPE_OPTIONS.map((t) => (
          <li className="nav-item" key={t.value}>
            <button
              className={`nav-link px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${invoiceType === t.value ? "active" : "text-muted"}`}
              onClick={() => {
                setInvoiceType(t.value);
                setCurrentPage(1);
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Card bảng dữ liệu ── */}
      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Search theo contract ID */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: 360, flex: 1 }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm theo mã hợp đồng..."
                value={contractIdInput}
                onChange={(e) => setContractIdInput(e.target.value)}
              />
              {appliedContractId && (
                <button
                  type="button"
                  className="btn btn-light border-0"
                  onClick={handleClearSearch}
                >
                  <FaTimesCircle className="text-muted" />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-dark shadow-sm">
              Tìm
            </button>
          </form>

          {/* Filters phụ */}
          <div className="d-flex gap-2 flex-wrap">
            {/* Tháng */}
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 130 }}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả tháng</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Năm */}
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 100 }}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Trạng thái */}
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 165 }}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Chi nhánh — highlight giống ListProfile */}
            <select
              className="form-select form-select-sm border-0 bg-primary-subtle text-primary fw-bold"
              style={{ width: 180 }}
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))
              ) : (
                <option disabled>Chưa có chi nhánh</option>
              )}
            </select>

            {/* Sắp xếp */}
            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 155 }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="createdAt">Sắp xếp: Ngày tạo</option>
              <option value="periodYear">Sắp xếp: Kỳ</option>
              <option value="totalAmount">Sắp xếp: Tổng tiền</option>
              <option value="dueDate">Sắp xếp: Hạn TT</option>
            </select>

            <select
              className="form-select form-select-sm border-0 bg-light"
              style={{ width: 115 }}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Hợp đồng</th>
                <th>Loại</th>
                <th>Kỳ</th>
                <th>Tổng tiền</th>
                <th className="text-center">Trạng thái</th>
                <th>Hạn thanh toán</th>
                <th>Ngày tạo</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <span className="spinner-border spinner-border-sm me-2" />{" "}
                    Đang tải...
                  </td>
                </tr>
              ) : data.content?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <FaFileInvoiceDollar className="fs-3 mb-2 d-block mx-auto text-secondary" />
                    Không có hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                data.content.map((inv) => {
                  const typeBadge = TYPE_BADGE[inv.type] || {
                    cls: "bg-light text-dark",
                    label: inv.type,
                  };
                  const statusBadge = STATUS_BADGE[inv.status] || {
                    cls: "bg-light text-dark",
                    label: inv.status,
                  };
                  const isActioning = actionLoading === inv.invoiceId;
                  return (
                    <tr key={inv.invoiceId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <FaFileInvoiceDollar className="text-secondary" />
                          <div>
                            <div className="fw-bold">HĐ #{inv.contractId}</div>
                            <div className="text-muted small">
                              {inv.roomName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill fw-normal ${typeBadge.cls}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="small">
                        {inv.periodMonth && inv.periodYear
                          ? `T${inv.periodMonth}/${inv.periodYear}`
                          : "—"}
                      </td>
                      <td className="fw-bold small">{fmt(inv.totalAmount)}</td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill fw-normal ${statusBadge.cls}`}
                          style={statusBadge.style || {}}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="small">{fmtDate(inv.dueDate)}</td>
                      <td className="small">{fmtDate(inv.createdAt)}</td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          {/* Xem chi tiết */}
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem chi tiết"
                            onClick={() =>
                              navigate(`/invoice/${inv.invoiceId}`)
                            }
                          >
                            <FaEye className="text-info" />
                          </button>

                          {/* Gửi (DRAFT) */}
                          {inv.status === "DRAFT" && (
                            <button
                              className="btn btn-sm btn-light border-0"
                              title="Gửi hóa đơn"
                              disabled={isActioning}
                              onClick={() =>
                                handleAction(
                                  inv.invoiceId,
                                  apiInvoice.send,
                                  "Gửi hóa đơn",
                                )
                              }
                            >
                              <FaPaperPlane className="text-warning" />
                            </button>
                          )}

                          {/* Xác nhận thu (PENDING) */}
                          {inv.status === "PENDING" && (
                            <button
                              className="btn btn-sm btn-light border-0"
                              title="Xác nhận đã thu"
                              disabled={isActioning}
                              onClick={() =>
                                handleAction(
                                  inv.invoiceId,
                                  apiInvoice.markPaid,
                                  "Xác nhận đã thu",
                                )
                              }
                            >
                              <FaCheckDouble className="text-success" />
                            </button>
                          )}

                          {/* Hủy (DRAFT / PENDING) */}
                          {["DRAFT", "PENDING"].includes(inv.status) && (
                            <button
                              className="btn btn-sm btn-light border-0"
                              title="Hủy hóa đơn"
                              disabled={isActioning}
                              onClick={() =>
                                handleAction(
                                  inv.invoiceId,
                                  apiInvoice.cancel,
                                  "Hủy hóa đơn",
                                )
                              }
                            >
                              <FaBan className="text-danger" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">
            Tổng: {data.totalElements} hóa đơn
          </small>
          <Pagination
            currentPage={data.pageNumber}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
