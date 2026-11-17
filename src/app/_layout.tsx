
import { useEffect } from "react";
import {
  Stack,
  Href,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme";

function RootNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !navigationState?.key) {
      return;
    }

    const isPublicScreen =
      segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && !isPublicScreen) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicScreen) {
      router.replace(
        user?.role === "PROFESSOR" ? "/meus-posts" : "/",
      );
      return;
    }

    if (isAuthenticated && user?.role === "PROFESSOR" && !segments[0]) {
      router.replace("/meus-posts");
      return;
    }

    if (isAuthenticated && user?.role === "ALUNO" && segments[0] === "meus-posts") {
      router.replace("/");
      return;
    }

    if (isAuthenticated && user?.role === "ALUNO" && segments[0] === "usuarios") {
      router.replace("/posts" as Href);
      return;
    }

    if (isAuthenticated && user?.role === "PROFESSOR" && segments[0] === "alunos") {
      router.replace("/meus-posts");
    }
  }, [
    user,
    isAuthenticated,
    isLoading,
    segments,
    navigationState?.key,
    router,
  ]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}
