import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileContract,
  FaArrowLeft,
  FaDoorOpen,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUsers,
  FaConciergeBell,
  FaUser,
  FaPhone,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaBolt,
  FaTint,
  FaHome,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";

// ====================== CONSTANTS ======================
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

// ====================== INFO CARD ======================
const InfoCard = ({ icon, title, children }) => (
  <div className="card border-0 shadow-sm rounded-4 mb-4">
    <div className="card-header bg-white border-0 py-3 px-4">
      <div className="d-flex align-items-center gap-2">
        <div className="p-2 rounded-3 bg-primary-subtle text-primary">
          {icon}
        </div>
        <h6 className="fw-bold mb-0 text-primary">{title}</h6>
      </div>
    </div>
    <div className="card-body px-4 pt-0">{children}</div>
  </div>
);

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

// ====================== MAIN COMPONENT ======================
const TenantContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ====================== FETCH ======================
  useEffect(() => {
    const fetchContractData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contractRes, memberIdsRes, servicesRes] = await Promise.all([
          apiContract.getContractById(id),
          apiContract.getMembers(id),
          apiContract.getServices(id),
        ]);

        setContract(contractRes);

        // Fetch profile từng thành viên
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

        const rawSvcs = servicesRes?.services ?? servicesRes;
        setServices(Array.isArray(rawSvcs) ? rawSvcs : []);
      } catch (err) {
        console.error("Lỗi tải chi tiết hợp đồng:", err);
        setError("Không thể tải thông tin hợp đồng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [id]);

  // ====================== COMPUTED ======================
  const monthlyServices = services.filter((s) => !isMeterService(s));
  const meterServices = services.filter((s) => isMeterService(s));

  const totalMonthlySvcCost = monthlyServices.reduce(
    (sum, s) => sum + Number(s.priceAtSigning ?? 0),
    0,
  );
  const totalFixed = (contract?.rentPrice ?? 0) + totalMonthlySvcCost;

  // ====================== LOADING / ERROR ======================
  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 400 }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Đang tải thông tin hợp đồng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger rounded-4 shadow-sm">
          <strong>Lỗi:</strong> {error || "Không tìm thấy hợp đồng."}
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" /> Quay lại
        </button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(contract.status);
  const endDate = contract.endDate ? new Date(contract.endDate) : null;
  const remainingDays = endDate
    ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const paymentDay = contract.billingDay ?? contract.paymentDay ?? null;

  // Thành viên đại diện (người đầu tiên)
  const representative = members[0];

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-link text-decoration-none ps-0 mb-3"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" /> Quay lại
        </button>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <FaFileContract className="text-primary fs-4" />
            <h3 className="fw-bold text-dark mb-0">
              {formatContractCode(contract.contractId)}
            </h3>
          </div>
          <span
            className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${statusCfg.cls}`}
          >
            {statusCfg.icon}
            <span className="ms-1">{statusCfg.label}</span>
          </span>
        </div>
        <p className="text-muted mt-2">Chi tiết hợp đồng thuê phòng</p>
      </div>

      {/* Alert: Ngày hết hạn */}
      {contract.status === "ACTIVE" && remainingDays !== null && (
        <div
          className={`alert rounded-4 mb-4 d-flex align-items-center gap-2 border-0 ${
            remainingDays <= 30
              ? "alert-warning"
              : "alert-success bg-success-subtle text-success"
          }`}
        >
          <FaCalendarAlt />
          {remainingDays > 0 ? (
            <span>
              Hợp đồng còn <strong>{remainingDays} ngày</strong> hiệu lực (đến{" "}
              {formatDate(contract.endDate)})
            </span>
          ) : (
            <span>Hợp đồng đã quá hạn — vui lòng liên hệ chủ trọ để gia hạn.</span>
          )}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <InfoCard icon={<FaHome size={16} />} title="Thông tin phòng thuê">
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
        {paymentDay && (
          <InfoRow
            icon={<FaCalendarAlt size={14} />}
            label="Ngày thanh toán"
            value={`Ngày ${paymentDay} hàng tháng`}
          />
        )}
        {contract.note && (
          <div className="mt-3 p-3 bg-light rounded-3">
            <p className="small text-muted mb-1">Ghi chú</p>
            <p className="small text-dark mb-0">{contract.note}</p>
          </div>
        )}
      </InfoCard>

      {/* Chi phí */}
      <InfoCard icon={<FaMoneyBillWave size={16} />} title="Chi phí hàng tháng">
        {/* Tiền phòng */}
        <div className="d-flex justify-content-between py-2 border-bottom border-light">
          <span className="text-muted">Tiền thuê phòng</span>
          <span className="fw-semibold">{formatCurrency(contract.rentPrice)}</span>
        </div>

        {/* Dịch vụ cố định */}
        {monthlyServices.map((svc, idx) => (
          <div key={idx} className="d-flex justify-content-between py-2 border-bottom border-light">
            <span className="text-muted">
              <FaConciergeBell className="me-1 opacity-50" size={12} />
              {svc.serviceName}
            </span>
            <span className="fw-semibold">{formatCurrency(svc.priceAtSigning)}</span>
          </div>
        ))}

        {/* Tổng cố định */}
        <div className="d-flex justify-content-between py-3 mt-2 border-top border-2">
          <div>
            <span className="fw-bold text-dark">Tổng tiền mỗi tháng</span>
            <div className="text-muted" style={{ fontSize: "0.7rem" }}>
              (chưa bao gồm điện, nước)
            </div>
          </div>
          <span className="fw-bold text-primary fs-5">
            {formatCurrency(totalFixed)}
          </span>
        </div>

        {/* Điện nước */}
        {meterServices.length > 0 && (
          <div className="mt-3 pt-2">
            <div className="small fw-semibold text-secondary mb-2">
              📌 Điện, nước (tính theo chỉ số thực tế):
            </div>
            {meterServices.map((svc, idx) => {
              const isElec = (svc.unitAtSigning || "").toLowerCase().includes("kwh");
              return (
                <div key={idx} className="d-flex justify-content-between py-1">
                  <span className="small text-muted d-flex align-items-center gap-1">
                    {isElec ? <FaBolt size={12} className="text-warning" /> : <FaTint size={12} className="text-info" />}
                    {svc.serviceName}
                  </span>
                  <span className="small text-muted">
                    {formatCurrency(svc.priceAtSigning)} / {svc.unitAtSigning}
                  </span>
                </div>
              );
            })}
            <div className="mt-2 small text-muted bg-light p-2 rounded">
              ⚡ Chi phí điện, nước sẽ được tính riêng dựa trên chỉ số thực tế hàng tháng
            </div>
          </div>
        )}
      </InfoCard>

      {/* Tiền cọc */}
      <InfoCard icon={<FaShieldAlt size={16} />} title="Tiền đặt cọc">
        <div className="d-flex justify-content-between align-items-center py-2">
          <span className="text-muted">Số tiền đặt cọc (một lần)</span>
          <span className="fw-bold text-success fs-5">
            {formatCurrency(contract.depositAmount)}
          </span>
        </div>
        <div className="small text-muted mt-2">
          * Tiền cọc sẽ được hoàn trả khi kết thúc hợp đồng (không bao gồm chi phí sửa chữa nếu có)
        </div>
      </InfoCard>

      {/* Thành viên hợp đồng */}
      <InfoCard icon={<FaUsers size={16} />} title="Thành viên hợp đồng">
        {members.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <p className="small mb-0">Chưa có thành viên nào</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {members.map((member, idx) => {
              const profileId = member.profileId ?? member.id;
              const isRep = idx === 0;
              return (
                <div
                  key={profileId}
                  className={`rounded-3 px-3 py-2 d-flex align-items-center gap-3 ${
                    isRep ? "bg-primary-subtle border border-primary border-opacity-25" : "bg-light"
                  }`}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                      isRep ? "bg-primary text-white" : "bg-white border text-muted"
                    }`}
                    style={{ width: 40, height: 40 }}
                  >
                    <FaUser size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark d-flex align-items-center gap-2 flex-wrap">
                      {member.fullName ?? "N/A"}
                      {isRep && (
                        <span className="badge bg-primary" style={{ fontSize: "0.65rem" }}>
                          Đại diện
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-3 mt-1 flex-wrap" style={{ fontSize: "0.75rem" }}>
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
                </div>
              );
            })}
          </div>
        )}
      </InfoCard>

      {/* Dịch vụ đăng ký */}
      {services.length > 0 && (
        <InfoCard icon={<FaConciergeBell size={16} />} title="Dịch vụ đã đăng ký">
          <div className="d-flex flex-column gap-2">
            {services.map((svc, idx) => {
              const isMeter = isMeterService(svc);
              return (
                <div
                  key={idx}
                  className="d-flex align-items-center justify-content-between rounded-3 bg-light px-3 py-2"
                >
                  <div className="d-flex align-items-center gap-2">
                    <FaConciergeBell className="text-muted" size={14} />
                    <span className="fw-semibold small">{svc.serviceName}</span>
                  </div>
                  <div className="text-end">
                    <span className="fw-semibold small">
                      {formatCurrency(svc.priceAtSigning)}
                    </span>
                    <span className="text-muted small ms-1">
                      / {svc.unitAtSigning || "tháng"}
                    </span>
                    {isMeter && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary ms-2">
                        Chỉ số thực tế
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>
      )}

      {/* Footer */}
      <div className="text-center mt-4 pt-3 border-top">
        <p className="small text-muted">
          © {new Date().getFullYear()} - Hợp đồng thuê phòng trọ
        </p>
      </div>
    </div>
  );
};

export default TenantContractDetail;