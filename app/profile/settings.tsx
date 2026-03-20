import { icons } from "@/constants/icons";
import { useProfileQuery } from "@/hooks/useAppQuery";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useReaderThemeStore } from "@/store/useReaderThemeStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceHigh: "#F3F4F6",
  border: "#E5E7EB",
  borderFocus: "rgba(232,67,38,0.5)",
  accent: "#E84326",
  accentDim: "rgba(232,67,38,0.08)",
  white: "#FFFFFF",
  offWhite: "#1A1A2E",
  muted: "#9CA3AF",
  mutedLight: "#6B7280",
  success: "#34C759",
  successDim: "rgba(52,199,89,0.08)",
  danger: "#FF3B30",
  dangerDim: "rgba(255,59,48,0.08)",
};

// Feedback toast
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[s.toast, { opacity, backgroundColor: type === "success" ? C.successDim : C.dangerDim, borderColor: type === "success" ? C.success : C.danger }]}>
      <Ionicons name={type === "success" ? "checkmark-circle" : "alert-circle"} size={16} color={type === "success" ? C.success : C.danger} />
      <Text style={[s.toastText, { color: type === "success" ? C.success : C.danger }]}>{msg}</Text>
    </Animated.View>
  );
}

// Section wrapper
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>{label}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

