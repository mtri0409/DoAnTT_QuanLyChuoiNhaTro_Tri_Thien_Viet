import React from "react";

const StatsCard = ({
  stats = [], // [{ label, value, bg, color }]
  title = "Tổng quan",
  className = "",
}) => {
  return (
    <div className={`card border-0 rounded-4 shadow-sm ${className}`}>
      <div className="card-body p-3">
        <p className="small text-uppercase text-secondary fw-semibold mb-3">
          {title}
        </p>
        {stats.map(({ label, value, bg, color }, idx) => (
          <div
            key={idx}
            className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2 mb-2 ${bg}`}
          >
            <span className="small text-secondary">{label}</span>
            <span className={`fw-bold fs-6 ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;