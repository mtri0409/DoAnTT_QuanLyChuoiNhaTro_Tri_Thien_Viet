import axiosInstance from "./axios";

const apiDashboard ={
    getStash:()=> axiosInstance.get(`/admin/dashboard/stats`),
    getStashByBranch:(branchId) => axiosInstance.get(`/admin/dashboard/branch-stats/${branchId}`),
  // Cấu trúc mới sử dụng params để gửi các RequestParam
    getFinancialAnalytics: (branchId, month, year) => {
        return axiosInstance.get(`/admin/dashboard/financial-stats`, {
            params: {
                branchId: branchId || null, 
                month: month || null,
                year: year || null
            }
        });
    },
    getUtilityAnalytics: (branchId, month, year) => {
        return axiosInstance.get(`/admin/dashboard/utility-stats`, {
            params: {
                branchId: branchId || null, 
                month: month || null,
                year: year || null
            }
        });
    },
      getReminders: (branchId) => {
        return axiosInstance.get(`/admin/dashboard/reminders/${branchId}`);
    },
    
}
export default apiDashboard;