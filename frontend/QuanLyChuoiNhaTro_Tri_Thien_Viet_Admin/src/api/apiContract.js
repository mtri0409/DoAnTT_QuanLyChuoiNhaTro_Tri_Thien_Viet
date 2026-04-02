import axiosClient from "./axios";

const apiContract = {
  // Lấy tất cả hợp đồng (có phân trang + sort)
  getAllContracts: (
    pageNumber,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/contracts", {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    });
  },

  // Tìm kiếm hợp đồng (có phân trang + sort)
  searchContracts: (
    keyword,
    pageNumber,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/contracts/search", {
      params: { keyword, pageNumber, pageSize, sortBy, sortOrder },
    });
  },

  // Lấy hợp đồng theo trạng thái (có phân trang + sort)
  getContractsByStatus: (
    status,
    pageNumber,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get(`/contracts/status/${status}`, {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    });
  },

  // Lấy hợp đồng theo ID
  getContractById: (id) => {
    return axiosClient.get(`/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/contracts/room/${roomId}`);
  },

  // Tạo hợp đồng mới
  createContract: (dto) => {
    return axiosClient.post("/contracts", dto);
  },

  // Cập nhật hợp đồng
  updateContract: (id, dto) => {
    return axiosClient.put(`/contracts/${id}`, dto);
  },

  // Cập nhật trạng thái hợp đồng
  updateStatus: (id, newStatus) => {
    return axiosClient.put(`/contracts/${id}/status`, newStatus);
  },

  // Xóa hợp đồng
  deleteContract: (id) => {
    return axiosClient.delete(`/contracts/${id}`);
  },

  // Tự động cập nhật trạng thái hợp đồng
  autoUpdateStatus: () => {
    return axiosClient.post("/contracts/auto-update-status");
  },

  // --- THÀNH VIÊN ---
  addMember: (contractId, profileId) => {
    return axiosClient.post(`/contracts/${contractId}/members/${profileId}`);
  },

  removeMember: (contractId, profileId) => {
    return axiosClient.delete(`/contracts/${contractId}/members/${profileId}`);
  },

  getMembers: (contractId) => {
    return axiosClient.get(`/contracts/${contractId}/members`);
  },

  // --- DỊCH VỤ ---
  getServices: (contractId) => {
    return axiosClient.get(`/contracts/${contractId}/services`);
  },

  addServices: (contractId, services) => {
    return axiosClient.post(`/contracts/${contractId}/services`, services);
  },

  updateService: (id, dto) => {
    return axiosClient.put(`/contracts/services/${id}`, dto);
  },

  deleteService: (id) => {
    return axiosClient.delete(`/contracts/services/${id}`);
  },
};

export default apiContract;
