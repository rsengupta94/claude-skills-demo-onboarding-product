import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { api, type ManagerToolkit as ManagerToolkitData } from '../services/api';
import { PageSkeleton } from './LoadingSkeleton';
import { ErrorMessage } from './ErrorMessage';

export function ManagerToolkit() {
  const { id } = useParams<{ id: string }>();
  const [toolkitData, setToolkitData] = useState<ManagerToolkitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.getManagerToolkit(id)
      .then(setToolkitData)
      .catch((e) => setError(e.message || 'Failed to load manager toolkit'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8"><PageSkeleton /></div>;
  }

  if (error || !toolkitData) {
    return <div className="p-8"><ErrorMessage message={error || 'Employee not found'} /></div>;
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Manager Toolkit</h1>
        <p className="text-gray-500">{toolkitData.name}</p>
      </div>

      <div className="space-y-8">
        {/* Section 1 - Development Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Development Summary</h2>
              <p className="text-sm text-gray-600 mb-3">Key areas to focus on for this hire:</p>
              <ul className="space-y-2">
                {toolkitData.focusAreas.map((area: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{area.text ?? area.area ?? String(area)}</span>
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
              <div className="space-y-4">
                {toolkitData.checkIns.map((checkIn) => (
                  <div key={checkIn.day}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Day {checkIn.day} Check-in:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                      {checkIn.prompts.map((prompt: any, j: number) => (
                        <p key={j} className="text-sm text-gray-700">
                          "{prompt.question ?? prompt}"
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
                {toolkitData.supportTips.map((tip: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{tip.text ?? tip}</span>
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