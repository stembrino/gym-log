import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DatabaseProvider } from "@/components/providers/DatabaseProvider";
import { I18nProvider, useI18n } from "@/components/providers/i18n-provider";
import { ThemePreferenceProvider, useThemePreference } from "@/components/theme-preference";
import { AndroidWorkoutNotificationBridge } from "@/features/workouts/components/AndroidWorkoutNotificationBridge";
import { AndroidNotificationPreferenceProvider } from "@/features/workouts/providers/AndroidNotificationPreferenceProvider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <DatabaseProvider>
      <I18nProvider>
        <ThemePreferenceProvider>
          <AndroidNotificationPreferenceProvider>
            <ThemedNavigation />
          </AndroidNotificationPreferenceProvider>
        </ThemePreferenceProvider>
      </I18nProvider>
    </DatabaseProvider>
  );
}

function ThemedNavigation() {
  const { theme } = useThemePreference();
  const { t } = useI18n();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <AndroidWorkoutNotificationBridge />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercise-library"
            options={{
              title: t("exercises.title"),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: t("settings.title") || "Settings",
            }}
          />
          <Stack.Screen name="workout-prepare" options={{ headerShown: false }} />
          <Stack.Screen name="workout-in-progress" options={{ headerShown: false }} />
          <Stack.Screen
            name="dev-lab"
            options={{
              title: "Dev Lab",
            }}
          />
          <Stack.Screen
            name="notification-lab"
            options={{
              title: "Notification Lab",
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
