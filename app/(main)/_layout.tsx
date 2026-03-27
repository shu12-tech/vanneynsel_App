import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  initializeSslPinning,
  isSslPinningAvailable,
} from "react-native-ssl-public-key-pinning";

export default function MainLayout() {
  useEffect(() => {
    const isPinningEnabled =
      process.env.EXPO_PUBLIC_ENABLE_SSL_PINNING === "true";

    console.log("ENV:", process.env.EXPO_PUBLIC_APP_ENV);
    console.log("SSL Pinning Enabled:", isPinningEnabled);

    // If disabled → do nothing
    if (!isPinningEnabled) {
      console.log("SSL Pinning Disabled"); // need to work on setting
      return;
    }

    // Check native support
    if (!isSslPinningAvailable()) {
      console.log("SSL Pinning not available in this build");
      return;
    }

    // Initialize SSL Pinning
    initializeSslPinning({
      "d02.srv.boundaryless.com": {
        includeSubdomains: true,
        publicKeyHashes: [
          "Lh1fG3+IA2ywhlchTOlOisA9aisUpD29X5NDGpismAc=",
          "Lh1fG3+IA2ywhlchTOlOisA9aisUpD29X5NDGpismAc=", // temporary backup
        ],
      },
    });

    console.log("SSL Pinning Initialized");
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="recent" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
