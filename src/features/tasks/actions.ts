"use server";

import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/types/task";

export interface TaskActionResult {
  error: string | null;
}

const emptyResult: TaskActionResult = { error: null };

// Reflecting mutations back into the UI is realtime's job (see
// useRealtimeTasks) — the acting tab receives its own change through its
// own subscription, same as any other tab. These actions intentionally do
// NOT call revalidatePath: doing so would bundle a full dashboard RSC
// re-render into every mutation's response, which both contradicts "update
// only the affected task" and made the submit button stay disabled far
// longer than the (now faster) realtime round-trip that already reflects
// the change — a real user's rapid next click would silently land while
// still disabled. A fresh navigation to /dashboard always gets correct
// data regardless, since that route reads cookies() and is already forced
// dynamic.

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }

  return data ?? [];
}

export async function createTask(
  _prevState: TaskActionResult,
  formData: FormData,
): Promise<TaskActionResult> {
  const title = formData.get("title");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Task title cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a task." };
  }

  const { error } = await supabase.from("tasks").insert({
    title: title.trim(),
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  return emptyResult;
}

export async function updateTaskTitle(taskId: string, title: string): Promise<TaskActionResult> {
  if (!title.trim()) {
    return { error: "Task title cannot be empty." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ title: title.trim() }).eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return emptyResult;
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return emptyResult;
}

export async function deleteTask(taskId: string): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return emptyResult;
}
