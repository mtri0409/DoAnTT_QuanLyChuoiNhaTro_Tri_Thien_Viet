// hooks/useInvoiceDetail.js
import { useState, useEffect, useCallback } from 'react';
import apiUserInvoice from '../src/api/apiInvoice';

const useInvoiceDetail = (invoiceId) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiUserInvoice.getById(invoiceId);
            console.error("Lỗi tải hóa đơn:", response);
      setInvoice(response);
    } catch (err) {
      console.error("Lỗi tải hóa đơn:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  };
};

export default useInvoiceDetail;