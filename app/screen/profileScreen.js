import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Switch, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Mail, Shield, Moon, LogOut, ChevronRight, FileText, Calendar } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [noteCount, setNoteCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) throw userError;
      setUser(currentUser);

      const { count, error: countError } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", currentUser.id);

      if (!countError) setNoteCount(count || 0);
    } catch (error) {
      console.log("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } else {
      router.replace("auth/authScreen");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4FAFF" }}>
        <ActivityIndicator size="large" color="#168CF5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4FAFF", paddingTop: 50, paddingHorizontal: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DDEEF8" }} >
          <ArrowLeft size={20} color="#12344D" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#12344D" }}>Profil Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#E0EFF8", marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8F5FF", justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 2, borderColor: "#168CF5" }}>
            <User size={40} color="#168CF5" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#12344D", marginBottom: 4 }}>
            {user?.user_metadata?.full_name || "Pengguna Note"}
          </Text>
          <Text style={{ fontSize: 14, color: "#7A92A5" }}>{user?.email || "email@contoh.com"}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E0EFF8", flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#E8F5FF", justifyContent: "center", alignItems: "center" }}>
              <FileText size={22} color="#168CF5" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#12344D" }}>{noteCount}</Text>
              <Text style={{ fontSize: 12, color: "#7A92A5" }}>Total Catatan</Text>
            </View>
          </View>

          <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E0EFF8", flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#E8F8F2", justifyContent: "center", alignItems: "center" }}>
              <Calendar size={22} color="#20A779" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#12344D" }}>
                {new Date(user?.created_at || Date.now()).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
              </Text>
              <Text style={{ fontSize: 12, color: "#7A92A5" }}>Bergabung</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#7A92A5", marginBottom: 10, paddingLeft: 4 }}>
          PENGATURAN AKUN
        </Text>

        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E0EFF8", overflow: "hidden", marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderColor: "#F0F4F8" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Mail size={20} color="#4A6572" />
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#12344D" }}>Email</Text>
            </View>
            <Text style={{ fontSize: 14, color: "#7A92A5" }}>{user?.email}</Text>
          </View>

          <TouchableOpacity onPress={() => Alert.alert("Informasi", "Fitur ubah kata sandi dapat disesuaikan.")} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderColor: "#F0F4F8" }} >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Shield size={20} color="#4A6572" />
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#12344D" }}>Keamanan Akun</Text>
            </View>
            <ChevronRight size={18} color="#A0B2C6" />
          </TouchableOpacity>

        </View>

        <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FFE5E5", borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#FFCDCD" }} >
          <LogOut size={20} color="#E53935" />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#E53935" }}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent={true} animationType="fade" onRequestClose={() => setShowLogoutModal(false)} >
        <View style={{ flex: 1, backgroundColor: "rgba(18, 52, 77, 0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View style={{ width: "100%", maxWidth: 320, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFE5E5", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <LogOut size={28} color="#E53935" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: "700", color: "#12344D", marginBottom: 8, textAlign: "center" }}>
              Keluar Akun?
            </Text>
            <Text style={{ fontSize: 14, color: "#7A92A5", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              Anda harus masuk kembali untuk mengakses catatan Anda.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F0F4F8", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#4A6572" }}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#E53935", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}