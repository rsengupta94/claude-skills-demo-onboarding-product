import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface GeneratingPlanProps {
  hireName: string;
  employeeId: string;
}

export function GeneratingPlan({ hireName, employeeId }: GeneratingPlanProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReady, setShowReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate progress through the 8 Claude Skills steps
    // In production, this would poll /api/plans/:id/status or use SSE
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 7) return prev + 1;
        return prev;
      });
    }, 1500); // ~12 seconds total for demo

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // When all steps are complete, show "Plan Ready!" and then navigate
    if (currentStep >= 7) {
      const timer = setTimeout(() => {
        setShowReady(true);

        // Navigate to the onboarding plan
        setTimeout(() => {
          navigate(`/employees/${employeeId}/onboarding-plan`, { replace: true });
        }, 1500);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentStep, employeeId, navigate]);

  const steps: Step[] = [
    {
      id: 0,
      label: 'Analyzing job description',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'in-progress' : 'pending',
    },
    {
      id: 1,
      label: 'Assessing candidate',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
    },
    {
      id: 2,
      label: 'Identifying skill gaps',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
    },
    {
      id: 3,
      label: 'Mapping learning content',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
    },
    {
      id: 4,
      label: 'Generating 30/60/90 plan',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
    },
    {
      id: 5,
      label: 'Creating manager toolkit',
      status: currentStep > 5 ? 'completed' : currentStep === 5 ? 'in-progress' : 'pending',
    },
    {
      id: 6,
      label: 'Building progress framework',
      status: currentStep > 6 ? 'completed' : currentStep === 6 ? 'in-progress' : 'pending',
    },
    {
      id: 7,
      label: 'Finalizing onboarding plan',
      status: currentStep > 7 ? 'completed' : currentStep === 7 ? 'in-progress' : 'pending',
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#0056D2' }} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Generating Plan for {hireName}
        </h2>
        <p className="text-gray-500 mb-12">
          Running 8 AI skills to create personalized onboarding
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 text-left max-w-md mx-auto">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              {/* Icon */}
              {step.status === 'completed' && (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
              {step.status === 'in-progress' && (
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#0056D2' }} />
                </div>
              )}
              {step.status === 'pending' && (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
              )}

              {/* Label */}
              <span
                className={`text-base ${
                  step.status === 'completed'
                    ? 'text-gray-500'
                    : step.status === 'in-progress'
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Plan Ready Message */}
        {showReady && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-green-600">Plan Ready!</h3>
            <p className="text-gray-500">Redirecting to Onboarding Plan...</p>
          </div>
        )}
      </div>
    </div>
  );
}
