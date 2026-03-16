import { useTheme } from "@/hooks/useTheme";
import { RootState } from "@/store";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProfileImage from "@/components/settings/ProfileImage";
import ThemeSelector from "@/components/settings/ThemeSelector";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";


export default function Settings() {
  const theme = useTheme();
  const currentTheme = useSelector((state: RootState) => state.theme.theme);

  const email = useSelector((state: any) => state.auth.user?.username);

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Instellingen
        </Text>
      </View>
      <View style={styles.container}>
        <ProfileImage />

        <View style={styles.emailContainer}>
          <Text style={[styles.emailLabel, { color: currentTheme == 'dark' ? "#FFF" : "#4D4D4D" }]}>e-mail</Text>
          <Text style={[styles.emailText, { color: theme.text }]} numberOfLines={1}>
            {email ?? ""}
          </Text>
        </View>

        <ThemeSelector />

     
      </View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme === "van" ? "#FFF4FD" : theme.background }}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  emailContainer: {
    marginVertical: 20,
    marginLeft: 22,
  },
  emailLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_500Medium",
    marginLeft: 16,
  },
  safeArea: {
    flex: 1,
  },
  logoutContainer: {
    marginTop: 50,
    marginLeft: 22,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginLeft: 12,
  },
});

