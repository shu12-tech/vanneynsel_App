import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from 'react-native';
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useTheme } from "../hooks/useTheme";
import { persistor, RootState, store } from "../store";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading component
  }

  // Set default font family
  // @ts-ignore
  Text.defaultProps = Text.defaultProps || {};
  // @ts-ignore
  Text.defaultProps.style = {
    // @ts-ignore
    ...Text.defaultProps.style,
    fontFamily: 'Inter_400Regular',
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
}

function RootNavigator() {
  const isLoggedIn = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const theme = useTheme();
  const themeName = useSelector((state: RootState) => state.theme.theme);

  // useEffect(() => {
  // //  NavigationBar.setBackgroundColorAsync(theme.background);
  //   NavigationBar.setButtonStyleAsync(themeName === "dark" ? "light" : "dark");
  // }, [theme.background, themeName]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Main app screens
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        ) : (
          // Auth flow screens
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      </>
  );
}

