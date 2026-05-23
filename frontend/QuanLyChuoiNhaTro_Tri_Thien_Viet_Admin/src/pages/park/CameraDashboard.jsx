import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  FaVideo, FaVideoSlash, FaWifi, FaCar, 
  FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEye, FaIdCard, FaCircle
} from 'react-icons/fa';

const CameraDashboard = () => {
  const STREAM_URL = "http://localhost:8000/api/stream";
  const SOCKET_URL = "http://localhost:8080/ws-parking";

  const [isStreamOffline, setIsStreamOffline] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [plateHistory, setPlateHistory] = useState([]);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      setIsSocketConnected(true);
      stompClient.subscribe('/topic/plates', (message) => {
        try {
          const newData = JSON.parse(message.body);
          setPlateHistory((prev) => [newData, ...prev].slice(0, 50));
        } catch (err) {}
      });

      stompClient.subscribe('/topic/plates_errors', (message) => {
        try {
          const errorData = JSON.parse(message.body);
          setPlateHistory((prev) => [errorData, ...prev].slice(0, 50));
        } catch (err) {}
      });
    };

    stompClient.onWebSocketClose = () => setIsSocketConnected(false);
    stompClient.activate();

    return () => { if (stompClient) stompClient.deactivate(); };
  }, []);

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

  const todayCount = plateHistory.filter(p => {
    try { return new Date(p.timestamp).toDateString() === new Date().toDateString(); } 
    catch { return false; }
  }).length;

  const successCount = plateHistory.filter(p => p.status === 'SUCCESS').length;
  const errorCount = plateHistory.filter(p => p.status !== 'SUCCESS').length;

  return (
    // Container bao ngoài cùng, 100vh để không bị cuộn trang
    <div className="vh-100 d-flex flex-column bg-light" style={{ overflow: 'hidden' }}>
      
      {/* ===== HEADER ===== */}
      <header className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
            <FaCar size={24} />
          </div>
          <div>
            <h4 className="m-0 fw-bold text-dark">Smart Parking AI</h4>
            <small className="text-muted fw-semibold">Hệ thống giám sát phương tiện</small>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <StatusBadge label="Camera AI" isOnline={!isStreamOffline} icon={!isStreamOffline ? <FaVideo /> : <FaVideoSlash />} />
          <StatusBadge label="Máy chủ Java" isOnline={isSocketConnected} icon={<FaWifi />} />
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="container-fluid flex-grow-1 p-4" style={{ minHeight: 0 }}>
        <div className="row h-100 g-4">
          
          {/* CỘT TRÁI: THỐNG KÊ & CAMERA */}
          <div className="col-lg-8 d-flex flex-column h-100 gap-3">
            
            {/* 1. Thống kê nhanh */}
            <div className="row g-3 flex-shrink-0">
              <div className="col-4"><StatCard label="Lượt xe hôm nay" value={todayCount} icon={<FaCar />} color="primary" /></div>
              <div className="col-4"><StatCard label="Thành công" value={successCount} icon={<FaCheckCircle />} color="success" /></div>
              <div className="col-4"><StatCard label="Cảnh báo / Lỗi" value={errorCount} icon={<FaExclamationTriangle />} color="danger" /></div>
            </div>

            {/* 2. Màn hình Camera */}
            <div className="card flex-grow-1 bg-dark text-white border-0 shadow overflow-hidden position-relative">
              
              {/* Header Camera */}
              <div className="position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 10 }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge border border-secondary text-light bg-dark">CH-01</span>
                  <span className="fw-bold small">CỔNG VÀO CHÍNH</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-light small" style={{ fontFamily: 'monospace' }}>{formatTime(new Date().toISOString())}</span>
                  {!isStreamOffline && <FaCircle className="text-danger small" />}
                  <span className="text-danger fw-bold small">LIVE</span>
                </div>
              </div>

              {/* Khung Video */}
              <div className="h-100 d-flex align-items-center justify-content-center bg-black">
                {!isStreamOffline ? (
                  <img
                    src={STREAM_URL}
                    alt="Live Stream"
                    className="w-100 h-100"
                    style={{ objectFit: 'contain' }}
                    onError={() => setIsStreamOffline(true)}
                  />
                ) : (
                  <div className="text-center p-5">
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                      <FaVideoSlash size={32} className="text-light" />
                    </div>
                    <h5 className="fw-bold">Mất tín hiệu Video</h5>
                    <p className="text-muted small mb-4">Kiểm tra lại service Python AI hoặc đường truyền.</p>
                    <button onClick={() => setIsStreamOffline(false)} className="btn btn-primary px-4 shadow">
                      Thử kết nối lại
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỊCH SỬ NHẬN DIỆN */}
          <div className="col-lg-4 h-100">
            <div className="card h-100 shadow-sm border-0 d-flex flex-column">
              
              {/* Header Lịch sử */}
              <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
                <h6 className="m-0 fw-bold d-flex align-items-center gap-2">
                  <FaClock className="text-secondary" /> Luồng sự kiện
                </h6>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {plateHistory.length} kết quả
                </span>
              </div>

              {/* Danh sách (Scrollable) */}
              <div className="card-body overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
                {plateHistory.length === 0 ? (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <FaEye size={48} className="mb-3 text-light" />
                    <span className="fw-semibold">Hệ thống đang chờ</span>
                    <small>Chưa có phương tiện qua trạm...</small>
                  </div>
                ) : (
                  plateHistory.map((item, idx) => (
                    <PlateCard key={item.track_id + '-' + idx} item={item} formatTime={formatTime} formatDate={formatDate} />
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
  const isSuccess = item.status === 'SUCCESS';
  
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
            <span className="d-block fw-bold text-dark small">{formatTime(item.timestamp)}</span>
            <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{formatDate(item.timestamp)}</span>
          </div>
        </div>
        
        <div>
          {isSuccess ? (
            <div>
              <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                {item.best_plate}
              </h2>
              <div className="d-flex gap-2 mt-2">
                <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                  <FaIdCard /> ID: {item.track_id}
                </span>
                <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                  Tỉ lệ: {item.confidence_votes}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h5 className="fw-bold text-muted" style={{ fontFamily: 'monospace' }}>Không xác định</h5>
              <div className="mt-2 p-2 bg-light border border-danger border-opacity-25 rounded">
                <small className="fw-bold text-dark d-block mb-1">Kết quả OCR thô:</small>
                <small className="text-muted d-block" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {item.raw_5_reads?.join(' | ') || 'Trống'}
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