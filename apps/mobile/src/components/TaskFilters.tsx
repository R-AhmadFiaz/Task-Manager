import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { TaskFilter } from "../types/taskFilter";
import { colors } from "../theme";

interface TaskFiltersProps {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {FILTERS.map((filterOption) => {
        const active = value === filterOption.value;
        return (
          <TouchableOpacity
            key={filterOption.value}
            style={[styles.button, active && styles.buttonActive]}
            onPress={() => onChange(filterOption.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{filterOption.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.surface,
  },
});
