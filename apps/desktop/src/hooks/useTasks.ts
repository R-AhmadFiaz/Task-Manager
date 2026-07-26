import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Task } from "../types/task";

interface TaskActionResult {
  error: string | null;
}

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (title: string) => Promise<TaskActionResult>;
  updateTaskTitle: (id: string, title: string) => Promise<TaskActionResult>;
  toggleTask: (id: string, completed: boolean) => Promise<TaskActionResult>;
  deleteTask: (id: string) => Promise<TaskActionResult>;
}

/**
 * Fetches the initial task list once and exposes mutation functions.
 * Mutations intentionally do NOT refetch or optimistically patch local
 * state — useRealtimeTasks (composed by the caller) reflects every change,
 * including this window's own, back through its Postgres Changes
 * subscription, exactly like the web app's architecture.
 */
export function useTasks(userId: string | undefined): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setTasks(data ?? []);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const createTask = useCallback(
    async (title: string): Promise<TaskActionResult> => {
      if (!userId) return { error: "Not signed in." };
      const trimmed = title.trim();
      if (!trimmed) return { error: "Task title cannot be empty." };

      const { error: insertError } = await supabase.from("tasks").insert({ title: trimmed, user_id: userId });
      return { error: insertError?.message ?? null };
    },
    [userId],
  );

  const updateTaskTitle = useCallback(async (id: string, title: string): Promise<TaskActionResult> => {
    const trimmed = title.trim();
    if (!trimmed) return { error: "Task title cannot be empty." };

    const { error: updateError } = await supabase.from("tasks").update({ title: trimmed }).eq("id", id);
    return { error: updateError?.message ?? null };
  }, []);

  const toggleTask = useCallback(async (id: string, completed: boolean): Promise<TaskActionResult> => {
    const { error: updateError } = await supabase.from("tasks").update({ completed }).eq("id", id);
    return { error: updateError?.message ?? null };
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<TaskActionResult> => {
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", id);
    return { error: deleteError?.message ?? null };
  }, []);

  return { tasks, loading, error, createTask, updateTaskTitle, toggleTask, deleteTask };
}
