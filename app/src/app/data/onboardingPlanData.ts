// Mock data structure - In production, this would come from an API/database
// based on the employee's assessment results and personalized learning plan

export interface GapCard {
  id: string;
  title: string;
  severity: 'low' | 'moderate' | 'high';
  current: number;
  total: number;
  evidence: string;
}

export interface LearningCard {
  id: string;
  number: number;
  title: string;
  addresses: string;
  duration: string;
  modules: string;
}

export interface PhaseGoal {
  id: string;
  text: string;
}

export interface Phase {
  id: string;
  dayRange: string;
  title: string;
  goals: PhaseGoal[];
  milestone: string;
}

export interface OnboardingPlanData {
  gapAnalysis: GapCard[];
  learningPath: LearningCard[];
  plan306090: Phase[];
}

// Placeholder data for visualization - Would be fetched from backend
export function getOnboardingPlanData(employeeId: string): OnboardingPlanData {
  // In production: return await fetch(`/api/employees/${employeeId}/onboarding-plan`)
  
  // Mock data - same structure would be returned for any employee
  return {
    gapAnalysis: [
      {
        id: '1',
        title: 'Communication',
        severity: 'moderate',
        current: 2,
        total: 4,
        evidence: 'Needs to work on presenting to executives',
      },
      {
        id: '2',
        title: 'Strategic Thinking',
        severity: 'low',
        current: 3,
        total: 4,
        evidence: 'Good strategic instincts, some refinement needed',
      },
    ],
    learningPath: [
      {
        id: '1',
        number: 1,
        title: 'Executive Communication Mastery',
        addresses: 'Communication',
        duration: '4 hours',
        modules: 'Modules 1-2',
      },
      {
        id: '2',
        number: 2,
        title: 'Strategic Thinking for Leaders',
        addresses: 'Strategic Thinking',
        duration: '3 hours',
        modules: 'Module 1',
      },
    ],
    plan306090: [
      {
        id: '1',
        dayRange: 'Day 1-30',
        title: 'Foundation',
        goals: [
          { id: '1', text: 'Complete core learning modules' },
          { id: '2', text: 'Understand team communication patterns' },
        ],
        milestone: 'Present learnings to your manager',
      },
      {
        id: '2',
        dayRange: 'Day 31-60',
        title: 'Development',
        goals: [
          { id: '1', text: 'Apply skills in real projects' },
          { id: '2', text: 'Lead a team meeting' },
        ],
        milestone: 'Successfully lead one cross-functional meeting',
      },
      {
        id: '3',
        dayRange: 'Day 61-90',
        title: 'Mastery',
        goals: [
          { id: '1', text: 'Demonstrate consistent improvement' },
          { id: '2', text: 'Mentor others on learnings' },
        ],
        milestone: 'Present strategic recommendation to leadership',
      },
    ],
  };
}