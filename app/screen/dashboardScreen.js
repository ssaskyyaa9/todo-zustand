import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Sun,
  Moon,
  ChevronRight,
  FileText,
  Plus,
  Clock3,
  CircleUserRound,
  Settings,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { useNoteStore } from "../../store/useNoteStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function DashboardScreen() {
  const router = useRouter();

  const { notes, setNotes } = useNoteStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==============================
  // THEME
  // ==============================

  const theme = {
    bg: isDarkMode ? "#121212" : "#F4FAFF",
    cardBg: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    cardBorder: isDarkMode ? "#333333" : "#E0EFF8",
    textPrimary: isDarkMode ? "#FFFFFF" : "#12344D",
    textSecondary: isDarkMode ? "#AAAAAA" : "#7893A6",
    primary: "#168CF5",
    todoColor: "#22C55E",
  };

  // ==============================
  // FILTER DATA
  // ==============================

  const todoItems = notes.filter(
    (item) => item.type === "todo"
  );

  const noteItems = notes.filter(
    (item) => item.type !== "todo"
  );

  // Todo yang belum selesai
  const remainingTodoCount = todoItems.filter(
    (item) => !item.completed
  ).length;

  // Total Todo
  const totalTodoCount = todoItems.length;

  // Total Note
  const totalNoteCount = noteItems.length;

  // ==============================
  // LOAD DATA SUPABASE
  // ==============================

  const loadNotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/AuthScreen");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log(
          "Error Fetch Supabase:",
          error.message
        );
      } else {
        setNotes(data || []);
      }
    } catch (err) {
      console.log(
        "Catch Error:",
        err?.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==============================
  // LOAD SETIAP MASUK DASHBOARD
  // ==============================

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  // ==============================
  // REFRESH
  // ==============================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
  };

  // ==============================
  // TOGGLE TODO
  // ==============================

  const handleToggle = async (
    id,
    currentStatus
  ) => {
    const nextStatus = !currentStatus;

    // Update Zustand langsung
    const updatedNotes = notes.map((item) =>
      item.id === id
        ? {
          ...item,
          completed: nextStatus,
        }
        : item
    );

    setNotes(updatedNotes);

    // Update Supabase
    const { error } = await supabase
      .from("notes")
      .update({
        completed: nextStatus,
      })
      .eq("id", id);

    if (error) {
      console.log(
        "Gagal memperbarui status:",
        error.message
      );

      // Kalau gagal, kembalikan state
      const rollbackNotes = notes.map((item) =>
        item.id === id
          ? {
            ...item,
            completed: currentStatus,
          }
          : item
      );

      setNotes(rollbackNotes);
    }
  };

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ==============================
  // FORMAT TIME
  // ==============================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ==============================
  // RENDER TODO
  // ==============================

  const renderTodoItem = ({ item }) => {
    const completed = Boolean(
      item.completed
    );

    return (
      <View
        style={{
          backgroundColor: theme.cardBg,
          borderRadius: 17,
          padding: 14,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.cardBorder,
        }}
      >
        {/* CHECKBOX */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            handleToggle(
              item.id,
              completed
            )
          }
          style={{
            paddingHorizontal: 6,
            paddingVertical: 4,
          }}
        >
          {completed ? (
            <CheckSquare
              size={22}
              color={theme.todoColor}
              strokeWidth={2.2}
            />
          ) : (
            <Square
              size={22}
              color={theme.textSecondary}
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>

        {/* TODO CONTENT */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              `/screen/detailScreen?id=${item.id}`
            )
          }
          style={{
            flex: 1,
            marginLeft: 10,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: theme.textPrimary,
              marginBottom: 4,
              textDecorationLine: completed
                ? "line-through"
                : "none",
              opacity: completed
                ? 0.5
                : 1,
            }}
          >
            {item.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Clock3
              size={12}
              color={theme.textSecondary}
              strokeWidth={2}
            />

            <Text
              style={{
                marginLeft: 5,
                fontSize: 11,
                color: theme.textSecondary,
              }}
            >
              {formatDate(item.created_at)}
              {" · "}
              {formatTime(item.created_at)}
            </Text>
          </View>
        </TouchableOpacity>

        <ChevronRight
          size={18}
          color={theme.textSecondary}
          strokeWidth={2}
        />
      </View>
    );
  };

  // ==============================
  // RENDER NOTE
  // ==============================

  const renderNoteItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push(
            `/screen/detailScreen?id=${item.id}`
          )
        }
        style={{
          backgroundColor: theme.cardBg,
          borderRadius: 17,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: theme.cardBorder,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {/* ICON NOTE */}

          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: isDarkMode
                ? "#26384A"
                : "#EAF7FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText
              size={20}
              color={theme.primary}
              strokeWidth={2}
            />
          </View>

          {/* NOTE CONTENT */}

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: theme.textPrimary,
                marginBottom: 5,
              }}
            >
              {item.title}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                fontSize: 12,
                lineHeight: 18,
                color: theme.textSecondary,
                marginBottom: 7,
              }}
            >
              {item.content}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Clock3
                size={12}
                color={theme.textSecondary}
                strokeWidth={2}
              />

              <Text
                style={{
                  marginLeft: 5,
                  fontSize: 11,
                  color: theme.textSecondary,
                }}
              >
                {formatDate(item.created_at)}
                {" · "}
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>

          <ChevronRight
            size={18}
            color={theme.textSecondary}
            strokeWidth={2}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // ==============================
  // HEADER
  // ==============================

  const ListHeader = () => (
    <>
      {/* HEADER */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              marginBottom: 5,
            }}
          >
            Welcome back
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: theme.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            todo-global
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: theme.cardBg,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        >
          {isDarkMode ? (
            <Sun
              size={21}
              color="#FFD700"
              strokeWidth={2}
            />
          ) : (
            <Moon
              size={21}
              color={theme.primary}
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* COUNTER */}

      <View
        style={{
          backgroundColor: theme.primary,
          borderRadius: 24,
          padding: 22,
          marginBottom: 22,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: 100,
            backgroundColor: "#42A6FF",
            right: -60,
            top: -60,
            opacity: 0.45,
          }}
        />

        <Text
          style={{
            color: "#DCEFFF",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          TUGAS TERSISA
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 38,
            fontWeight: "800",
            marginBottom: 4,
          }}
        >
          {loading
            ? "..."
            : remainingTodoCount}
        </Text>

        <Text
          style={{
            color: "#DCEFFF",
            fontSize: 14,
          }}
        >
          {totalTodoCount} Todo · {totalNoteCount} Note
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/screen/addnoteScreen"
            )
          }
          style={{
            marginTop: 20,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 16,
            paddingVertical: 11,
            borderRadius: 12,
          }}
        >
          <Plus
            size={17}
            color={theme.primary}
            strokeWidth={2.5}
          />

          <Text
            style={{
              marginLeft: 7,
              color: theme.primary,
              fontWeight: "800",
              fontSize: 13,
            }}
          >
            Tambah
          </Text>
        </TouchableOpacity>
      </View>

      {/* TODO SECTION */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 19,
              fontWeight: "800",
              color: theme.textPrimary,
            }}
          >
            Daftar To-Do
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: theme.textSecondary,
              marginTop: 3,
            }}
          >
            {remainingTodoCount} tugas belum selesai
          </Text>
        </View>
      </View>
    </>
  );

  // ==============================
  // MAIN LIST
  // ==============================

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg,
      }}
    >
      <StatusBar
        barStyle={
          isDarkMode
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={theme.bg}
      />

      <FlatList
        data={notes}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => {
          if (item.type === "todo") {
            return renderTodoItem({
              item,
            });
          }

          return renderNoteItem({
            item,
          });
        }}
        ListHeaderComponent={
          ListHeader
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 55,
          paddingBottom: 110,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 17,
                padding: 22,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }}
            >
              <ActivityIndicator
                color={theme.primary}
                size="small"
              />

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                Memuat data...
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 17,
                padding: 30,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 15,
                  backgroundColor:
                    isDarkMode
                      ? "#2A2A2A"
                      : "#EAF7FF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <FileText
                  size={24}
                  color={theme.primary}
                  strokeWidth={2}
                />
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: theme.textPrimary,
                  marginBottom: 5,
                }}
              >
                Belum ada data
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                Buat catatan atau todo
                pertama kamu.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    "/screen/addnoteScreen"
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    theme.primary,
                  paddingHorizontal: 17,
                  paddingVertical: 11,
                  borderRadius: 12,
                }}
              >
                <Plus
                  size={17}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: "800",
                    marginLeft: 7,
                  }}
                >
                  Buat Baru
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* ==============================
          BOTTOM NAVIGATION
      ============================== */}

      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          height: 68,
          backgroundColor: theme.cardBg,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          borderWidth: 1,
          borderColor: theme.cardBorder,
          elevation: 5,
        }}
      >
        {/* HOME */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText
            size={21}
            color={theme.primary}
            strokeWidth={2.2}
          />

          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: theme.primary,
              marginTop: 4,
            }}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* NOTES */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push(
              "/screen/addnoteScreen"
            )
          }
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText
            size={21}
            color={theme.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            Notes
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push(
              "/screen/profileScreen"
            )
          }
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircleUserRound
            size={21}
            color={theme.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            Profile
          </Text>
        </TouchableOpacity>

        {/* SETTINGS */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Settings
            size={21}
            color={theme.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={{
              fontSize: 10,
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}