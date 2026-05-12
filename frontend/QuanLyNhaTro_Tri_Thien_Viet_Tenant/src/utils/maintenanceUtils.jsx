
export const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    badge: "bg-warning-subtle text-warning",
    dot: "#f59e0b",
  },
  PROCESSING: {
    label: "Đang xử lý",
    badge: "bg-primary-subtle text-primary",
    dot: "#3b82f6",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badge: "bg-success-subtle text-success",
    dot: "#22c55e",
  },
  CANCELLED: {
    label: "Đã hủy",
    badge: "bg-secondary-subtle text-secondary",
    dot: "#94a3b8",
  },
};

export const FILTER_OPTIONS = [
  { key: "ALL", label: "Tất cả", dot: "#cbd5e1" },
  { key: "PENDING", label: "Chờ xử lý", dot: "#f59e0b" },
  { key: "PROCESSING", label: "Đang xử lý", dot: "#3b82f6" },
  { key: "COMPLETED", label: "Hoàn thành", dot: "#22c55e" },
  { key: "CANCELLED", label: "Đã hủy", dot: "#94a3b8" },
];

// const STATUS_CONFIG = {
//   PENDING: {
//     label: "Chờ xử lý",
//     badge: "bg-warning-subtle text-warning",
//     chipBg: "bg-warning bg-opacity-10",
//     chipText: "text-warning-emphasis",
//     dot: "bg-warning",
//   },
//   PROCESSING: {
//     label: "Đang xử lý",
//     badge: "bg-primary-subtle text-primary",
//     chipBg: "bg-primary bg-opacity-10",
//     chipText: "text-primary",
//     dot: "bg-primary",
//   },
//   COMPLETED: {
//     label: "Hoàn thành",
//     badge: "bg-success-subtle text-success",
//     chipBg: "bg-success bg-opacity-10",
//     chipText: "text-success-emphasis",
//     dot: "bg-success",
//   },
//   CANCELLED: {
//     label: "Đã hủy",
//     badge: "bg-secondary-subtle text-secondary",
//     chipBg: "bg-secondary bg-opacity-10",
//     chipText: "text-secondary",
//     dot: "bg-secondary",
//   },
// };

export const HINTS = {
  PENDING: "Yêu cầu đã được ghi nhận, đang chờ phân công kỹ thuật viên.",
  PROCESSING: "Kỹ thuật viên đang tiến hành xử lý sự cố.",
  COMPLETED: "Sự cố đã được khắc phục thành công.",
  CANCELLED: "Yêu cầu đã bị hủy.",
};
