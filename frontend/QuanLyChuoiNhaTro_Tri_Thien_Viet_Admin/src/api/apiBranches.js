import axiosInstance from "./axios";

const apiBranches = {
    getAllBranches: (pageNumber = 1, pageSize = 5, sortBy = 'branchId', sortOrder = 'asc', search = '') => {
        const url = `/admin/branches`;
        return axiosInstance.get(url, {
            params: {
                pageNumber: pageNumber,  // 1, 2, 3... (user-friendly)
                pageSize: pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder,
                search: search
            }
        });
    },

    getBranchById: (id) => {
        const url = `/admin/branches/${id}`;
        return axiosInstance.get(url);
    },

    createBranch: (branchDTO) => {
        const url = `/admin/branches`;
        return axiosInstance.post(url, branchDTO);
    },

    updateBranch: (id, branchDTO) => {
        const url = `/admin/branches/${id}`;
        return axiosInstance.put(url, branchDTO);
    },

    deleteBranch: (id) => {
        const url = `/admin/branches/${id}`;
        return axiosInstance.delete(url);
    }
};

export default apiBranches;