// components/readings/ImageCapture.jsx (phần thay đổi)
import React, { useState, useRef } from 'react';
import { FaCamera, FaImage, FaTrash, FaMagic } from 'react-icons/fa';
import SimpleCamera from './SimpleCamera'; // Import component mới
import apiMeterReading from '../../api/apiMeterReading';

const ImageCapture = ({ 
  serviceColor, 
  serviceId, 
  onFile, 
  onRemove, 
  onOCRComplete, 
  imagePreview, 
  imageName, 
  imageSize, 
  isSaved 
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCurrentFile(file);
    const preview = URL.createObjectURL(file);
    setCurrentPreview(preview);
    onFile({ file, preview });
    e.target.value = "";
  };

  const handleCapture = ({ file, preview }) => {
    setCurrentFile(file);
    setCurrentPreview(preview);
    onFile({ file, preview });
  };

  const handleRemove = () => {
    if (currentPreview) URL.revokeObjectURL(currentPreview);
    setCurrentFile(null);
    setCurrentPreview(null);
    setOcrError('');
    if (onRemove) onRemove();
  };

  const handleOCR = async () => {
    const fileToSend = currentFile;
    if (!fileToSend) {
      setOcrError('Chưa có ảnh để đọc');
      return;
    }
    
    setOcrLoading(true);
    setOcrError('');
    
    try {
      let response;
      if (serviceId === 1) {
        response = await apiMeterReading.ocrElectricity(fileToSend);
      } else if (serviceId === 2) {
        response = await apiMeterReading.ocrWater(fileToSend);
      }
      
      const meterValue = response?.data?.detectedNumber || response?.detectedNumber;
      if (meterValue && meterValue !== "0" && meterValue !== "") {
        onOCRComplete(parseInt(meterValue));
      } else {
        throw new Error('Không đọc được chỉ số');
      }
    } catch (err) {
      setOcrError(err.response?.data?.message || err.message || 'Không thể đọc được số từ ảnh');
    } finally {
      setOcrLoading(false);
    }
  };

  if (isSaved) return null;

  if (currentPreview || imagePreview) {
    const previewSrc = currentPreview || imagePreview;
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap p-2 rounded bg-white bg-opacity-75 border mt-2">
        <img src={previewSrc} alt="meter" className="rounded" style={{ width: 52, height: 38, objectFit: 'cover' }} />
        <div className="flex-grow-1">
          <div className="fw-bold small text-truncate">{imageName || 'Ảnh đồng hồ'}</div>
        </div>
        <button 
          className="btn btn-sm text-white"
          onClick={handleOCR} 
          disabled={ocrLoading}
          style={{ background: serviceColor }}
        >
          {ocrLoading ? <span className="spinner-border spinner-border-sm" /> : <FaMagic />}
          <span className="ms-1">OCR</span>
        </button>
        <button className="btn btn-sm btn-danger" onClick={handleRemove}>
          <FaTrash /> Xóa
        </button>
        {ocrError && <div className="text-danger small w-100">{ocrError}</div>}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex gap-2 mt-2">
        <button 
          className="flex-grow-1 btn btn-light d-flex align-items-center justify-content-center gap-2 border"
          style={{ borderColor: `${serviceColor}55`, color: serviceColor }}
          onClick={() => setShowCamera(true)}
        >
          <FaCamera /> Chụp ảnh
        </button>
        <label className="flex-grow-1 btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
          <FaImage /> Thư viện
          <input type="file" accept="image/*" className="d-none" ref={fileInputRef} onChange={handleFileSelect} />
        </label>
      </div>

      {showCamera && (
        <SimpleCamera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          serviceColor={serviceColor}
        />
      )}
    </>
  );
};

export default ImageCapture;