// Input row
function InputRow({ label, value, onChange, placeholder, secure }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; secure?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.inputWrap, focused && { borderColor: C.borderFocus }]}>
      <Text style={s.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={secure}
        style={s.input}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function ProfileSettings() {
  const { data: profile, isLoading, refetch } = useProfileQuery();
  const { logout, setUser } = useAuthStore();
  const { theme, toggleTheme } = useReaderThemeStore();

  const [displayName, setDisplayName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string; key: number } | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.username) setDisplayName(profile.username);
    const loadAvatar = async () => {
      const saved = await AsyncStorage.getItem("userAvatar");
      if (saved) setLocalAvatar(saved);
      else if (profile?.profilePhotoUrl) setLocalAvatar(profile.profilePhotoUrl);
    };
    loadAvatar();
  }, [profile]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg, key: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Avatar
  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Уруксат талап кылынат", "Галереяга кирүүгө уруксат бериңиз."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    setIsUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const fd = new FormData();
      fd.append("photo", { uri: asset.uri, name: "avatar.jpg", type: asset.mimeType ?? "image/jpeg" } as never);
      const res = await authApi.uploadProfilePhoto(fd);
      if (profile) setUser({ ...profile, profilePhotoUrl: res.url });
      setLocalAvatar(res.url);
      await AsyncStorage.setItem("userAvatar", res.url);
      await refetch();
      showToast("success", "Аватар жаңыртылды!");
    } catch { showToast("error", "Аватарды жүктөө мүмкүн болгон жок."); }
    finally { setIsUploadingAvatar(false); }
  };

  const handleDeleteAvatar = () => {
    Alert.alert("Аватарды өчүрүү", "Чынында өчүргүңүз келеби?", [
      { text: "Жок", style: "cancel" },
      {
        text: "Өчүрүү", style: "destructive", onPress: async () => {
          try {
            await authApi.deleteProfilePhoto();
            if (profile) setUser({ ...profile, profilePhotoUrl: undefined });
            setLocalAvatar(null);
            await AsyncStorage.removeItem("userAvatar");
            await refetch();
            showToast("success", "Аватар өчүрүлдү.");
          }
          catch { showToast("error", "Аватарды өчүрүү мүмкүн болгон жок."); }
        }
      },
    ]);
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!displayName.trim()) { showToast("error", "Ат бош болбосун."); return; }
    setIsSavingProfile(true);
    try { if (profile) setUser({ ...profile, username: displayName.trim() }); showToast("success", "Профиль сакталды!"); }
    catch { showToast("error", "Профилди сактоо мүмкүн болгон жок."); }
    finally { setIsSavingProfile(false); }
  };

  // Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) { showToast("error", "Бардык талааларды толтуруңуз."); return; }
    if (newPassword.length < 8) { showToast("error", "Жаңы сырсөз 8 символдон кем эмес."); return; }
    if (oldPassword === newPassword) { showToast("error", "Жаңы сырсөз эскисинен айырмаланышы керек."); return; }
    setIsChangingPassword(true);
    try { await authApi.changePassword({ oldPassword, newPassword }); setOldPassword(""); setNewPassword(""); showToast("success", "Сырсөз ийгиликтүү алмаштырылды!"); }
    catch { showToast("error", "Сырсөздү өзгөртүү мүмкүн болгон жок."); }
    finally { setIsChangingPassword(false); }
  };

  // Logout
  const handleLogout = () => {
    Alert.alert("Чыгуу", "Чыккыңыз келерине ишенесизби?", [
      { text: "Жок", style: "cancel" },
      { text: "Ооба, чыгуу", style: "destructive", onPress: async () => { await authApi.logout(); await logout(); router.replace("/auth/login"); } },
    ]);
  };

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      {/* Toast */}
      {toast && <Toast key={toast.key} type={toast.type} msg={toast.msg} />}

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Орнотуулар</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.flex}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={s.avatarBlock}>
          <TouchableOpacity onPress={handleChangeAvatar} activeOpacity={0.85} style={s.avatarWrap}>
            {isLoading || isUploadingAvatar ? (
              <View style={[s.avatar, { alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceHigh }]}>
                <ActivityIndicator color={C.accent} />
              </View>
            ) : (
              <Image
                source={localAvatar ? { uri: localAvatar } : icons.defaultAvatar}
                style={s.avatar}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
            )}
            {/* Camera overlay */}
            <View style={s.avatarOverlay}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              <Ionicons name="camera" size={16} color={C.white} />
            </View>
          </TouchableOpacity>
          <Text style={s.avatarName}>{profile?.username ?? "—"}</Text>
          {profile?.profilePhotoUrl && (
            <TouchableOpacity onPress={handleDeleteAvatar} style={s.removeAvatarBtn} activeOpacity={0.7}>
              <Text style={s.removeAvatarText}>Сүрөттү өчүрүү</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Display name */}
        <Section label="ПРОФИЛЬ">
          <InputRow label="Колдонуучунун аты" value={displayName} onChange={setDisplayName} placeholder="Атыңыз" />
          <View style={s.sectionDivider} />
          <TouchableOpacity style={s.actionRow} onPress={handleSaveProfile} disabled={isSavingProfile} activeOpacity={0.7}>
            {isSavingProfile ? <ActivityIndicator color={C.accent} size="small" /> : <Text style={s.actionText}>Сактоо</Text>}
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </Section>

        {/* Password */}
        <Section label="КООПСУЗДУК">
          <InputRow label="Эски сырсөз" value={oldPassword} onChange={setOldPassword} placeholder="••••••••" secure />
          <View style={s.sectionDivider} />
          <InputRow label="Жаңы сырсөз" value={newPassword} onChange={setNewPassword} placeholder="8+ символ" secure />
          <View style={s.sectionDivider} />
          <TouchableOpacity style={s.actionRow} onPress={handleChangePassword} disabled={isChangingPassword} activeOpacity={0.7}>
            {isChangingPassword ? <ActivityIndicator color={C.accent} size="small" /> : <Text style={s.actionText}>Сырсөздү жаңыртуу</Text>}
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </Section>

        {/* Reader Settings */}
        <Section label="ОКУРМАН">
          <View style={[s.inputWrap, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 0 }]}>
            <Text style={[s.inputLabel, { marginBottom: 0, fontSize: 16 }]}>Караңгы тема (Dark Mode)</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.accent }}
              thumbColor={C.white}
            />
          </View>
        </Section>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={C.danger} />
            <Text style={s.logoutText}>Аккаунттан чыгуу</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceHigh, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: C.offWhite, fontSize: 17, fontWeight: "600", letterSpacing: -0.3 },
  // Avatar
  avatarBlock: { alignItems: "center", paddingVertical: 28, paddingBottom: 32 },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", marginBottom: 12 },
  avatar: { width: 96, height: 96 },
  avatarOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 30, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarName: { color: C.offWhite, fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
  removeAvatarBtn: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 12 },
  removeAvatarText: { color: C.danger, fontSize: 13 },
  // Sections
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: "600", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  sectionDivider: { height: 1, backgroundColor: C.border, marginLeft: 16 },
  // Input
  inputWrap: { paddingHorizontal: 16, paddingVertical: 12, borderWidth: 0, borderColor: "transparent" },
  inputLabel: { color: C.muted, fontSize: 11, fontWeight: "500", marginBottom: 4, letterSpacing: 0.2 },
  input: { color: C.offWhite, fontSize: 15, fontWeight: "400" },
  // Action row
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  actionText: { color: C.accent, fontSize: 15, fontWeight: "500" },
  // Logout
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, backgroundColor: C.dangerDim, borderWidth: 1, borderColor: "rgba(255,59,48,0.2)" },
  logoutText: { color: C.danger, fontSize: 15, fontWeight: "600" },
  // Toast
  toast: { position: "absolute", bottom: 60, left: 20, right: 20, zIndex: 999, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  toastText: { fontSize: 13, fontWeight: "500", flex: 1 },
});