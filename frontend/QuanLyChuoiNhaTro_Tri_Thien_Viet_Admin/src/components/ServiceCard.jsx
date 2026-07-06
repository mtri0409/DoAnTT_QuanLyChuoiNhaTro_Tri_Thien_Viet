// components/ServiceCard.js (cập nhật đầy đủ)
import React, { useState } from 'react';
import { FaCheck, FaInfoCircle, FaExpand } from 'react-icons/fa';
import ImageCapture from './WaterImageCapture';

const ServiceCard = ({ 
  service, 
  readingData, 
  roomId, 
  onUpdate, 
  onSave, 
  onOCRComplete,
  onLightbox 
}) => {
  const [localValue, setLocalValue] = useState(readingData?.newValue || '');
  const isSaved = readingData?.status === 'saved';
  const isLoading = readingData?.status === 'loading';
  const hasError = readingData?.status === 'error';
  
  const oldValue = readingData?.oldValue || 0;
  const usage = localValue && !isNaN(Number(localValue)) 
    ? Math.max(0, Number(localValue) - oldValue) 
    : null;

  const handleValueChange = (value) => {
    setLocalValue(value);
    onUpdate(roomId, service.id, 'newValue', value);
  };

  const handleOCRValue = (ocrValue) => {
    setLocalValue(String(ocrValue));
    onUpdate(roomId, service.id, 'newValue', String(ocrValue));
    if (onOCRComplete) {
      onOCRComplete(roomId, service.id, ocrValue);
    }
  };

  const handleSave = () => {
    if (localValue && !isNaN(Number(localValue))) {
      onSave(roomId, service.id, Number(localValue));
    }
  };

  return (
    <Card className="h-100" style={{ borderColor: isSaved ? `${service.color}60` : `${service.color}30` }}>
      <Card.Body style={{ background: service.bg }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: service.color, fontSize: 20 }}>{service.icon}</span>
            <h6 className="mb-0 fw-bold">{service.label}</h6>
          </div>
          {isSaved && (
            <Badge bg="success" className="d-flex align-items-center gap-1">
              <FaCheck size={10} /> Đã lưu
            </Badge>
          )}
        </div>

        <div className="d-flex justify-content-between mb-3">
          <div>
            <div className="small text-secondary text-uppercase fw-semibold">Kỳ trước</div>
            <div className="fs-3 fw-bold text-secondary">{oldValue} <span className="small">{service.unit}</span></div>
          </div>
          {usage !== null && usage > 0 && (
            <div className="text-end">
              <div className="small text-secondary text-uppercase fw-semibold">Tiêu thụ</div>
              <div className="fs-3 fw-bold" style={{ color: service.color }}>+{usage} <span className="small">{service.unit}</span></div>
            </div>
          )}
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold">Chỉ số mới ({service.unit})</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="number"
              min={oldValue}
              value={localValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Nhập chỉ số..."
              disabled={isSaved}
              isInvalid={hasError}
              className="fw-bold"
            />
            <Button
              onClick={handleSave}
              disabled={!localValue || isSaved || isLoading}
              style={{ background: isSaved ? '#10b981' : service.color, borderColor: isSaved ? '#10b981' : service.color }}
              className="fw-semibold"
            >
              {isLoading ? <span>...</span> : isSaved ? <FaCheck /> : 'Lưu'}
            </Button>
          </div>
          {hasError && (
            <Alert variant="danger" className="mt-2 py-1 small mb-0">
              <FaInfoCircle className="me-1" /> {readingData?.errMsg}
            </Alert>
          )}
        </Form.Group>

        {!isSaved && (
          <ImageCapture
            serviceColor={service.color}
            serviceId={service.id}
            imagePreview={readingData?.imagePreview}
            imageName={readingData?.image?.name}
            imageSize={readingData?.image?.size}
            onFile={({ file, preview }) => onUpdate(roomId, service.id, 'image', file, preview)}
            onRemove={() => onUpdate(roomId, service.id, 'image', null, null)}
            onOCRComplete={handleOCRValue}
            isSaved={isSaved}
          />
        )}

        {isSaved && readingData?.imagePreview && (
          <div 
            onClick={() => onLightbox && onLightbox(readingData.imagePreview)}
            className="d-flex align-items-center gap-2 mt-2 p-2 rounded cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.6)', cursor: 'zoom-in' }}
          >
            <img src={readingData.imagePreview} alt="meter" style={{ width: 40, height: 32, objectFit: 'cover' }} className="rounded" />
            <span className="small text-secondary">Xem ảnh đồng hồ</span>
            <FaExpand className="ms-auto text-secondary" />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ServiceCard;