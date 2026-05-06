import React, { useState, useEffect } from "react";
import { 
  FaBuilding, FaBed, FaUsers, FaArrowDown, FaHistory, 
  FaMoneyBillWave, FaBolt, FaTint, FaSyncAlt, FaExclamationTriangle 
} from "react-icons/fa";
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, Title 
} from 'chart.js';

import apiDashboard from "../api/apiDashboard";
import apiBranches from "../api/apiBranches";
import StatCard from "../components/StatCard";
import MiniStat from "../components/MiniStast";
import ReminderWidget from "../components/ReminderWidget";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Stats States
  const [systemStats, setSystemStats] = useState(null);
  const [financeStats, setFinanceStats] = useState(null);
  const [utilityStats, setUtilityStats] = useState(null);
  const [reminders, setReminders] = useState({ expiringContracts: [], pendingInvoices: [] });
  const [branches, setBranches] = useState([]);
  
  // Filter States
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const [branchDetail, setBranchDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInitialData(); }, []);
  // Load lại dữ liệu khi đổi chi nhánh hoặc thời gian
  useEffect(() => { loadDashboardData(); }, [selectedBranchId, selectedMonth, selectedYear]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, branchRes] = await Promise.all([
        apiDashboard.getStash(),
        apiBranches.getAllBranches(1, 100)
      ]);
      setSystemStats(statsRes);
      setBranches(branchRes.content || []);
    } catch (err) { console.error("Lỗi khởi tạo:", err); } 
    finally { setLoading(false); }
  };

 const loadDashboardData = async () => {
  try {
    const branchParam = selectedBranchId || null;
    
    // 1. Luôn gọi Finance và Utility (vì hai cái này hỗ trợ null cho toàn hệ thống)
    const promises = [
      apiDashboard.getFinancialAnalytics(branchParam, selectedMonth, selectedYear),
      apiDashboard.getUtilityAnalytics(branchParam, selectedMonth, selectedYear)
    ];

    // 2. CHỈ đưa Reminder và BranchDetail vào mảng gọi API nếu selectedBranchId THỰC SỰ CÓ GIÁ TRỊ
    // Kiểm tra thêm selectedBranchId !== "" để tránh lỗi truyền chuỗi rỗng vào URL
    if (selectedBranchId && selectedBranchId !== "") {
      promises.push(apiDashboard.getReminders(selectedBranchId));
      promises.push(apiDashboard.getStashByBranch(selectedBranchId));
    }

    const results = await Promise.all(promises);
    
    setFinanceStats(results[0]);
    setUtilityStats(results[1]);
    
    // 3. Gán dữ liệu dựa trên kết quả trả về
    if (selectedBranchId && selectedBranchId !== "") {
      setReminders(results[2]);
      setBranchDetail(results[3]);
    } else {
      // Nếu không chọn chi nhánh, reset lại dữ liệu nhắc nhở
      setReminders({ expiringContracts: [], pendingInvoices: [] });
      setBranchDetail(null);
    }
  } catch (err) { 
    console.error("Lỗi cập nhật dữ liệu:", err); 
  }
};

  const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  if (loading) return <div className="p-5 text-center text-primary fw-bold">🚀 Đang kết nối hệ thống...</div>;

  const activeData = branchDetail || systemStats;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      
     {/* 1. BỘ LỌC (FILTER BAR) */}
