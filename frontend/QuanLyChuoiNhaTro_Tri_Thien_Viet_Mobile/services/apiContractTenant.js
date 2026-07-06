import axiosClient from "./axios";

/**
 * API hợp đồng dành riêng cho tenant (người thuê).
 * Dùng trong các màn hình: ContractDetailScreen, v.v.
 * KHÔNG dùng cho admin.
 */
const apiContractTenant = {
  // Lấy hợp đồng theo ID
  getContractById: (id) => {
    return axiosClient.get(`/user/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/user/contracts/room/${roomId}`);
  },

  // Lấy danh sách thành viên hợp đồng
  getMembers: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/members`);
  },

  // Lấy danh sách dịch vụ hợp đồng
  getServices: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/services`);
  },
  // Trong apiContractTenant.js thêm:
  getMembersWithProfile: async (contractId) => {
    const res = await axiosClient.get(`/user/contracts/${contractId}/members`);
    const ids = res?.data?.data ?? res?.data ?? res;

    // Fetch profile từng ID song song
    const profiles = await Promise.all(
      ids.map((id) =>
        axiosClient
          .get(`/public/profiles/${id}`)
          .then((r) => r?.data?.data ?? r?.data ?? r),
      ),
    );
    return profiles;
  },
  getMyContracts: () => axiosClient.get("/user/contracts"),
};

export default apiContractTenant;
