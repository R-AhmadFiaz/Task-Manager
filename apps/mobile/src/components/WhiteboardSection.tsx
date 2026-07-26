import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Whiteboard } from "./Whiteboard";
import { colors } from "../theme";

export function WhiteboardSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Whiteboard</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsOpen((open) => !open)}
          accessibilityRole="button"
        >
          <Text style={styles.toggleButtonText}>{isOpen ? "Hide whiteboard" : "Open whiteboard"}</Text>
        </TouchableOpacity>
      </View>
      {isOpen && <Whiteboard />}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
