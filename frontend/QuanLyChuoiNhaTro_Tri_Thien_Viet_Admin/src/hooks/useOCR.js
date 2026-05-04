import { useState } from 'react';
import apiMeterReading from '../api/apiMeterReading';


const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const readMeterFromImage = async (imageFile, serviceId) => {
    if (!imageFile) {
      setError('Không có ảnh để xử lý');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('serviceId', serviceId);

      // Gọi API OCR - thay endpoint thực tế sau
      const response = await apiMeterReading.ocrWater(formData);
      
      if (response.success && response.meterValue) {
        return {
          value: response.meterValue,
          confidence: response.confidence,
          rawText: response.rawText,
        };
      }
      
      throw new Error(response.message || 'Không đọc được chỉ số');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi OCR';
      setError(errorMsg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { readMeterFromImage, isProcessing, error, setError };
};

export default useOCR;