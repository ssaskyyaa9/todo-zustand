import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save, FileText, Trash2 } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useNoteStore } from "../../store/useNoteStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function AddNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Zustand Store Hooks
  const { addNote, updateNote, removeNote } = useNoteStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(id);

  // Dynamic Theme Styling
  const theme = {
    bg: isDarkMode ? "#121212" : "#F4FAFF",
    cardBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    cardBorder: isDarkMode ? "#333333" : "#E0EFF8",
    inputBg: isDarkMode ? "#2A2A2A" : "#F9FDFF",
    inputBorder: isDarkMode ? "#444444" : "#CDE7F7",
    textPrimary: isDarkMode ? "#FFFFFF" : "#12344D",
    textSecondary: isDarkMode ? "#AAAAAA" : "#7893A6",
    labelColor: isDarkMode ? "#DCEFFF" : "#31566F",
    primary: "#168CF5",
  };

  useEffect(() => {
    if (isEditMode) fetchNoteDetail();
  }, [id]);

  const fetchNoteDetail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("title, content")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        Alert.alert("Error", "Gagal memuat catatan.");
        router.back();
      } else if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  async function saveNote() {
    if (!title.trim()) return Alert.alert("Title belum diisi", "Silakan masukkan judul catatan.");
    if (!content.trim()) return Alert.alert("Content belum diisi", "Silakan masukkan isi catatan.");

    setSaving(true);

    try {
      // 1. Cek Sesi User Aktiv
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Session error", "User belum login. Silakan login kembali.");
        return;
      }

      if (isEditMode) {
        // UPDATE NOTE
        const { data, error } = await supabase
          .from("notes")
          .update({ title: title.trim(), content: content.trim() })
          .eq("id", id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          updateNote(id, data[0]); // Simpan ke Zustand
        }
      } else {
        // INSERT NOTE BARU
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              user_id: user.id,
              title: title.trim(),
              content: content.trim(),
            }
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          addNote(data[0]); // Simpan ke Zustand
        }
      }

      // 2. LANGSUNG ARAHKAN KEMBALI KE DASHBOARD
      router.replace("/screen/dashboardScreen");

    } catch (err) {
      Alert.alert("Gagal menyimpan", err.message || "Terjadi kesalahan pada database.");
    } finally {
      setSaving(false);
    }
  }

  function deleteNote() {
    Alert.alert("Hapus Catatan", "Apakah Anda yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          setSaving(true);
          try {
            const { error } = await supabase.from("notes").delete().eq("id", id);
            if (error) throw error;

            removeNote(id);
            router.replace("/screen/dashboardScreen"); // Langsung balik ke Dashboard setelah hapus
          } catch (err) {
            Alert.alert("Gagal menghapus", err.message);
          } finally {
            setSaving(false);
          }
        }
      }
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.bg} />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 55, paddingBottom: 40 }}>
        {/* Header Navigation */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.cardBorder }}>
              <ArrowLeft size={21} color={theme.textPrimary} strokeWidth={2} />
            </TouchableOpacity>

            <View style={{ marginLeft: 14 }}>
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 3 }}> NOTES </Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: theme.textPrimary }}>{isEditMode ? "Edit Note" : "New Note"}</Text>
            </View>
          </View>

          {isEditMode && (
            <TouchableOpacity activeOpacity={0.7} onPress={deleteNote} disabled={saving} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "#FFE5E5", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={21} color="#E53935" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Banner */}
        <View style={{ backgroundColor: theme.primary, borderRadius: 22, padding: 20, marginBottom: 24, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <FileText size={23} color={theme.primary} strokeWidth={2} />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginBottom: 4 }}>{isEditMode ? "Update your thought" : "Create something new"}</Text>
            <Text style={{ color: "#DCEFFF", fontSize: 12, lineHeight: 18 }}> Write down your thoughts, ideas, or important notes. </Text>
          </View>
        </View>

        {/* Form Input */}
        <View style={{ backgroundColor: theme.cardBg, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: theme.cardBorder }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: theme.labelColor, marginBottom: 9 }}> Title </Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Give your note a title" placeholderTextColor={theme.textSecondary} autoCapitalize="sentences" style={{ height: 54, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, color: theme.textPrimary, marginBottom: 22 }} />

          <Text style={{ fontSize: 14, fontWeight: "700", color: theme.labelColor, marginBottom: 9 }}> Content </Text>
          <TextInput value={content} onChangeText={setContent} placeholder="Write your note here..." placeholderTextColor={theme.textSecondary} multiline textAlignVertical="top" autoCapitalize="sentences" style={{ minHeight: 230, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 14, padding: 16, fontSize: 15, lineHeight: 23, color: theme.textPrimary, marginBottom: 22 }} />

          <TouchableOpacity activeOpacity={0.8} onPress={saveNote} disabled={saving} style={{ height: 55, backgroundColor: saving ? "#8BC8F8" : theme.primary, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={19} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 8 }}>{isEditMode ? "Update Note" : "Save Note"}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}