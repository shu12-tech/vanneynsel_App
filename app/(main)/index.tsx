import ChatInput from "@/components/ChatInput";
import Header from "@/components/Header";
import RecentActivitiesBtn from "@/components/RecentActivities";
import { themes } from "@/constants/Colors";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function Home() {
  const { user, token, expiry } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];

  const displayName = user?.display_name?.match(/^\s*(\S+)/)?.[1] ?? "";

  useEffect(() => {
    if (!token || !expiry) {
      router.replace("/(auth)");
      return;
    }
    const now = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;
    if (expiry < now + tenMinutes) {
      router.replace("/(auth)");
    }
  }, [token, expiry, router]);

  const renderContent = () => (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header />

      {/* First section - 30% with text */}
      <View style={styles.sectionOne}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: theme.text }]}>
            Hallo {displayName}
          </Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Hoe kan ik je helpen
          </Text>
        </View>
      </View>

      {/* Second section - 20% */}
      <View style={styles.sectionTwo}>
        <ChatInput homeScreen={true} />
      </View>

      {/* Third section - 40% */}
      <View style={styles.sectionThree}>{/* <Suggestions /> */}</View>

      {/* Fourth section - 10% */}
      <View style={styles.sectionFour}>
        <RecentActivitiesBtn />
      </View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1 }}>
      {themeName === "van" ? (
        <ImageBackground
          source={require("../../assets/images/main-background.png")}
          style={styles.background}
          resizeMode="cover"
        >
          {renderContent()}
        </ImageBackground>
      ) : (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {renderContent()}
        </View>
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
  sectionOne: {
    flex: 0.25, // 20% of screen
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  sectionTwo: {
    flex: 0.4, // 20% of screen
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  sectionThree: {
    flex: 0.3, // 40% of screen
  },
  sectionFour: {
    flex: 0.12, // 10% of screen
  },
  textContainer: {
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
