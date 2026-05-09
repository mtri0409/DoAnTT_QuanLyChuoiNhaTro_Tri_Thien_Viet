// src/context/SystemSettingProvider.jsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import apiSystemSetting from '../api/apiSetting';
import { SystemSettingContext } from './SystemSettingContext';



export const SystemSettingProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem("systemSettings");
      return savedSettings ? JSON.parse(savedSettings) : {
        name: "Hệ Thống Quản Lý Nhà Trọ",
        hotline: "",
        email: "",
        logo: "",
        favicon: "",
        facebookLink: "",
        youtubeLink: "",
        address: "",
        copyrightText: "",
        isMaintenance: false,
      };
    } catch { 
      return {
        name: "Hệ Thống Quản Lý Nhà Trọ",
        hotline: "",
        email: "",
        logo: "",
        favicon: "",
        facebookLink: "",
        youtubeLink: "",
        address: "",
        copyrightText: "",
        isMaintenance: false,
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm fetch settings từ API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiSystemSetting.getSetting();
      console.log("Fetched settings:", data);
      
      const newSettings = {
        name: data.name || settings.name,
        hotline: data.hotline || "",
        email: data.email || "",
        logo: data.logo || "",
        favicon: data.favicon || "",
        facebookLink: data.facebookLink || "",
        youtubeLink: data.youtubeLink || "",
        address: data.address || "",
        copyrightText: data.copyrightText || "",
        isMaintenance: data.isMaintenance || false,
      };
      
      setSettings(newSettings);
      localStorage.setItem("systemSettings", JSON.stringify(newSettings));
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
      setError("Không thể tải thông tin cài đặt");
    } finally {
      setLoading(false);
    }
  }, [settings.name]);

  // Hàm update settings
  const updateSettings = useCallback(async (newSettings) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiSystemSetting.updateSettings(newSettings);
      
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      
      setSettings(updatedSettings);
      localStorage.setItem("systemSettings", JSON.stringify(updatedSettings));
      
      return response;
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err.response?.data?.message || "Cập nhật thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Upload Logo
  const uploadLogo = useCallback(async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiSystemSetting.uploadLogo(formData);
      await fetchSettings(); // Refresh sau khi upload
      return response;
    } catch (err) {
      console.error("Lỗi upload logo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  // Upload Favicon
  const uploadFavicon = useCallback(async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiSystemSetting.uploadFavicon(formData);
      await fetchSettings(); // Refresh sau khi upload
      return response;
    } catch (err) {
      console.error("Lỗi upload favicon:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  // Auto fetch settings khi component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon,
  };

  return (
    <SystemSettingContext.Provider value={value}>
      {children}
    </SystemSettingContext.Provider>
  );
};

export default SystemSettingProvider;