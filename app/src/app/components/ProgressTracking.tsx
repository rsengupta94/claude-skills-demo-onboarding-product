import { useParams } from 'react-router';
import { getEmployeeById } from '../data/employees';
import { getProgressTrackingData } from '../data/progressTrackingData';

export function ProgressTracking() {
  const { id } = useParams<{ id: string }>();
  const employee = id ? getEmployeeById(id) : null;

  if (!employee) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Employee not found</p>
      </div>
    );
  }

  // Fetch employee-specific progress tracking data
  // In production, this would be an API call with loading states
  const progressData = getProgressTrackingData(employee.id);

  const getStatusColor = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'not-started':
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Progress Tracking</h1>
        <p className="text-gray-500">{employee.name}</p>
      </div>

      {/* Main Content - Stacked Sections */}
      <div className="space-y-8">
        {/* Section 1 - Overall Readiness */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between gap-8">
            {/* Left side - Progress bar */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-3">Overall Readiness</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressData.overallReadiness}%`,
                      backgroundColor: '#0056D2',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                  {progressData.overallReadiness}%
                </span>
              </div>
            </div>

            {/* Right side - Phase indicators */}
            <div className="flex items-center gap-6">
              {progressData.phases.map((phase) => (
                <div key={phase.day} className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center w-8 h-8">
                    {phase.status === 'completed' && (
                      <span className="text-green-600 text-2xl font-bold">✓</span>
                    )}
                    {phase.status === 'current' && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: '#0056D2' }}
                      />
                    )}
                    {phase.status === 'upcoming' && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">Day {phase.day}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 - Learning Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📚</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Checklist</h2>

              {/* Checklist items */}
              <div className="space-y-3">
                {progressData.learningChecklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-5 h-5">
                        {item.status === 'completed' ? (
                          <span className="text-green-600 text-xl">☑</span>
                        ) : (
                          <span className="text-gray-400 text-xl">☐</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">
                        {item.title} - {item.module}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 - Skill Progression */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Progression</h2>

              {/* Skill rows */}
              <div className="space-y-6">
                {progressData.skillProgression.map((skill) => (
                  <div key={skill.id}>
                    <p className="text-sm font-semibold text-gray-700 mb-3">{skill.skillName}</p>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Before */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Before</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-400 rounded-full"
                              style={{ width: `${(skill.levels.before / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 min-w-[1.5rem]">
                            {skill.levels.before}/4
                          </span>
                        </div>
                      </div>

                      {/* Current */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Current</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(skill.levels.current / 4) * 100}%`,
                                backgroundColor: '#0056D2',
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 min-w-[1.5rem]">
                            {skill.levels.current}/4
                          </span>
                        </div>
                      </div>

                      {/* Target */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Target</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(skill.levels.target / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 min-w-[1.5rem]">
                            {skill.levels.target}/4
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
