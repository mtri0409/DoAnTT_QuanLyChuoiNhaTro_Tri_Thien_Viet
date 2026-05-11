import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
} from "react-icons/fa";
// ====================== CONSTANTS ======================
const METER_UNITS = ["kwh", "kWh", "KWH", "m³", "m3", "M3", "m^3"];
export const isMeterService = (svc) =>
  METER_UNITS.some(
    (u) => (svc.unitAtSigning || "").trim().toLowerCase() === u.toLowerCase(),
  );

// ====================== HELPERS ======================
export const STATUS_CONFIG = {
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

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    cls: "bg-light text-dark border",
    label: status || "N/A",
    icon: null,
  };

export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatCurrency = (amount) => {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatContractCode = (id) => {
  if (!id) return "N/A";
  return `HD-${String(id).padStart(5, "0")}`;
};