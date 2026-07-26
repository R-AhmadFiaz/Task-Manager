import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Session } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { useRealtimeTasks } from "../hooks/useRealtimeTasks";
import { TaskRow } from "../components/TaskRow";
import { TaskStats } from "../components/TaskStats";
import { TaskFilters } from "../components/TaskFilters";
import { WhiteboardSection } from "../components/WhiteboardSection";
import type { Task } from "../types/task";
import type { TaskFilter } from "../types/taskFilter";
import { colors } from "../theme";

interface TasksScreenProps {
  session: Session;
}

export function TasksScreen({ session }: TasksScreenProps) {
  const { signOut } = useAuth();
  const {
    tasks: initialTasks,
    loading,
    error,
    createTask,
    updateTaskTitle,
    toggleTask,
    deleteTask,
  } = useTasks(session.user.id);
  const tasks = useRealtimeTasks(initialTasks, session.user.id);

  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return { total: tasks.length, completed, remaining: tasks.length - completed };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  async function handleAddTask() {
    setFormError(null);
    setSubmitting(true);
    const { error: createError } = await createTask(title);
    setSubmitting(false);

    if (createError) {
      setFormError(createError);
      return;
    }
    setTitle("");
  }

  async function handleToggle(task: Task) {
    setBusyTaskId(task.id);
    await toggleTask(task.id, !task.completed);
    setBusyTaskId(null);
  }

  async function handleDelete(task: Task) {
    setBusyTaskId(task.id);
    await deleteTask(task.id);
    setBusyTaskId(null);
  }

  async function handleRename(task: Task, nextTitle: string) {
    setBusyTaskId(task.id);
    const result = await updateTaskTitle(task.id, nextTitle);
    setBusyTaskId(null);
    return result;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Task Manager</Text>
          <Text style={styles.headerEmail}>{session.user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => void signOut()} accessibilityRole="button">
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onRename={handleRename}
            disabled={busyTaskId === item.id}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <TaskStats total={stats.total} completed={stats.completed} remaining={stats.remaining} />

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Add a new task…"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={() => void handleAddTask()}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, submitting && styles.addButtonDisabled]}
                onPress={() => void handleAddTask()}
                disabled={submitting}
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>{submitting ? "Adding…" : "Add"}</Text>
              </TouchableOpacity>
            </View>
            {formError && <Text style={styles.error}>{formError}</Text>}

            <TaskFilters value={filter} onChange={setFilter} />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loading} color={colors.textPrimary} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.empty}>
              {tasks.length === 0 ? "No tasks here yet." : "No tasks match this filter."}
            </Text>
          )
        }
        ListFooterComponent={<WhiteboardSection />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  headerEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listHeader: {
    gap: 12,
    marginBottom: 12,
  },
  form: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  addButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
  },
  loading: {
    marginTop: 24,
  },
});
