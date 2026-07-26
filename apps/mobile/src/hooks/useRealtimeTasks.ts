import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Task } from "../types/task";

interface TaskRow extends Task {
  user_id: string;
}

/**
 * Keeps a task list in sync in real time via Supabase Postgres Changes —
 * same backend, same publication/RLS setup the web and desktop apps already
 * require, so no additional Supabase configuration is needed for mobile.
 *
 * `initialTasks` is only the source of truth for the very first fetch; if
 * it ever changes afterwards, local state resyncs to it (self-healing
 * after a reconnect). Day to day, every change — including this device's
 * own mutations — arrives through the subscription below, so the phone,
 * desktop, and web app stay in sync without polling.
 */
export function useRealtimeTasks(initialTasks: Task[], userId: string): Task[] {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const filter = `user_id=eq.${userId}`;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      // A freshly created client hasn't synced its session to the Realtime
      // socket yet. Subscribing before that sync completes means Postgres
      // Changes' RLS check runs as anonymous and silently drops every
      // event (the channel still reports "subscribed" either way), so the
      // auth token must be set on the realtime connection explicitly first.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;

      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`tasks-changes-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "tasks", filter },
          (payload: RealtimePostgresChangesPayload<TaskRow>) => {
            const inserted = payload.new as TaskRow;
            setTasks((current) =>
              current.some((task) => task.id === inserted.id) ? current : [inserted, ...current],
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "tasks", filter },
          (payload: RealtimePostgresChangesPayload<TaskRow>) => {
            const updated = payload.new as TaskRow;
            setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "tasks", filter },
          (payload: RealtimePostgresChangesPayload<TaskRow>) => {
            const deletedId = (payload.old as Partial<TaskRow>).id;
            setTasks((current) => current.filter((task) => task.id !== deletedId));
          },
        )
        .subscribe();
    }

    subscribe();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  return tasks;
}
