// api/apiParkingLog.js
import axiosInstance from "./axios";

const apiParkingLog = {
  // ==================== GET ALL WITH FILTERS ====================
  getAllParkingLogs: (
    pageNumber = 0, 
    pageSize = 10, 
    sortBy = "detectedAt", 
    sortOrder = "desc",
    licensePlate = null,
    direction = null,
    isVerified = null,
    fromDate = null,
    toDate = null
  ) => {
    const url = `/parking-logs`;
    const params = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy,
      sortOrder: sortOrder
    };
    
    if (licensePlate) params.licensePlate = licensePlate;
    if (direction) params.direction = direction;
    if (isVerified !== null && isVerified !== undefined) params.isVerified = isVerified;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    return axiosInstance.get(url, { params });
  },

  // ==================== GET BY ID ====================
  getParkingLogById: (logId) => {
    const url = `/parking-logs/${logId}`;
    return axiosInstance.get(url);
  },

  // ==================== GET BY LICENSE PLATE ====================
  getLogsByLicensePlate: (
    licensePlate,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "detectedAt",
    sortOrder = "desc"
  ) => {
    const url = `/parking-logs/plate/${licensePlate}`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });
  },

  // ==================== GET BY VEHICLE ID ====================
  getLogsByVehicleId: (
    vehicleId,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "detectedAt",
    sortOrder = "desc"
  ) => {
    const url = `/parking-logs/vehicle/${vehicleId}`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });
  },

  // ==================== CREATE ====================
  createParkingLog: (data) => {
    const url = `/parking-logs`;
    return axiosInstance.post(url, data);
  },

  // ==================== CREATE FROM DETECTION ====================
  createFromDetection: (
    licensePlate,
    direction,
    confidence = null,
    imagePath = null,
    vehicleId = null
  ) => {
    const url = `/parking-logs/detect`;
    const params = {
      licensePlate: licensePlate,
      direction: direction
    };
    if (confidence) params.confidence = confidence;
    if (imagePath) params.imagePath = imagePath;
    if (vehicleId) params.vehicleId = vehicleId;
    
    return axiosInstance.post(url, null, { params });
  },

  // ==================== UPDATE ====================
  updateParkingLog: (logId, data) => {
    const url = `/api/parking-logs/${logId}`;
    return axiosInstance.put(url, data);
  },

  // ==================== VERIFY LOG ====================
  verifyLog: (logId, vehicleId) => {
    const url = `/parking-logs/${logId}/verify`;
    return axiosInstance.put(url, null, {
      params: { vehicleId: vehicleId }
    });
  },

  // ==================== MARK AS NOTIFIED ====================
  markAsNotified: (logId) => {
    const url = `/parking-logs/${logId}/notify`;
    return axiosInstance.put(url);
  },

  // ==================== UPDATE IMAGE ====================
  updateImagePath: (logId, imagePath) => {
    const url = `/parking-logs/${logId}/image`;
    return axiosInstance.put(url, null, {
      params: { imagePath: imagePath }
    });
  },

  // ==================== DELETE ====================
  deleteParkingLog: (logId) => {
    const url = `/parking-logs/${logId}`;
    return axiosInstance.delete(url);
  },

  // ==================== DELETE OLD LOGS ====================
  deleteLogsOlderThan: (date) => {
    const url = `/api/parking-logs/old`;
    return axiosInstance.delete(url, {
      params: { date: date }
    });
  },

  // ==================== DELETE BY LICENSE PLATE ====================
  deleteLogsByLicensePlate: (licensePlate) => {
    const url = `/api/parking-logs/plate/${licensePlate}`;
    return axiosInstance.delete(url);
  },

  // ==================== STATS ====================
  getTodayStats: () => {
    const url = `/parking-logs/stats/today`;
    return axiosInstance.get(url);
  },

  getStatsByDate: (date) => {
    const url = `/parking-logs/stats`;
    return axiosInstance.get(url, {
      params: { date: date }
    });
  },

  getCurrentVehiclesInside: () => {
    const url = `/parking-logs/current-inside`;
    return axiosInstance.get(url);
  },

  getUnverifiedCount: () => {
    const url = `/parking-logs/unverified/count`;
    return axiosInstance.get(url);
  }
};

export default apiParkingLog;