interface TaskStatsProps {
  total: number;
  completed: number;
  remaining: number;
}

export function TaskStats({ total, completed, remaining }: TaskStatsProps) {
  return (
    <div className="task-stats">
      <StatCard label="Total" value={total} />
      <StatCard label="Completed" value={completed} />
      <StatCard label="Remaining" value={remaining} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}
