import axiosInstance from "./axios";

const apiScheduler = {
    getAll: () => {
        return axiosInstance.get(`/admin/schedulers`);
    },
    update: (id, data) => {
        return axiosInstance.put(`/admin/schedulers/${id}`, data);
    },
    trigger: (codeKey) => {
        return axiosInstance.post(`/admin/schedulers/${codeKey}/trigger`);
    },
};

export default apiScheduler;
