// app/(tenant)/profile/PasswordTab.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { Lock, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react-native";
import { s, C, IS_IOS } from "./ProfileStyles";
import { EditField, SectionCard, Divider } from "./ProfileComponents";
import apiUser from "../../../services/apiUser";

const TIPS = [
  "Ít nhất 8 ký tự",
  "Kết hợp chữ hoa + chữ thường + số",
  "Thêm ký tự đặc biệt (!@#$...)",
];

export default function PasswordTab({ user }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const f = (key) => ({
    value: form[key],
    onChangeText: (v) => setForm((p) => ({ ...p, [key]: v })),
    secureTextEntry: true,
  });

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Không khớp", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.newPassword.length < 6) {
      Alert.alert("Quá ngắn", "Mật khẩu mới cần ít nhất 6 ký tự");
      return;
    }
    try {
      setSaving(true);
      await apiUser.changePassword(user.userId, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      Alert.alert("Thành công", "Đã đổi mật khẩu thành công");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message ||
          "Mật khẩu cũ không đúng hoặc lỗi hệ thống",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={s.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mật khẩu section */}
        <SectionCard
          IconComponent={Lock}
          iconColor={C.violet}
          title="Đổi mật khẩu"
          subtitle="Dùng mật khẩu mạnh để bảo vệ tài khoản"
          accent={C.violet}
        >
          <Divider />
          <EditField
            label="Mật khẩu hiện tại"
            {...f("oldPassword")}
            placeholder="••••••••"
            IconComponent={KeyRound}
          />
          <EditField
            label="Mật khẩu mới"
            {...f("newPassword")}
            placeholder="Ít nhất 6 ký tự"
            IconComponent={Lock}
          />
          <EditField
            label="Xác nhận mật khẩu mới"
            {...f("confirmPassword")}
            placeholder="Nhập lại mật khẩu mới"
            IconComponent={CheckCircle2}
          />
        </SectionCard>

        {/* Tips card */}
        <View style={s.tipCard}>
          <ShieldCheck size={18} color={C.navy} strokeWidth={2} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.tipTitle}>Gợi ý mật khẩu mạnh</Text>
            {TIPS.map((t) => (
              <View key={t} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={s.tipItem}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            s.successBtn,
            { paddingVertical: 16 },
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <>
              <Lock size={16} color={C.white} strokeWidth={2} />
              <Text style={s.successBtnText}>Xác nhận đổi mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tipRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.navy },
});
