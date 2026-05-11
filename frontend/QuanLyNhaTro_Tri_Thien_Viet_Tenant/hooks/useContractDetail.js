// hooks/useContractDetail.js
import { useState, useEffect, useCallback } from 'react';
import apiContract from '../src/api/apiContract';
import apiProfile from '../src/api/apiProfile';


const useContractDetail = (contractId) => {
  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ĐỊNH NGHĨA fetchContractData TRƯỚC
  const fetchContractData = useCallback(async () => {
    if (!contractId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [contractRes, memberIdsRes, servicesRes] = await Promise.all([
        apiContract.getContractById(contractId),
        apiContract.getMembers(contractId),
        apiContract.getServices(contractId),
      ]);

      setContract(contractRes);
      
      const memberIds = Array.isArray(memberIdsRes) ? memberIdsRes : [];
      if (memberIds.length > 0) {
        const results = await Promise.allSettled(
          memberIds.map((pid) => apiProfile.getProfileById(pid)),
        );
        setMembers(
          results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value)
        );
      } else {
        setMembers([]);
      }

      const rawSvcs = servicesRes?.services ?? servicesRes;
      setServices(Array.isArray(rawSvcs) ? rawSvcs : []);
      
    } catch (err) {
      console.error("Lỗi tải chi tiết hợp đồng:", err);
      setError("Không thể tải thông tin hợp đồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [contractId]); // useCallback để tránh tạo function mới mỗi lần render

  // SAU ĐÓ mới gọi trong useEffect
  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  // Trả về refetch là fetchContractData
  return {
    contract,
    members,
    services,
    loading,
    error,
    refetch: fetchContractData, // BÂY GIỜ ĐÃ ĐỊNH NGHĨA
  };
};

export default useContractDetail;