// 1. StatCard: Hiển thị các ô thông số chính
const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="col-12 col-sm-6">
    <div className="card border-0 shadow-sm h-100 rounded-4">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small fw-bold uppercase">{title}</span>
          <div className={`p-2 rounded-3 ${bg} bg-opacity-10 ${color}`}>{icon}</div>
        </div>
        <h5 className="fw-bold mb-0">{value}</h5>
      </div>
    </div>
  </div>
);
export default StatCard;