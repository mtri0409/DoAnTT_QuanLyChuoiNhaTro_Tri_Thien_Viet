import React from "react";
import {
  FaBell,
  FaChevronRight,
  FaUserAlt,
  FaFileContract,
  FaMoneyBillWave,
  FaTools,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const NOTI_CONFIG = {
  CONTRACT: {
    color: "#0d6efd",
    bg: "#e8f0fe",
    icon: <FaFileContract />,
    label: "Hợp đồng",
  },
  BILL: {
    color: "#198754",
    bg: "#e6f4ea",
    icon: <FaMoneyBillWave />,
    label: "Hóa đơn",
  },
  OVERDUE: {
    color: "#dc3545",
    bg: "#fce8e6",
    icon: <FaExclamationTriangle />,
    label: "Quá hạn",
  },
  MAINTENANCE: {
    color: "#e67e22",
    bg: "#fef3e2",
    icon: <FaTools />,
    label: "Bảo trì",
  },
  DEFAULT: {
    color: "#0dcaf0",
    bg: "#e0f7fa",
    icon: <FaInfoCircle />,
    label: "Thông báo",
  },
};

const getNotiConfig = (type) =>
  NOTI_CONFIG[type?.toUpperCase()] || NOTI_CONFIG.DEFAULT;

const ProfileField = ({ label, value, badge }) => (
  <div className="p-2 rounded-3 hg-profile-field">
    <span
      className="d-block text-uppercase fw-bold mb-1"
      style={{ fontSize: "0.68rem", color: "#9fa6b2", letterSpacing: "0.5px" }}
    >
      {label}
    </span>
    {badge ? (
      <span
        className="badge rounded-pill fw-bold"
        style={{ background: "#e8f0fe", color: "#1a73e8", fontSize: "0.82rem" }}
      >
        {value}
      </span>
    ) : (
      <span
        className="d-block fw-semibold text-truncate"
        style={{ fontSize: "0.92rem", color: "#1a1a2e" }}
      >
        {value || "—"}
      </span>
    )}
  </div>
);

const HeaderGrid = ({ profileData, notifications = [] }) => {
  if (!profileData) return null;

  const fields = [
    { label: "Họ tên", value: profileData.fullName },
    { label: "Điện thoại", value: profileData.phone },
    { label: "Phòng", value: `Phòng ${profileData.roomName}`, badge: true },
    { label: "Email", value: profileData.email || "N/A" },
    { label: "Địa chỉ", value: profileData.address },
    { label: "Hết hạn HĐ", value: profileData.contractEndDate || "N/A" },
  ];

  return (
    <div className="row g-3 mb-2">
      {/* Profile card */}
      <div className="col-12 col-lg-7">
        <div className="card border rounded-4 h-100">
          {/* Card header */}
          <div
            className="card-header d-flex align-items-center gap-2 border-bottom"
            style={{ background: "#fcfcfd" }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{
                width: 28,
                height: 28,
                background: "#e8f0fe",
                color: "#1a73e8",
              }}
            >
              <FaUserAlt size={13} />
            </div>
            <span
              className="text-uppercase fw-bold text-secondary"
              style={{ fontSize: "0.78rem", letterSpacing: "0.6px" }}
            >
              Hồ sơ cư dân
            </span>
          </div>

          {/* Profile fields grid */}
          <div className="card-body p-2">
            <div className="row row-cols-2 g-1">
              {fields.map((f, i) => (
                <div key={i} className="col">
                  <ProfileField {...f} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications card */}
      <div className="col-12 col-lg-5">
        <div className="card border rounded-4 h-100">
          {/* Card header */}
          <div
            className="card-header d-flex align-items-center gap-2 border-bottom"
            style={{ background: "#fcfcfd" }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{
                width: 28,
                height: 28,
                background: "#fff3cd",
                color: "#e67e22",
              }}
            >
              <FaBell size={13} />
            </div>
            <span
              className="text-uppercase fw-bold text-secondary"
              style={{ fontSize: "0.78rem", letterSpacing: "0.6px" }}
            >
              Nhắc nhở
            </span>
            {notifications.length > 0 && (
              <span className="badge bg-danger rounded-pill ms-auto">
                {notifications.length}
              </span>
            )}
          </div>

          {/* Notification list */}
          <div
            className="card-body p-0 overflow-auto"
            style={{ maxHeight: 220 }}
          >
            {notifications.length > 0 ? (
              notifications.map((note) => {
                const cfg = getNotiConfig(note.type);
                return (
                  <div
                    key={note.notificationId || note.id}
                    className="d-flex align-items-start gap-3 px-3 py-2 border-bottom border-start border-3"
                    style={{ borderColor: cfg.color }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0 mt-1"
                      style={{
                        width: 32,
                        height: 32,
                        background: cfg.bg,
                        color: cfg.color,
                        fontSize: 13,
                      }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span
                          className="text-uppercase fw-bold"
                          style={{
                            fontSize: "0.78rem",
                            color: cfg.color,
                            letterSpacing: "0.4px",
                          }}
                        >
                          {note.title || cfg.label}
                        </span>
                        <span
                          className="text-muted text-nowrap"
                          style={{ fontSize: "0.72rem" }}
                        >
                          {note.createdAt || note.time}
                        </span>
                      </div>
                      <p
                        className="mb-0 text-truncate-2"
                        style={{
                          fontSize: "0.875rem",
                          color: "#343a40",
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {note.content}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="d-flex align-items-center justify-content-center text-muted"
                style={{ minHeight: 100, fontSize: "0.85rem" }}
              >
                Không có nhắc nhở mới
              </div>
            )}
          </div>

          {/* Footer link */}
          <a
            href="/notifications"
            className="card-footer d-flex align-items-center justify-content-center gap-1 text-primary fw-semibold text-decoration-none border-top"
            style={{ fontSize: "0.8rem", background: "#fcfcfd" }}
          >
            Xem tất cả <FaChevronRight size={9} />
          </a>
        </div>
      </div>

      <style>{`
        .hg-profile-field:hover { background: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default HeaderGrid;
