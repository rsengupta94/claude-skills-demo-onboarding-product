import { MetricCard } from './MetricCard';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { api, type DashboardMetrics } from '../services/api';
import { PageSkeleton } from './LoadingSkeleton';

export function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPlans, setHasPlans] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [employees, metricsData] = await Promise.all([
          api.getEmployees(),
          api.getDashboardMetrics(),
        ]);
        setHasPlans(employees.length > 0);
        setMetrics(metricsData);
      } catch {
        setHasPlans(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <PageSkeleton />
      </div>
    );
  }

  // Empty state
  if (!hasPlans) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <FileText className="w-24 h-24 text-gray-300 mx-auto" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No onboarding plans yet
          </h2>
          <p className="text-gray-500 mb-8">
            Create your first plan to get started
          </p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Overview of all onboarding plans</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Active Plans" value={metrics?.activePlans ?? 0} />
        <MetricCard title="Average Completion Rate" value={`${metrics?.avgCompletionRate ?? 0}%`} />
        <MetricCard title="On Track / Behind" value={`${metrics?.onTrack ?? 0}/${metrics?.behind ?? 0}`} />
        <MetricCard title="Avg Time to Complete" value={`${metrics?.avgDays ?? 0} days`} />
        <MetricCard title="Gaps Closed" value={metrics?.gapsClosed ?? 0} />
      </div>
    </div>
  );
}