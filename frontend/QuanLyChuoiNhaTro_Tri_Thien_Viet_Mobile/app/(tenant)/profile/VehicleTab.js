// app/(tenant)/profile/VehicleTab.js
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import {
  Bike,
  Car,
  Plus,
  Pencil,
  Trash2,
  Tag,
  CreditCard,
  Save,
} from "lucide-react-native";
import { s, C, IS_IOS } from "../../../components/ProfileStyles";
import { EditField } from "../../../components/ProfileComponents";
import axiosInstance from "../../../services/axios";

const unwrap = (r) => r?.data ?? r;
const api = {
  getVehicles: (profileId) =>
    axiosInstance
      .get(`/public/profiles/${profileId}`)
      .then(unwrap)
      .then((r) => r?.vehicles || []),
  createVehicle: (profileId, data) =>
    axiosInstance.post(`/public/vehicles/${profileId}`, data).then(unwrap),
  updateVehicle: (id, data) =>
    axiosInstance.put(`/public/vehicles/${id}`, data).then(unwrap),
  deleteVehicle: (id) =>
    axiosInstance.delete(`/public/vehicles/${id}`).then(unwrap),
};

// ─── Vehicle Modal ────────────────────────────────────────────────────────────
function VehicleModal({ visible, vehicle, onSave, onClose, loading }) {
  const [brand, setBrand] = useState("");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    setBrand(vehicle?.brand || "");
    setPlate(vehicle?.licensePlate || "");
  }, [vehicle, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={IS_IOS ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <View style={s.sheetHandle} />

            {/* Sheet header */}
            <View style={styles.sheetHead}>
              <View style={styles.sheetIconWrap}>
                <Bike size={20} color={C.white} strokeWidth={2} />
              </View>
              <Text style={s.sheetTitle}>
                {vehicle ? "Sửa thông tin xe" : "Thêm xe mới"}
              </Text>
            </View>

            <EditField
              label="Hãng xe"
              value={brand}
              onChangeText={setBrand}
              placeholder="VD: Honda Vision"
              IconComponent={Tag}
            />
            <EditField
              label="Biển số xe"
              value={plate}
              onChangeText={setPlate}
              placeholder="VD: 59-X3 123.45"
              IconComponent={CreditCard}
            />

            <View style={s.actionRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, loading && { opacity: 0.6 }]}
                onPress={() => onSave({ brand, licensePlate: plate })}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <>
                    <Save size={15} color={C.white} strokeWidth={2} />
                    <Text style={s.saveBtnText}>Lưu xe</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <View style={s.vehicleCard}>
      <View style={s.vehicleAccent} />
      <View style={s.vehicleIconWrap}>
        <Bike size={22} color={C.navy} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.vehiclePlate}>{vehicle.licensePlate}</Text>
        <Text style={s.vehicleBrand}>{vehicle.brand || "Không rõ hãng"}</Text>
      </View>
      <TouchableOpacity
        style={s.vehicleEditBtn}
        onPress={() => onEdit(vehicle)}
      >
        <Pencil size={14} color={C.white} strokeWidth={2} />
      </TouchableOpacity>
      <TouchableOpacity
        style={s.vehicleDeleteBtn}
        onPress={() => onDelete(vehicle)}
      >
        <Trash2 size={14} color={C.white} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VehicleTab({ profileId }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!profileId) return;
    try {
      setVehicles(await api.getVehicles(profileId));
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (data) => {
    if (!data.brand?.trim() || !data.licensePlate?.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập hãng xe và biển số");
      return;
    }
    try {
      setSaving(true);
      editing?.vehicleId
        ? await api.updateVehicle(editing.vehicleId, data)
        : await api.createVehicle(profileId, data);
      setModal(false);
      load();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu thông tin xe");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (v) =>
    Alert.alert("Xóa xe", `Xóa xe ${v.licensePlate}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteVehicle(v.vehicleId);
            load();
          } catch {
            Alert.alert("Lỗi", "Không thể xóa xe này");
          }
        },
      },
    ]);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.navy} size="large" />
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={s.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          colors={[C.navy]}
          tintColor={C.navy}
          title="Kéo để làm mới"
          titleColor={C.slate400}
        />
      }
    >
      {/* Stat banner */}
      <View style={s.vehicleBanner}>
        <View style={s.vehicleBannerLeft}>
          <Text style={s.vehicleBannerNum}>{vehicles.length}</Text>
          <Text style={s.vehicleBannerLabel}>xe đã đăng ký</Text>
        </View>
        <Car size={52} color="rgba(255,255,255,0.18)" strokeWidth={1.5} />
      </View>

      {/* List hoặc empty */}
      {vehicles.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={s.emptyIconWrap}>
            <Bike size={40} color={C.slate400} strokeWidth={1.5} />
          </View>
          <Text style={s.emptyTitle}>Chưa có xe nào</Text>
          <Text style={s.emptySub}>Thêm xe để quản lý ra vào bãi đỗ xe</Text>
        </View>
      ) : (
        <View style={s.vehicleList}>
          {vehicles.map((v) => (
            <VehicleCard
              key={v.vehicleId}
              vehicle={v}
              onEdit={(veh) => {
                setEditing(veh);
                setModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </View>
      )}

      {/* Add button */}
      <TouchableOpacity
        style={s.addVehicleBtn}
        onPress={() => {
          setEditing(null);
          setModal(true);
        }}
        activeOpacity={0.85}
      >
        <Plus size={17} color={C.navy} strokeWidth={2.5} />
        <Text style={s.addVehicleBtnText}>Thêm xe mới</Text>
      </TouchableOpacity>

      <VehicleModal
        visible={modal}
        vehicle={editing}
        onSave={handleSave}
        onClose={() => setModal(false)}
        loading={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
