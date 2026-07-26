import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { Task } from "../types/task";
import { colors } from "../theme";

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRename: (task: Task, title: string) => Promise<{ error: string | null }>;
  disabled: boolean;
}

export function TaskRow({ task, onToggle, onDelete, onRename, disabled }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Task title cannot be empty.");
      return;
    }
    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    setError(null);
    const result = await onRename(task, trimmed);
    if (result.error) {
      setError(result.error);
      return;
    }
    setIsEditing(false);
  }

  function handleCancel() {
    setTitle(task.title);
    setError(null);
    setIsEditing(false);
  }

  return (
    <View style={styles.row}>
      <View style={styles.mainRow}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxChecked]}
          onPress={() => onToggle(task)}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed, disabled }}
          accessibilityLabel={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
        />

        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            onBlur={() => void handleSave()}
            onSubmitEditing={() => void handleSave()}
            returnKeyType="done"
            autoFocus
            accessibilityLabel={`Edit title for "${task.title}"`}
          />
        ) : (
          <TouchableOpacity
            style={styles.titleTouchable}
            onPress={() => setIsEditing(true)}
            disabled={disabled}
          >
            <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={2}>
              {task.title}
            </Text>
          </TouchableOpacity>
        )}

        {isEditing ? (
          <TouchableOpacity onPress={handleCancel} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onDelete(task)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Delete "${task.title}"`}
          >
            <Text style={[styles.delete, disabled && styles.deleteDisabled]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 4,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  titleTouchable: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  titleInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  delete: {
    fontSize: 13,
    color: colors.danger,
  },
  deleteDisabled: {
    opacity: 0.5,
  },
  cancel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});
