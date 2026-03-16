// Header.js
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { themes } from "../constants/Colors";
import { RootState } from "../store";
import { logout } from "../store/authSlice";
import { setAsk, setPrompt } from "../store/promptSlice";
import SettingsIcon from "./icons/SettingsIcon";

const Header = ({}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const themeName = useSelector((state: RootState) => state.theme.theme);
  const theme = themes[themeName];
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(logout());
    router.replace("/");
  };

  const handleAccountSettings = () => {
    setShowDropdown(false);
    router.push("/settings");
  };

  const styles = getStyles(theme, themeName);
  return (
    <>
      {showDropdown && (
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.container}>
      {/* Left - Home Icon (25%) */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => {
            dispatch(setPrompt(""));
            dispatch(setAsk(null));
            router.replace("/");
          }}
          style={styles.leftIconTouch}
        >
          <MaterialCommunityIcons
            name="home-outline"
            size={28}
            color={themeName == "dark" ? "#FFFFFF" : "#808080"}
          />
        </TouchableOpacity>
      </View>

      {/* Center - Logo (50%) */}
      <View style={styles.centerContainer}>
        {/* Replace with your logo image if needed */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Right - Icons (25%) */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          onPress={async () => {
            const url = "http://3.21.30.41/help.html";
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert("Unable to open link", `Can't open URL: ${url}`);
              }
            } catch (err) {
              console.error("Failed to open URL", err);
              Alert.alert(
                "Unable to open link",
                "An error occurred while trying to open the help page."
              );
            }
          }}
          style={{ marginRight: 14 }}
        >
          <MaterialIcons
            name="help-outline"
            size={24}
            color={themeName == "dark" ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            onPress={() => {
              setShowDropdown(!showDropdown);
            }}
          >
            <SettingsIcon
              color={themeName == "dark" ? "#FFFFFF" : "#000000"}
              size={24}
            />
          </TouchableOpacity>
          
          {showDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleAccountSettings}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={themeName == "dark" ? "#FFFFFF" : "#000000"}
                />
                <Text style={styles.dropdownText}>Accountinstellingen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color="#FF0000"
                />
                <Text style={[styles.dropdownText, { color: "#FF0000" }]}>Uitloggen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
    </>
  );
};

const getStyles = (theme: any, themeName: string) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    safeArea: {},
    container: {
      height: 70,
      paddingHorizontal: 15,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftContainer: {
      width: "25%",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    centerContainer: {
      width: "50%",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
    },
    logo: {
      height: 44,
      maxHeight: 44,
      maxWidth: 180,
      resizeMode: "contain",
      alignSelf: "center",
    },
    leftIconTouch: {
      padding: 6,
    },
    rightContainer: {
      width: "25%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 2,
    },
    dropdown: {
      position: "absolute",
      top: 35,
      right: 0,
      width: 207,
      height: 82,
      backgroundColor: themeName === "dark" ? "#121212" : "#FFFFFF",
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.5)",
      gap: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      zIndex: 1000,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      height: 38,
    },
    dropdownText: {
      fontFamily: "Inter",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 16,
      letterSpacing: -0.32,
      color: theme.text,
    },
  });

export default Header;
