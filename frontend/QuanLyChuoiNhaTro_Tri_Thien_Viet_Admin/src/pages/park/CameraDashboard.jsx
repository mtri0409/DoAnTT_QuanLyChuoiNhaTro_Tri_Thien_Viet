import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  FaVideo, FaVideoSlash, FaWifi, FaCar,
  FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEye, FaCircle, FaExchangeAlt,
} from "react-icons/fa";
import { socketURL } from "../../api/config";

const MOCK_CAMERAS = [
  { id: "CH-01", name: "CỔNG VÀO CHÍNH", streamUrl: "http://localhost:8000/api/stream", isMock: false },
  { id: "CH-02", name: "CỔNG RA PHỤ (MOCK)", streamUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=600", isMock: true },
  { id: "CH-03", name: "CAMERA BÃI XE TẦNG G (MOCK)", streamUrl: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600", isMock: true },
];

const CameraDashboard = () => {
  const SOCKET_URL = socketURL;

  const [cameras] = useState(MOCK_CAMERAS);
  const [activeCam, setActiveCam] = useState(MOCK_CAMERAS[0]);
  const [isStreamOffline, setIsStreamOffline] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [plateHistory, setPlateHistory] = useState([]);

  const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
  const errorSound = new Audio("https://assets.mixkit.co/active_storage/sfx/911/911-500.wav");

  const playAlert = (audioObj) => {
    try { audioObj.currentTime = 0; audioObj.play().catch(() => {}); } catch (e) {console.error(e);}
  };

  useEffect(() => {
    if (!activeCam.isMock) return;
    const mockInterval = setInterval(() => {
      const mockPlates = ["59G1-12345", "29A-99999", "43C-88888", "72A-55555"];
      const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
      const isSuccess = Math.random() > 0.2;
      setPlateHistory((prev) => [{
        track_id: Math.floor(Math.random() * 1000),
        status: isSuccess ? "SUCCESS" : "FAILED_OCR",
        best_plate: isSuccess ? randomPlate : null,
        timestamp: new Date().toISOString(),
        camera_id: activeCam.id,
      }, ...prev].slice(0, 50));
    }, 7000);
    return () => clearInterval(mockInterval);
  }, [activeCam]);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      setIsSocketConnected(true);
      stompClient.subscribe("/topic/plates", (message) => {
        try {
          const newData = JSON.parse(message.body);
          const standardData = {
            ...newData,
            track_id: newData.logId || newData.track_id || "N/A",
            best_plate: newData.licensePlate || newData.best_plate || null,
            timestamp: newData.detectedAt || newData.timestamp || new Date().toISOString(),
            status: "SUCCESS",
          };
          setPlateHistory((prev) => [standardData, ...prev].slice(0, 50));
          playAlert(successSound);
        } catch (err) { console.error(err); }
      });

      stompClient.subscribe("/topic/plates_errors", (message) => {
        try {
          const errorData = JSON.parse(message.body);
          setPlateHistory((prev) => [{
            ...errorData,
            best_plate: null,
            status: "FAILED_OCR",
            timestamp: errorData.timestamp || new Date().toISOString(),
          }, ...prev].slice(0, 50));
          playAlert(errorSound);
        } catch (err) { console.error(err); }
      });
    };

    stompClient.onWebSocketClose = () => setIsSocketConnected(false);
    stompClient.activate();
    return () => { if (stompClient) stompClient.deactivate(); };
  }, []);

  const formatTime = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
    catch { return ""; }
  };

  const totalCount = plateHistory.length;
  const successCount = plateHistory.filter((p) => p?.status === "SUCCESS").length;
  const errorCount = plateHistory.filter((p) => p?.status !== "SUCCESS").length;

  return (
    <div className="vh-100 d-flex flex-column bg-light" style={{ overflow: "hidden" }}>

      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm flex-shrink-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            <FaCar size={20} />
          </div>
          <div>
            <h6 className="m-0 fw-bold text-dark">Smart Parking AI</h6>
            <small className="text-muted">Hệ thống giám sát phương tiện</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <small className="text-muted"><FaExchangeAlt /> Kênh:</small>
          <select
            className="form-select form-select-sm fw-semibold border-primary text-primary"
            style={{ width: 200 }}
            value={activeCam.id}
            onChange={(e) => { setActiveCam(cameras.find((c) => c.id === e.target.value)); setIsStreamOffline(false); }}
          >
            {cameras.map((cam) => <option key={cam.id} value={cam.id}>{cam.id} — {cam.name}</option>)}
          </select>
        </div>

        <div className="d-flex gap-2">
          <StatusBadge label={activeCam.id} isOnline={activeCam.isMock ? true : !isStreamOffline} icon={<FaVideo />} />
          <StatusBadge label="Java server" isOnline={isSocketConnected} icon={<FaWifi />} />
        </div>
      </header>

      {/* MAIN */}
      <main className="container-fluid flex-grow-1 p-3" style={{ minHeight: 0 }}>
        <div className="row h-100 g-3">

          {/* LEFT */}
          <div className="col-lg-8 d-flex flex-column h-100 gap-3">

            {/* STATS */}
            <div className="row g-3 flex-shrink-0">
              <div className="col-4"><StatCard label="Tổng quét" value={totalCount} icon={<FaCar />} color="primary" /></div>
              <div className="col-4"><StatCard label="Thành công" value={successCount} icon={<FaCheckCircle />} color="success" /></div>
              <div className="col-4"><StatCard label="Lỗi OCR" value={errorCount} icon={<FaExclamationTriangle />} color="danger" /></div>
            </div>

            {/* CAMERA FEED */}
            <div className="card flex-grow-1 bg-dark text-white border-0 overflow-hidden position-relative">
              <div className="position-absolute top-0 w-100 px-3 py-2 d-flex justify-content-between align-items-center" style={{ background: "rgba(0,0,0,0.55)", zIndex: 10 }}>
                <span className="fw-bold small text-uppercase">{activeCam.id} — {activeCam.name}</span>
                <div className="d-flex align-items-center gap-2">
                  <FaCircle className="text-danger" size={8} />
                  <span className="text-danger fw-bold small">LIVE</span>
                </div>
              </div>

              <div className="h-100 d-flex align-items-center justify-content-center bg-black">
                {!isStreamOffline || activeCam.isMock ? (
                  <img
                    src={activeCam.streamUrl}
                    alt={activeCam.name}
                    className="w-100 h-100"
                    style={{ objectFit: activeCam.isMock ? "cover" : "contain" }}
                    onError={() => { if (!activeCam.isMock) setIsStreamOffline(true); }}
                  />
                ) : (
                  <div className="text-center p-5">
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 72, height: 72 }}>
                      <FaVideoSlash size={28} className="text-light" />
                    </div>
                    <h6 className="fw-bold mb-2">Mất tín hiệu camera</h6>
                    <p className="text-muted small mb-3">Kiểm tra Python AI Service (port 8000)</p>
                    <button onClick={() => setIsStreamOffline(false)} className="btn btn-primary btn-sm px-4">Kết nối lại</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — EVENT LOG */}
          <div className="col-lg-4 h-100">
            <div className="card h-100 shadow-sm border-0 d-flex flex-column">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-2 px-3">
                <span className="fw-semibold small d-flex align-items-center gap-2">
                  <FaClock className="text-secondary" /> Sự kiện nhận diện
                </span>
                <span className="badge bg-primary rounded-pill">{totalCount}</span>
              </div>

              <div className="card-body overflow-auto p-2" style={{ backgroundColor: "#f8f9fa" }}>
                {totalCount === 0 ? (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted py-5">
                    <FaEye size={36} className="mb-2 opacity-25" />
                    <small className="fw-semibold">Đang chờ tín hiệu...</small>
                  </div>
                ) : (
                  plateHistory.map((item, idx) => (
                    <PlateCard key={`${item?.track_id}-${idx}`} item={item} formatTime={formatTime} />
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

// ── SUB-COMPONENTS ──────────────────────────────────────────────

const StatusBadge = ({ label, isOnline, icon }) => (
  <div className={`border rounded px-2 py-1 d-flex align-items-center gap-2 small fw-semibold ${isOnline ? "border-success text-success" : "border-danger text-danger"}`}>
    {icon}
    {label}
    <span className={`rounded-circle ${isOnline ? "bg-success" : "bg-danger"}`} style={{ width: 7, height: 7, display: "inline-block" }} />
  </div>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body d-flex align-items-center justify-content-between p-3">
      <div>
        <p className="text-muted mb-1" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
        <h4 className="m-0 fw-bold text-dark">{value}</h4>
      </div>
      <div className={`text-${color}`} style={{ fontSize: 22, opacity: 0.7 }}>{icon}</div>
    </div>
  </div>
);

const PlateCard = ({ item, formatTime }) => {
  const isSuccess = item?.status === "SUCCESS";
  const plate = item?.best_plate;

  return (
    <div
      className="d-flex align-items-center gap-3 px-3 py-2 mb-1 bg-white rounded border-start border-3"
      style={{
        borderColor: isSuccess ? "#198754" : "#dc3545",
        borderLeftStyle: "solid",
        borderTop: "0.5px solid #e9ecef",
        borderRight: "0.5px solid #e9ecef",
        borderBottom: "0.5px solid #e9ecef",
      }}
    >
      {/* Status dot */}
      <div
        className={`rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center ${isSuccess ? "bg-success" : "bg-danger"}`}
        style={{ width: 32, height: 32 }}
      >
        {isSuccess
          ? <FaCheckCircle color="white" size={14} />
          : <FaExclamationTriangle color="white" size={12} />
        }
      </div>

      {/* Plate + meta */}
      <div className="flex-grow-1 min-width-0">
        <div
          className={`fw-bold ${isSuccess ? "text-dark" : "text-danger"}`}
          style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "1.5px" }}
        >
          {isSuccess && plate ? plate : "UNKNOWN"}
        </div>
        <div className="text-muted" style={{ fontSize: 11 }}>
          Track #{item?.track_id} · {formatTime(item?.timestamp)}
        </div>
      </div>

      {/* Badge */}
      <span
        className={`badge flex-shrink-0 ${isSuccess ? "bg-success" : "bg-danger"} bg-opacity-10 border`}
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: isSuccess ? "#0f5132" : "#842029",
          borderColor: isSuccess ? "#badbcc" : "#f5c2c7",
        }}
      >
        {isSuccess ? "HỢP LỆ" : "LỖI OCR"}
      </span>
    </div>
  );
};

export default CameraDashboard;