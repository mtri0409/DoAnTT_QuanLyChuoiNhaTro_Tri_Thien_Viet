export const STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang tìm",
    badge: "bg-success-subtle text-success",
    dot: "#22c55e",
  },
  CLOSED: {
    label: "Đã đóng",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
  },
  EXPIRED: {
    label: "Hết hạn",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
  },
};

export const FILTER_OPTIONS = [
  { key: "ALL", label: "Tất cả", dot: "#cbd5e1" },
  { key: "ACTIVE", label: "Đang tìm", dot: "#22c55e" },
  { key: "EXPIRED", label: "Hết hạn", dot: "#f59e0b" },
  { key: "CLOSED", label: "Đã đóng", dot: "#94a3b8" },
];