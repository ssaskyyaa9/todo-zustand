import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator, } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save, FileText, CheckSquare, Trash2, } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useNoteStore } from "../../store/useNoteStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function AddNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addNote, updateNote, removeNote } = useNoteStore();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEditMode = Boolean(id);

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
    todoColor: "#22C55E",
  };

  useEffect(() => {
    if (isEditMode) {
      fetchNoteDetail();
    }
  }, [id]);

  const fetchNoteDetail = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("title, content, type, completed")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        Alert.alert("Error", "Gagal memuat catatan.");
        router.back();
        return;
      }

      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");

        if (data.type === "todo") {
          setNoteType("todo");
        } else {
          setNoteType("note");
        }
      }
    } catch (err) {
      Alert.alert( "Error", err?.message || "Terjadi kesalahan saat memuat data." );
    } finally {
      setLoading(false);
    }
  };
  
  async function saveNote() {
    if (!title.trim()) {
      Alert.alert(
        noteType === "todo"
          ? "Todo belum diisi"
          : "Title belum diisi",
        noteType === "todo"
          ? "Silakan masukkan nama todo."
          : "Silakan masukkan judul catatan."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        noteType === "todo"
          ? "Description belum diisi"
          : "Content belum diisi",
        noteType === "todo"
          ? "Silakan masukkan detail todo."
          : "Silakan masukkan isi catatan."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Session error",
          "User belum login. Silakan login kembali."
        );
        return;
      }

      if (isEditMode) {
        const { data, error } = await supabase
          .from("notes")
          .update({
            title: title.trim(),
            content: content.trim(),
            type: noteType,
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          updateNote(id, data[0]);
        }
      }

      else {
        const { data, error } = await supabase
          .from("notes")
          .insert([
            {
              user_id: user.id,
              title: title.trim(),
              content: content.trim(),
              type: noteType,
              completed: false,
            },
          ])
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          addNote(data[0]);
        }
      }

      router.replace("/screen/dashboardScreen");
    } catch (err) {
      Alert.alert( "Gagal menyimpan", err?.message || "Terjadi kesalahan pada database." );
    } finally {
      setSaving(false);
    }
  }

  function deleteNote() {
    Alert.alert(
      noteType === "todo" ? "Hapus Todo" : "Hapus Catatan",
      noteType === "todo"
        ? "Apakah Anda yakin ingin menghapus todo ini?"
        : "Apakah Anda yakin ingin menghapus catatan ini?",
      [
        { text: "Batal", style: "cancel", },
        { text: "Hapus", style: "destructive",

          onPress: async () => {
            setSaving(true);

            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                Alert.alert(
                  "Session error",
                  "User belum login."
                );
                return;
              }

              const { error } = await supabase
                .from("notes")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

              if (error) { throw error; }

              removeNote(id);
              router.replace( "/screen/dashboardScreen" );
            } catch (err) {
              Alert.alert(
                "Gagal menghapus",
                err?.message || "Terjadi kesalahan."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg, }} > <ActivityIndicator size="large" color={theme.primary} /> </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg, }} behavior={ Platform.OS === "ios" ? "padding" : undefined } >
      <StatusBar barStyle={ isDarkMode ? "light-content" : "dark-content" } backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 55, paddingBottom: 40, }} >

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28, }} >
          <View style={{ flexDirection: "row", alignItems: "center", }} >
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.cardBorder, }} >
              <ArrowLeft size={21} color={theme.textPrimary} strokeWidth={2} />
            </TouchableOpacity>

            <View style={{ marginLeft: 14, }} >
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 3, }} > {noteType === "todo" ? "TODO" : "NOTES"} </Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: theme.textPrimary, }} > {isEditMode ? noteType === "todo" ? "Edit Todo" : "Edit Note" : noteType === "todo" ? "New Todo" : "New Note"} </Text>
            </View>
          </View>

          {isEditMode && (
            <TouchableOpacity activeOpacity={0.7} onPress={deleteNote} disabled={saving} style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "#FFE5E5", alignItems: "center", justifyContent: "center", }} >
              <Trash2 size={21} color="#E53935" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {!isEditMode && (
          <View style={{ backgroundColor: theme.cardBg, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 24, }} >
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.labelColor, marginBottom: 12, }} > What do you want to create? </Text>
            <View style={{ flexDirection: "row", }} >

              <TouchableOpacity activeOpacity={0.8} onPress={() => setNoteType("note") }
                style={{ flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 6, backgroundColor: noteType === "note" ? theme.primary : theme.inputBg, borderWidth: 1, borderColor: noteType === "note" ? theme.primary : theme.inputBorder, }}
              >
                <FileText size={25} color={ noteType === "note" ? "#FFFFFF" : theme.textSecondary } />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "800", color: noteType === "note" ? "#FFFFFF" : theme.textPrimary, }} > Note </Text>
                <Text style={{ marginTop: 3, fontSize: 11, color: noteType === "note" ? "#DCEFFF" : theme.textSecondary, }} > Catatan biasa </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={() => setNoteType("todo") }
                style={{ flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: "center", justifyContent: "center", marginLeft: 6, backgroundColor: noteType === "todo" ? theme.todoColor : theme.inputBg, borderWidth: 1, borderColor: noteType === "todo" ? theme.todoColor : theme.inputBorder, }}
              >
                <CheckSquare size={25} color={ noteType === "todo" ? "#FFFFFF" : theme.textSecondary } />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "800", color: noteType === "todo" ? "#FFFFFF" : theme.textPrimary, }} > Todo </Text>
                <Text style={{ marginTop: 3, fontSize: 11, color: noteType === "todo" ? "#E9FFF0" : theme.textSecondary, }} > Dengan checklist </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ backgroundColor: noteType === "todo" ? theme.todoColor : theme.primary, borderRadius: 22, padding: 20, marginBottom: 24, flexDirection: "row", alignItems: "center", }} >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", }} >
            {noteType === "todo" ? (
              <CheckSquare size={23} color={theme.todoColor} strokeWidth={2} />
            ) : (
              <FileText size={23} color={theme.primary} strokeWidth={2} />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 14, }} >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginBottom: 4, }} > {noteType === "todo" ? isEditMode ? "Update your task" : "Create a new todo" : isEditMode ? "Update your thought" : "Create something new"} </Text>
            <Text style={{ color: noteType === "todo" ? "#E9FFF0" : "#DCEFFF", fontSize: 12, lineHeight: 18, }} >
              {noteType === "todo"
                ? "Create a task that you can check when completed."
                : "Write down your thoughts, ideas, or important notes."}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.cardBg, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: theme.cardBorder, }} >
          <Text style={{ fontSize: 14, fontWeight: "700", color: theme.labelColor, marginBottom: 9, }} > {noteType === "todo" ? "Task" : "Title"} </Text>
          <TextInput value={title} onChangeText={setTitle}
            placeholder={ noteType === "todo" ? "What needs to be done?" : "Give your note a title" }
            placeholderTextColor={ theme.textSecondary } autoCapitalize="sentences"
            style={{ height: 54, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, color: theme.textPrimary, marginBottom: 22, }}
          />

          <Text style={{ fontSize: 14, fontWeight: "700", color: theme.labelColor, marginBottom: 9, }} > {noteType === "todo" ? "Description" : "Content"} </Text>
          <TextInput value={content} onChangeText={setContent}
            placeholder={ noteType === "todo" ? "Add some details about this task..." : "Write your note here..." }
            placeholderTextColor={ theme.textSecondary } multiline textAlignVertical="top" autoCapitalize="sentences"
            style={{ minHeight: 230, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 14, padding: 16, fontSize: 15, lineHeight: 23, color: theme.textPrimary, marginBottom: 22, }}
          />

          <TouchableOpacity activeOpacity={0.8} onPress={saveNote} disabled={saving}
            style={{ height: 55, backgroundColor: saving ? "#8BC8F8" : noteType === "todo" ? theme.todoColor : theme.primary, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={19} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 8, }} >
                  {isEditMode ? noteType === "todo" ? "Update Todo" : "Update Note" : noteType === "todo" ? "Save Todo" : "Save Note"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}