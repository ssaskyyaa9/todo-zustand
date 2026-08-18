import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Trash2, Edit3, Check, X, AlertTriangle } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
    const { error } = await supabase
      .from("notes")
      .update({ title, content })
      .eq("id", id);

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
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
      router.back();
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
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DDEEF8" }}>
          <ArrowLeft size={20} color="#12344D" />
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <TextInput value={title} onChangeText={setTitle}
            style={{ fontSize: 24, fontWeight: "800", color: "#12344D", marginBottom: 15, borderBottomWidth: 1, borderColor: "#168CF5", paddingBottom: 5 }} placeholder="Judul Catatan"
          />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#12344D", marginBottom: 15 }}>{title}</Text>
        )}

        {isEditing ? (
          <TextInput value={content} onChangeText={setContent} multiline textAlignVertical="top"
            style={{ fontSize: 15, color: "#4A6572", minHeight: 200, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 15, borderWidth: 1, borderColor: "#E0EFF8" }}
            placeholder="Tuliskan isi catatan..."
          />
        ) : (
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E0EFF8", minHeight: 200 }}>
            <Text style={{ fontSize: 15, color: "#4A6572", lineHeight: 22 }}>{content || "Tidak ada isi catatan."}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showDeleteModal} transparent={true} animationType="fade" onRequestClose={() => setShowDeleteModal(false)} >
        <View style={{ flex: 1, backgroundColor: "rgba(18, 52, 77, 0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View style={{ width: "100%", maxWidth: 320, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFE5E5", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <AlertTriangle size={28} color="#E53935" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: "700", color: "#12344D", marginBottom: 8, textAlign: "center" }}>
              Hapus Catatan?
            </Text>
            <Text style={{ fontSize: 14, color: "#7A92A5", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              Tindakan ini tidak dapat dibatalkan. Catatan Anda akan dihapus secara permanen.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F0F4F8", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#4A6572" }}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={executeDelete}
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