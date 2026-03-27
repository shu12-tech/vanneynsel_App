import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SSOCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [error, setError] = useState("");
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const finishLogin = async () => {
      try {
        const token = params.token as string;
        const username = params.username as string;
        const ssoError = params.error as string;

        console.log("SSO Params:", params);

        // ❌ Handle SSO error
        if (ssoError) {
          throw new Error(decodeURIComponent(ssoError));
        }

        // ❌ No token case
        if (!token) {
          try {
            const existingToken = await SecureStore.getItemAsync("token");

            if (existingToken) {
              router.replace("/(main)");
              return;
            }
          } catch (e) {
            console.warn("SecureStore read failed:", e);
          }

          throw new Error("SSO login did not return a token.");
        }

        // ✅ Save token
        try {
          await SecureStore.setItemAsync("token", token);
        } catch (e) {
          console.warn("Token save failed:", e);
        }

        // ✅ Save user
        try {
          const user = {
            username: username || "",
            authenticated: true,
            authMethod: "sso",
          };

          await SecureStore.setItemAsync("user", JSON.stringify(user));

          if (username) {
            await SecureStore.setItemAsync("rememberedEmail", username);
          }
        } catch (e) {
          console.warn("User save failed:", e);
        }

        // ✅ SUCCESS → Go to MAIN SCREEN
        router.replace("/(main)");

        // 🔥 OPTIONAL background API call (safe)
        setTimeout(async () => {
          try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL;

            if (!API_URL) {
              console.warn("API URL missing");
              return;
            }

            const response = await fetch(`${API_URL}/me`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();

              const userData = {
                userId: data.id,
                groupId: data.group_id,
                username: data.username,
                displayName: data.display_name,
                firstName: data.display_name?.split(" ")?.[0] || data.username,
                roleId: data.role_id,
                permissions: data.permissions,
                authenticated: true,
              };

              await SecureStore.setItemAsync(
                "userdata",
                JSON.stringify(userData),
              );
            } else {
              console.warn("SSO /me failed");
            }
          } catch (err) {
            console.warn("Profile fetch error:", err);
          }
        }, 500);
      } catch (err: any) {
        console.error("SSO Error:", err);
        setError(err.message || "SSO login failed");
      }
    };

    finishLogin();
  }, []);

  // ❌ ERROR UI → Go to LOGIN SCREEN
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Sign-in failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retry} onPress={() => router.replace("/(auth)")}>
          Go back to login
        </Text>
      </View>
    );
  }

  // ✅ LOADING UI
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  retry: {
    marginTop: 20,
    color: "blue",
    fontWeight: "600",
  },
});
