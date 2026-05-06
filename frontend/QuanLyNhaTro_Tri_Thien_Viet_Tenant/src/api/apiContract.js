import axiosClient from "./axios";

const apiContract = {


  // Lấy hợp đồng theo ID
  getContractById: (id) => {
    return axiosClient.get(`/public/contracts/${id}`);
  },

  // Lấy hợp đồng theo phòng
  getContractsByRoom: (roomId) => {
    return axiosClient.get(`/public/contracts/room/${roomId}`);
  },
 
  getMembers: (contractId) => {
    return axiosClient.get(`/public/contracts/${contractId}/members`);
  },

  // --- DỊCH VỤ ---
  getServices: (contractId) => {
    return axiosClient.get(`/public/contracts/${contractId}/services`);
  },

};

export default apiContract;
