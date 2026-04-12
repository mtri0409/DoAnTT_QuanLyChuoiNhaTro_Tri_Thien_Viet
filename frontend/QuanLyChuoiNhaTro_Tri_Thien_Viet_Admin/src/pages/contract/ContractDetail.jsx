import React, { useState, useEffect } from "react";
import { exportContractToPDF } from "../../utils/exportContract";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileContract,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaDoorOpen,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUsers,
  FaConciergeBell,
  FaUser,
  FaPhone,
  FaIdCard,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaFilePdf,
  FaBolt,
  FaTint,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";
import apiUser from "../../api/apiUser";

// ====================== CONSTANTS ======================
// Đơn vị điện/nước — tính theo chỉ số, KHÔNG cộng vào tổng cố định
const METER_UNITS = ["kwh", "kWh", "KWH", "m³", "m3", "M3", "m^3"];
const isMeterService = (svc) =>
  METER_UNITS.some(
    (u) => (svc.unitAtSigning || "").trim().toLowerCase() === u.toLowerCase(),
  );

// ====================== HELPERS ======================
const STATUS_CONFIG = {
  ACTIVE: {
    cls: "bg-success-subtle text-success border border-success border-opacity-25",
    label: "Đang hiệu lực",
    icon: <FaCheckCircle />,
  },
  EXPIRED: {
    cls: "bg-danger-subtle text-danger border border-danger border-opacity-25",
    label: "Hết hạn",
    icon: <FaTimesCircle />,
  },
  PENDING: {
    cls: "bg-warning-subtle text-warning border border-warning border-opacity-25",
    label: "Chờ duyệt",
    icon: <FaClock />,
  },
  CANCELLED: {
    cls: "bg-secondary-subtle text-secondary border border-secondary border-opacity-25",
    label: "Đã hủy",
    icon: <FaBan />,
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    cls: "bg-light text-dark border",
    label: status || "N/A",
    icon: null,
  };

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatContractCode = (id) => {
  if (!id) return "N/A";
  return `HD-${String(id).padStart(5, "0")}`;
};

// ====================== INFO ROW ======================
const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="d-flex align-items-start py-2 border-bottom border-light">
    <div className="text-muted me-3 mt-1" style={{ width: 18, flexShrink: 0 }}>
      {icon}
    </div>
    <div className="flex-grow-1">
      <div className="small text-muted mb-1">{label}</div>
      <div
        className={`fw-semibold ${highlight ? "text-primary fs-6" : "text-dark"}`}
      >
        {value}
      </div>
    </div>
  </div>
);

