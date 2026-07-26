import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface TaskStatsProps {
  total: number;
  completed: number;
  remaining: number;
}

export function TaskStats({ total, completed, remaining }: TaskStatsProps) {
  return (
    <View style={styles.row}>
      <StatCard label="Total" value={total} />
      <StatCard label="Completed" value={completed} />
      <StatCard label="Remaining" value={remaining} />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
