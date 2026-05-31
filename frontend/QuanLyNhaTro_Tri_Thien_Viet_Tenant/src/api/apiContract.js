import axiosClient from "./axios";

const apiContract = {


  // Lấy hợp đồng theo ID
  getContractById: (id) => {
    return axiosClient.get(`/user/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/user/contracts/room/${roomId}`);
  },
 
  getMembers: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/members`);
  },

  // --- DỊCH VỤ ---
  getServices: (contractId) => {
    return axiosClient.get(`/user/contracts/${contractId}/services`);
  },

};

export default apiContract;
