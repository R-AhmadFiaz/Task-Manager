import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../theme";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isLogin = mode === "login";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const result = isLogin ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.info) {
      setInfo(result.info);
      return;
    }
    // Otherwise a session was established and useAuth's own
    // onAuthStateChange listener updates `session` — App switches to the
    // authenticated view on its own, nothing to do here.
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Task Manager</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Log in to see your tasks" : "Create an account to get started"}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={isLogin ? "password" : "newPassword"}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />
          {!isLogin && <Text style={styles.hint}>At least 6 characters.</Text>}
        </View>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
        {info && <Text style={styles.info}>{info}</Text>}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={submitting}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? "Log in" : "Create account"}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <TouchableOpacity onPress={() => switchMode(isLogin ? "register" : "login")}>
            <Text style={styles.switchLink}>{isLogin ? "Register" : "Log in"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: -8,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  info: {
    color: colors.success,
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  switchText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  switchLink: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
