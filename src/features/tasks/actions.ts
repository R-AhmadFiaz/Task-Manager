"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/types/task";

export interface TaskActionResult {
  error: string | null;
}

const emptyResult: TaskActionResult = { error: null };

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

  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
  return emptyResult;
}

export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return emptyResult;
}

export async function deleteTask(taskId: string): Promise<TaskActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return emptyResult;
}
