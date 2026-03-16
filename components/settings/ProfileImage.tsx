import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

export default function ProfileImage() {
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const { user } = useSelector((state: any) => state.auth);

  const theme = themes[themeName];

  const displayName: string | undefined =
    user?.display_name || user?.name || "";

  // derive initials from first and last name
  const initials = (() => {
    if (!displayName) return "";
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  })();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.initialsContainer]}>
        <Text style={[styles.initialsText]}> {initials} </Text>
      </View>
      <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
        {displayName || "Anonymous"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  initialsContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#FFF5A8",
    borderColor: "#A39D6B",
  },
  initialsText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    textAlign: "center",
    color: "#0000",
  },
  nameText: {
    marginTop: 8,
    fontSize: 18,
    textAlign: "center",
    fontFamily: 'Inter_500Medium',
  },
});
