// hooks/useInvoiceList.js
import { useCallback, useState, useEffect } from "react";
import apiInvoice from "../src/api/apiInvoice"
const useInvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState("NEED_PAY");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [urgentCount, setUrgentCount] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "NEED_PAY") {
        const [pendingRes, partialRes] = await Promise.all([
          apiInvoice.getMyInvoices(
            { status: "PENDING", year: yearFilter || undefined },
            pageNumber,
            50,
          ),
          apiInvoice.getMyInvoices(
            { status: "PARTIAL", year: yearFilter || undefined },
            pageNumber,
            50,
          ),
        ]);
        const pendingData = pendingRes?.data ?? pendingRes;
        const partialData = partialRes?.data ?? partialRes;
        const combined = [
          ...(pendingData?.content || []),
          ...(partialData?.content || []),
        ].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
        setInvoices(combined);
        setTotalPages(1);
        setTotalElements(combined.length);
        setUrgentCount(combined.length);
      } 
      else if (activeTab === "ALL") {
        const statuses = ["PENDING", "PARTIAL", "PAID", "CANCELLED", "REFUNDED"];
        const results = await Promise.all(
          statuses.map((s) =>
            apiInvoice.getMyInvoices(
              { status: s, year: yearFilter || undefined },
              pageNumber,
              50,
            )
          )
        );
        const combined = results
          .flatMap((res) => {
            const data = res?.data ?? res;
            return data?.content || [];
          })
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setInvoices(combined);
        setTotalPages(1);
        setTotalElements(combined.length);
      } 
      else {
        const res = await apiInvoice.getMyInvoices(
          { status: activeTab, year: yearFilter || undefined },
          pageNumber,
          10,
        );
        const data = res?.data ?? res;
        setInvoices(data?.content || []);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || 0);
      }
    } catch (err) {
      console.error("Lỗi fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, yearFilter, pageNumber]);

  // Fetch urgent count (chỉ lấy số lượng, không cần page)
  const fetchUrgentCount = useCallback(async () => {
    try {
      const [pendingRes, partialRes] = await Promise.all([
        apiInvoice.getMyInvoices({ status: "PENDING", year: yearFilter }, 1, 1),
        apiInvoice.getMyInvoices({ status: "PARTIAL", year: yearFilter }, 1, 1),
      ]);
      const pendingData = pendingRes?.data ?? pendingRes;
      const partialData = partialRes?.data ?? partialRes;
      const count = (pendingData?.totalElements || 0) + (partialData?.totalElements || 0);
      setUrgentCount(count);
    } catch (e) {
      console.error("Lỗi fetch urgent count:", e);
    }
  }, [yearFilter]);

  // Change page
  const changePage = useCallback((newPage) => {
    setPageNumber(newPage);
  }, []);

  // Change tab
  const changeTab = useCallback((tab) => {
    setActiveTab(tab);
    setPageNumber(1); // Reset page khi đổi tab
  }, []);

  // Change year filter
  const changeYear = useCallback((year) => {
    setYearFilter(year);
    setPageNumber(1); // Reset page khi đổi năm
  }, []);

  // Hover handlers
  const handleMouseEnter = useCallback((id) => {
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  // Auto fetch khi dependencies thay đổi
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Auto fetch urgent count khi year thay đổi
  useEffect(() => {
    fetchUrgentCount();
  }, [fetchUrgentCount]);

  // Return tất cả state và functions
  return {
    // State
    invoices,
    loading,
    pageNumber,
    totalPages,
    totalElements,
    activeTab,
    yearFilter,
    urgentCount,
    hoveredId,
    
    // Functions
    fetchInvoices,
    fetchUrgentCount,
    changePage,
    changeTab,
    changeYear,
    handleMouseEnter,
    handleMouseLeave,
    
    // Convenience
    setActiveTab,
    setYearFilter,
    setPageNumber,
  };
};

export default useInvoiceList;