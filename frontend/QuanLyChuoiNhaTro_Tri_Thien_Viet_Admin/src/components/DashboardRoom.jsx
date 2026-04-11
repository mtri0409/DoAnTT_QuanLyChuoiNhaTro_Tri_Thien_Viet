import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết cho Doughnut Chart
ChartJS.register(ArcElement, Tooltip, Legend);

const RoomDashboard = ({ data }) => {
  // Dữ liệu cho biểu đồ tròn (Trạng thái phòng)
  const doughnutData = {
    labels: ['Phòng Trống', 'Đang Ở', 'Bảo Trì'],
    datasets: [
      {
        data: [data.availableRooms, data.occupiedRooms, data.maintenanceRooms],
        backgroundColor: [
          '#4ade80', // Xanh lá (Empty)
          '#3b82f6', // Xanh dương (Occupied)
          '#facc15', // Vàng (Maintenance)
        ],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '70%', // Tạo lỗ rỗng ở giữa để thành biểu đồ vòng khuyên
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Thống kê chi tiết</h2>
      
      {/* 1. Hàng thẻ số liệu (Stat Cards) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Tổng số Tầng" value={data.totalFloors} color="#6366f1" />
        <StatCard title="Tổng số Phòng" value={data.totalRooms} color="#8b5cf6" />
        <StatCard title="Tổng số Khách (Profiles)" value={data.totalProfiles} color="#ec4899" />
      </div>

      {/* 2. Biểu đồ trạng thái */}
      <div style={{ width: '400px', textAlign: 'center' }}>
        <h3>Tình trạng phòng</h3>
        <Doughnut data={doughnutData} options={options} />
        <div style={{ marginTop: '-135px', marginBottom: '100px' }}>
             <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {Math.round((data.occupiedRooms / data.totalRooms) * 100)}%
             </span>
             <br /> Lấp đầy
        </div>
      </div>
    </div>
  );
};

// Component con để hiển thị các ô số liệu
const StatCard = ({ title, value, color }) => (
  <div style={{
    flex: 1,
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: color,
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <div style={{ fontSize: '14px', opacity: 0.8 }}>{title}</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>{value}</div>
  </div>
);

export default RoomDashboard;