import axiosInstance from "./axios";

const apiAIConfig = {
    /**
     * Lấy cấu hình AI duy nhất
     * @returns {Promise}
     */
    getAiConfig: () => {
        const url = `/ai-config`;
        return axiosInstance.get(url);
    },

    /**
     * Cập nhật cấu hình AI
     * @param {Object} data - Dữ liệu cấu hình (apiKey, baseUrl, model, description)
     * @returns {Promise}
     */
    updateAiConfig: (data) => {
        const url = `/ai-config`;
        return axiosInstance.put(url, data);
    }
};

export default apiAIConfig;