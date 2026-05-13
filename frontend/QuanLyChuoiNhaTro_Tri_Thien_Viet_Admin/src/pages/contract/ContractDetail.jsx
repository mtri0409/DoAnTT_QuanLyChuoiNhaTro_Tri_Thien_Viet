import React, { useState, useEffect } from "react";
import { exportContractToPDF } from "../../utils/exportContract";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaSyncAlt,
  FaFilePdf,
  FaFileContract,
  FaDoorOpen,
  FaCalendarAlt,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCreditCard,
  FaStickyNote,
  FaUsers,
  FaUserTie,
  FaIdCard,
  FaPhone,
  FaTools,
  FaBolt,
  FaEye,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTint,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";
import apiUser from "../../api/apiUser";
import { toast } from "react-toastify";

// ====================== CONSTANTS ======================
const METER_UNITS = ["kwh", "kWh", "KWH", "m³", "m3", "M3", "m^3"];
const isMeterService = (svc) =>
  METER_UNITS.some(
    (u) => (svc.unitAtSigning || "").trim().toLowerCase() === u.toLowerCase(),
  );

const STATUS_BADGE = {
  ACTIVE: { cls: "bg-success-subtle text-success", label: "Đang hiệu lực" },
  EXPIRED: { cls: "bg-danger-subtle text-danger", label: "Hết hạn" },
  PENDING: { cls: "bg-warning-subtle text-warning", label: "Chờ duyệt" },
  CANCELLED: { cls: "bg-secondary-subtle text-secondary", label: "Đã hủy" },
};
const getStatusBadge = (s) =>
  STATUS_BADGE[s] || { cls: "bg-light text-dark", label: s || "N/A" };

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const formatCurrency = (v) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v);

const formatContractCode = (id) =>
  id ? `HD-${String(id).padStart(5, "0")}` : "—";

const isWaterService = (svc) => {
  const n = (svc.serviceName || "").toLowerCase();
  const u = (svc.unitAtSigning || "").toLowerCase();
  return (
    n.includes("nước") ||
    n.includes("nuoc") ||
    n.includes("water") ||
    ["m³", "m3", "m^3"].includes(u)
  );
};
const getMeterIcon = (svc) => (isWaterService(svc) ? FaTint : FaBolt);
const getMeterColor = (svc) =>
  isWaterService(svc) ? "text-info" : "text-warning";

// ====================== SUB-COMPONENTS ======================
const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="d-flex align-items-center py-2 border-bottom border-light">
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0 me-3 rounded-2 bg-light text-secondary"
      style={{ width: 28, height: 28 }}
    >
      <Icon size={12} />
    </div>
    <div className="d-flex justify-content-between align-items-center w-100">
      <span className="text-muted small">{label}</span>
      <span
        className={`${highlight ? "fw-bold fs-6 text-dark" : "fw-medium small text-dark"}`}
      >
        {value}
      </span>
    </div>
  </div>
);

const Section = ({ title, icon: TitleIcon, children, action }) => (
  <div className="card border-0 shadow-sm rounded-3 mb-4">
    <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-2">
        {TitleIcon && <TitleIcon size={13} className="text-secondary" />}
        <span
          className="text-muted text-uppercase fw-bold"
          style={{ letterSpacing: "0.06em", fontSize: "0.72rem" }}
        >
          {title}
        </span>
      </div>
      {action}
    </div>
    <div className="card-body pt-0">{children}</div>
  </div>
);

