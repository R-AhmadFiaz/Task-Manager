import { useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { useRealtimeTasks } from "../hooks/useRealtimeTasks";
import { TaskRow } from "./TaskRow";
import { TaskStats } from "./TaskStats";
import { TaskFilters } from "./TaskFilters";
import { WhiteboardSection } from "./WhiteboardSection";
import type { Task } from "../types/task";
import type { TaskFilter } from "../types/taskFilter";

interface TasksViewProps {
  session: Session;
}

export function TasksView({ session }: TasksViewProps) {
  const { signOut } = useAuth();
  const { tasks: initialTasks, loading, error, createTask, updateTaskTitle, toggleTask, deleteTask } = useTasks(
    session.user.id,
  );
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

  async function handleAddTask(event: FormEvent) {
    event.preventDefault();
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
    <>
      <header className="tasks-header">
        <div>
          <h1>Task Manager</h1>
          <p className="email">{session.user.email}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void signOut()}>
          Log out
        </button>
      </header>

      <div className="tasks-body">
        <TaskStats total={stats.total} completed={stats.completed} remaining={stats.remaining} />

        <form className="task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a new task…"
          />
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
        {formError && <p className="error-text">{formError}</p>}

        <TaskFilters value={filter} onChange={setFilter} />

        {loading ? (
          <p className="muted-text">Loading tasks…</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : visibleTasks.length === 0 ? (
          <p className="empty-text">
            {tasks.length === 0 ? "No tasks here yet." : "No tasks match this filter."}
          </p>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onRename={handleRename}
                disabled={busyTaskId === task.id}
              />
            ))}
          </ul>
        )}

        <WhiteboardSection />
      </div>
    </>
  );
}
