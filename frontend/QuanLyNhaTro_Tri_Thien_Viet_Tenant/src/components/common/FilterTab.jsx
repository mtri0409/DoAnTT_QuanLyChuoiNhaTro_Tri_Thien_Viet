// components/common/FilterTab.jsx
import React from "react";
import { FaFilter } from "react-icons/fa";

const FilterTab = ({
  options = [], // [{ key, label, dot, count }]
  activeKey,
  onChange,
  title = "Trạng thái",
  showIcon = true,
  className = "",
}) => {
  return (
    <div className={`card border-0 rounded-4 shadow-sm ${className}`}>
      <div className="card-body p-3">
        {title && (
          <p className="fw-semibold mb-3 d-flex align-items-center gap-2 text-uppercase text-secondary small">
            {showIcon && <FaFilter size={10} />}
            {title}
          </p>
        )}
        <div className="d-flex flex-column gap-1">
          {options.map(({ key, label, dot, count }) => {
            const isActive = activeKey === key;
            return (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`w-100 d-flex align-items-center justify-content-between border-0 rounded-3 px-3 py-2 mb-1 ${
                  isActive
                    ? "bg-warning bg-opacity-10 text-warning-emphasis fw-semibold"
                    : "bg-transparent text-secondary"
                }`}
                style={{ fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
              >
                <span className="d-flex align-items-center gap-2">
                  {dot && (
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: 8, height: 8, background: dot }}
                    />
                  )}
                  {label}
                </span>
                {count !== undefined && (
                  <span
                    className={`badge rounded-pill ${
                      isActive ? "bg-warning text-dark" : "bg-secondary-subtle text-secondary"
                    }`}
                    style={{ fontSize: 11 }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterTab;