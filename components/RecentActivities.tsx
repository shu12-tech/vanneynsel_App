import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import StackedChevrons from "./icons/StackedChevrons";

const RecentActivitiesBtn = () => {
  const router = useRouter();
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];

  const styles = getStyles(theme);

  return (
    <TouchableOpacity onPress={() => router.push("/recent")}>
      <BlurView intensity={100} style={styles.blurContainer}>
        <View style={styles.container}>
          <View style={styles.leftContent}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={theme.text}
            />
            <Text style={styles.text}>Recente activiteiten</Text>
          </View>
          <StackedChevrons width={18} height={24} color={theme.text} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    blurContainer: {
      overflow: "hidden",

      //  margin: 10,
      marginHorizontal: 15,

      padding: 1.5,

      borderWidth: 2,
      borderColor: theme.containerBorder,
      borderRadius: 14,
    },
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingVertical: 10,
      paddingHorizontal: 10,

    //  borderWidth: 2,
      borderColor: theme.containerBorder,
      borderRadius: 12,
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      marginLeft: 10,
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: theme.text,
    },
  });

export default RecentActivitiesBtn;