// ====================== SECTION CARD ======================
const SectionCard = ({ icon, title, accent, badge, children }) => (
  <div className="card border-0 shadow-sm rounded-4">
    <div className="card-header bg-white border-0 py-3 px-4">
      <div className="d-flex align-items-center gap-2">
        <div className={`p-2 rounded-3 bg-${accent}-subtle text-${accent}`}>
          {icon}
        </div>
        <h6 className={`fw-bold mb-0 text-${accent}`}>{title}</h6>
        {badge != null && (
          <span
            className={`ms-auto badge bg-${accent} bg-opacity-10 text-${accent} border border-${accent} border-opacity-25`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className="card-body px-4 pt-0">{children}</div>
  </div>
);

// ====================== MAIN COMPONENT ======================
const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // ====================== FETCH ======================
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch hợp đồng, thành viên, dịch vụ song song
        const [contractRes, memberIdsRes, servicesRes] = await Promise.all([
          apiContract.getContractById(id),
          apiContract.getMembers(id),
          apiContract.getServices(id),
        ]);

        setContract(contractRes);

        // 2. Fetch profile từng thành viên
        const memberIds = Array.isArray(memberIdsRes) ? memberIdsRes : [];
        if (memberIds.length > 0) {
          const results = await Promise.allSettled(
            memberIds.map((pid) => apiProfile.getProfileById(pid)),
          );
          setMembers(
            results.filter((r) => r.status === "fulfilled").map((r) => r.value),
          );
        } else {
          setMembers([]);
        }

        // 3. Dịch vụ
        const rawSvcs = servicesRes?.services ?? servicesRes;
        setServices(Array.isArray(rawSvcs) ? rawSvcs : []);

        // 4. Lấy thông tin chủ trọ (ADMIN)
        //    Chiến lược: getAllUsers → tìm user role ADMIN → getProfileById
        //    Dùng pageSize nhỏ vì admin thường ít
        try {
          const usersRes = await apiUser.getAllUsers(1, 50, "userId", "asc");
          // API trả về: { content: [...], totalElements, ... } hoặc mảng trực tiếp
          const userList =
            usersRes?.content ??
            usersRes?.data?.content ??
            usersRes?.data ??
            (Array.isArray(usersRes) ? usersRes : []);

          // Tìm user đầu tiên có role ADMIN
          const adminUser = userList.find(
            (u) => (u.role || u.accountRole || "").toUpperCase() === "ADMIN",
          );

          if (adminUser) {
            // Lấy profileId từ user — tuỳ backend trả về field nào
            const adminProfileId =
              adminUser.profileId ??
              adminUser.profile?.profileId ??
              adminUser.profile?.id ??
              null;

            if (adminProfileId) {
              const profile = await apiProfile.getProfileById(adminProfileId);
              setAdminProfile(profile);
            } else {
              // Fallback: dùng thông tin trực tiếp từ user nếu không có profileId
              setAdminProfile({
                fullName: adminUser.fullName || adminUser.username || null,
                identityNumber: adminUser.identityNumber || null,
                phone: adminUser.phone || null,
                address: adminUser.address || null,
              });
            }
          } else {
            setAdminProfile(null);
          }
        } catch (adminErr) {
          console.warn("Không thể lấy profile ADMIN:", adminErr);
          setAdminProfile(null);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết hợp đồng:", err);
        setError("Không thể tải thông tin hợp đồng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  // ====================== HANDLERS ======================
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await exportContractToPDF({ contract, members, services, adminProfile });
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Có lỗi khi xuất file PDF!");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      await apiContract.deleteContract(id);
      alert("Đã xóa hợp đồng thành công!");
      navigate("/contracts");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa hợp đồng!");
    }
  };

  const handleAutoUpdate = async () => {
    if (!window.confirm("Tự động cập nhật trạng thái hợp đồng này?")) return;
    try {
      setUpdatingStatus(true);
      await apiContract.autoUpdateStatus();
      const updated = await apiContract.getContractById(id);
      setContract(updated);
      alert("Đã cập nhật trạng thái thành công!");
    } catch {
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ====================== COMPUTED ======================
  // Tách dịch vụ: cố định tháng vs chỉ số (điện/nước)
  const monthlyServices = services.filter((s) => !isMeterService(s));
  const meterServices = services.filter((s) => isMeterService(s));

  // Tổng cố định = tiền phòng + dịch vụ tháng (KHÔNG cộng điện/nước)
  const totalMonthlySvcCost = monthlyServices.reduce(
    (sum, s) => sum + Number(s.priceAtSigning ?? 0),
    0,
  );
  const totalFixed = (contract?.rentPrice ?? 0) + totalMonthlySvcCost;

  // ====================== LOADING / ERROR ======================
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center text-muted">
          <div className="spinner-border text-primary mb-3" />
          <p className="small">Đang tải thông tin hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger rounded-4 shadow-sm">
          <strong>Lỗi:</strong> {error || "Không tìm thấy hợp đồng."}
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/contracts")}
        >
          <FaArrowLeft className="me-2" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(contract.status);
  const endDate = contract.endDate ? new Date(contract.endDate) : null;
  const remainingDays = endDate
    ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Ngày thanh toán hàng tháng (backend có thể trả về field paymentDay hoặc billingDay)
  const paymentDay =
    contract.billingDay ??
    contract.paymentDay ??
    contract.paymentDate ??
    contract.payDay ??
    null;

  return (
    <div className="container-fluid py-4">
      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light border-0 shadow-sm rounded-3"
            onClick={() => navigate("/contracts")}
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <FaFileContract className="text-primary fs-5" />
              <h4 className="fw-bold text-dark mb-0">
                {formatContractCode(contract.contractId)}
              </h4>
              <span
                className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${statusCfg.cls}`}
              >
                {statusCfg.icon}
                <span className="ms-1">{statusCfg.label}</span>
              </span>
            </div>
            <p className="text-muted small mb-0">
              Chi tiết hợp đồng thuê phòng
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-secondary shadow-sm"
            onClick={handleAutoUpdate}
            disabled={updatingStatus}
            title="Cập nhật trạng thái"
          >
            <FaSyncAlt className={updatingStatus ? "spin-icon" : ""} />
            <span className="ms-2 d-none d-md-inline">Cập nhật TT</span>
          </button>

          <button
            className="btn btn-outline-danger shadow-sm"
            onClick={handleExportPDF}
            disabled={exporting}
            title="Xuất hợp đồng ra file PDF"
          >
            {exporting ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <FaFilePdf />
            )}
            <span className="ms-2 d-none d-md-inline">
              {exporting ? "Đang xuất..." : "Xuất PDF"}
            </span>
          </button>

          <button
            className="btn btn-outline-primary shadow-sm"
            onClick={() => navigate(`/contracts/${id}/update`)}
          >
            <FaEdit />
            <span className="ms-2 d-none d-md-inline">Chỉnh sửa</span>
          </button>

          {/* <button
            className="btn btn-outline-danger shadow-sm"
            onClick={handleDelete}
          >
            <FaTrash />
            <span className="ms-2 d-none d-md-inline">Xóa</span>
          </button> */}
        </div>
      </div>

      {/* ===== ALERT: Remaining days ===== */}
      {contract.status === "ACTIVE" && remainingDays !== null && (
        <div
          className={`alert rounded-4 shadow-sm mb-4 d-flex align-items-center gap-2 border-0 ${remainingDays <= 30 ? "alert-warning" : "alert-success bg-success-subtle text-success"}`}
        >
          <FaCalendarAlt />
          {remainingDays > 0 ? (
            <span>
              Hợp đồng còn <strong>{remainingDays} ngày</strong> hiệu lực (đến{" "}
              {formatDate(contract.endDate)})
            </span>
          ) : (
            <span>Hợp đồng đã quá hạn — cần cập nhật trạng thái.</span>
          )}
        </div>
      )}

      {/* ===== BANNER: Chủ trọ (ADMIN) ===== */}
      {adminProfile ? (
        <div className="alert border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-3 bg-primary-subtle">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <FaUser size={16} />
          </div>
          <div className="flex-grow-1">
            <div className="small text-muted mb-0">
              Chủ trọ – Bên A (người cho thuê)
            </div>
            <div className="fw-bold text-dark">
              {adminProfile.fullName || "Chưa có tên"}
            </div>
            <div
              className="d-flex gap-3 mt-1 flex-wrap"
              style={{ fontSize: "0.8rem" }}
            >
              {adminProfile.identityNumber && (
                <span className="text-muted">
                  <FaIdCard className="me-1" size={11} />
                  CCCD: {adminProfile.identityNumber}
                </span>
              )}
              {adminProfile.phone && (
                <span className="text-muted">
                  <FaPhone className="me-1" size={11} />
                  {adminProfile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Banner cảnh báo nếu không tìm được admin profile
        <div className="alert border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-2 bg-warning-subtle text-warning">
          <FaUser size={14} />
          <span className="small">
            Chưa tìm được thông tin chủ trọ (ADMIN). Hợp đồng PDF sẽ để trống
            phần Bên A.
          </span>
        </div>
      )}

      <div className="row g-4">
        {/* ===== COL LEFT ===== */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Contract Info */}
          <SectionCard
            icon={<FaFileContract size={16} />}
            title="Thông tin hợp đồng"
            accent="primary"
          >
            <InfoRow
              icon={<FaDoorOpen size={14} />}
              label="Phòng"
              value={
                contract.roomName ||
                (contract.roomId ? `Phòng #${contract.roomId}` : "N/A")
              }
            />
            <InfoRow
              icon={<FaCalendarAlt size={14} />}
              label="Ngày bắt đầu"
              value={formatDate(contract.startDate)}
            />
            <InfoRow
              icon={<FaCalendarAlt size={14} />}
              label="Ngày kết thúc"
              value={formatDate(contract.endDate)}
            />
            {/* Ngày thanh toán hàng tháng */}
            <InfoRow
              icon={<FaCalendarAlt size={14} />}
              label="Ngày thanh toán hàng tháng"
              value={
                paymentDay ? `Ngày ${paymentDay} hàng tháng` : "Chưa xác định"
              }
            />
            <InfoRow
              icon={<FaMoneyBillWave size={14} />}
              label="Giá thuê hàng tháng"
              value={formatCurrency(contract.rentPrice)}
              highlight
            />
            <InfoRow
              icon={<FaShieldAlt size={14} />}
              label="Tiền đặt cọc"
              value={formatCurrency(contract.depositAmount)}
            />
            {contract.note && (
              <div className="mt-3 p-3 bg-light rounded-3">
                <p className="small text-muted mb-1">Ghi chú</p>
                <p className="small text-dark mb-0">{contract.note}</p>
              </div>
            )}
          </SectionCard>

          {/* ===== Cost Summary ===== */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4">
              <h6 className="fw-bold text-dark mb-3">Tổng quan chi phí</h6>

              {/* Tiền phòng */}
              <div className="d-flex justify-content-between py-2 border-bottom border-light">
                <span className="text-muted small">Tiền thuê / tháng</span>
                <span className="fw-semibold small">
                  {formatCurrency(contract.rentPrice)}
                </span>
              </div>

              {/* Dịch vụ tháng (nếu có) */}
              {monthlyServices.length > 0 && (
                <>
                  {monthlyServices.map((svc, idx) => (
                    <div
                      key={idx}
                      className="d-flex justify-content-between py-2 border-bottom border-light"
                    >
                      <span className="text-muted small">
                        <FaConciergeBell
                          className="me-1 opacity-50"
                          size={10}
                        />
                        {svc.serviceName || "Dịch vụ"} /{" "}
                        {svc.unitAtSigning || "tháng"}
                      </span>
                      <span className="fw-semibold small">
                        {formatCurrency(svc.priceAtSigning)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Tổng cố định */}
              <div className="d-flex justify-content-between py-3 border-bottom border-light">
                <div>
                  <span className="fw-bold text-dark small">
                    Tổng cố định / tháng
                  </span>
                  <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                    (chưa bao gồm điện, nước)
                  </div>
                </div>
                <span className="fw-bold text-primary fs-6">
                  {formatCurrency(totalFixed)}
                </span>
              </div>

              {/* Điện nước — tính theo chỉ số, hiển thị riêng */}
              {meterServices.length > 0 && (
                <div className="mt-3 p-3 rounded-3 bg-light border border-secondary border-opacity-10">
                  <div className="small fw-semibold text-secondary mb-2">
                    Tính riêng theo chỉ số thực tế:
                  </div>
                  {meterServices.map((svc, idx) => {
                    const isElec = (svc.unitAtSigning || "")
                      .toLowerCase()
                      .includes("kwh");
                    return (
                      <div
                        key={idx}
                        className="d-flex justify-content-between py-1"
                      >
                        <span className="small text-muted d-flex align-items-center gap-1">
                          {isElec ? (
                            <FaBolt size={10} className="text-warning" />
                          ) : (
                            <FaTint size={10} className="text-info" />
                          )}
                          {svc.serviceName || "Dịch vụ"}
                        </span>
                        <span className="small text-muted">
                          {formatCurrency(svc.priceAtSigning)} /{" "}
                          {svc.unitAtSigning}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tiền cọc */}
              <div className="d-flex justify-content-between pt-3">
                <span className="text-muted small">Tiền đặt cọc (một lần)</span>
                <span className="fw-semibold small">
                  {formatCurrency(contract.depositAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== COL RIGHT ===== */}
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Members */}
          <SectionCard
            icon={<FaUsers size={16} />}
            title="Thành viên hợp đồng"
            accent="success"
            badge={`${members.length} người`}
          >
            {members.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaUsers className="fs-2 mb-2 opacity-25" />
                <p className="small mb-0">Chưa có thành viên nào</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 mt-2">
                {members.map((member, idx) => {
                  const profileId = member.profileId ?? member.id;
                  const isRep = idx === 0;
                  return (
                    <div
                      key={profileId}
                      className={`rounded-3 px-3 py-2 d-flex align-items-center gap-3 ${isRep ? "bg-success-subtle border border-success border-opacity-25" : "bg-light"}`}
                    >
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isRep ? "bg-success text-white" : "bg-white border text-muted"}`}
                        style={{ width: 40, height: 40 }}
                      >
                        <FaUser size={14} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold small text-dark d-flex align-items-center gap-2">
                          {member.fullName ?? "N/A"}
                          {isRep && (
                            <span
                              className="badge bg-success text-white"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Đại diện
                            </span>
                          )}
                        </div>
                        <div
                          className="d-flex gap-3 mt-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {member.phone && (
                            <span className="text-muted">
                              <FaPhone className="me-1" size={10} />
                              {member.phone}
                            </span>
                          )}
                          {member.identityNumber && (
                            <span className="text-muted">
                              <FaIdCard className="me-1" size={10} />
                              {member.identityNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-light border-0 text-primary"
                        onClick={() => navigate(`/profile/${profileId}/detail`)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        Xem
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 pt-2 text-end">
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => navigate(`/contracts/${id}/members`)}
              >
                <FaUsers className="me-1" size={12} /> Quản lý thành viên
              </button>
            </div>
          </SectionCard>

          {/* Services */}
          <SectionCard
            icon={<FaConciergeBell size={16} />}
            title="Dịch vụ đã đăng ký"
            accent="info"
            badge={`${services.length} dịch vụ`}
          >
            {services.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaConciergeBell className="fs-2 mb-2 opacity-25" />
                <p className="small mb-0">Chưa đăng ký dịch vụ nào</p>
              </div>
            ) : (
              <>
                {/* Dịch vụ tháng */}
                {monthlyServices.length > 0 && (
                  <>
                    <p className="small text-muted fw-semibold mt-3 mb-1">
                      Dịch vụ cố định hàng tháng
                    </p>
                    <div className="d-flex flex-column gap-2">
                      {monthlyServices.map((svc, idx) => {
                        const svcId =
                          svc.contractServiceId ?? svc.serviceId ?? idx;
                        return (
                          <div
                            key={svcId}
                            className="d-flex align-items-center gap-3 rounded-3 bg-light px-3 py-2"
                          >
                            <div
                              className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 36, height: 36 }}
                            >
                              <FaConciergeBell size={13} />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold small text-dark">
                                {svc.serviceName ?? `Dịch vụ #${svcId}`}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {formatCurrency(svc.priceAtSigning ?? 0)} /{" "}
                                {svc.unitAtSigning || "tháng"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 px-3 py-2 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25 d-flex justify-content-between">
                      <span className="small fw-bold text-info">
                        Tổng dịch vụ cố định / tháng
                      </span>
                      <span className="fw-bold text-info">
                        {formatCurrency(totalMonthlySvcCost)}
                      </span>
                    </div>
                  </>
                )}

                {/* Điện / Nước — chỉ số */}
                {meterServices.length > 0 && (
                  <>
                    <p className="small text-muted fw-semibold mt-3 mb-1">
                      Điện, nước (tính theo chỉ số thực tế)
                    </p>
                    <div className="d-flex flex-column gap-2">
                      {meterServices.map((svc, idx) => {
                        const svcId =
                          svc.contractServiceId ?? svc.serviceId ?? idx;
                        const isElec = (svc.unitAtSigning || "")
                          .toLowerCase()
                          .includes("kwh");
                        return (
                          <div
                            key={svcId}
                            className="d-flex align-items-center gap-3 rounded-3 px-3 py-2"
                            style={{
                              background: isElec ? "#fffbeb" : "#eff6ff",
                            }}
                          >
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white"
                              style={{
                                width: 36,
                                height: 36,
                                background: isElec ? "#f59e0b" : "#3b82f6",
                              }}
                            >
                              {isElec ? (
                                <FaBolt size={13} />
                              ) : (
                                <FaTint size={13} />
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold small text-dark">
                                {svc.serviceName ?? `Dịch vụ #${svcId}`}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {formatCurrency(svc.priceAtSigning ?? 0)} /{" "}
                                {svc.unitAtSigning}
                                <span
                                  className="ms-2 badge bg-secondary bg-opacity-10 text-secondary"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  Chỉ số thực tế
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 px-3 py-2 bg-secondary bg-opacity-10 rounded-3 border border-secondary border-opacity-10">
                      <span className="small text-muted">
                        ⚡ Tiền điện, nước tính riêng theo chỉ số thực tế hàng
                        tháng, không gộp vào tổng cố định.
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </SectionCard>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ContractDetail;
