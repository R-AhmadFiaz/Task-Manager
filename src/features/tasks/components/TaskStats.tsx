interface TaskStatsProps {
  total: number;
  completed: number;
  remaining: number;
}

export function TaskStats({ total, completed, remaining }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Total" value={total} />
      <StatCard label="Completed" value={completed} />
      <StatCard label="Remaining" value={remaining} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
