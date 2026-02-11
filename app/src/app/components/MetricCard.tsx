interface MetricCardProps {
  title: string;
  value: string | number;
}

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
