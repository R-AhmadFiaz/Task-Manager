import { useState } from "react";
import type { Task } from "../types/task";

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
    <li className="task-row">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        disabled={disabled}
        aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
      />

      {isEditing ? (
        <input
          type="text"
          className="task-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => void handleSave()}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleSave();
            if (event.key === "Escape") handleCancel();
          }}
          autoFocus
          aria-label={`Edit title for "${task.title}"`}
        />
      ) : (
        <button
          type="button"
          className={`task-title${task.completed ? " completed" : ""}`}
          onClick={() => setIsEditing(true)}
          disabled={disabled}
        >
          {task.title}
        </button>
      )}

      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(task)}
        disabled={disabled}
        aria-label={`Delete "${task.title}"`}
      >
        Delete
      </button>

      {error && (
        <p className="task-row-error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
