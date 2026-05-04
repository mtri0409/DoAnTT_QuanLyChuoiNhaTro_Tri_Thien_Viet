// components/ImageCapture.jsx
import React, { useState, useRef } from 'react';
import { FaCamera, FaImage, FaTrash, FaMagic } from 'react-icons/fa';
import apiMeterReading from '../api/apiMeterReading';

const ImageCapture = ({ serviceColor, serviceId, onFile, onRemove, onOCRComplete, imagePreview, imageName, imageSize, isSaved }) => {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const imageFileRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    imageFileRef.current = file;
    const preview = URL.createObjectURL(file);
    onFile({ file, preview });
    e.target.value = "";
  };

  const handleOCR = async () => {
    // Lấy file từ ref
    const fileToSend = imageFileRef.current;
    
    if (!fileToSend) {
      setOcrError('Chưa có ảnh để đọc');
      return;
    }
    
    setOcrLoading(true);
    setOcrError('');
    
    try {
      let response;
      
      if (serviceId === 1) { // Điện
        response = await apiMeterReading.ocrElectricity(fileToSend);
      } else if (serviceId === 2) { // Nước
        response = await apiMeterReading.ocrWater(fileToSend);
      }
      
      console.log('OCR response:', response);
      
      const meterValue = response?.data?.detectedNumber || response?.detectedNumber;
      
      if (meterValue && meterValue !== "0" && meterValue !== "") {
        // Chỉ gửi giá trị OCR, KHÔNG làm mất ảnh
        onOCRComplete(parseInt(meterValue));
        // Ảnh vẫn còn vì imageFileRef.current vẫn giữ file
      } else {
        throw new Error('Không đọc được chỉ số');
      }
      
    } catch (err) {
      console.error('OCR error:', err);
      setOcrError(err.response?.data?.message || err.message || 'Không thể đọc được số từ ảnh');
    } finally {
      setOcrLoading(false);
    }
  };

  if (isSaved) return null;

  if (imagePreview) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap p-2 rounded bg-white bg-opacity-75 border mt-2">
        <img 
          src={imagePreview} 
          alt="meter" 
          className="rounded" 
          style={{ width: 52, height: 38, objectFit: 'cover' }} 
        />
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-bold small text-truncate">{imageName || 'Ảnh đồng hồ'}</div>
          {imageSize && <div className="small text-muted">{(imageSize / 1024).toFixed(0)} KB</div>}
        </div>
        <button 
          className="btn btn-sm text-white fw-semibold"
          onClick={handleOCR} 
          disabled={ocrLoading}
          style={{ background: serviceColor, borderColor: serviceColor }}
        >
          {ocrLoading ? <span className="spinner-border spinner-border-sm" /> : <FaMagic />}
          <span className="ms-1">{ocrLoading ? 'Đang đọc' : 'OCR'}</span>
        </button>
        <button className="btn btn-sm btn-danger" onClick={onRemove}>
          <FaTrash /> Xóa
        </button>
        {ocrError && (
          <div className="text-danger small w-100 mt-1 d-flex align-items-center gap-1">
            <FaMagic size={10} /> {ocrError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex gap-2 mt-2">
      <label className="flex-grow-1 btn btn-light d-flex align-items-center justify-content-center gap-2 border" style={{ borderColor: `${serviceColor}55`, color: serviceColor }}>
        <FaCamera /> Chụp ảnh
        <input type="file" accept="image/*" capture="environment" className="d-none" onChange={handleChange} />
      </label>
      <label className="flex-grow-1 btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
        <FaImage /> Thư viện
        <input type="file" accept="image/*" className="d-none" onChange={handleChange} />
      </label>
    </div>
  );
};

export default ImageCapture;