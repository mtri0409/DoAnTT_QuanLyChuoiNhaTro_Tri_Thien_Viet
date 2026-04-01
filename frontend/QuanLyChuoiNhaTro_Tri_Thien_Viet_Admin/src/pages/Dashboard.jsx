import React from 'react';
import { 
  FaBuilding, FaBed, FaUsers, FaFileInvoiceDollar, 
  FaArrowUp, FaArrowDown, FaHistory 
} from 'react-icons/fa';

const Dashboard = () => {
  // Dữ liệu thống kê mẫu
  const stats = [
    { title: "Tổng Chi Nhánh", value: "12", icon: <FaBuilding />, color: "primary", change: "+2 tháng này", up: true },
    { title: "Phòng Trống", value: "45", icon: <FaBed />, color: "success", change: "-5 tuần này", up: false },
    { title: "Khách Thuê", value: "1,250", icon: <FaUsers />, color: "info", change: "+12% tăng", up: true },
    { title: "Doanh Thu", value: "450tr", icon: <FaFileInvoiceDollar />, color: "warning", change: "+15tr hôm nay", up: true },
  ];

  const recentActivities = [
    { id: 1, task: "Thanh toán hóa đơn P.101", time: "5 phút trước", status: "Thành công" },
    { id: 2, task: "Hợp đồng mới - Nguyễn Văn A", time: "1 giờ trước", status: "Chờ duyệt" },
    { id: 3, task: "Báo hỏng điện P.305", time: "3 giờ trước", status: "Đang xử lý" },
  ];

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h4 className="fw-bold">Tổng quan hệ thống</h4>
        <p className="text-muted small">Chào mừng Tri, đây là báo cáo nhanh tình hình kinh doanh hôm nay.</p>
      </div>

      {/* 1. STATS CARDS */}
      <div className="row g-3 mb-4">
        {stats.map((item, index) => (
          <div className="col-12 col-sm-6 col-xl-3" key={index}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`p-3 rounded-circle bg-${item.color} bg-opacity-10 text-${item.color}`}>
                    {item.icon}
                  </div>
                  <small className={`fw-bold ${item.up ? 'text-success' : 'text-danger'}`}>
                    {item.up ? <FaArrowUp /> : <FaArrowDown />} {item.change}
                  </small>
                </div>
                <h3 className="fw-bold mb-1">{item.value}</h3>
                <p className="text-muted small mb-0">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 2. BIỂU ĐỒ GIẢ LẬP (Tỉ lệ lấp đầy phòng) */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h6 className="fw-bold m-0">Tỉ lệ lấp đầy theo chi nhánh</h6>
            </div>
            <div className="card-body">
              {['Quận 1', 'Thủ Đức', 'Bình Thạnh', 'Quận 7'].map((branch, idx) => (
                <div className="mb-4" key={idx}>
                  <div className="d-flex justify-content-between mb-1 small">
                    <span>{branch}</span>
                    <span className="fw-bold">{85 - idx * 10}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar bg-primary`} 
                      style={{ width: `${85 - idx * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-light rounded text-center small text-muted">
                Dữ liệu được cập nhật tự động mỗi 30 phút.
              </div>
            </div>
          </div>
        </div>

        {/* 3. HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 d-flex align-items-center">
              <FaHistory className="me-2 text-primary" />
              <h6 className="fw-bold m-0">Hoạt động gần đây</h6>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {recentActivities.map((act) => (
                  <li className="list-group-item border-0 px-4 py-3" key={act.id}>
                    <div className="d-flex justify-content-between">
                      <h6 className="small fw-bold mb-1">{act.task}</h6>
                      <small className="text-muted">{act.time}</small>
                    </div>
                    <span className={`badge rounded-pill bg-light text-dark border small`}>
                      {act.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-3 text-center border-top">
                <button className="btn btn-sm btn-link text-decoration-none">Xem tất cả</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;