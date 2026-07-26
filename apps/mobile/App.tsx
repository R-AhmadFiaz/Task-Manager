import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { boot } from "./src/lib/bootLog";

boot("App.tsx module evaluated (imports about to run)");

import { useAuth } from "./src/hooks/useAuth";
import { AuthScreen } from "./src/screens/AuthScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { startAppStateAuthSync } from "./src/lib/supabase";
import { colors } from "./src/theme";

boot("App.tsx imports resolved");

function AppContent() {
  boot("AppContent render start");
  const { session, initializing, initError } = useAuth();
  boot(`AppContent render: initializing=${initializing} hasSession=${!!session} initError=${initError ?? "null"}`);

  useEffect(() => {
    boot("AppContent mounted (useEffect fired)");
    return startAppStateAuthSync();
  }, []);

  if (initializing) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator color={colors.textPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {initError && !session && <Text style={styles.initError}>{initError}</Text>}
      {session ? <TasksScreen session={session} /> : <AuthScreen />}
    </SafeAreaView>
  );
}

export default function App() {
  boot("App() component function called");
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  initError: {
    padding: 12,
    fontSize: 13,
    color: colors.danger,
    textAlign: "center",
  },
});
