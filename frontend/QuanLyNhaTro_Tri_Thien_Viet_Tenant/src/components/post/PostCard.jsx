// components/post/PostCard.jsx
import React from "react";
import {
  FaDoorOpen,
  FaClock,
  FaEye,
  FaEdit,
  FaTimes,
  FaRedo,
  FaTrash,
} from "react-icons/fa";
import ActionBtn from "../common/ActionBtn";
import { STATUS_CONFIG } from "../../utils/postUtils";
import { formatDate } from "../../utils/dateUtils";

const PostCard = ({
  post,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClose,
  onDelete,
  onRepost,
  daysLeft,
}) => {
  const left = daysLeft(post.expiresAt);
  const isActive = post.status === "ACTIVE";
  const isInactive = post.status === "EXPIRED" || post.status === "CLOSED";
  const cfg = STATUS_CONFIG[post.status];

  return (
    <div
      className={`card border-0 rounded-4 bg-white card-hover-shadow ${
        isInactive ? "card-inactive" : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="card-body p-4">
        <div className="d-flex gap-3 align-items-start">
          {/* Status dot */}
          <div className="flex-shrink-0 pt-1">
            <span
              className="rounded-circle d-block status-dot"
              style={{ background: cfg?.dot }}
            />
          </div>

          {/* Content */}
          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <span className="fw-semibold text-dark small">
                <FaDoorOpen size={12} className="me-1 text-primary" />
                {post.roomName}
              </span>
              {post.branchName && (
                <span className="text-secondary small">— {post.branchName}</span>
              )}
              <span className={`badge rounded-pill ${cfg?.badge}`}>
                {cfg?.label}
              </span>
              {isActive && left !== null && left <= 5 && (
                <span className="badge rounded-pill bg-danger-subtle text-danger">
                  ⚠ Còn {left} ngày
                </span>
              )}
            </div>

            <p className="description-line-clamp text-secondary mb-2">
              {post.description}
            </p>

            <div className="d-flex align-items-center gap-3 flex-wrap small">
              <span className="d-flex align-items-center gap-1 text-secondary">
                <FaClock size={10} /> {formatDate(post.createdAt)}
              </span>
              {isActive && left !== null && left > 5 && (
                <span className="d-flex align-items-center gap-1 text-secondary">
                  <FaClock size={10} /> Còn {left} ngày
                </span>
              )}
              <span className="text-secondary">#POST-{post.postId}</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className={`action-bar-slide ${isHovered ? "action-bar-show" : "action-bar-hide"}`}>
          <div className="d-flex gap-2 flex-wrap pt-3 mt-3 border-top">
            {isActive && (
              <>
                <ActionBtn
                  to={`/user/posts/${post.postId}`}
                  icon={<FaEye size={12} />}
                  label="Xem"
                  variant="secondary"
                />
                <ActionBtn
                  to={`/user/posts/${post.postId}/edit`}
                  icon={<FaEdit size={12} />}
                  label="Chỉnh sửa"
                  variant="primary"
                />
                <ActionBtn
                  icon={<FaTimes size={12} />}
                  label="Đóng bài"
                  variant="warning"
                  onClick={() => onClose(post.postId)}
                />
              </>
            )}
            {isInactive && (
              <ActionBtn
                icon={<FaRedo size={12} />}
                label="Đăng lại"
                variant="success"
                onClick={() => onRepost(post.postId)}
              />
            )}
            <ActionBtn
              icon={<FaTrash size={12} />}
              label="Xóa bài"
              variant="danger"
              onClick={() => onDelete(post.postId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;