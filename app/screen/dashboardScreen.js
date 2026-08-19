import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, ChevronRight, FileText, Plus, Clock3, CheckCircle2, CircleUserRound, Settings } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

export default function DashboardScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) { 
      router.replace("/auth/AuthScreen"); 
      return; 
    }

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error.message);
      setNotes([]);
    } else {
      setNotes(data || []);
    }

    setLoading(false);
    setRefreshing(false);
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

  const formatDate = (date) => {
    const noteDate = new Date(date);

    return noteDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    const noteDate = new Date(date);

    return noteDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4FAFF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FAFF" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#168CF5" />
        } 
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 55, paddingBottom: 110 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <View>
            <Text style={{ fontSize: 14, color: "#7893A6", marginBottom: 5 }}> Welcome back </Text>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#12344D", letterSpacing: -0.5 }}> noteapp </Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#DDEEF8" }}>
            <Bell size={21} color="#168CF5" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#168CF5", borderRadius: 24, padding: 22, marginBottom: 22, overflow: "hidden" }}>
          <View style={{ position: "absolute", width: 150, height: 150, borderRadius: 100, backgroundColor: "#42A6FF", right: -60, top: -60, opacity: 0.45 }} />
          <Text style={{ color: "#DCEFFF", fontSize: 13, fontWeight: "600", marginBottom: 8 }}> YOUR NOTES </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 38, fontWeight: "800", marginBottom: 4 }}> {loading ? "..." : notes.length} </Text>
          <Text style={{ color: "#DCEFFF", fontSize: 14 }}> Notes saved in your account </Text>

          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/screen/addnoteScreen")} style={{ marginTop: 20, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 }}>
            <Plus size={17} color="#168CF5" strokeWidth={2.5} />
            <Text style={{ marginLeft: 7, color: "#168CF5", fontWeight: "800", fontSize: 13 }}> New Note </Text>
          </TouchableOpacity>
        </View>


        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Text style={{ fontSize: 19, fontWeight: "800", color: "#12344D" }}> Recent Notes </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/notes")} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#168CF5", fontSize: 13, fontWeight: "700" }}> View all </Text>
            <ChevronRight size={16} color="#168CF5" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 17, padding: 22, alignItems: "center", borderWidth: 1, borderColor: "#E0EFF8" }}>
            <Text style={{ color: "#7893A6", fontSize: 13 }}> Loading notes... </Text>
          </View>
        ) : notes.length === 0 ? (
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 17, padding: 30, alignItems: "center", borderWidth: 1, borderColor: "#E0EFF8" }}>
            <View style={{ width: 52, height: 52, borderRadius: 15, backgroundColor: "#EAF7FF", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <FileText size={24} color="#168CF5" strokeWidth={2} />
            </View>

            <Text style={{ fontSize: 16, fontWeight: "800", color: "#12344D", marginBottom: 5 }}> No notes yet </Text>
            <Text style={{ fontSize: 13, color: "#7893A6", textAlign: "center", marginBottom: 18 }}> Create your first note to get started. </Text>

            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/screen/addnoteScreen")} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#168CF5", paddingHorizontal: 17, paddingVertical: 11, borderRadius: 12 }}>
              <Plus size={17} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800", marginLeft: 7 }}> Create Note </Text>
            </TouchableOpacity>
          </View>
        ) : (
          notes.slice(0, 5).map((note) => (
            <TouchableOpacity 
              key={note.id} 
              activeOpacity={0.8} 
              onPress={() => router.push(`/screen/detailScreen?id=${note.id}`)}
              style={{ backgroundColor: "#FFFFFF", borderRadius: 17, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E0EFF8" }}
            >
              <View style={{ width: 43, height: 43, borderRadius: 12, backgroundColor: "#EAF7FF", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color="#168CF5" strokeWidth={2} />
              </View>

              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: "#193B52", marginBottom: 5 }}> 
                  {note.title} 
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock3 size={13} color="#91A8B8" strokeWidth={2} />
                  <Text style={{ marginLeft: 5, fontSize: 11, color: "#91A8B8" }}>
                    {formatDate(note.created_at)} · {formatTime(note.created_at)}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#A8BDCB" strokeWidth={2} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{ position: "absolute", left: 16, right: 16, bottom: 18, height: 68, backgroundColor: "#FFFFFF", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderWidth: 1, borderColor: "#E0EFF8", shadowColor: "#12344D", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 }}>
        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: "center", justifyContent: "center" }}>
          <FileText size={21} color="#168CF5" strokeWidth={2.2} />
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#168CF5", marginTop: 4 }}> Home </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("screen/addnoteScreen")} style={{ alignItems: "center", justifyContent: "center" }}>
          <FileText size={21} color="#9AAEBC" strokeWidth={2} />
          <Text style={{ fontSize: 10, color: "#9AAEBC", marginTop: 4 }}> Notes </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("screen/profileScreen")} style={{ alignItems: "center", justifyContent: "center" }}>
          <CircleUserRound size={21} color="#9AAEBC" strokeWidth={2} />
          <Text style={{ fontSize: 10, color: "#9AAEBC", marginTop: 4 }}> Profile </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: "center", justifyContent: "center" }}>
          <Settings size={21} color="#9AAEBC" strokeWidth={2} />
          <Text style={{ fontSize: 10, color: "#9AAEBC", marginTop: 4 }}> Settings </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}