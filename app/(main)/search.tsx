import { themes } from "@/constants/Colors";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { AppDispatch, RootState } from "@/store";
import { clearMessages, getMessages } from "@/store/promptSlice";
import { getSessions, Session, setCurrentSession } from "@/store/sessionSlice";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";



export default function Search() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState("");

  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();

  const styles = getStyles(theme);

  const { sessions, loading, error } = useSelector(
    (state: any) => state.session
  );

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

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
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
          <Feather
            name="search"
            size={20}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Zoekopdracht"
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>

        <ScrollView>
          {(searchText
            ? sessions.filter((session: Session) =>
                session.name.toLowerCase().includes(searchText.toLowerCase())
              )
            : sessions
                .slice()
                .sort(
                  (a: Session, b: Session) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 5)
          ).map((session: Session) => (
            <TouchableOpacity
              key={session.session_id}
              style={styles.historyItem}
              onPress={() =>
                handleLoadChat(session.session_id)
              }
            >
              <Feather name="clock" size={20} color={theme.text} />
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.historyText}>{session.name}</Text>
              <Feather name="arrow-up-left" size={20} color={theme.text} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

   
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    background: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
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
      color: theme.text,
    },
    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
        backgroundColor: theme.recentBackground,
    },
    historyText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      marginLeft: 16,
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
    },
  leftControls: {
    flexDirection: 'row',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  buttonText: {
    marginLeft: 5,
    color: '#555',
    fontFamily: 'Inter_500Medium',
  },
  micButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor:theme.iconPrimaryBg,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  });
