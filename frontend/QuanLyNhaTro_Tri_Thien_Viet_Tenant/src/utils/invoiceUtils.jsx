import {
  FaClipboardList,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaWrench,
  FaCalendarAlt
} from "react-icons/fa";
export const STATUS_META = {
  DRAFT: {
    label: "Nháp",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
    icon: <FaClipboardList />,
  },
  PENDING: {
    label: "Chờ thanh toán",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
    icon: <FaCreditCard />,
  },
  PARTIAL: {
    label: "Còn nợ một phần",
    badge: "bg-warning-subtle text-warning-emphasis",
    dot: "#f97316",
    icon: <FaCreditCard />,
  },
  PAID: {
    label: "Đã thanh toán",
    badge: "bg-success-subtle text-success",
    dot: "#10b981",
    icon: <FaCheckCircle />,
  },
  REFUNDED: {
    label: "Đã hoàn cọc",
    badge: "bg-primary-subtle text-primary",
    dot: "#8b5cf6",
    icon: <FaCheckCircle />,
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-danger-subtle text-danger",
    dot: "#ef4444",
    icon: <FaTimesCircle />,
  },
};


export const TYPE_META = {
  MONTHLY: {
    label: "Tiền phòng hàng tháng",
    icon: <FaCalendarAlt />,
    color: "#0ea5e9",
  },
  DEPOSIT: { label: "Tiền cọc", icon: <FaShieldAlt />, color: "#f59e0b" },
  REPAIR: { label: "Chi phí sửa chữa", icon: <FaWrench />, color: "#ef4444" },
};
export const TABS = [
  { key: "NEED_PAY", label: "Cần thanh toán", urgent: true },
  { key: "ALL", label: "Tất cả" },
  { key: "PAID", label: "Đã thanh toán" },
  { key: "CANCELLED", label: "Đã hủy" },
];
//==========HElPER=======
export const fmt = (num) =>
  num != null ? Number(num).toLocaleString("vi-VN") + " ₫" : "—";

export const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const isOverdue = (dueDateStr, status) => {
  if (!dueDateStr || ["PAID", "CANCELLED", "REFUNDED"].includes(status))
    return false;
  return new Date(dueDateStr) < new Date();
};

export const isDueSoon = (dueDateStr) => {
  if (!dueDateStr) return false;
  const diff = new Date(dueDateStr) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};