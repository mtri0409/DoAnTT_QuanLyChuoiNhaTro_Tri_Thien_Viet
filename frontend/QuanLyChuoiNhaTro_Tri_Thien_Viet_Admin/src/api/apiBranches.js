import axiosInstance from "./axios";

const apiBranches = {
    // ✅ GET ALL BRANCHES (với pagination, sorting)
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

    // ✅ GET BRANCH BY ID
    getBranchById: (id) => {
        const url = `/public/branches/${id}`;
        return axiosInstance.get(url);
    },

    // ✅ CREATE NEW BRANCH
    createBranch: (branchDTO) => {
        const url = `/admin/branches`;
        return axiosInstance.post(url, branchDTO);
    },

    // ✅ UPDATE BRANCH
    updateBranch: (id, branchDTO) => {
        const url = `/admin/branches/${id}`;
        return axiosInstance.put(url, branchDTO);
    },

    // ✅ DELETE BRANCH
    deleteBranch: (id) => {
        const url = `/admin/branches/${id}`;
        return axiosInstance.delete(url);
    }
};

export default apiBranches;