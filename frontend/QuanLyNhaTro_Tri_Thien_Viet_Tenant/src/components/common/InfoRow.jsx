
export const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="d-flex align-items-start py-2 border-bottom border-light">
    <div className="text-muted me-3 mt-1" style={{ width: 18, flexShrink: 0 }}>
      {icon}
    </div>
    <div className="flex-grow-1">
      <div className="small text-muted mb-1">{label}</div>
      <div
        className={`fw-semibold ${highlight ? "text-primary fs-6" : "text-dark"}`}
      >
        {value}
      </div>
    </div>
  </div>
);