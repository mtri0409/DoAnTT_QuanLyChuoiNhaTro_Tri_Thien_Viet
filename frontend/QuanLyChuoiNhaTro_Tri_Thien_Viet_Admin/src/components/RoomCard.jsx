// components/RoomCard.js
import React from 'react';
import { FaDoorOpen, FaChevronRight, FaFileInvoiceDollar, FaArrowRight } from 'react-icons/fa';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import ServiceCard from './ServiceCard';

const STATUS_CONFIG = {
  done: { color: '#10b981', label: '✓ Đã xong' },
  partial: { color: '#f59e0b', label: '~ Ghi dở' },
  pending: { color: '#94a3b8', label: 'Chưa ghi' }
};

const RoomCard = ({ 
  room, 
  expanded, 
  onToggle, 
  readings, 
  contract, 
  services,
  month,
  year,
  onUpdateReading,
  onSaveReading,
  onOCRValue,
  onLightbox,
  onCreateInvoice 
}) => {
  const roomReadings = readings[room.roomId];
  const roomStatus = !roomReadings ? 'pending' : (() => {
    const statuses = services.map(s => roomReadings[s.id]?.status);
    if (statuses.every(s => s === 'saved')) return 'done';
    if (statuses.some(s => s === 'saved')) return 'partial';
    return 'pending';
  })();
  const statusConfig = STATUS_CONFIG[roomStatus];

  return (
    <Card className="mb-2 overflow-hidden" style={{ borderColor: expanded ? '#6366f1' : '#e2e8f0' }}>
      <div 
        onClick={() => onToggle(room.roomId)}
        className="d-flex align-items-center p-3 cursor-pointer"
        style={{ cursor: 'pointer' }}
      >
        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, background: expanded ? '#ede9fe' : '#f1f5f9', color: expanded ? '#6366f1' : '#64748b' }}>
          <FaDoorOpen />
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold">{room.roomName}</div>
          <div className="small text-secondary">
            {room.floorName} · {room.branchName}
            {contract && <Badge bg="primary" className="ms-2">HĐ #{contract.contractId}</Badge>}
          </div>
        </div>
        <Badge style={{ background: `${statusConfig.color}18`, color: statusConfig.color }} className="me-2">
          {statusConfig.label}
        </Badge>
        <FaChevronRight style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>

      {expanded && (
        <Card.Body className="pt-0">
          {!roomReadings ? (
            <div className="text-center py-4 text-secondary">
              <Spinner animation="border" size="sm" /> Đang tải chỉ số...
            </div>
          ) : (
            <>
              <div className="row g-3 mt-2">
                {services.map(service => (
                  <div key={service.id} className="col-12 col-md-6">
                    <ServiceCard
                      service={service}
                      readingData={roomReadings[service.id]}
                      roomId={room.roomId}
                      onUpdate={onUpdateReading}
                      onSave={onSaveReading}
                      onOCRValue={onOCRValue}
                      onLightbox={onLightbox}
                    />
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-2 flex-wrap gap-2">
                <div className="small text-secondary">
                  {contract ? (
                    <>Hợp đồng <strong className="text-primary">#{contract.contractId}</strong> · {contract.status}</>
                  ) : (
                    <span className="text-warning">⚠ Không tìm thấy hợp đồng active</span>
                  )}
                </div>
                <Button
                  onClick={() => onCreateInvoice(contract?.contractId || '')}
                  variant={roomStatus === 'done' ? 'primary' : 'secondary'}
                  className="d-flex align-items-center gap-2"
                >
                  <FaFileInvoiceDollar />
                  {roomStatus === 'done' ? `Tạo hóa đơn T${month}/${year}` : 'Tạo hóa đơn (chưa ghi đủ)'}
                  <FaArrowRight />
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default RoomCard;