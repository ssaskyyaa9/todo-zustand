import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator, } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save, FileText, Trash2 } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

export default function AddNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(id);
  useEffect(() => {
    if (isEditMode) {
      fetchNoteDetail();
    }
  }, [id]);

  const fetchNoteDetail = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error", "Gagal memuat catatan.");
      router.back();
    } else {
      setTitle(data.title || "");
      setContent(data.content || "");
    }
    setLoading(false);
  };

  async function saveNote() {
    if (!title.trim()) {
      Alert.alert("Title belum diisi", "Silakan masukkan judul catatan.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Content belum diisi", "Silakan masukkan isi catatan.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      Alert.alert("Session error", "User belum login. Silakan login kembali.");
      router.replace("/auth/AuthScreen");
      return;
    }

    let error;

    if (isEditMode) {
      const response = await supabase
        .from("notes")
        .update({ title: title.trim(), content: content.trim() })
        .eq("id", id);
      error = response.error;
    } else {
      const response = await supabase
        .from("notes")
        .insert({ user_id: user.id, title: title.trim(), content: content.trim() });
      error = response.error;
    }

    setSaving(false);

    if (error) {
      Alert.alert("Gagal menyimpan", error.message);
      return;
    }

    Alert.alert(
      "Berhasil",
      isEditMode ? "Catatan diperbarui." : "Catatan disimpan.",
      [{ text: "OK", onPress: () => router.replace("/dashboard") }]
    );
  }

  function deleteNote() {
    Alert.alert(
      "Hapus Catatan",
      "Apakah Anda yakin ingin menghapus catatan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            const { error } = await supabase.from("notes").delete().eq("id", id);
            setSaving(false);

            if (error) {
              Alert.alert("Gagal menghapus", error.message);
            } else {
              Alert.alert("Terhapus", "Catatan berhasil dihapus.", [
                { text: "OK", onPress: () => router.replace("/dashboard") },
              ]);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4FAFF" }}>
        <ActivityIndicator size="large" color="#168CF5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F4FAFF" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FAFF" />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 55, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#DDEEF8" }}>
              <ArrowLeft size={21} color="#12344D" strokeWidth={2} />
            </TouchableOpacity>

            <View style={{ marginLeft: 14 }}>
              <Text style={{ fontSize: 12, color: "#7893A6", marginBottom: 3 }}> NOTES </Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#12344D" }}>
                {isEditMode ? "Edit Note" : "New Note"}
              </Text>
            </View>
          </View>

          {isEditMode && (
            <TouchableOpacity activeOpacity={0.7} onPress={deleteNote} disabled={saving} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "#FFE5E5", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={21} color="#E53935" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ backgroundColor: "#168CF5", borderRadius: 22, padding: 20, marginBottom: 24, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <FileText size={23} color="#168CF5" strokeWidth={2} />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginBottom: 4 }}>
              {isEditMode ? "Update your thought" : "Create something new"}
            </Text>
            <Text style={{ color: "#DCEFFF", fontSize: 12, lineHeight: 18 }}> Write down your thoughts, ideas, or important notes. </Text>
          </View>
        </View>

        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, borderWidth: 1, borderColor: "#E0EFF8" }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#31566F", marginBottom: 9 }}> Title </Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Give your note a title" placeholderTextColor="#91AFC4" autoCapitalize="sentences" style={{ height: 54, backgroundColor: "#F9FDFF", borderWidth: 1, borderColor: "#CDE7F7", borderRadius: 14, paddingHorizontal: 16, fontSize: 15, color: "#12344D", marginBottom: 22 }} />
          
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#31566F", marginBottom: 9 }}> Content </Text>
          <TextInput value={content} onChangeText={setContent} placeholder="Write your note here..." placeholderTextColor="#91AFC4" multiline textAlignVertical="top" autoCapitalize="sentences" style={{ minHeight: 230, backgroundColor: "#F9FDFF", borderWidth: 1, borderColor: "#CDE7F7", borderRadius: 14, padding: 16, fontSize: 15, lineHeight: 23, color: "#12344D", marginBottom: 22 }} />

          <TouchableOpacity activeOpacity={0.8} onPress={saveNote} disabled={saving} style={{ height: 55, backgroundColor: saving ? "#8BC8F8" : "#168CF5", borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            <Save size={19} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 8 }}>
              {saving ? "Saving..." : isEditMode ? "Update Note" : "Save Note"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}