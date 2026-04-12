// 3. ReminderWidget: Danh sách nhắc nhở (MỚI)
const ReminderWidget = ({ title, icon, data, type }) => (
  <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
    <div className="card-header bg-white border-0 pt-4 px-4 d-flex align-items-center">
      <span className="me-2">{icon}</span>
      <h6 className="fw-bold mb-0 small text-uppercase">{title}</h6>
      <span className="ms-auto badge bg-light text-dark rounded-pill px-3">{data?.length || 0}</span>
    </div>
    <div className="card-body p-0">
      <div className="list-group list-group-flush">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="list-group-item px-4 py-3 border-0 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark">Phòng {item.roomName}</div>
                  <div className="text-muted small">{item.tenantName}</div>
                </div>
                <div className="text-end">
                  {type === 'invoice' ? (
                    <>
                      <div className="fw-bold text-danger">{new Intl.NumberFormat('vi-VN').format(item.totalAmount)}đ</div>
                      <div className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Hạn: {item.dueDate}</div>
                    </>
                  ) : (
                    <>
                      <div className="fw-bold text-primary">Còn {item.daysLeft} ngày</div>
                      <div className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>Hết: {item.endDate}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 text-center text-muted small">Không có nhắc nhở nào</div>
        )}
      </div>
    </div>
  </div>
);
export default ReminderWidget;