export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "—"; // Dùng gạch ngang nhìn đẹp hơn N/A
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    // Nếu bạn không muốn hiện số lẻ (ví dụ 1.000.000,00) thì thêm dòng dưới:
    minimumFractionDigits: 0, 
  }).format(amount);
};