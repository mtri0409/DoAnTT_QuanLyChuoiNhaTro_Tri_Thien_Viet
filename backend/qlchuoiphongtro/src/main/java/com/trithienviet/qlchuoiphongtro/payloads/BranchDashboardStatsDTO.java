package com.trithienviet.qlchuoiphongtro.payloads;



public record BranchDashboardStatsDTO(
    Long totalFloors,
    Long totalRooms,
    Long availableRooms,
    Long occupiedRooms,
    Long maintenanceRooms,
    Long totalProfiles
) {}