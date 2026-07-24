import type { Task } from "@/types/task";
import { TaskItem } from "@/features/tasks/components/TaskItem";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
        No tasks here yet.
      </p>
    );
  }

  return (
    <ul className="rounded-lg border border-gray-200 bg-white px-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
