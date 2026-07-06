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

  // [FIX] Lọc hợp đồng theo status + branchId phía backend (thay thế lọc client-side)
  filterContracts: (
    status = null,
    branchId = null,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/admin/contracts/filter", {
      params: {
        ...(status ? { status } : {}),
        ...(branchId ? { branchId } : {}),
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
    return axiosClient.get(`/user/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/user/contracts/room/${roomId}`);
  },

  // Tạo hợp đồng mới
  createContract: (dto) => {
    return axiosClient.post("/admin/contracts", dto);
  },

  // Cập nhật hợp đồng
  updateContract: (id, dto) => {
    return axiosClient.put(`/user/contracts/${id}`, dto);
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
    return axiosClient.post("/admin/contracts/status-updates");
  },

  // --- THÀNH VIÊN ---
  addMember: (contractId, profileId) => {
    return axiosClient.post(
      `/user/contracts/${contractId}/members/${profileId}`,
    );
  },

  removeMember: (contractId, profileId) => {
    return axiosClient.delete(
      `/user/contracts/${contractId}/members/${profileId}`,
    );
  },

  getMembers: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/members`);
  },

  // --- DỊCH VỤ ---
  getServices: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/services`);
  },

  addServices: (contractId, services) => {
    return axiosClient.post(
      `/user/contracts/${contractId}/services`,
      services,
    );
  },

  updateService: (id, dto) => {
    return axiosClient.put(`/user/contracts/services/${id}`, dto);
  },

  deleteService: (id) => {
    return axiosClient.delete(`/user/contracts/services/${id}`);
  },

  terminateContract: (id, reason = null) => {
    return axiosClient.post(`/admin/contracts/${id}/termination`, { reason });
  },
};

export default apiContract;
