import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { api, type OnboardingPlan as OnboardingPlanData } from '../services/api';
import { PageSkeleton } from './LoadingSkeleton';
import { ErrorMessage } from './ErrorMessage';

type Tab = 'gap-analysis' | 'learning-path' | '30-60-90';

export function OnboardingPlan() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('gap-analysis');
  const [planData, setPlanData] = useState<OnboardingPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.getOnboardingPlan(id)
      .then(setPlanData)
      .catch((e) => setError(e.message || 'Failed to load onboarding plan'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8"><PageSkeleton /></div>;
  }

  if (error || !planData) {
    return <div className="p-8"><ErrorMessage message={error || 'Employee not found'} /></div>;
  }

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low':
        return '#10b981'; // green
      case 'moderate':
        return '#f59e0b'; // amber/orange
      case 'high':
        return '#ef4444'; // red
    }
  };

  const getSeverityBgColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low':
        return '#d1fae5';
      case 'moderate':
        return '#fef3c7';
      case 'high':
        return '#fee2e2';
    }
  };

  const getSeverityTextColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low':
        return '#065f46';
      case 'moderate':
        return '#92400e';
      case 'high':
        return '#991b1b';
    }
  };

  const getSeverityLabel = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low':
        return 'Low Gap';
      case 'moderate':
        return 'Moderate Gap';
      case 'high':
        return 'High Gap';
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="px-8 pt-8 pb-4 bg-white border-b border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">{planData.name}</h1>
        <p className="text-gray-500">{planData.roleTitle}</p>
      </div>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 z-10">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('gap-analysis')}
            className={`py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'gap-analysis' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gap Analysis
            {activeTab === 'gap-analysis' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#0056D2' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('learning-path')}
            className={`py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'learning-path' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Learning Path
            {activeTab === 'learning-path' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#0056D2' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('30-60-90')}
            className={`py-4 text-sm font-medium transition-colors relative ${
              activeTab === '30-60-90' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            30/60/90 Plan
            {activeTab === '30-60-90' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#0056D2' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {activeTab === 'gap-analysis' && (
          <div className="max-w-4xl space-y-6">
            {planData.gapAnalysis.map((gap, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: getSeverityColor(gap.severity) }}
                />
                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{gap.competency}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getSeverityBgColor(gap.severity),
                        color: getSeverityTextColor(gap.severity),
                      }}
                    >
                      {getSeverityLabel(gap.severity)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(gap.currentLevel / gap.targetLevel) * 100}%`,
                          backgroundColor: getSeverityColor(gap.severity),
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Current: {gap.currentLevel}/{gap.targetLevel}
                  </p>
                  <p className="text-sm text-gray-500 italic">{gap.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'learning-path' && (
          <div className="max-w-4xl space-y-6">
            {planData.learningPath.map((course) => (
              <div
                key={course.courseId}
                className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#0056D2' }}
                >
                  {course.sequence}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-lg font-semibold text-gray-900">{course.courseTitle}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Addresses: {course.addresses}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Duration: {course.duration} | {course.recommendedModules.length} module{course.recommendedModules.length !== 1 ? 's' : ''}
                  </p>
                  {course.courseUrl && (
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium transition-colors"
                      style={{ color: '#0056D2' }}
                    >
                      View Content →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === '30-60-90' && (
          <div className="grid grid-cols-3 gap-6 max-w-7xl">
            {planData.plan306090.map((phase, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {phase.dayRange}
                  </h2>
                  <p className="text-gray-600">{phase.title}</p>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Goals</h3>
                  <ul className="space-y-3">
                    {phase.goals.map((goal: any, j: number) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{goal.text ?? goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mx-6 mb-6 p-4 rounded-lg" style={{ backgroundColor: '#E8F2FF' }}>
                  <p className="text-xs font-semibold text-gray-700 mb-1">MILESTONE</p>
                  <p className="text-sm text-gray-900">{phase.milestone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}