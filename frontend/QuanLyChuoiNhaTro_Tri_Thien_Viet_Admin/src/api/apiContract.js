import axiosClient from "./axios";

const apiContract = {
  // Lấy tất cả hợp đồng (có phân trang + sort)
  getAllContracts: (
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/admin/contracts", {
      params: {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    });
  },

  // Tìm kiếm hợp đồng (có phân trang + sort)
  searchContracts: (
    keyword,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/admin/contracts/search", {
      params: {
        keyword: keyword?.trim(),
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    });
  },

  // Lấy hợp đồng theo trạng thái (có phân trang + sort)
  getContractsByStatus: (
    status,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get(`/admin/contracts/status/${status}`, {
      params: {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      },
    });
  },

  // Lấy hợp đồng theo ID
  getContractById: (id) => {
    return axiosClient.get(`/public/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/public/contracts/room/${roomId}`);
  },

  // Tạo hợp đồng mới
  createContract: (dto) => {
    return axiosClient.post("/admin/contracts", dto);
  },

  // Cập nhật hợp đồng
  updateContract: (id, dto) => {
    return axiosClient.put(`/public/contracts/${id}`, dto);
  },

  // Cập nhật trạng thái hợp đồng
  updateStatus: (id, newStatus) => {
    return axiosClient.put(`/admin/contracts/${id}/status`, newStatus);
  },

  // Xóa hợp đồng
  deleteContract: (id) => {
    return axiosClient.delete(`/admin/contracts/${id}`);
  },

  // Tự động cập nhật trạng thái hợp đồng
  autoUpdateStatus: () => {
    return axiosClient.post("/admin/contracts/auto-update-status");
  },

  // --- THÀNH VIÊN ---
  addMember: (contractId, profileId) => {
    return axiosClient.post(
      `/public/contracts/${contractId}/members/${profileId}`,
    );
  },

  removeMember: (contractId, profileId) => {
    return axiosClient.delete(
      `/public/contracts/${contractId}/members/${profileId}`,
    );
  },

  getMembers: (contractId) => {
    return axiosClient.get(`/public/contracts/${contractId}/members`);
  },

  // --- DỊCH VỤ ---
  getServices: (contractId) => {
    return axiosClient.get(`/public/contracts/${contractId}/services`);
  },

  addServices: (contractId, services) => {
    return axiosClient.post(
      `/public/contracts/${contractId}/services`,
      services,
    );
  },

  updateService: (id, dto) => {
    return axiosClient.put(`/public/contracts/services/${id}`, dto);
  },

  deleteService: (id) => {
    return axiosClient.delete(`/public/contracts/services/${id}`);
  },
};

export default apiContract;
