// 2. MiniStat: Các dòng thông tin vận hành nhỏ
const MiniStat = ({ title, value, icon, color }) => (
  <div className="col-6">
    <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light bg-opacity-50">
      <div className={`${color} fs-4`}>{icon}</div>
      <div>
        <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{title}</div>
        <div className="h5 fw-bold mb-0">{value || 0}</div>
      </div>
    </div>
  </div>
);
export default MiniStat;