// app/(tenant)/profile/profileComponents.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { s, C } from "./ProfileStyles";

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = () => <View style={s.divider} />;

// ─── InfoRow: read-only display row ──────────────────────────────────────────
export function InfoRow({ IconComponent, iconColor = C.blue, label, value }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoRowIcon}>
        <IconComponent size={15} color={iconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoRowLabel}>{label}</Text>
        <Text style={s.infoRowValue} numberOfLines={1}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

// ─── EditField: editable input ────────────────────────────────────────────────
export function EditField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  IconComponent,
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={s.editField}>
      <View style={s.editFieldHeader}>
        {IconComponent && (
          <IconComponent size={12} color={C.slate400} strokeWidth={2} />
        )}
        <Text style={s.editFieldLabel}>{label}</Text>
      </View>
      <View style={s.editFieldInputWrap}>
        <TextInput
          style={[s.editFieldInput, secureTextEntry && s.editFieldInputPad]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={C.slate400}
          keyboardType={keyboardType || "default"}
          secureTextEntry={secureTextEntry && !show}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShow((p) => !p)}>
            {show ? (
              <EyeOff size={15} color={C.slate400} strokeWidth={2} />
            ) : (
              <Eye size={15} color={C.slate400} strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
export function SectionCard({
  IconComponent,
  iconColor = C.blue,
  title,
  subtitle,
  accent,
  children,
}) {
  return (
    <View
      style={[
        s.sectionCard,
        accent && { borderLeftWidth: 3, borderLeftColor: accent },
      ]}
    >
      <View style={s.sectionCardHead}>
        <View style={s.sectionCardIcon}>
          <IconComponent size={17} color={iconColor} strokeWidth={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionCardTitle}>{title}</Text>
          {subtitle && <Text style={s.sectionCardSub}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}
