import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaBuilding,
  FaSearch,
  FaTrash,
  FaExternalLinkAlt,
  FaEdit,
  FaSync,
  FaTools,
  FaListAlt,
  FaPlus,
  FaEye,
  FaTimesCircle,
} from "react-icons/fa";
import apiExpenses from "../../api/apiExpenses";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";

// ── Constants ──────────────────────────────────────────────────────────────────
const PAYER_TABS = [
  {
    value: "",
    label: "Tất cả",
    icon: <FaListAlt />,
    color: "#6366f1",
    bg: "#eef2ff",
    desc: "Xem toàn bộ chi phí",
  },
  {
    value: "TENANT_FAULT",
    label: "Lỗi khách",
    icon: <FaFileInvoiceDollar />,
    color: "#3b82f6",
    bg: "#eff6ff",
    desc: "Phát sinh hóa đơn sửa chữa",
  },
  {
    value: "OWNER_COST",
    label: "Chi phí trọ",
    icon: <FaBuilding />,
    color: "#16a34a",
    bg: "#f0fdf4",
    desc: "Chi phí vận hành nội bộ",
  },
];

const EXPENSE_CATEGORIES = [
  "Sửa điện",
  "Sửa nước",
  "Sửa điều hòa",
  "Sửa cửa / khóa",
  "Sơn tường",
  "Thay thiết bị",
  "Vệ sinh",
  "Chi phí khác",
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "amount", label: "Số tiền" },
  { value: "paymentDate", label: "Ngày thanh toán" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount || 0,
  );

const fmtDate = (dt) =>
  dt
    ? new Date(dt).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const payerMeta = (payer) =>
  PAYER_TABS.find((t) => t.value === payer) || PAYER_TABS[1];

