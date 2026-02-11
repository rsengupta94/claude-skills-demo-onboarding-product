// Mock data structure - In production, this would come from an API/database
// based on the employee's progress, learning completion, and skill assessments

export interface PhaseIndicator {
  day: number;
  status: 'completed' | 'current' | 'upcoming';
}

export interface LearningItem {
  id: string;
  title: string;
  module: string;
  status: 'completed' | 'in-progress' | 'not-started';
}

export interface SkillLevel {
  before: number;
  current: number;
  target: number;
}

export interface SkillProgression {
  id: string;
  skillName: string;
  levels: SkillLevel;
}

export interface ProgressTrackingData {
  overallReadiness: number; // Percentage 0-100
  phases: PhaseIndicator[];
  learningChecklist: LearningItem[];
  skillProgression: SkillProgression[];
}

// Placeholder data for visualization - Would be fetched from backend
export function getProgressTrackingData(employeeId: string): ProgressTrackingData {
  // In production: return await fetch(`/api/employees/${employeeId}/progress-tracking`)
  
  // Mock data - real-time progress data would be returned for each employee
  return {
    overallReadiness: 67,
    phases: [
      { day: 30, status: 'completed' },
      { day: 60, status: 'current' },
      { day: 90, status: 'upcoming' },
    ],
    learningChecklist: [
      {
        id: '1',
        title: 'Executive Communication Mastery',
        module: 'Module 1',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Executive Communication Mastery',
        module: 'Module 2',
        status: 'completed',
      },
      {
        id: '3',
        title: 'Strategic Thinking for Leaders',
        module: 'Module 1',
        status: 'in-progress',
      },
    ],
    skillProgression: [
      {
        id: '1',
        skillName: 'Communication',
        levels: {
          before: 2,
          current: 3,
          target: 4,
        },
      },
      {
        id: '2',
        skillName: 'Strategic Thinking',
        levels: {
          before: 3,
          current: 3,
          target: 4,
        },
      },
    ],
  };
}
