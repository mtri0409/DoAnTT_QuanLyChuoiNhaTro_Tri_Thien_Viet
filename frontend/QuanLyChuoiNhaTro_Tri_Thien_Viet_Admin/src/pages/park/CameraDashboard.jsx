import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  FaVideo, FaVideoSlash, FaWifi, FaCar, 
  FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEye, FaIdCard, FaCircle, FaExchangeAlt
} from 'react-icons/fa';

// CẤU HÌNH ĐA CAMERA & MOCK DATA: Hỗ trợ chuyển đổi kênh hoặc giả lập sự kiện
const MOCK_CAMERAS = [
  { id: 'CH-01', name: 'CỔNG VÀO CHÍNH', streamUrl: "http://localhost:8000/api/stream", isMock: false },
  { id: 'CH-02', name: 'CỔNG RA PHỤ (MOCK)', streamUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=600", isMock: true },
  { id: 'CH-03', name: 'CAMERA BÃI XE TẦNG G (MOCK)', streamUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600", isMock: true }
];

const CameraDashboard = () => {
  const SOCKET_URL = "http://localhost:8080/ws-parking";

  // Quản lý trạng thái camera
  const [cameras] = useState(MOCK_CAMERAS);
  const [activeCam, setActiveCam] = useState(MOCK_CAMERAS[0]);

  const [isStreamOffline, setIsStreamOffline] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [plateHistory, setPlateHistory] = useState([]);
  const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
  const errorSound = new Audio("https://assets.mixkit.co/active_storage/sfx/911/911-500.wav");

  const playAlert = (audioObj) => {
    try {
      audioObj.currentTime = 0; // Tua nhanh về giây đầu tiên (tránh bị lag khi quét liên tục)
      audioObj.play().catch(err => console.log("Trình duyệt yêu cầu tương tác trước khi phát âm thanh"));
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (!activeCam.isMock) return;

    const mockInterval = setInterval(() => {
      const mockPlates = ["59G1-12345", "29A-99999", "43C-88888", "72A-55555"];
      const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
      const isSuccess = Math.random() > 0.2; // Giả lập tỷ lệ OCR thành công 80%

      const mockEvent = {
        track_id: Math.floor(Math.random() * 1000),
        status: isSuccess ? "SUCCESS" : "FAILED_OCR",
        best_plate: isSuccess ? randomPlate : null,
        confidence_votes: "5/5",
        raw_5_reads: isSuccess ? [randomPlate] : ["???", "UNKNOWN"],
        timestamp: new Date().toISOString(),
        camera_id: activeCam.id
      };

      setPlateHistory((prev) => [mockEvent, ...prev].slice(0, 50));
    }, 7000); // 7 giây xuất hiện một xe mới

    return () => clearInterval(mockInterval);
  }, [activeCam]);

  // 2. LUỒNG WEBSOCKET REALTIME: Kết nối trực tiếp đến Spring Boot Server thông qua SockJS
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      setIsSocketConnected(true);
      
      // Đăng ký nhận sự kiện quét thành công
      stompClient.subscribe('/topic/plates', (message) => {
        try {
          const newData = JSON.parse(message.body);
          // Đồng bộ cấu hình trường trạng thái theo chuẩn hệ thống mới
          const standardData = {
            ...newData,
            status: newData.status || 'SUCCESS'
          };
          setPlateHistory((prev) => [standardData, ...prev].slice(0, 50));
          playAlert(successSound);
        } catch (err) {
          console.error("Lỗi phân tích cú pháp JSON hợp lệ:", err);
        }
      });

      // Đăng ký nhận sự kiện lỗi hoặc xe không đọc được biển số
      stompClient.subscribe('/topic/plates_errors', (message) => {
        try {
          const errorData = JSON.parse(message.body);
          const standardError = {
            ...errorData,
            status: errorData.status || 'FAILED_OCR'
          };
          setPlateHistory((prev) => [standardError, ...prev].slice(0, 50));
          playAlert(errorSound);
        } catch (err) {
          console.error("Lỗi phân tích cú pháp JSON cảnh báo:", err);
        }
      });
    };

    stompClient.onWebSocketClose = () => setIsSocketConnected(false);
    stompClient.activate();

    // Hủy kích hoạt cổng kết nối khi component bị unmount khỏi cây DOM
    return () => { if (stompClient) stompClient.deactivate(); };
  }, []);

  // Tiện ích định dạng thời gian và ngày
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return ''; }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return ''; }
  };

  // Tính toán các chỉ số dựa trên mảng lịch sử thời gian thực (Có cơ chế phòng vệ chống lỗi undefined)
  const totalCount = plateHistory?.length || 0;
  const successCount = plateHistory?.filter(p => p?.status === 'SUCCESS').length || 0;
  const errorCount = plateHistory?.filter(p => p?.status !== 'SUCCESS').length || 0;

  return (
    <div className="vh-100 d-flex flex-column bg-light" style={{ overflow: 'hidden' }}>
      
      {/* ===== HEADER ===== */}
      <header className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
            <FaCar size={24} />
          </div>
          <div>
            <h4 className="m-0 fw-bold text-dark">Smart Parking AI</h4>
            <small className="text-muted fw-semibold">Hệ thống giám sát phương tiện đa kênh</small>
          </div>
        </div>
        
        {/* Bộ tinh chỉnh đổi luồng Camera nhanh */}
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-bold"><FaExchangeAlt /> Chọn kênh:</span>
          <select 
            className="form-select form-select-sm fw-bold border-primary text-primary" 
            style={{ width: '220px' }}
            value={activeCam.id}
            onChange={(e) => {
              const selected = cameras.find(c => c.id === e.target.value);
              setActiveCam(selected);
              setIsStreamOffline(false); // Đặt lại trạng thái lỗi của luồng camera mới
            }}
          >
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>{cam.id} - {cam.name}</option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-2">
          <StatusBadge label={activeCam.id} isOnline={activeCam.isMock ? true : !isStreamOffline} icon={<FaVideo />} />
          <StatusBadge label="Máy chủ Java" isOnline={isSocketConnected} icon={<FaWifi />} />
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="container-fluid flex-grow-1 p-4" style={{ minHeight: 0 }}>
        <div className="row h-100 g-4">
          
          {/* CỘT TRÁI: THỐNG KÊ NHANH & MÀN HÌNH THEO DÕI */}
          <div className="col-lg-8 d-flex flex-column h-100 gap-3">
            
            {/* Thống kê nhanh luồng dữ liệu tạm thời */}
            <div className="row g-3 flex-shrink-0">
              <div className="col-4"><StatCard label="Tổng lưu lượng quét" value={totalCount} icon={<FaCar />} color="primary" /></div>
              <div className="col-4"><StatCard label="Nhận diện thành công" value={successCount} icon={<FaCheckCircle />} color="success" /></div>
              <div className="col-4"><StatCard label="Cảnh báo / Lỗi OCR" value={errorCount} icon={<FaExclamationTriangle />} color="danger" /></div>
            </div>

            {/* Khung giám sát Camera */}
            <div className="card flex-grow-1 bg-dark text-white border-0 shadow overflow-hidden position-relative">
              
              <div className="position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 10 }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge border border-secondary text-light bg-dark">{activeCam.id}</span>
                  <span className="fw-bold small text-uppercase">{activeCam.name}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-light small" style={{ fontFamily: 'monospace' }}>{formatTime(new Date().toISOString())}</span>
                  {(!isStreamOffline || activeCam.isMock) && <FaCircle className="text-danger small animate-pulse" />}
                  <span className="text-danger fw-bold small">LIVE</span>
                </div>
              </div>

              {/* Box kết xuất hình ảnh từ Stream URL */}
              <div className="h-100 d-flex align-items-center justify-content-center bg-black">
                {(!isStreamOffline || activeCam.isMock) ? (
                  <img
                    src={activeCam.streamUrl}
                    alt={activeCam.name}
                    className="w-100 h-100"
                    style={{ objectFit: activeCam.isMock ? 'cover' : 'contain' }}
                    onError={() => { if(!activeCam.isMock) setIsStreamOffline(true); }}
                  />
                ) : (
                  <div className="text-center p-5">
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                      <FaVideoSlash size={32} className="text-light" />
                    </div>
                    <h5 className="fw-bold">Mất tín hiệu luồng camera thật</h5>
                    <p className="text-muted small mb-4">Vui lòng kiểm tra lại cổng chạy Python AI Service (Port 8000) hoặc liên kết webcam.</p>
                    <button onClick={() => setIsStreamOffline(false)} className="btn btn-primary px-4 shadow">
                      Thử kết nối lại
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LUỒNG SỰ KIỆN NHẬN DIỆN THỜI GIAN THỰC */}
          <div className="col-lg-4 h-100">
            <div className="card h-100 shadow-sm border-0 d-flex flex-column">
              
              <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                <h6 className="m-0 fw-bold d-flex align-items-center gap-2">
                  <FaClock className="text-secondary" /> Luồng sự kiện trạm
                </h6>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {totalCount} sự kiện
                </span>
              </div>

              <div className="card-body overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
                {totalCount === 0 ? (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <FaEye size={48} className="mb-3 text-light" />
                    <span className="fw-semibold">Hệ thống đã sẵn sàng</span>
                    <small>Đang nghe tín hiệu xe từ camera hoặc mock dữ liệu...</small>
                  </div>
                ) : (
                  plateHistory.map((item, idx) => (
                    <PlateCard 
                      key={item?.track_id ? `${item.track_id}-${idx}` : idx} 
                      item={item} 
                      formatTime={formatTime} 
                      formatDate={formatDate} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

const StatusBadge = ({ label, isOnline, icon }) => {
  const badgeClass = isOnline ? 'border-success text-success bg-white' : 'border-danger text-danger bg-white';
  return (
    <div className={`border rounded p-2 d-flex align-items-center gap-2 ${badgeClass}`}>
      {icon}
      <span className="small fw-bold">{label}</span>
      <span className={`rounded-circle ${isOnline ? 'bg-success' : 'bg-danger'}`} style={{ width: '8px', height: '8px' }}></span>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center justify-content-between p-3">
        <div>
          <p className="text-muted small mb-1 fw-semibold">{label}</p>
          <h3 className="m-0 fw-bold text-dark">{value}</h3>
        </div>
        <div className={`text-${color} bg-light border border-${color} border-opacity-25 rounded d-flex align-items-center justify-content-center`} style={{ width: '50px', height: '50px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const PlateCard = ({ item, formatTime, formatDate }) => {
  // Đồng bộ kiểm tra trạng thái khớp với dữ liệu cấu hình mới của Java
  const isSuccess = item?.status === 'SUCCESS';
  
  return (
    <div className={`card mb-3 shadow-sm border-0 border-start border-5 ${isSuccess ? 'border-success' : 'border-danger bg-white'}`}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          
          <div className="d-flex align-items-center gap-2">
            {isSuccess ? (
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 text-uppercase">Hợp lệ</span>
            ) : (
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 text-uppercase d-flex align-items-center gap-1">
                <FaExclamationTriangle /> Lỗi đọc
              </span>
            )}
          </div>
          
          <div className="text-end">
            <span className="d-block fw-bold text-dark small">{formatTime(item?.timestamp)}</span>
            <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(item?.timestamp)}</span>
          </div>
        </div>
        
        <div>
          {isSuccess ? (
            <div>
              <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                {item?.best_plate}
              </h2>
              <div className="d-flex gap-2 mt-2">
                <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                  <FaIdCard /> Track ID: {item?.track_id}
                </span>
                <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                  Tỷ lệ bầu: {item?.confidence_votes}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h5 className="fw-bold text-muted" style={{ fontFamily: 'monospace' }}>
                {item?.best_plate || "UNKNOWN (Không đọc được)"}
              </h5>
              <div className="mt-2 p-2 bg-light border border-danger border-opacity-25 rounded">
                <small className="fw-bold text-dark d-block mb-1">Kết quả phân tích thô:</small>
                <small className="text-muted d-block" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {item?.raw_5_reads?.join(' | ') || 'Dữ liệu ảnh lỗi hoàn toàn'}
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraDashboard;