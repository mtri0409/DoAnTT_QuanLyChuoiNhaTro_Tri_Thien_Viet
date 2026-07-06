import React from "react";
import { Link } from "react-router-dom";

const ActionBtn = ({
  icon,
  label,
  onClick,
  variant = "secondary",
  to,
  disabled = false,
  className = "",
}) => {
  const cls = {
    primary: "btn-primary-subtle text-primary",
    danger: "btn-danger-subtle text-danger",
    secondary: "btn-secondary-subtle text-secondary",
    success: "btn-success-subtle text-success",
    warning: "btn-warning-subtle text-warning",
    info: "btn-info-subtle text-info",
  };

  const baseClass = `btn btn-sm d-inline-flex align-items-center gap-2 rounded-3 fw-medium ${cls[variant] ?? cls.secondary} ${className}`;

  // Nếu có prop 'to' thì render Link
  if (to) {
    return (
      <Link
        to={to}
        className={baseClass}
        style={{ textDecoration: "none", opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}
      >
        {icon}
        {label}
      </Link>
    );
  }

  // Ngược lại render button
  return (
    <button
      className={baseClass}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};

export default ActionBtn;