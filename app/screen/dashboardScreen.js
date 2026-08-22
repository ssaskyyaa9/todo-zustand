import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, RefreshControl, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Sun, Moon, ChevronRight, FileText, Plus, Clock3, CircleUserRound, Settings, CheckSquare, Square } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useNoteStore } from "../../store/useNoteStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function DashboardScreen() {
  const router = useRouter();
  
  // Zustand Store Hooks (Multi-store)
  const { notes, setNotes, toggleNote } = useNoteStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic Theme Colors
  const theme = {
    bg: isDarkMode ? "#121212" : "#F4FAFF",
    cardBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    cardBorder: isDarkMode ? "#333333" : "#E0EFF8",
    textPrimary: isDarkMode ? "#FFFFFF" : "#12344D",
    textSecondary: isDarkMode ? "#AAAAAA" : "#7893A6",
    primary: "#168CF5",
  };

  // Menghitung To-Do yang tersisa (Langkah 5 Modul Praktikum)
  const remainingCount = notes.filter((item) => !item.is_completed).length;

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { 
        router.replace("/auth/AuthScreen"); 
        return; 
      }

      // Ambil seluruh kolom untuk menghindari error nama kolom yang tidak terdefinisi
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error Fetch Supabase:", error.message);
      } else {
        // Format data agar properti is_completed tidak bernilai undefined
        const formattedData = (data || []).map(item => ({
          ...item,
          is_completed: Boolean(item.is_completed)
        }));
        setNotes(formattedData);
      }
    } catch (err) {
      console.log("Catch Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
  };

  // Toggle Selesai/Belum Selesai (Memperbarui Zustand & Supabase)
  const handleToggle = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    
    // 1. Update State Global Zustand secara Instant
    toggleNote(id); 

    // 2. Simpan Perubahan ke Supabase (Tantangan Opsional Modul)
    const { error } = await supabase
      .from("notes")
      .update({ is_completed: nextStatus })
      .eq("id", id);

    if (error) {
      console.log("Gagal memperbarui status di Supabase:", error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Render Item untuk FlatList (Langkah 5)
  const renderTodoItem = ({ item }) => (
    <View 
      style={{ 
        backgroundColor: theme.cardBg, 
        borderRadius: 17, 
        padding: 14, 
        marginBottom: 10, 
        flexDirection: "row", 
        alignItems: "center", 
        borderWidth: 1, 
        borderColor: theme.cardBorder 
      }}
    >
      {/* Checkbox Toggle Selesai */}
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleToggle(item.id, item.is_completed)} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
        {item.is_completed ? (
          <CheckSquare size={22} color={theme.primary} strokeWidth={2.2} />
        ) : (
          <Square size={22} color={theme.textSecondary} strokeWidth={2} />
        )}
      </TouchableOpacity>

      {/* Detail Teks Catatan */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => router.push(`/screen/detailScreen?id=${item.id}`)}
        style={{ flex: 1, marginLeft: 10 }}
      >
        <Text 
          numberOfLines={1} 
          style={{ 
            fontSize: 15, 
            fontWeight: "700", 
            color: theme.textPrimary, 
            marginBottom: 4,
            textDecorationLine: item.is_completed ? "line-through" : "none",
            opacity: item.is_completed ? 0.5 : 1
          }}
        > 
          {item.title} 
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Clock3 size={12} color={theme.textSecondary} strokeWidth={2} />
          <Text style={{ marginLeft: 5, fontSize: 11, color: theme.textSecondary }}>
            {formatDate(item.created_at)} · {formatTime(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>

      <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2} />
    </View>
  );

  // Component Header untuk FlatList
  const ListHeader = () => (
    <>
      {/* Header dengan Toggle Theme (Langkah 6 Modul) */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <View>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 5 }}> Welcome back </Text>
          <Text style={{ fontSize: 28, fontWeight: "800", color: theme.textPrimary, letterSpacing: -0.5 }}> todo-global </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={toggleTheme}
          style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.cardBorder }}
        >
          {isDarkMode ? (
            <Sun size={21} color="#FFD700" strokeWidth={2} />
          ) : (
            <Moon size={21} color={theme.primary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Info Box Counter Item Tersisa (Langkah 5 Modul) */}
      <View style={{ backgroundColor: theme.primary, borderRadius: 24, padding: 22, marginBottom: 22, overflow: "hidden" }}>
        <View style={{ position: "absolute", width: 150, height: 150, borderRadius: 100, backgroundColor: "#42A6FF", right: -60, top: -60, opacity: 0.45 }} />
        <Text style={{ color: "#DCEFFF", fontSize: 13, fontWeight: "600", marginBottom: 8 }}> TUGAS TERSISA </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 38, fontWeight: "800", marginBottom: 4 }}> {loading ? "..." : remainingCount} </Text>
        <Text style={{ color: "#DCEFFF", fontSize: 14 }}> Dari total {notes.length} item tersimpan </Text>

        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/screen/addnoteScreen")} style={{ marginTop: 20, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 }}>
          <Plus size={17} color={theme.primary} strokeWidth={2.5} />
          <Text style={{ marginLeft: 7, color: theme.primary, fontWeight: "800", fontSize: 13 }}> Tambah To-Do </Text>
        </TouchableOpacity>
      </View>

      {/* Section List Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Text style={{ fontSize: 19, fontWeight: "800", color: theme.textPrimary }}> Daftar To-Do </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/notes")} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "700" }}> Lihat semua </Text>
          <ChevronRight size={16} color={theme.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

      {/* Implementasi FlatList (Langkah 5 Kriteria Tugas) */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTodoItem}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 55, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ backgroundColor: theme.cardBg, borderRadius: 17, padding: 22, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder }}>
              <ActivityIndicator color={theme.primary} size="small" />
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 8 }}> Memuat data... </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: theme.cardBg, borderRadius: 17, padding: 30, alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder }}>
              <View style={{ width: 52, height: 52, borderRadius: 15, backgroundColor: isDarkMode ? "#2A2A2A" : "#EAF7FF", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <FileText size={24} color={theme.primary} strokeWidth={2} />
              </View>

              <Text style={{ fontSize: 16, fontWeight: "800", color: theme.textPrimary, marginBottom: 5 }}> Belum ada tugas </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: "center", marginBottom: 18 }}> Buat tugas atau catatan pertama kamu. </Text>

              <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/screen/addnoteScreen")} style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.primary, paddingHorizontal: 17, paddingVertical: 11, borderRadius: 12 }}>
                <Plus size={17} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginLeft: 7 }}> Buat Tugas </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Bottom Navigation */}
      <View style={{ position: "absolute", left: 16, right: 16, bottom: 18, height: 68, backgroundColor: theme.cardBg, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderWidth: 1, borderColor: theme.cardBorder, elevation: 5 }}>
        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: "center", justifyContent: "center" }}>
          <FileText size={21} color={theme.primary} strokeWidth={2.2} />
          <Text style={{ fontSize: 10, fontWeight: "700", color: theme.primary, marginTop: 4 }}> Home </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/screen/addnoteScreen")} style={{ alignItems: "center", justifyContent: "center" }}>
          <FileText size={21} color={theme.textSecondary} strokeWidth={2} />
          <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}> Notes </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/screen/profileScreen")} style={{ alignItems: "center", justifyContent: "center" }}>
          <CircleUserRound size={21} color={theme.textSecondary} strokeWidth={2} />
          <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}> Profile </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: "center", justifyContent: "center" }}>
          <Settings size={21} color={theme.textSecondary} strokeWidth={2} />
          <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}> Settings </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}