<div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
  <div className="row g-3 align-items-center">
    {/* Tiêu đề - Luôn nằm trên cùng hoặc bên trái */}
    <div className="col-12 col-md-auto">
      <h4 className="fw-bold mb-0 text-dark">Dashboard Quản Lý</h4>
    </div>

    {/* Nhóm bộ lọc - Tự động giãn cách */}
    <div className="col-12 col-md">
      <div className="row g-2 justify-content-md-end">
        <div className="col-12 col-sm-4 col-md-auto">
          <select 
            className="form-select border-light shadow-none w-100 rounded-3" 
            value={selectedBranchId} 
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="">-- Tất cả chi nhánh --</option>
            {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
          </select>
        </div>
        
        <div className="col-6 col-sm-3 col-md-auto">
          <select 
            className="form-select border-light shadow-none w-100 rounded-3" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : "")}
          >
            <option value="">-- Tháng --</option>
            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
          </select>
        </div>

        <div className="col-6 col-sm-3 col-md-auto">
          <select 
            className="form-select border-light shadow-none w-100 rounded-3" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : "")}
          >
            <option value="">-- Năm --</option>
            {[currentYear, currentYear - 1].map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        </div>

        <div className="col-12 col-sm-auto">
          <button className="btn btn-primary rounded-3 w-100" onClick={loadDashboardData}>
            <FaSyncAlt /> <span className="d-sm-none ms-1">Làm mới</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* 2. TỈ LỆ LẤP ĐẦY (HIỆU SUẤT VẬN HÀNH) */}
      <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
        <div className="row align-items-center">
          <div className="col-lg-4 text-center border-end">
             <h6 className="fw-bold text-muted uppercase small mb-3">Tỉ lệ lấp đầy hiện tại</h6>
             <div style={{ height: '180px', position: 'relative' }}>
                <Doughnut 
                  data={{
                    labels: ['Trống', 'Ở', 'Bảo trì'],
                    datasets: [{
                      data: [activeData?.availableRooms, activeData?.occupiedRooms, activeData?.maintenanceRooms],
                      backgroundColor: ['#4ade80', '#3b82f6', '#facc15'],
                      cutout: '80%', borderWeight: 0
                    }]
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <h2 className="fw-bold mb-0">{activeData?.totalRooms > 0 ? Math.round((activeData.occupiedRooms / activeData.totalRooms) * 100) : 0}%</h2>
                  <div className="small text-muted fw-bold">LẤP ĐẦY</div>
                </div>
             </div>
          </div>
          <div className="col-lg-8 ps-lg-5">
             <div className="row g-3">
                <MiniStat title="Tổng số phòng" value={activeData?.totalRooms} icon={<FaBed />} color="text-primary" />
                <MiniStat title="Đang ở" value={activeData?.occupiedRooms} icon={<FaUsers />} color="text-success" />
                <MiniStat title="Phòng trống" value={activeData?.availableRooms} icon={<FaArrowDown />} color="text-warning" />
                <MiniStat title="Khách lưu trú" value={activeData?.totalProfiles || activeData?.totalMembers} icon={<FaUsers />} color="text-info" />
             </div>
          </div>
        </div>
      </div>

      {/* 3. TÀI CHÍNH & NHẮC VIỆC (LAYOUT 7/5) */}
      <div className="row g-4 mb-5">
        <div className="col-xl-8">
          <div className="row g-3 mb-3">
            <StatCard title="Tiền phòng" value={formatVND(financeStats?.totalPaidMonthly)} icon={<FaMoneyBillWave />} color="text-primary" bg="bg-primary" />
            <StatCard title="Tiền cọc" value={formatVND(financeStats?.totalPaidDeposit)} icon={<FaHistory />} color="text-success" bg="bg-success" />
            <StatCard title="Khách nợ" value={formatVND(financeStats?.totalPendingAmount || financeStats?.totalPending)} icon={<FaArrowDown />} color="text-danger" bg="bg-danger" />
            <StatCard title="Đơn nợ" value={`${financeStats?.pendingInvoicesCount || 0} hóa đơn`} icon={<FaBed />} color="text-warning" bg="bg-warning" />
          </div>
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h6 className="fw-bold mb-4 text-primary uppercase small">Phân tích dòng tiền thực tế</h6>
            <div style={{ height: '320px' }}>
              <Bar 
                data={{
                  labels: ['Thu tiền phòng', 'Thu tiền cọc', 'Khách còn nợ', 'Đã hoàn trả'],
                  datasets: [{
                    data: [financeStats?.totalPaidMonthly, financeStats?.totalPaidDeposit, financeStats?.totalPendingAmount || financeStats?.totalPending, financeStats?.totalRefunded],
                    backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
                    borderRadius: 8, barThickness: 45
                  }]
                }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
              />
            </div>
          </div>
        </div>

        {/* CỘT NHẮC VIỆC (RIGHT SIDE) */}
        <div className="col-xl-4">
          <ReminderWidget 
            title="Hóa đơn chưa đóng" 
            icon={<FaExclamationTriangle className="text-danger" />} 
            data={reminders.pendingInvoices}
            type="invoice"
          />
          <ReminderWidget 
            title="Hợp đồng sắp hết hạn" 
            icon={<FaHistory className="text-warning" />} 
            data={reminders.expiringContracts}
            type="contract"
          />
        </div>
      </div>

      {/* 4. ĐIỆN NƯỚC */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3 text-info"><FaBolt className="me-2"/>Dịch vụ Điện & Nước</h5>
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
              <div className="mb-4 border-bottom pb-2">
                <div className="display-6 fw-bold text-warning">{formatVND(utilityStats?.totalElectricMoney)}</div>
                <div className="text-muted small uppercase fw-bold">Tổng tiền điện</div>
              </div>
              <div>
                <div className="display-6 fw-bold text-info">{formatVND(utilityStats?.totalWaterMoney)}</div>
                <div className="text-muted small uppercase fw-bold">Tổng tiền nước</div>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
              <h6 className="fw-bold mb-4 text-info uppercase small">Biểu đồ doanh thu dịch vụ</h6>
              <div style={{ height: '220px' }}>
                <Bar 
                  data={{
                    labels: ['Tiền Điện (VNĐ)', 'Tiền Nước (VNĐ)'],
                    datasets: [{
                      data: [utilityStats?.totalElectricMoney, utilityStats?.totalWaterMoney],
                      backgroundColor: ['#f59e0b', '#0ea5e9'],
                      borderRadius: 10, barThickness: 80
                    }]
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */






export default Dashboard;