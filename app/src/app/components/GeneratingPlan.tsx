import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { addEmployee } from '../data/employees';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface GeneratingPlanProps {
  hireName: string;
}

export function GeneratingPlan({ hireName }: GeneratingPlanProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReady, setShowReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // When all steps are complete, show "Plan Ready!" and then navigate
    if (currentStep >= 4) {
      const timer = setTimeout(() => {
        setShowReady(true);
        
        // Add the new employee to the system
        const newEmployee = addEmployee(hireName);
        
        console.log('New employee added:', newEmployee);
        console.log('Navigating to:', `/employees/${newEmployee.id}/onboarding-plan`);
        
        // Navigate to their Onboarding Plan after a brief moment
        setTimeout(() => {
          navigate(`/employees/${newEmployee.id}/onboarding-plan`, { replace: true });
        }, 1500);
      }, 2000); // Wait for last step to show as completed

      return () => clearTimeout(timer);
    }
  }, [currentStep, hireName, navigate]);

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
      label: 'Creating onboarding plan',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'in-progress' : 'pending',
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
        <h2 className="text-3xl font-semibold text-gray-900 mb-12">Generating Plan...</h2>

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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0056D2' }} />
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