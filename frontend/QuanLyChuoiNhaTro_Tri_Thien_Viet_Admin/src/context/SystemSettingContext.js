import { createContext, useContext } from "react";

export const SystemSettingContext = createContext(null);

export const useSystemSetting = () => {
  const ctx = useContext(SystemSettingContext);
  if (!ctx) throw new Error("useSystem phải dùng bên trong <SystemSettingProdiver>");
  return ctx;
};