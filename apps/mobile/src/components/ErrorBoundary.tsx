import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("[BOOT-FATAL] ErrorBoundary caught a render-phase error:", error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} accessibilityRole="button">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: "600",
  },
});
