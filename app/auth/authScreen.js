import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Data belum lengkap",
        "Email dan password wajib diisi."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password terlalu pendek",
        "Password minimal 6 karakter."
      );
      return;
    }

    if (isLogin) {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        Alert.alert("Login gagal", error.message);
        return;
      }

      if (data?.user) {
        router.replace("/screen/dashboardScreen");
      }
    } else {
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

      if (error) {
        Alert.alert("Register gagal", error.message);
        return;
      }

      if (data?.user) {
        Alert.alert(
          "Register berhasil",
          "Akun berhasil dibuat. Silakan login."
        );

        setMode("login");
        setPassword("");
      }
    }
  }

  function changeMode(selectedMode) {
    setMode(selectedMode);
    setEmail("");
    setPassword("");
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#EAF7FF", }} behavior={Platform.OS === "ios" ? "padding" : undefined} >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40, }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} >
        <View style={{ alignItems: "center", marginBottom: 28, }} >
          <Text style={{ fontSize: 40, fontWeight: "800", color: "#168CF5", letterSpacing: -1, }} > noteapp </Text>
          <Text style={{ marginTop: 6, fontSize: 14, color: "#6C8DA5", }} > Your simple place for simple notes.
          </Text>
        </View>

        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22, shadowColor: "#168CF5", shadowOffset: { width: 0, height: 8, }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6, }} >
          <View style={{ flexDirection: "row", backgroundColor: "#EAF7FF", borderRadius: 14, padding: 4, marginBottom: 28, }} >
            <TouchableOpacity activeOpacity={0.8} onPress={() => changeMode("register")} style={{ flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: !isLogin ? "#168CF5" : "transparent", }} >
              <Text style={{ fontSize: 15, fontWeight: !isLogin ? "800" : "600", color: !isLogin ? "#FFFFFF" : "#6C8DA5", }} > Register </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => changeMode("login")} style={{ flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: isLogin ? "#168CF5" : "transparent", }} >
              <Text style={{ fontSize: 15, fontWeight: isLogin ? "800" : "600", color: isLogin ? "#FFFFFF" : "#6C8DA5", }} > Login </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 25, fontWeight: "800", color: "#12344D", marginBottom: 6, }} > {isLogin ? "Welcome back!" : "Create your account"} </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: "#7A98AD", marginBottom: 24, }} > {isLogin ? "Login to continue to your notes." : "Register to start creating your notes."} </Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#31566F", marginBottom: 8, }} > Email </Text>

          <TextInput style={{ height: 52, borderWidth: 1, borderColor: "#CDE7F7", borderRadius: 13, paddingHorizontal: 16, fontSize: 15, color: "#12344D", backgroundColor: "#F9FDFF", marginBottom: 18, }} placeholder="Enter your email" placeholderTextColor="#91AFC4" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#31566F", marginBottom: 8, }} > Password </Text>
          <TextInput style={{ height: 52, borderWidth: 1, borderColor: "#CDE7F7", borderRadius: 13, paddingHorizontal: 16, fontSize: 15, color: "#12344D", backgroundColor: "#F9FDFF", marginBottom: 18, }} placeholder="Enter your password" placeholderTextColor="#91AFC4" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />

          <TouchableOpacity activeOpacity={0.8} onPress={handleAuth} style={{ height: 54, backgroundColor: "#168CF5", borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 18, shadowColor: "#168CF5", shadowOffset: { width: 0, height: 5, }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4, }} >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", }} > {isLogin ? "Login" : "Create Account"} </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => changeMode( isLogin ? "register" : "login" ) } >
            <Text style={{ textAlign: "center", color: "#168CF5", fontSize: 14, fontWeight: "600", }} >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}