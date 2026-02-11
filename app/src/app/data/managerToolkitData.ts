// Mock data structure - In production, this would come from an API/database
// based on the employee's role, assessment results, and development areas

export interface FocusArea {
  id: string;
  text: string;
}

export interface CheckInPrompt {
  id: string;
  question: string;
}

export interface DayCheckIn {
  day: number;
  prompts: CheckInPrompt[];
}

export interface SupportTip {
  id: '1' | '2' | '3';
  text: string;
}

export interface ManagerToolkitData {
  focusAreas: FocusArea[];
  checkIns: DayCheckIn[];
  supportTips: SupportTip[];
}

// Placeholder data for visualization - Would be fetched from backend
export function getManagerToolkitData(employeeId: string): ManagerToolkitData {
  // In production: return await fetch(`/api/employees/${employeeId}/manager-toolkit`)
  
  // Mock data - personalized content would be returned for each employee based on their development needs
  return {
    focusAreas: [
      { id: '1', text: 'Executive communication and presence' },
      { id: '2', text: 'Strategic narrative building' },
    ],
    checkIns: [
      {
        day: 30,
        prompts: [
          { id: '1', question: 'How comfortable do you feel presenting to the team?' },
          { id: '2', question: 'What challenges have you faced in communication?' },
        ],
      },
      {
        day: 60,
        prompts: [
          { id: '1', question: 'Tell me about a recent strategic decision you made' },
        ],
      },
    ],
    supportTips: [
      { id: '1', text: 'Pair with senior leader for shadowing' },
      { id: '2', text: 'Provide low-stakes presentation opportunities' },
      { id: '3', text: 'Share examples of good strategic narratives' },
    ],
  };
}