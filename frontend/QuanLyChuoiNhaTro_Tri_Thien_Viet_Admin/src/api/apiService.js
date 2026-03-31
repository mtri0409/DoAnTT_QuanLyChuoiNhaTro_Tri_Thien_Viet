import axiosInstance from "./axios";

const apiServices = {
    getAllServices: (pageNumber = 1, pageSize = 5, sortBy = 'serviceId', sortOrder = 'asc', search = '') => {
        const url = `/admin/services`;
        return axiosInstance.get(url, {
            params: {
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
                search
            }
        });
    },

    getServiceById: (id) => {
        const url = `/public/services/${id}`;
        return axiosInstance.get(url);
    },

    createService: (data) => {
        const url = `/admin/services`;
        return axiosInstance.post(url, data);
    },

    updateService: (id, data) => {
        const url = `/admin/services/${id}`;
        return axiosInstance.put(url, data);
    },

    deleteService: (id) => {
        const url = `/admin/services/${id}`;
        return axiosInstance.delete(url);
    }
};

export default apiServices;