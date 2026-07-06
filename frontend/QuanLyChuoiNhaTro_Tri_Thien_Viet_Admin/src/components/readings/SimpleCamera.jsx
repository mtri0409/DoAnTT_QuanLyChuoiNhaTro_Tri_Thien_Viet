// components/readings/SimpleCamera.jsx - Phiên bản đã fix lỗi OverconstrainedError
import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaTimes, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

const SimpleCamera = ({ onCapture, onClose, serviceColor = "#ffc107" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' hoặc 'user'

  // Dừng camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Khởi tạo camera - KHÔNG dùng exact để tránh OverconstrainedError
  const initCamera = async (mode) => {
    stopCamera();
    setError(null);
    setIsReady(false);
    
    try {
      // Cách 1: Dùng facingMode không exact (ưu tiên nhưng không bắt buộc)
      let constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      // Thêm facingMode nhưng KHÔNG dùng exact
      if (mode === 'environment') {
        constraints.video.facingMode = { ideal: 'environment' };
      } else {
        constraints.video.facingMode = { ideal: 'user' };
      }
      
      console.log('Camera constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setIsReady(true);
      };
    } catch (err) {
      console.error('Camera error:', err);
      
      // Cách 2: Thử lại với constraints cơ bản nhất (không facingMode)
      try {
        console.log('Thử lại với constraints cơ bản...');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        videoRef.current.srcObject = fallbackStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsReady(true);
        };
        setFacingMode('any'); // Đánh dấu là đang dùng camera mặc định
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setError('Không thể truy cập camera. Vui lòng kiểm tra quyền và kết nối.');
      }
    }
  };

  // Chụp ảnh
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) {
      setError('Camera chưa sẵn sàng, vui lòng đợi...');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Không thể tạo ảnh');
          return;
        }
        
        const file = new File([blob], `meter_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const preview = URL.createObjectURL(blob);
        onCapture({ file, preview });
        
        // Đóng camera sau khi chụp
        stopCamera();
        onClose();
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Không thể chụp ảnh, vui lòng thử lại');
    }
  };

  // Đổi camera
  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    // Camera sẽ tự động khởi tạo lại khi facingMode thay đổi
  };

  // Effect khởi tạo camera
  useEffect(() => {
    let isActive = true;
    
    const startCamera = async () => {
      if (!isActive) return;
      await initCamera(facingMode);
    };
    
    startCamera();
    
    return () => {
      isActive = false;
      stopCamera();
    };
  }, [facingMode]);

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-black" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 bg-dark bg-opacity-75 text-white">
        <h6 className="mb-0">
          <FaCamera className="me-2" />
          Chụp ảnh đồng hồ
        </h6>
        <button className="btn btn-sm btn-outline-light" onClick={() => { stopCamera(); onClose(); }}>
          <FaTimes />
        </button>
      </div>

      {/* Video preview */}
      <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center bg-black">
        {error ? (
          <div className="text-center text-white p-4" style={{ maxWidth: '90%' }}>
            <FaExclamationTriangle size={48} className="mb-3 text-warning" />
            <p className="mb-3">{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-outline-light" 
                onClick={() => initCamera(facingMode)}
              >
                Thử lại
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  // Reset và thử với camera khác
                  const newMode = facingMode === 'environment' ? 'user' : 'environment';
                  setFacingMode(newMode);
                }}
              >
                Đổi camera
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            
            {/* Overlay khung canh */}
            <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none">
              <div
                className="border-4 border-warning rounded-3 position-relative"
                style={{
                  width: '80%',
                  maxWidth: 400,
                  aspectRatio: '4/3',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                }}
              >
                <div className="position-absolute bottom-0 start-0 w-100 text-center mb-2">
                  <span className="bg-dark bg-opacity-75 text-white px-2 py-1 rounded small">
                    🎯 Canh đồng hồ vào khung
                  </span>
                </div>
              </div>
            </div>

            {/* Loading */}
            {!isReady && !error && (
              <div className="position-absolute bg-dark bg-opacity-75 text-white px-3 py-2 rounded">
                <div className="spinner-border spinner-border-sm me-2" />
                Đang khởi tạo camera...
              </div>
            )}

            {/* Hướng dẫn */}
            {isReady && (
              <div className="position-absolute bottom-5 start-50 translate-middle-x mb-4">
                <div className="bg-dark bg-opacity-75 text-white px-3 py-1 rounded-pill small">
                  📸 Đưa đồng hồ vào khung, giữ yên → bấm nút chụp
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Canvas ẩn */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      {isReady && !error && (
        <div className="position-absolute bottom-0 start-0 w-100 p-4 d-flex justify-content-center gap-3 bg-dark bg-opacity-75">
          <button
            className="btn btn-secondary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 50, height: 50 }}
            onClick={switchCamera}
            title="Đổi camera trước/sau"
          >
            <FaSyncAlt size={20} />
          </button>
          
          <button
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: 70, 
              height: 70, 
              backgroundColor: serviceColor,
              border: '3px solid white'
            }}
            onClick={capturePhoto}
          >
            <FaCamera size={28} color="white" />
          </button>
          
          <div style={{ width: 50 }} />
        </div>
      )}
    </div>
  );
};

export default SimpleCamera;