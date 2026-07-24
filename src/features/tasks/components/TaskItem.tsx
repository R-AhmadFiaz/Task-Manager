"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/types/task";
import { deleteTask, toggleTaskCompleted, updateTaskTitle } from "@/features/tasks/actions";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTaskCompleted(task.id, !task.completed);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.error) setError(result.error);
    });
  }

  function handleSaveTitle() {
    if (!title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    if (title.trim() === task.title) {
      setIsEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateTaskTitle(task.id, title);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-gray-100 py-3 last:border-none">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={isPending}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 disabled:cursor-not-allowed"
        aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
      />

      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSaveTitle();
            if (event.key === "Escape") {
              setTitle(task.title);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={`flex-1 cursor-pointer text-left text-sm ${
            task.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {task.title}
        </button>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="cursor-pointer text-sm text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Delete "${task.title}"`}
      >
        Delete
      </button>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </li>
  );
}
