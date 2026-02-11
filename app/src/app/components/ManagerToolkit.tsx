import { useParams } from 'react-router';
import { getEmployeeById } from '../data/employees';
import { getManagerToolkitData } from '../data/managerToolkitData';

export function ManagerToolkit() {
  const { id } = useParams<{ id: string }>();
  const employee = id ? getEmployeeById(id) : null;

  if (!employee) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Employee not found</p>
      </div>
    );
  }

  // Fetch employee-specific manager toolkit data
  // In production, this would be an API call with loading states
  const toolkitData = getManagerToolkitData(employee.id);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Manager Toolkit</h1>
        <p className="text-gray-500">{employee.name}</p>
      </div>

      {/* Main Content - Stacked Sections */}
      <div className="space-y-8">
        {/* Section 1 - Development Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Development Summary</h2>
              <p className="text-sm text-gray-600 mb-3">Key areas to focus on for this hire:</p>
              <ul className="space-y-2">
                {toolkitData.focusAreas.map((area) => (
                  <li key={area.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{area.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 - Conversation Prompts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversation Prompts</h2>

              {/* Dynamic Check-in subsections */}
              <div className="space-y-4">
                {toolkitData.checkIns.map((checkIn) => (
                  <div key={checkIn.day}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Day {checkIn.day} Check-in:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                      {checkIn.prompts.map((prompt) => (
                        <p key={prompt.id} className="text-sm text-gray-700">
                          "{prompt.question}"
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 - Support Tips */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Support Tips</h2>
              <ul className="space-y-2">
                {toolkitData.supportTips.map((tip) => (
                  <li key={tip.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}