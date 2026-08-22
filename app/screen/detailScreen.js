import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Trash2, Edit3, Check, X, AlertTriangle } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useNoteStore } from "../../store/useNoteStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Zustand Store Hooks
  const { updateNote, removeNote } = useNoteStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Dynamic Theme Styling
  const theme = {
    bg: isDarkMode ? "#121212" : "#F4FAFF",
    cardBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    cardBorder: isDarkMode ? "#333333" : "#E0EFF8",
    textPrimary: isDarkMode ? "#FFFFFF" : "#12344D",
    textSecondary: isDarkMode ? "#AAAAAA" : "#4A6572",
    inputBg: isDarkMode ? "#222222" : "#FFFFFF",
    modalBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
  };

  useEffect(() => {
    fetchNoteDetail();
  }, [id]);

  const fetchNoteDetail = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error", "Gagal mengambil data catatan.");
      router.back();
    } else {
      setTitle(data.title);
      setContent(data.content);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Peringatan", "Judul tidak boleh kosong!");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .update({ title, content })
      .eq("id", id)
      .select()
      .single();

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Update state global Zustand
      updateNote(id, { title, content });
      Alert.alert("Sukses", "Catatan berhasil diperbarui!");
      setIsEditing(false);
    }
  };

  const executeDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    
    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } else {
      // Hapus dari state global Zustand
      removeNote(id);
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color="#168CF5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: 50, paddingHorizontal: 22 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.cardBg, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.cardBorder }}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFE5E5", justifyContent: "center", alignItems: "center" }}>
                <X size={20} color="#E53935" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#E8F8F2", justifyContent: "center", alignItems: "center" }}>
                <Check size={20} color="#20A779" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#E8F5FF", justifyContent: "center", alignItems: "center" }}>
                <Edit3 size={20} color="#168CF5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFE5E5", justifyContent: "center", alignItems: "center" }}>
                <Trash2 size={20} color="#E53935" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Body Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <TextInput 
            value={title} 
            onChangeText={setTitle}
            style={{ fontSize: 24, fontWeight: "800", color: theme.textPrimary, marginBottom: 15, borderBottomWidth: 1, borderColor: "#168CF5", paddingBottom: 5 }} 
            placeholder="Judul Catatan"
            placeholderTextColor={theme.textSecondary}
          />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: "800", color: theme.textPrimary, marginBottom: 15 }}>{title}</Text>
        )}

        {isEditing ? (
          <TextInput 
            value={content} 
            onChangeText={setContent} 
            multiline 
            textAlignVertical="top"
            style={{ fontSize: 15, color: theme.textPrimary, minHeight: 200, backgroundColor: theme.inputBg, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: theme.cardBorder }}
            placeholder="Tuliskan isi catatan..."
            placeholderTextColor={theme.textSecondary}
          />
        ) : (
          <View style={{ backgroundColor: theme.cardBg, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: theme.cardBorder, minHeight: 200 }}>
            <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 22 }}>{content || "Tidak ada isi catatan."}</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Hapus */}
      <Modal visible={showDeleteModal} transparent={true} animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View style={{ width: "100%", maxWidth: 320, backgroundColor: theme.modalBg, borderRadius: 24, padding: 24, alignItems: "center", elevation: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFE5E5", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <AlertTriangle size={28} color="#E53935" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.textPrimary, marginBottom: 8, textAlign: "center" }}>
              Hapus Catatan?
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              Tindakan ini tidak dapat dibatalkan. Catatan Anda akan dihapus secara permanen.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity 
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: isDarkMode ? "#333" : "#F0F4F8", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: theme.textPrimary }}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={executeDelete}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#E53935", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}