// ====================== MAIN ======================
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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contractRes, memberIdsRes, servicesRes] = await Promise.all([
          apiContract.getContractById(id),
          apiContract.getMembers(id),
          apiContract.getServices(id),
        ]);
        setContract(contractRes);
        const memberIds = Array.isArray(memberIdsRes) ? memberIdsRes : [];
        if (memberIds.length > 0) {
          const results = await Promise.allSettled(
            memberIds.map((pid) => apiProfile.getProfileById(pid)),
          );
          setMembers(
            results.filter((r) => r.status === "fulfilled").map((r) => r.value),
          );
        }
        const rawSvcs = servicesRes?.services ?? servicesRes;
        setServices(Array.isArray(rawSvcs) ? rawSvcs : []);
        try {
          const usersRes = await apiUser.getAllUsers(1, 50, "userId", "asc");
          const userList =
            usersRes?.content ??
            usersRes?.data?.content ??
            usersRes?.data ??
            (Array.isArray(usersRes) ? usersRes : []);
          const adminUser = userList.find(
            (u) => (u.role || u.accountRole || "").toUpperCase() === "ADMIN",
          );
          if (adminUser) {
            const adminProfileId =
              adminUser.profileId ??
              adminUser.profile?.profileId ??
              adminUser.profile?.id ??
              null;
            if (adminProfileId)
              setAdminProfile(await apiProfile.getProfileById(adminProfileId));
            else
              setAdminProfile({
                fullName: adminUser.fullName || adminUser.username || null,
                identityNumber: adminUser.identityNumber || null,
                phone: adminUser.phone || null,
              });
          }
        } catch {
          setAdminProfile(null);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin hợp đồng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await exportContractToPDF({ contract, members, services, adminProfile });
    } catch {
      toast.error("Có lỗi khi xuất file PDF!");
    } finally {
      setExporting(false);
    }
  };

  const handleAutoUpdate = async () => {
    if (!window.confirm("Tự động cập nhật trạng thái hợp đồng này?")) return;
    try {
      setUpdatingStatus(true);
      await apiContract.autoUpdateStatus();
      setContract(await apiContract.getContractById(id));
      toast.success("Đã cập nhật trạng thái thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const monthlyServices = services.filter((s) => !isMeterService(s));
  const meterServices = services.filter((s) => isMeterService(s));
  const totalMonthlySvcCost = monthlyServices.reduce(
    (sum, s) => sum + Number(s.priceAtSigning ?? 0),
    0,
  );
  const totalFixed = (contract?.rentPrice ?? 0) + totalMonthlySvcCost;

  // ---- Loading ----
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-secondary mb-3"
            style={{ width: 28, height: 28, borderWidth: 2 }}
          />
          <p className="text-muted small mb-0">Đang tải...</p>
        </div>
      </div>
    );

  // ---- Error ----
  if (error || !contract)
    return (
      <div className="container-fluid py-4" style={{ maxWidth: 900 }}>
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <FaExclamationTriangle size={14} />
          <span className="small">{error || "Không tìm thấy hợp đồng."}</span>
        </div>
        <button
          className="btn btn-sm btn-light border"
          onClick={() => navigate("/contracts")}
        >
          <FaArrowLeft size={11} className="me-2" /> Quay lại
        </button>
      </div>
    );

  const badge = getStatusBadge(contract.status);
  const endDate = contract.endDate ? new Date(contract.endDate) : null;
  const remainingDays = endDate
    ? Math.ceil((endDate - new Date()) / 86400000)
    : null;
  const paymentDay =
    contract.billingDay ?? contract.paymentDay ?? contract.paymentDate ?? null;

  return (
    <div className="container-fluid py-4">
      {/* ── HEADER (đồng bộ ListContract) ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <button
              className="btn btn-sm btn-light border"
              onClick={() => navigate("/contracts")}
              title="Quay lại"
            >
              <FaArrowLeft size={12} />
            </button>
            <FaFileContract className="text-secondary fs-5" />
            <h4 className="fw-bold text-dark mb-0">
              {formatContractCode(contract.contractId)}
            </h4>
            <span
              className={`badge rounded-pill ${badge.cls}`}
              style={{ fontSize: "0.72rem" }}
            >
              {badge.label}
            </span>
          </div>
          <p className="text-muted small mb-0">Chi tiết hợp đồng thuê phòng</p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary shadow-sm"
            onClick={handleAutoUpdate}
            disabled={updatingStatus}
          >
            <FaSyncAlt
              size={13}
              className={`me-1 ${updatingStatus ? "spin-icon" : ""}`}
            />{" "}
            Cập nhật tự động
          </button>
          <button
            className="btn btn-outline-secondary shadow-sm"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <span
                className="spinner-border spinner-border-sm me-1"
                style={{ width: 11, height: 11 }}
              />
            ) : (
              <FaFilePdf size={13} className="me-1" />
            )}
            Xuất PDF
          </button>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => navigate(`/contracts/${id}/update`)}
          >
            <FaEdit size={13} className="me-1" /> Chỉnh sửa
          </button>
        </div>
      </div>

      {/* ── BANNER sắp hết hạn ── */}
      {contract.status === "ACTIVE" &&
        remainingDays !== null &&
        remainingDays <= 30 && (
          <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
            <FaExclamationTriangle size={13} className="flex-shrink-0" />
            <span className="small">
              Hợp đồng còn <strong>{remainingDays} ngày</strong> hiệu lực — đến{" "}
              {formatDate(contract.endDate)}.
            </span>
          </div>
        )}

      {/* ── BODY ── */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* CỘT TRÁI */}
            <div className="col-lg-5">
              <Section title="Thông tin hợp đồng" icon={FaFileContract}>
                <InfoRow
                  icon={FaDoorOpen}
                  label="Phòng"
                  value={
                    <span className="badge bg-light text-dark border fw-normal">
                      {contract.roomName ||
                        (contract.roomId ? `Phòng #${contract.roomId}` : "—")}
                    </span>
                  }
                />
                <InfoRow
                  icon={FaCalendarAlt}
                  label="Ngày bắt đầu"
                  value={formatDate(contract.startDate)}
                />
                <InfoRow
                  icon={FaCalendarCheck}
                  label="Ngày kết thúc"
                  value={formatDate(contract.endDate)}
                />
                <InfoRow
                  icon={FaCreditCard}
                  label="Ngày thanh toán"
                  value={
                    paymentDay
                      ? `Ngày ${paymentDay} hàng tháng`
                      : "Chưa xác định"
                  }
                />
                <InfoRow
                  icon={FaMoneyBillWave}
                  label="Giá thuê hàng tháng"
                  value={formatCurrency(contract.rentPrice)}
                  highlight
                />
                <InfoRow
                  icon={FaShieldAlt}
                  label="Tiền đặt cọc"
                  value={formatCurrency(contract.depositAmount)}
                />
                {contract.note && (
                  <div className="d-flex gap-2 mt-3 px-3 py-2 rounded-3 bg-light border">
                    <FaStickyNote
                      size={12}
                      className="text-muted mt-1 flex-shrink-0"
                    />
                    <span className="small text-secondary">
                      {contract.note}
                    </span>
                  </div>
                )}
              </Section>

              <Section title="Chi phí hàng tháng" icon={FaMoneyBillWave}>
                <InfoRow
                  icon={FaDoorOpen}
                  label="Tiền thuê"
                  value={formatCurrency(contract.rentPrice)}
                />
                {monthlyServices.map((svc, idx) => (
                  <InfoRow
                    key={idx}
                    icon={FaTools}
                    label={`${svc.serviceName || "Dịch vụ"} / ${svc.unitAtSigning || "tháng"}`}
                    value={formatCurrency(svc.priceAtSigning)}
                  />
                ))}
                <div className="d-flex justify-content-between align-items-center mt-3 px-3 py-2 rounded-3 bg-light border">
                  <div>
                    <div className="fw-bold small text-dark">
                      Tổng cố định / tháng
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                      chưa bao gồm điện, nước
                    </div>
                  </div>
                  <span className="fw-bold fs-6 text-dark">
                    {formatCurrency(totalFixed)}
                  </span>
                </div>
                {meterServices.length > 0 && (
                  <div className="mt-3 px-3 py-2 rounded-3 bg-light border">
                    <div
                      className="text-muted text-uppercase fw-semibold mb-2"
                      style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
                    >
                      Tính riêng theo chỉ số
                    </div>
                    {meterServices.map((svc, idx) => {
                      const MIcon = getMeterIcon(svc);
                      return (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-center py-1"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <MIcon size={11} className={getMeterColor(svc)} />
                            <span className="small text-secondary">
                              {svc.serviceName}
                            </span>
                          </div>
                          <span className="small text-secondary">
                            {formatCurrency(svc.priceAtSigning)} /{" "}
                            {svc.unitAtSigning}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="d-flex justify-content-between pt-3 mt-2 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <FaShieldAlt size={12} className="text-muted" />
                    <span className="small text-secondary">
                      Tiền đặt cọc (một lần)
                    </span>
                  </div>
                  <span className="small fw-medium text-dark">
                    {formatCurrency(contract.depositAmount)}
                  </span>
                </div>
              </Section>

              {adminProfile && (
                <Section title="Bên A — Chủ trọ" icon={FaUserTie}>
                  <InfoRow
                    icon={FaUserTie}
                    label="Họ và tên"
                    value={adminProfile.fullName || "—"}
                  />
                  {adminProfile.identityNumber && (
                    <InfoRow
                      icon={FaIdCard}
                      label="CCCD / CMND"
                      value={adminProfile.identityNumber}
                    />
                  )}
                  {adminProfile.phone && (
                    <InfoRow
                      icon={FaPhone}
                      label="Số điện thoại"
                      value={adminProfile.phone}
                    />
                  )}
                </Section>
              )}
            </div>

            {/* CỘT PHẢI */}
            <div className="col-lg-7">
              <Section
                title={`Thành viên hợp đồng (${members.length})`}
                icon={FaUsers}
                action={
                  <button
                    className="btn btn-sm btn-light border"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => navigate(`/contracts/${id}/members`)}
                  >
                    <FaUsers size={11} className="me-1" /> Quản lý
                  </button>
                }
              >
                {members.length === 0 ? (
                  <div className="d-flex align-items-center gap-2 py-2 small text-secondary">
                    <FaInfoCircle size={13} /> Chưa có thành viên.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {members.map((member, idx) => {
                      const profileId = member.profileId ?? member.id;
                      const isRep = idx === 0;
                      return (
                        <div
                          key={profileId}
                          className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 border ${isRep ? "bg-light border-secondary-subtle" : "bg-white border-light"}`}
                        >
                          <div
                            className={`d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold ${isRep ? "bg-dark text-white" : "bg-light text-secondary"}`}
                            style={{
                              width: 36,
                              height: 36,
                              fontSize: "0.75rem",
                            }}
                          >
                            {(member.fullName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <span className="small fw-semibold text-dark">
                                {member.fullName ?? "—"}
                              </span>
                              {isRep && (
                                <span
                                  className="badge bg-dark text-white fw-medium"
                                  style={{ fontSize: "0.65rem" }}
                                >
                                  Đại diện
                                </span>
                              )}
                            </div>
                            <div
                              className="d-flex gap-3 mt-1 text-secondary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {member.phone && (
                                <span className="d-flex align-items-center gap-1">
                                  <FaPhone size={10} />
                                  {member.phone}
                                </span>
                              )}
                              {member.identityNumber && (
                                <span className="d-flex align-items-center gap-1">
                                  <FaIdCard size={10} />
                                  {member.identityNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-light border"
                            style={{ fontSize: "0.72rem" }}
                            onClick={() =>
                              navigate(`/profile/${profileId}/detail`)
                            }
                          >
                            <FaEye size={11} className="me-1 text-info" /> Xem
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              <Section
                title={`Dịch vụ đã đăng ký (${services.length})`}
                icon={FaTools}
              >
                {services.length === 0 ? (
                  <div className="d-flex align-items-center gap-2 py-2 small text-secondary">
                    <FaInfoCircle size={13} /> Chưa đăng ký dịch vụ nào.
                  </div>
                ) : (
                  <>
                    {monthlyServices.length > 0 && (
                      <>
                        <div
                          className="text-muted text-uppercase fw-semibold mb-2 mt-1"
                          style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Cố định hàng tháng
                        </div>
                        <div className="d-flex flex-column gap-2 mb-3">
                          {monthlyServices.map((svc, idx) => (
                            <div
                              key={
                                svc.contractServiceId ?? svc.serviceId ?? idx
                              }
                              className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3 bg-light border"
                            >
                              <div className="d-flex align-items-center gap-2">
                                <FaTools size={11} className="text-muted" />
                                <span className="small text-dark">
                                  {svc.serviceName ??
                                    `Dịch vụ #${svc.serviceId}`}
                                </span>
                              </div>
                              <span className="small fw-semibold text-dark">
                                {formatCurrency(svc.priceAtSigning)}{" "}
                                <span className="text-muted fw-normal">
                                  / {svc.unitAtSigning || "tháng"}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between px-3 py-2 rounded-3 mb-3 bg-secondary-subtle border border-secondary-subtle">
                          <span className="small fw-semibold text-dark">
                            Tổng dịch vụ cố định / tháng
                          </span>
                          <span className="small fw-bold text-dark">
                            {formatCurrency(totalMonthlySvcCost)}
                          </span>
                        </div>
                      </>
                    )}
                    {meterServices.length > 0 && (
                      <>
                        <div
                          className="text-muted text-uppercase fw-semibold mb-2"
                          style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Điện, nước — chỉ số thực tế
                        </div>
                        <div className="d-flex flex-column gap-2 mb-3">
                          {meterServices.map((svc, idx) => {
                            const MIcon = getMeterIcon(svc);
                            return (
                              <div
                                key={
                                  svc.contractServiceId ?? svc.serviceId ?? idx
                                }
                                className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3 bg-light border"
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <MIcon
                                    size={11}
                                    className={getMeterColor(svc)}
                                  />
                                  <span className="small text-dark">
                                    {svc.serviceName ??
                                      `Dịch vụ #${svc.serviceId}`}
                                  </span>
                                </div>
                                <span className="small text-secondary">
                                  {formatCurrency(svc.priceAtSigning)} /{" "}
                                  {svc.unitAtSigning}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 bg-light border small text-secondary">
                          <FaInfoCircle
                            size={12}
                            className="flex-shrink-0 mt-1"
                          />
                          <span>
                            Tiền điện, nước tính riêng theo chỉ số thực tế hàng
                            tháng, không gộp vào tổng cố định.
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </Section>
            </div>
          </div>
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
