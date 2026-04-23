import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { API_BASE_URL } from "../../constants/api";
import { AppDispatch, RootState } from "../../store";
import {
  clearError,
  completeSSOLogin,
  getMe,
  setEmail,
} from "../../store/authSlice";

const { width: screenWidth } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [emailID, setEmailID] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
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

  const handleMicrosoftLogin = async () => {
    try {
      setSsoLoading(true);

      const redirectUri =
        Platform.OS === "web"
          ? `${window.location.origin}/sso/callback`
          : Linking.createURL("sso/callback", { scheme: "vanneynsel" });

      const params = new URLSearchParams();
      params.set("return_to", redirectUri);

      if (emailID?.trim()) {
        params.set("login_hint", emailID.trim().toLowerCase());
      }

      const authUrl = `${API_BASE_URL}/auth/sso/microsoft/start?${params.toString()}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type !== "success" || !result.url) {
        throw new Error("Microsoft sign-in cancelled or failed.");
      }

      const url = result.url;

      let token = "";
      let username = "";
      let ssoError = "";

      if (url.includes("#")) {
        const hash = url.split("#")[1];
        const hashParams = new URLSearchParams(hash);
        token = hashParams.get("token") || "";
        username = hashParams.get("username") || "";
        ssoError = hashParams.get("error") || "";
      } else {
        const parsed = Linking.parse(url);
        token = String(parsed.queryParams?.token || "");
        username = String(parsed.queryParams?.username || "");
        ssoError = String(parsed.queryParams?.error || "");
      }

      if (ssoError) {
        throw new Error(decodeURIComponent(ssoError));
      }

      if (!token) {
        throw new Error("SSO login did not return a token.");
      }

      const ssoResult = await dispatch(completeSSOLogin({ token, username }));

      if (completeSSOLogin.fulfilled.match(ssoResult)) {
        await dispatch(getMe());
        router.replace("/(main)");
      } else {
        Alert.alert(
          "Microsoft Login Error",
          String(ssoResult.payload || "Microsoft SSO failed"),
        );
      }
    } catch (err: any) {
      Alert.alert("Microsoft Login Error", err?.message || "SSO failed");
    } finally {
      setSsoLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/auth/authBackground.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            {/* TOP */}
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

            {/* BOTTOM */}
            <View style={styles.bottomSection}>
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{
                  paddingBottom: 20 + insets.bottom,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.card}>
                  <Text style={styles.loginTitle}>Login</Text>

                  <Text style={styles.subtitle}>
                    Gebruik uw Microsoft-account om in te loggen.
                  </Text>

                  {/* EMAIL */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-mail-ID</Text>
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

                    <Text style={styles.helperText}>
                      Dit e-mailadres wordt gebruikt als login hint voor
                      Microsoft.
                    </Text>
                  </View>

                  {/* MICROSOFT BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      (loading || ssoLoading) && styles.loginButtonDisabled,
                    ]}
                    onPress={handleMicrosoftLogin}
                    disabled={loading || ssoLoading}
                  >
                    {ssoLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>
                        Inloggen met Microsoft
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
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
    justifyContent: "flex-end",
  },
  topSectionKeyboard: {
    display: "none",
  },
  mainImage: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.7,
    alignSelf: "center",
  },
  logoImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.15,
    marginBottom: 15,
  },
  logoImageKeyboard: {
    alignSelf: "center",
  },
  bottomSection: {
    flex: 0.9,
    backgroundColor: "#FFFFFF66",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSafeBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF66",
  },

  /* NEW CARD UI */
  card: {
    backgroundColor: "#F5D7CF",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  loginTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#E53935",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 15,
    fontFamily: "Inter_400Regular",
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
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  helperText: {
    fontSize: 12,
    color: "#8A8A8A",
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: "#BD0B5E",
    borderRadius: 25,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  loginButtonDisabled: {
    backgroundColor: "#BD0B5E80",
  },
});
/*import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { API_BASE_URL } from "../../constants/api";
import { AppDispatch, RootState } from "../../store";
import {
  clearError,
  completeSSOLogin,
  getMe,
  login,
  setEmail,
} from "../../store/authSlice";

const { width: screenWidth } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [emailID, setEmailID] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!emailID || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    dispatch(setEmail(emailID));

    const result = await dispatch(login({ email: emailID, password }));

    if (login.fulfilled.match(result)) {
      await dispatch(getMe());
      router.replace("/(main)");
    } else {
      Alert.alert("Error", String(result.payload || "Login failed"));
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setSsoLoading(true);

      const redirectUri =
        Platform.OS === "web"
          ? `${window.location.origin}/sso/callback`
          : Linking.createURL("sso/callback", { scheme: "vanneynsel" }); //yourapp://redirect

      const params = new URLSearchParams();
      params.set("return_to", redirectUri);

      if (emailID?.trim()) {
        params.set("login_hint", emailID.trim().toLowerCase());
      }

      const authUrl = `${API_BASE_URL}/auth/sso/microsoft/start?${params.toString()}`;

      console.log("SSO Platform:", Platform.OS);
      console.log("SSO redirectUri:", redirectUri);
      console.log("SSO authUrl:", authUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type !== "success" || !result.url) {
        throw new Error("Microsoft sign-in cancelled or failed.");
      }

      const url = result.url;

      let token = "";
      let username = "";
      let ssoError = "";

      if (url.includes("#")) {
        const hash = url.split("#")[1];
        const hashParams = new URLSearchParams(hash);
        token = hashParams.get("token") || "";
        username = hashParams.get("username") || "";
        ssoError = hashParams.get("error") || "";
      } else {
        const parsed = Linking.parse(url);
        token = String(parsed.queryParams?.token || "");
        username = String(parsed.queryParams?.username || "");
        ssoError = String(parsed.queryParams?.error || "");
      }

      if (ssoError) {
        throw new Error(decodeURIComponent(ssoError));
      }

      if (!token) {
        throw new Error("SSO login did not return a token.");
      }

      const ssoResult = await dispatch(completeSSOLogin({ token, username }));

      if (completeSSOLogin.fulfilled.match(ssoResult)) {
        await dispatch(getMe());
        router.replace("/(main)");
      } else {
        Alert.alert(
          "Microsoft Login Error",
          String(ssoResult.payload || "Microsoft SSO failed"),
        );
      }
    } catch (err: any) {
      Alert.alert("Microsoft Login Error", err?.message || "SSO failed");
    } finally {
      setSsoLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/auth/authBackground.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                <Text style={styles.loginTitle}>Login</Text>

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
                    (loading || ssoLoading) && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading || ssoLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "Logging in..." : "Login"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.orContainer}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    (loading || ssoLoading) && styles.loginButtonDisabled,
                  ]}
                  onPress={handleMicrosoftLogin}
                  disabled={loading || ssoLoading}
                >
                  {ssoLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>
                      Doorgaan met Microsoft
                    </Text>
                  )}
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
  },
  logoImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.15,
    alignSelf: "flex-start",
    marginTop: 0,
    marginBottom: 15,
  },
  logoImageKeyboard: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.15,
    alignSelf: "center",
    marginTop: 10,
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
    justifyContent: "center",
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
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  orText: {
    marginHorizontal: 12,
    color: "#666666",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
})*/
