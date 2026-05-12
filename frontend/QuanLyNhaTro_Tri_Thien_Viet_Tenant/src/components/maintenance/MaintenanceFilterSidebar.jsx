// components/maintenance/MaintenanceFilterSidebar.jsx
import React from "react";
import SearchBox from "../common/SearchBox";
import FilterTab from "../common/FilterTab";
import StatsCard from "../common/StatsCard";
import { FILTER_OPTIONS } from "../../utils/maintenanceUtils";

const MaintenanceFilterSidebar = ({
  searchText,
  onSearchChange,
  filterStatus,
  onFilterChange,
  getCountByStatus,
  requestsLength,
  pendingCount,
  processingCount,
}) => {
  // Chuẩn bị options cho FilterTab
  const filterOptions = FILTER_OPTIONS.map(({ key, label, dot }) => ({
    key,
    label,
    dot,
    count: getCountByStatus(key),
  }));

  // Chuẩn bị stats cho StatsCard
  const stats = [
    {
      label: "Tổng yêu cầu",
      value: requestsLength,
      bg: "bg-light",
      color: "text-primary",
    },
    {
      label: "Chờ xử lý",
      value: pendingCount,
      bg: "bg-warning bg-opacity-10",
      color: "text-warning",
    },
    {
      label: "Đang xử lý",
      value: processingCount,
      bg: "bg-primary bg-opacity-10",
      color: "text-primary",
    },
    {
      label: "Hoàn thành",
      value: getCountByStatus("COMPLETED"),
      bg: "bg-success bg-opacity-10",
      color: "text-success",
    },
  ];

  return (
    <>
      <SearchBox
        value={searchText}
        onChange={onSearchChange}
        placeholder="Tìm yêu cầu..."
        className="mb-3"
      />

      <FilterTab
        options={filterOptions}
        activeKey={filterStatus}
        onChange={onFilterChange}
        title="Trạng thái"
        showIcon={true}
        className="mb-3"
      />

      <StatsCard stats={stats} title="Tổng quan" />
    </>
  );
};

export default MaintenanceFilterSidebar;