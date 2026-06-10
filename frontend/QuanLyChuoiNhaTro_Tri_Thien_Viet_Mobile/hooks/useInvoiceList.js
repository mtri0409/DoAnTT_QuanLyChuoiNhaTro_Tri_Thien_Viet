// hooks/useInvoiceList.js
import { useCallback, useState, useEffect } from "react";
import apiUserInvoice from "../services/apiUserInvoice";

const useInvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState("NEED_PAY");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [urgentCount, setUrgentCount] = useState(0);

  const fetchInvoices = useCallback(async () => {
    console.log("📋 Fetching invoices...");
    setLoading(true);
    try {
      if (activeTab === "NEED_PAY") {
        const [pendingRes, partialRes] = await Promise.all([
          apiUserInvoice.getMyInvoices(
            { status: "PENDING", year: yearFilter || undefined },
            pageNumber,
            50,
          ),
          apiUserInvoice.getMyInvoices(
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
      } else if (activeTab === "ALL") {
        const statuses = [
          "PENDING",
          "PARTIAL",
          "PAID",
          "CANCELLED",
          "REFUNDED",
        ];
        const results = await Promise.all(
          statuses.map((s) =>
            apiUserInvoice.getMyInvoices(
              { status: s, year: yearFilter || undefined },
              pageNumber,
              50,
            ),
          ),
        );
        const combined = results
          .flatMap((res) => {
            const data = res?.data ?? res;
            return data?.content || [];
          })
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          );
        setInvoices(combined);
        setTotalPages(1);
        setTotalElements(combined.length);
      } else {
        const res = await apiUserInvoice.getMyInvoices(
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

  const fetchUrgentCount = useCallback(async () => {
    try {
      const [pendingRes, partialRes] = await Promise.all([
        apiUserInvoice.getMyInvoices(
          { status: "PENDING", year: yearFilter },
          1,
          1,
        ),
        apiUserInvoice.getMyInvoices(
          { status: "PARTIAL", year: yearFilter },
          1,
          1,
        ),
      ]);
      const pendingData = pendingRes?.data ?? pendingRes;
      const partialData = partialRes?.data ?? partialRes;
      setUrgentCount(
        (pendingData?.totalElements || 0) + (partialData?.totalElements || 0),
      );
    } catch (e) {
      console.error("Lỗi fetch urgent count:", e);
    }
  }, [yearFilter]);

  const changePage = useCallback((newPage) => setPageNumber(newPage), []);

  const changeTab = useCallback((tab) => {
    setActiveTab(tab);
    setPageNumber(1);
  }, []);

  const changeYear = useCallback((year) => {
    setYearFilter(year);
    setPageNumber(1);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchUrgentCount();
  }, [fetchUrgentCount]);

  return {
    invoices,
    loading,
    pageNumber,
    totalPages,
    totalElements,
    activeTab,
    yearFilter,
    urgentCount,
    fetchInvoices,
    fetchUrgentCount,
    changePage,
    changeTab,
    changeYear,
  };
};

export default useInvoiceList;
