// components/readings/ImageCapture.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import apiMeterReading from "../../services/apiMeterReading";

export default function ImageCapture({
  serviceColor,
  serviceId,
  onFile,
  onRemove,
  onOCRComplete,
  imageUri,
  isSaved,
}) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");

  const pickImage = async (fromCamera) => {
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền camera",
          "Vui lòng cấp quyền camera trong Cài đặt.",
        );
        return;
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền thư viện", "Vui lòng cấp quyền truy cập ảnh.");
        return;
      }
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"], // ✅ fix: thay MediaTypeOptions.Images
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"], // ✅ fix: thay MediaTypeOptions.Images
          quality: 0.8,
        });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      onFile(asset.uri);
      setOcrError("");
    }
  };

  const showPicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) pickImage(true);
          if (idx === 2) pickImage(false);
        },
      );
    } else {
      Alert.alert("Chọn ảnh", "Lấy ảnh từ đâu?", [
        { text: "Hủy", style: "cancel" },
        { text: "📷 Chụp ảnh", onPress: () => pickImage(true) },
        { text: "🖼 Thư viện", onPress: () => pickImage(false) },
      ]);
    }
  };

  const handleOCR = async () => {
    if (!imageUri) {
      setOcrError("Chưa có ảnh để đọc");
      return;
    }
    setOcrLoading(true);
    setOcrError("");
    try {
      let response;
      if (serviceId === 1) {
        response = await apiMeterReading.ocrElectricity(imageUri);
      } else {
        response = await apiMeterReading.ocrWater(imageUri);
      }
      const meterValue =
        response?.data?.detectedNumber || response?.detectedNumber;
      if (meterValue && meterValue !== "0" && meterValue !== "") {
        onOCRComplete(parseInt(meterValue, 10));
      } else {
        throw new Error("Không đọc được chỉ số");
      }
    } catch (err) {
      setOcrError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể đọc số từ ảnh",
      );
    } finally {
      setOcrLoading(false);
    }
  };

  if (isSaved) return null;

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <View style={styles.previewInfo}>
          <Text style={styles.previewLabel} numberOfLines={1}>
            Ảnh đồng hồ
          </Text>
          {!!ocrError && (
            <Text style={styles.ocrErrorText} numberOfLines={2}>
              ⚠ {ocrError}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.ocrBtn, { backgroundColor: serviceColor }]}
          onPress={handleOCR}
          disabled={ocrLoading}
        >
          {ocrLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.ocrBtnText}>✨ OCR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.addImageBtn, { borderColor: serviceColor + "80" }]}
      onPress={showPicker}
      activeOpacity={0.7}
    >
      <Text style={[styles.addImageIcon, { color: serviceColor }]}>📷</Text>
      <Text style={[styles.addImageText, { color: serviceColor }]}>
        Thêm ảnh đồng hồ
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  addImageIcon: { fontSize: 16 },
  addImageText: { fontSize: 13, fontWeight: "600" },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  previewImage: {
    width: 48,
    height: 36,
    borderRadius: 4,
    resizeMode: "cover",
  },
  previewInfo: { flex: 1 },
  previewLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  ocrErrorText: { fontSize: 11, color: "#ef4444", marginTop: 2 },
  ocrBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  ocrBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  removeBtn: { padding: 6 },
  removeBtnText: { fontSize: 18 },
});
