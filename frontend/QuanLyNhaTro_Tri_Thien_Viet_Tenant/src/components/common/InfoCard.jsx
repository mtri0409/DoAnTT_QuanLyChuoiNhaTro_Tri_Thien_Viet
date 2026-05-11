export const InfoCard = ({ icon, title, children }) => (
  <div className="card border-0 shadow-sm rounded-4 mb-4">
    <div className="card-header bg-white border-0 py-3 px-4">
      <div className="d-flex align-items-center gap-2">
        <div className="p-2 rounded-3 bg-primary-subtle text-primary">
          {icon}
        </div>
        <h6 className="fw-bold mb-0 text-primary">{title}</h6>
      </div>
    </div>
    <div className="card-body px-4 pt-0">{children}</div>
  </div>
);