import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import AppErrorBoundary from "../components/ui/AppErrorBoundary";
import { colors, paperTheme, spacing, typography } from "../constants/theme";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { requestNotificationPermissions } from "../services/notifications";
import { enableRuntimeHardening } from "../services/runtimeHardening";
import { seedInitialData } from "../services/storage";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <AppErrorBoundary>
            <AuthProvider>
              <RootNavigation />
            </AuthProvider>
          </AppErrorBoundary>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigation() {
  const [seeded, setSeeded] = useState(false);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const { isLoading, isOnboarded, isAuthenticated, refreshAuthSession } = useAuth();

  useEffect(() => {
    const prepare = async () => {
      await Promise.all([seedInitialData(), refreshAuthSession(), enableRuntimeHardening()]);
      void requestNotificationPermissions();
      setSeeded(true);
    };

    void prepare();
  }, [refreshAuthSession]);

  const ready = fontsLoaded && seeded && !isLoading;

  useEffect(() => {
    if (!ready) return;
    void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>Ford+</Text>
        <Text style={styles.subtitle}>Seu Ford, sempre em dia.</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: styles.stack }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && !isOnboarded}>
          <Stack.Screen name="onboarding/index" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && isOnboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="vehicle/[id]" />
          <Stack.Screen name="service/new" />
          <Stack.Screen name="service/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stack: {
    backgroundColor: colors.background,
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  logo: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: "900",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
