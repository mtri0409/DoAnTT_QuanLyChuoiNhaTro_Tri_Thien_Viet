import axiosInstance from "./axios";

const apiFloor = {
    // ✅ GET ALL FLOORS
    getAllFloors: () => {
        const url = `/public/floors`;
        return axiosInstance.get(url);
    },

    // ✅ GET FLOOR BY ID
    getFloorById: (floorId) => {
        const url = `/public/floors/${floorId}`;
        return axiosInstance.get(url);
    },

    // ✅ CREATE FLOOR
    createFloor: (floorDTO) => {
        const url = `/admin/floors`;
        return axiosInstance.post(url, floorDTO);
    },

    // ✅ UPDATE FLOOR
    updateFloor: (floorId, floorDTO) => {
        const url = `/public/floors/${floorId}`;
        return axiosInstance.put(url, floorDTO);
    },

    // ✅ DELETE FLOOR
    deleteFloor: (floorId) => {
        const url = `/admin/floors/${floorId}`;
        return axiosInstance.delete(url);
    }
};

export default apiFloor;