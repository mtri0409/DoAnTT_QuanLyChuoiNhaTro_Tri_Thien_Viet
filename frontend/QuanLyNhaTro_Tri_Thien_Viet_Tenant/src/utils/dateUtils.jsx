export const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  
  // Dùng mảng và join để code nhìn sạch hơn padStart thủ công
  const date = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${date}/${month}/${year}`;
};