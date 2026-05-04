// components/CreateInvoiceModal.js
import React, { useState } from 'react';
import { FaFileInvoiceDollar, FaCheck, FaInfoCircle } from 'react-icons/fa';
import apiInvoice from '../api/apiInvoice';

const CreateInvoiceModal = ({ onClose, onCreated, defaultContractId = "", defaultMonth, defaultYear }) => {
  const [contractId, setContractId] = useState(String(defaultContractId));
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!contractId) {
      setError("Vui lòng nhập ID hợp đồng");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiInvoice.createManual(Number(contractId), month, year);
      alert(`✅ Tạo hóa đơn thành công! ID: #${res.invoiceId}`);
      onCreated(res);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo hóa đơn. Kiểm tra lại contractId và kỳ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 1000 }}>
      <div className="bg-white rounded-4 p-4" style={{ width: '90%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
          <div className="bg-primary-subtle p-2 rounded-3 text-primary">
            <FaFileInvoiceDollar size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Tạo hóa đơn thủ công</h5>
            <p className="text-muted small mb-0">Hệ thống sẽ tạo hóa đơn DRAFT dựa trên chỉ số đã ghi</p>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold text-muted">ID Hợp đồng <span className="text-danger">*</span></label>
          <input 
            type="number" 
            className={`form-control bg-light border-0 py-2 ${error ? 'is-invalid' : ''}`}
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Nhập contract ID..."
          />
          {error && (
            <div className="text-danger small mt-1 d-flex align-items-center gap-1">
              <FaInfoCircle size={12} /> {error}
            </div>
          )}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">Tháng</label>
            <select 
              className="form-select bg-light border-0 py-2"
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">Năm</label>
            <select 
              className="form-select bg-light border-0 py-2"
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex gap-2 pt-2 border-top">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-light flex-grow-1 border-0 fw-bold py-2"
          >
            Hủy bỏ
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
            className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm"
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm"></span> Đang tạo...</>
            ) : (
              <><FaCheck size={14} /> Tạo hóa đơn</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;