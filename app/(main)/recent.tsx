import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { themes } from "@/constants/Colors";
import { clearMessages, getMessages } from "@/store/promptSlice";
import {
  deleteSession,
  getSessions,
  Session,
  setCurrentSession,
} from "@/store/sessionSlice";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";


const groupSessionsByDate = (sessions: Session[]) => {
  const grouped: { [key: string]: Session[] } = {};

  // Sort sessions by created_at in descending order
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  sortedSessions.forEach((session) => {
    const date = new Date(session.created_at);
    const dateString = date.toDateString(); // Group by day

    if (!grouped[dateString]) {
      grouped[dateString] = [];
    }
    grouped[dateString].push(session);
  });

  // Sort the date keys in descending order
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return sortedDates.map((date) => ({
    title: formatDate(new Date(date)),
    data: grouped[date],
  }));
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Vandaag - ${date.toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Gisteren - ${date.toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  return date.toLocaleDateString("nl-NL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function RecentActivities() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const { sessions, loading, error } = useSelector(
    (state: any) => state.session
  );
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  const handleDelete = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedSessionId) {
      dispatch(deleteSession(selectedSessionId));
      setModalVisible(false);
      setSelectedSessionId(null);
    }
  };

  const handleLoadChat = async (sessionId: string) => {
    try {
      dispatch(clearMessages());
      const session = sessions.find((s: Session) => s.session_id === sessionId);
      if (session) {
        await dispatch(setCurrentSession(session));
        await dispatch(getMessages());
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      router.push("/chat");
    }
  };

  const filteredSessions = sessions.filter((session: Session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="window-close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Recente Activiteiten
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "red" }}>
            {error}
          </Text>
        ) : (
          <SectionList
            sections={groupedSessions}
            keyExtractor={(item) => item.session_id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.itemContainer,
                  { borderBottomColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => handleLoadChat(item.session_id)}
                >
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.itemText, { color: theme.text }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.session_id)}
                >
                 
                   <MaterialIcons name="delete-outline" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={[
                  styles.sectionHeaderContainer,
                  { borderBottomColor: theme.border },
                ]}
              >
                <Text style={[styles.sectionHeader, { color: theme.text }]}>
                  {title}
                </Text>
              </View>
            )}
            contentContainerStyle={[
              styles.listContentContainer,
              { backgroundColor: theme.recentBackground },
            ]}
          />
        )}
      </View>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
       
        <MaterialIcons name="search" size={24} color="gray"
          style={styles.searchIcon} />
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => router.push("/search")}
        >
          <Text style={{ fontSize: 16, color: "gray" }}>Zoekopdracht</Text>
        </TouchableOpacity>
      </View>

      <DeleteConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {themeName === "van" ? (
        <ImageBackground
          source={require("../../assets/images/main-background.png")}
          style={styles.background}
          resizeMode="cover"
        >
          {renderContent()}
        </ImageBackground>
      ) : (
        renderContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
      background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
   // borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    marginLeft: 16,
  },
  listContentContainer: {
    paddingHorizontal: 16,
  },
  sectionHeaderContainer: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
  chatItem: {
    flex: 1,
  },
  deleteButton: {
    paddingLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
    justifyContent: "center",
  },
});
