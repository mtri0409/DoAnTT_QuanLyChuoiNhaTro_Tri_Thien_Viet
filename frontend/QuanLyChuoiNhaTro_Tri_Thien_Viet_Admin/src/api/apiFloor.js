import axiosInstance from "./axios";

const apiFloor = {
    getAllFloors: () => {
        const url = `/floors`;
        return axiosInstance.get(url);
    },

    getFloorById: (floorId) => {
        const url = `/public/floors/${floorId}`;
        return axiosInstance.get(url);
    },

    createFloor: (floorDTO) => {
        const url = `/admin/floors`;
        return axiosInstance.post(url, floorDTO);
    },

    updateFloor: (floorId, floorDTO) => {
        const url = `/public/floors/${floorId}`;
        return axiosInstance.put(url, floorDTO);
    },

    deleteFloor: (floorId) => {
        const url = `/admin/floors/${floorId}`;
        return axiosInstance.delete(url);
    }
};

export default apiFloor;