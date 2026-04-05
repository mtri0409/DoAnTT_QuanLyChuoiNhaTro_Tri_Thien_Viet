import axiosInstance from "./axios";

const apiAmenity = {
    getAllAmenities: (pageNumber = 0, pageSize = 10, sortBy = 'amenityName', sortOrder = 'asc') => {
        const url = `/amenities`;
        return axiosInstance.get(url, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder
            }
        });
    },

    getAmenityById: (amenityId) => {
        const url = `/public/amenities/${amenityId}`;
        return axiosInstance.get(url);
    },

    createAmenity: (amenityDTO) => {
        const url = `/admin/amenities`;
        return axiosInstance.post(url, amenityDTO);
    },

    updateAmenity: (amenityId, amenityDTO) => {
        const url = `/admin/amenities/${amenityId}`;
        return axiosInstance.put(url, amenityDTO);
    },

    deleteAmenity: (amenityId) => {
        const url = `/admin/amenities/${amenityId}`;
        return axiosInstance.delete(url);
    }
};

export default apiAmenity;