import axiosClient from "./axios";

const PAGE_SIZE_ROOMS = 10;

const apiContract = {
  getAllContracts: (
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get("/admin/contracts", {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    });
  },

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

  getContractsByStatus: (
    status,
    pageNumber = 0,
    pageSize = 10,
    sortBy = "contractId",
    sortOrder = "desc",
  ) => {
    return axiosClient.get(`/admin/contracts/status/${status}`, {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    });
  },

  getContractById: (id) => {
    return axiosClient.get(`/user/contracts/${id}`); // FIX: /public/ → /user/
  },

  // ─── HỢP ĐỒNG THEO PHÒNG (dùng cho MeterReading) ─────────────────────────

  /**
   * Lấy hợp đồng theo phòng — dùng trong loadRoomData() của MeterReadingScreen.
   * Trả về array; caller tự .find(c => c.status === "ACTIVE").
   */
  getContractsByRoom: (roomId) => {
    return axiosClient
      .get(`/user/contracts/room/${roomId}`) // FIX: /public/ → /user/
      .then((res) => res.data ?? res);
  },

  // ─── PHÂN TRANG PHÒNG CHO METER READING ───────────────────────────────────

  /**
   * Load danh sách phòng có phân trang — dùng thay thế cho getAllRooms(0,100)
   * trong MeterReadingScreen để tránh load toàn bộ phòng 1 lần.
   *
   * @param {number}      pageNumber  trang hiện tại (bắt đầu từ 0)
   * @param {number|null} floorId     lọc theo tầng (null = tất cả)
   * @param {number|null} branchId    lọc theo chi nhánh
   * @param {string}      keyword     tìm tên phòng ('' = không lọc)
   * @returns Promise<{ content: Room[], totalPages: number, totalElements: number, last: boolean }>
   *
   * Response shape mong đợi từ backend (Spring Page):
   * {
   *   content: [...],
   *   totalPages: 5,
   *   totalElements: 48,
   *   last: false,   ← true khi đây là trang cuối
   *   number: 0,
   *   size: 10
   * }
   */
  getRoomsPaged: (
    pageNumber = 0,
    floorId = null,
    branchId = null,
    keyword = "",
    pageSize = PAGE_SIZE_ROOMS,
    sortBy = "roomName",
    sortOrder = "asc",
  ) => {
    return axiosClient
      .get("/admin/rooms", {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          ...(floorId ? { floorId } : {}),
          ...(branchId ? { branchId } : {}),
          ...(keyword?.trim() ? { search: keyword.trim() } : {}),
        },
      })
      .then((res) => res.data ?? res);
  },

  // ─── TẠO / CẬP NHẬT / XÓA ─────────────────────────────────────────────────

  createContract: (dto) => {
    return axiosClient.post("/admin/contracts", dto);
  },

  updateContract: (id, dto) => {
    return axiosClient.put(`/user/contracts/${id}`, dto); // FIX: /public/ → /user/
  },

  updateStatus: (id, newStatus) => {
    return axiosClient.put(`/admin/contracts/${id}/status`, newStatus);
  },

  deleteContract: (id) => {
    return axiosClient.delete(`/admin/contracts/${id}`);
  },

  autoUpdateStatus: () => {
    return axiosClient.post("/admin/contracts/status-updates"); // FIX: auto-update-status → status-updates
  },

  terminateContract: (id, reason = null) => {
    return axiosClient.post(`/admin/contracts/${id}/termination`, { reason }); // FIX: terminate → termination
  },

  // ─── THÀNH VIÊN ───────────────────────────────────────────────────────────

  addMember: (contractId, profileId) => {
    return axiosClient.post(
      `/user/contracts/${contractId}/members/${profileId}`, // FIX: /public/ → /user/
    );
  },

  removeMember: (contractId, profileId) => {
    return axiosClient.delete(
      `/user/contracts/${contractId}/members/${profileId}`, // FIX: /public/ → /user/
    );
  },

  getMembers: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/members`); // FIX: /public/ → /user/
  },

  // ─── DỊCH VỤ ──────────────────────────────────────────────────────────────

  getServices: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/services`); // FIX: /public/ → /user/
  },

  addServices: (contractId, services) => {
    return axiosClient.post(
      `/user/contracts/${contractId}/services`, // FIX: /public/ → /user/
      services,
    );
  },

  updateService: (id, dto) => {
    return axiosClient.put(`/user/contracts/services/${id}`, dto); // FIX: /public/ → /user/
  },

  deleteService: (id) => {
    return axiosClient.delete(`/user/contracts/services/${id}`); // FIX: /public/ → /user/
  },
};

export { PAGE_SIZE_ROOMS };
export default apiContract;
