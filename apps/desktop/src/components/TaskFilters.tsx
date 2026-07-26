import type { TaskFilter } from "../types/taskFilter";

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
    <div className="task-filters" role="group" aria-label="Filter tasks">
      {FILTERS.map((filterOption) => (
        <button
          key={filterOption.value}
          type="button"
          onClick={() => onChange(filterOption.value)}
          aria-pressed={value === filterOption.value}
          className={`filter-button${value === filterOption.value ? " active" : ""}`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
}
