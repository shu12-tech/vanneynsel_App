import { useRouter } from "expo-router";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import EyeIcon from "../../components/icons/EyeIcon";
import { AppDispatch, RootState } from "../../store";
import { clearError, getMe, login, setEmail } from "../../store/authSlice";

const { width: screenWidth } = Dimensions.get("window");

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    email: storedEmail,
    loading,
    error,
    success,
    isAuthenticated,
  } = useSelector((state: RootState) => state.auth);

  const [emailID, setEmailID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        // Scroll to bottom when keyboard hides to show login button
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Handle login submission
  const handleLogin = async () => {
    if (!emailID || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Update email in Redux
    dispatch(setEmail(emailID));

    // Dispatch login thunk
    const result = await dispatch(login({ email: emailID, password }));

    if (login.fulfilled.match(result)) {
      dispatch(getMe());
      router.replace("/(main)");
    } else {
      // Handle error case
      const errorMessage = result.payload || "Login failed";
      Alert.alert("Error", errorMessage);
    }
  };

  // Clear error on unmount or button press if needed
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Show error if present
  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // If already authenticated, redirect (optional)
  useEffect(() => {
    if (isAuthenticated) {
      // Navigate away
      // e.g., navigation.navigate('Home');
    }
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/auth/authBackground.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
          style={styles.safeArea}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <View
              style={[
                styles.topSection,
                keyboardVisible && styles.topSectionKeyboard,
              ]}
            >
              {!keyboardVisible && (
                <Image
                  source={require("../../assets/images/auth/authMain.png")}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              )}
              <Image
                source={require("../../assets/images/logo.png")}
                style={[
                  styles.logoImage,
                  keyboardVisible && styles.logoImageKeyboard,
                ]}
                resizeMode="contain"
              />
            </View>

            <View style={[styles.bottomSection, { paddingBottom: 0 }]}>
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.loginTitle}>Login </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    E-mail-ID <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Voer e-mailadres in"
                    placeholderTextColor="#999"
                    value={emailID}
                    onChangeText={(text) => {
                      setEmailID(text);
                      dispatch(setEmail(text));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={[styles.inputContainer, { marginBottom: 7 }]}>
                  <Text style={styles.inputLabel}>
                    Wachtwoord <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Voer wachtwoord in"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon
                        size={20}
                        color="#666666"
                        accessibilityLabel={
                          showPassword
                            ? "Verberg wachtwoord"
                            : "Toon wachtwoord"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>
                    Wachtwoord vergeten?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "Logging in..." : "Login"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View
              pointerEvents="none"
              style={[styles.bottomSafeBackground, { height: insets.bottom }]}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </ImageBackground>
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
  topSection: {
    flex: 0.9,
    padding: 20,
    paddingTop: 20,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  topSectionKeyboard: {
    display: "none",
  },
  mainImage: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.7,
    marginBottom: -15,
    alignSelf: "center",
    resizeMode: "contain",
  },
  logoImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.15,
    alignSelf: "flex-start",
    marginTop: 0,
    marginBottom: 15,
    resizeMode: "contain",
  },
  logoImageKeyboard: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.15,
    alignSelf: "center",
    marginTop: 10,
    resizeMode: "contain",
  },
  bottomSection: {
    flex: 0.9,
    backgroundColor: "#FFFFFF66",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  bottomSafeBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF66",
  },
  loginTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FF0000",
    marginBottom: 18,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#4D4D4D",
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: "#E91E63",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 18,
    color: "#666",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 15,
    marginRight: 10,
  },
  forgotPasswordText: {
    color: "#595959",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  loginButton: {
    backgroundColor: "#BD0B5E",
    borderRadius: 25,
    paddingVertical: 9,
    height: 44,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 2,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  loginButtonDisabled: {
    backgroundColor: "#BD0B5E80",
  },
});
