"use client";

import { useMemo, useState } from "react";
import type { Task, TaskFilter } from "@/types/task";
import { useRealtimeTasks } from "@/features/tasks/hooks/useRealtimeTasks";
import { TaskInput } from "@/features/tasks/components/TaskInput";
import { TaskStats } from "@/features/tasks/components/TaskStats";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { TaskList } from "@/features/tasks/components/TaskList";

interface TaskBoardProps {
  tasks: Task[];
  userId: string;
}

export function TaskBoard({ tasks: initialTasks, userId }: TaskBoardProps) {
  const tasks = useRealtimeTasks(initialTasks, userId);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      remaining: tasks.filter((task) => !task.completed).length,
    }),
    [tasks],
  );

  return (
    <div className="space-y-6">
      <TaskStats {...stats} />
      <TaskInput />
      <TaskFilters value={filter} onChange={setFilter} />
      <TaskList tasks={filteredTasks} />
    </div>
  );
}
