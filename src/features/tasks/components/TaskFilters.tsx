import type { TaskFilter } from "@/types/task";

interface TaskFiltersProps {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((filterOption) => (
        <button
          key={filterOption.value}
          type="button"
          onClick={() => onChange(filterOption.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            value === filterOption.value
              ? "bg-gray-900 text-white"
              : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
}