// ── PayerBadge ─────────────────────────────────────────────────────────────────
const PayerBadge = ({ payer }) => {
  const m = payerMeta(payer);
  return (
    <span
      style={{
        background: m.bg,
        color: m.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {m.icon} {m.label}
    </span>
  );
};

// ══ Trang chính ═══════════════════════════════════════════════════════════════
const ListExpenses = () => {
  const navigate = useNavigate();

  // Data
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12;

  // Filters
  const [payerTab, setPayerTab] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Actions
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(
    async (p = 1, pt = payerTab, search = appliedSearch) => {
      setLoading(true);
      try {
        const res = await apiExpenses.filter(
          {
            payer: pt || undefined,
            // truyền search nếu API hỗ trợ param keyword/search
            ...(search && { keyword: search }),
          },
          p,
          PAGE_SIZE,
          sortBy,
          sortOrder,
        );
        const d = res?.data || res;
        setExpenses(d.content || []);
        setTotalPages(d.totalPages || 1);
        setTotalElements(d.totalElements || 0);
      } catch {
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    },
    [payerTab, appliedSearch, sortBy, sortOrder],
  );

  useEffect(() => {
    load(page);
  }, [page, sortBy, sortOrder]); // eslint-disable-line

  // Khi đổi tab payer
  const handleTabChange = (val) => {
    setPayerTab(val);
    setPage(1);
    load(1, val, appliedSearch);
  };

  // Search handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchTerm);
    load(1, payerTab, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setPage(1);
    load(1, payerTab, "");
  };

  // Pagination – component trả về page 0-based
  const handlePageChange = (p) => {
    setPage(p + 1);
  };

  const handleDelete = async (id) => {
    const result = await confirmAction({
        title: 'Khôi phục hồ sơ',
        text: `Bạn có chắc chi phí này không ?`,
        icon: 'info'
      });
    if(!result.isConfirmed) return
    setDeletingId(id);
    try {
      await apiExpenses.delete(id);
      setExpenses((prev) => prev.filter((e) => e.expenseId !== id));
      setTotalElements((t) => t - 1);
      toast.success("Xóa chi phí thành công")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa");
    } finally {
      setDeletingId(null);
    }
  };

  // Stats (trang hiện tại)
  const totalTenantFault = expenses
    .filter((e) => e.payer === "TENANT_FAULT")
    .reduce((s, e) => s + (e.amount || 0), 0);
  const totalOwnerCost = expenses
    .filter((e) => e.payer === "OWNER_COST")
    .reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="container-fluid py-4">
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ CHI PHÍ</h4>
          <p className="text-muted small mb-0">
            Theo dõi chi phí vận hành và sửa chữa
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
            onClick={() => navigate("/expenses/create")}
          >
            <FaPlus size={13} /> <span>Tạo thủ công</span>
          </button>
          <button
            className="btn btn-outline-secondary shadow-sm d-flex align-items-center gap-2"
            onClick={() => load(page)}
            title="Làm mới"
          >
            <FaSync size={13} />
          </button>
        </div>
      </div>

      {/* ── Payer Tabs (nav-pills style giống ListProfile) ── */}
      <ul className="nav nav-pills mb-4 bg-white p-1 rounded-3 shadow-sm d-inline-flex border">
        {PAYER_TABS.map((t) => (
          <li className="nav-item" key={t.value}>
            <button
              className={`nav-link px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${payerTab === t.value ? "active" : "text-muted"}`}
              onClick={() => handleTabChange(t.value)}
            >
              {t.icon} {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Main Card ── */}
      <div className="card border-0 shadow-sm rounded-3">
        {/* TOOLBAR */}
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex gap-2"
            style={{ maxWidth: 400, flex: 1 }}
          >
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Tìm theo danh mục, thợ, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {appliedSearch && (
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

          {/* Sort controls */}
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm border-0 bg-light"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm border-0 bg-light"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
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
                <th className="ps-4 py-3">#</th>
                <th>Loại</th>
                <th>Danh mục</th>
                <th>Số tiền</th>
                <th>Thợ / Đơn vị</th>
                <th>Chi nhánh</th>
                <th>Mã YC</th>
                <th>Hóa đơn</th>
                <th>Ngày tạo</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-5">
                    <FaSync
                      className="text-muted"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <div className="text-muted small mt-2">Đang tải...</div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    Không có chi phí nào
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.expenseId}>
                    <td className="ps-4 small text-muted fw-medium">
                      #{e.expenseId}
                    </td>
                    <td>
                      <PayerBadge payer={e.payer} />
                    </td>
                    <td className="small text-secondary">
                      {e.expenseCategory || "—"}
                    </td>
                    <td className="fw-bold text-dark">{fmt(e.amount)}</td>
                    <td className="small text-secondary">
                      {e.payeeName || "—"}
                    </td>
                    <td className="small">
                      {e.branchName ? (
                        <span className="d-inline-flex align-items-center gap-1">
                          <FaBuilding size={10} className="text-muted" />{" "}
                          {e.branchName}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {e.maintenanceRequestId ? (
                        <a
                          href={`/maintenance/${e.maintenanceRequestId}/detail`}
                          className="text-decoration-none d-inline-flex align-items-center gap-1 badge"
                          style={{
                            background: "#eef2ff",
                            color: "#6366f1",
                            padding: "4px 8px",
                            borderRadius: 6,
                          }}
                        >
                          <FaTools size={9} /> #{e.maintenanceRequestId}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {e.invoiceId ? (
                        <a
                          href={`/invoice/${e.invoiceId}`}
                          className="text-decoration-none d-inline-flex align-items-center gap-1 badge"
                          style={{
                            background: "#eff6ff",
                            color: "#3b82f6",
                            padding: "4px 8px",
                            borderRadius: 6,
                          }}
                        >
                          <FaFileInvoiceDollar size={9} /> #{e.invoiceId}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="small text-muted"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {fmtDate(e.createdAt)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        {/* Xem chi tiết */}
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xem chi tiết"
                          onClick={() =>
                            navigate(`/expenses/${e.expenseId}/detail`)
                          }
                        >
                          <FaEye className="text-info" />
                        </button>
                        {/* Chỉnh sửa */}
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Chỉnh sửa"
                          onClick={() =>
                            navigate(`/expenses/${e.expenseId}/edit`)
                          }
                        >
                          <FaEdit className="text-primary" />
                        </button>
                        {/* Xóa */}
                        <button
                          className="btn btn-sm btn-light border-0"
                          title="Xóa"
                          onClick={() => handleDelete(e.expenseId)}
                          disabled={deletingId === e.expenseId}
                        >
                          {deletingId === e.expenseId ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              style={{ width: 10, height: 10 }}
                            />
                          ) : (
                            <FaTrash className="text-danger" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG – giống ListProfile */}
        <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center border-0">
          <small className="text-muted">Tổng: {totalElements}</small>
          <Pagination
            currentPage={page - 1} // Pagination nhận 0-based
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Sub components ─────────────────────────────────────────────────────────────
function ActionBtn({ icon, color, title, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: `${color}15`,
        border: "none",
        borderRadius: 6,
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        color,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
    </button>
  );
}

export default ListExpenses;
