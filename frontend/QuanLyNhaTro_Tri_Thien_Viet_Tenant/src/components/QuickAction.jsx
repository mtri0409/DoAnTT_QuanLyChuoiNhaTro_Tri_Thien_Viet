import React from "react";
import {
  FaUserCircle,
  FaBed,
  FaHistory,
  FaTools,
  FaFileContract,
  FaPowerOff,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ACTIONS = (navigate, profile) => [
  {
    icon: <FaUserCircle />,
    label: "Thông tin cá nhân",
    sub: "Xem & chỉnh sửa hồ sơ",
    bg: "#e8f0fe",
    fg: "#1a73e8",
    onClick: () => navigate(`user/profile/${profile.profileId}`),
  },
  {
    icon: <FaHistory />,
    label: "Lịch sử hóa đơn",
    sub: "Thanh toán & công nợ",
    bg: "#e0f7fa",
    fg: "#007b91",
    onClick: () => navigate(`user/bills`),
  },
  {
    icon: <FaFileContract />,
    label: "Xem hợp đồng",
    sub: "Hợp đồng đang hoạt động",
    bg: "#fff8e1",
    fg: "#c17900",
    onClick: () => navigate(`user/contract/${profile.activeContractId}`),
  },
  {
    icon: <FaPowerOff />,
    label: "Đăng xuất",
    sub: "Thoát khỏi hệ thống",
    bg: "#f1f3f5",
    fg: "#6c757d",
    onClick: () => alert("Đăng xuất!"),
  },
];

const QuickActions = ({ profile }) => {
  const navigate = useNavigate();
  const actions = ACTIONS(navigate, profile);

  return (
    <>
      {/* 2 cột trên mobile, 4 cột từ md trở lên — vừa khít 4 nút */}
      <div className="row row-cols-2 row-cols-md-4 g-3">
        {actions.map((action, idx) => (
          <div key={idx} className="col">
            <button
              className="qa-card btn w-100 border rounded-4 d-flex flex-column align-items-center text-center p-3 gap-2"
              onClick={action.onClick}
              disabled={!action.onClick}
              style={{ "--icon-bg": action.bg, "--icon-fg": action.fg }}
            >
              {/* Icon */}
              <div
                className="qa-icon-wrap d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 52,
                  height: 52,
                  background: action.bg,
                  color: action.fg,
                }}
              >
                {React.cloneElement(action.icon, { size: 20 })}
              </div>

              {/* Text */}
              <div className="d-flex flex-column gap-1">
                <span
                  className="fw-bold"
                  style={{
                    fontSize: "0.82rem",
                    color: "#1a1a2e",
                    lineHeight: 1.3,
                  }}
                >
                  {action.label}
                </span>
                <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                  {action.sub}
                </span>
              </div>

              {/* Arrow indicator */}
              {action.onClick && (
                <span
                  className="qa-arrow position-absolute top-0 end-0 me-2 mt-2 text-muted"
                  style={{ fontSize: "1.1rem", lineHeight: 1 }}
                >
                  ›
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .qa-card {
          background: #fff;
          position: relative;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
          font-family: inherit;
        }
        .qa-card:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
          border-color: var(--icon-fg) !important;
        }
        .qa-card:not(:disabled):active {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
        }
        .qa-card:disabled { opacity: 0.7; cursor: default; }

        .qa-icon-wrap {
          transition: transform 0.15s;
        }
        .qa-card:not(:disabled):hover .qa-icon-wrap {
          transform: scale(1.08);
        }

        .qa-arrow {
          transition: color 0.15s, transform 0.15s;
        }
        .qa-card:not(:disabled):hover .qa-arrow {
          color: var(--icon-fg) !important;
          transform: translateX(2px);
        }
      `}</style>
    </>
  );
};

export default QuickActions;
