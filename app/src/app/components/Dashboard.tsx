import { MetricCard } from './MetricCard';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { employees } from '../data/employees';

export function Dashboard() {
  const navigate = useNavigate();
  const hasPlans = employees.length > 0;

  // Empty state
  if (!hasPlans) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-6">
            <FileText className="w-24 h-24 text-gray-300 mx-auto" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No onboarding plans yet
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 mb-8">
            Create your first plan to get started
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/create-plan')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: '#0056D2' }}
          >
            <Plus className="w-5 h-5" />
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  // Regular dashboard with metrics
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Overview of all onboarding plans</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Active Plans" value={3} />
        <MetricCard title="Average Completion Rate" value="67%" />
        <MetricCard title="On Track / Behind" value="2/1" />
        <MetricCard title="Avg Time to Complete" value="45 days" />
        <MetricCard title="Gaps Closed" value={12} />
      </div>
    </div>
  );
}