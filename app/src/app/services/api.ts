/**
 * API Client Service
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface JDAnalysisResult {
  roleTitle: string;
  competencies: Array<{
    competency: string;
    groupId: string;
    category: 'technical' | 'behavioral';
    importance: 'high' | 'moderate' | 'low';
    evidence: string;
    matchType: 'existing' | 'new_bucket';
  }>;
  newBuckets: Array<{
    groupId: string;
    groupName: string;
    covers: string[];
    category: 'technical' | 'behavioral';
    source: 'dynamic';
    rationale: string;
  }>;
}

export interface CreatePlanRequest {
  hireName: string;
  jobDescription: string;
  assessment: {
    interviewNotes?: string;
    competencyRatings?: Array<{
      competency: string;
      rating: number;
    }>;
  };
  llmConfig?: {
    provider?: 'openai' | 'gemini';
    model?: string;
  };
}

export interface CreatePlanResponse {
  success: boolean;
  employeeId: string;
  message: string;
  metadata: {
    duration: number;
    stepsCompleted: number;
  };
}

export interface Employee {
  employeeId: string;
  name: string;
  roleTitle: string;
  createdAt: string;
  llmProvider?: string;
}

export interface OnboardingPlan {
  employeeId: string;
  name: string;
  roleTitle: string;
  gapAnalysis: Array<{
    competency: string;
    severity: 'low' | 'moderate' | 'high';
    currentLevel: number;
    targetLevel: number;
    evidence: string;
    priority: number;
  }>;
  learningPath: Array<{
    sequence: number;
    courseId: string;
    courseTitle: string;
    courseUrl: string;
    addresses: string;
    duration: string;
    rationale: string;
    relevanceScore: number;
    recommendedModules: string[];
  }>;
  plan306090: Array<{
    dayRange: string;
    title: string;
    goals: string[];
    learningActivities: string[];
    practiceActivities: string[];
    milestone: string;
  }>;
  unmatchedGaps: Array<{
    competency: string;
    reason: string;
  }>;
}

export interface ManagerToolkit {
  employeeId: string;
  name: string;
  focusAreas: Array<{
    area: string;
    priority: string;
    context: string;
  }>;
  checkIns: Array<{
    day: number;
    prompts: string[];
  }>;
  supportTips: string[];
}

export interface ProgressTracking {
  employeeId: string;
  name: string;
  overallReadiness: number;
  phases: Array<{
    day: number;
    status: 'upcoming' | 'in_progress' | 'completed';
  }>;
  learningChecklist: Array<{
    id: string;
    title: string;
    module: string;
    status: 'not-started' | 'in-progress' | 'completed';
    courseId: string;
  }>;
  skillProgression: Array<{
    id: string;
    competency: string;
    before: number;
    current: number;
    target: number;
  }>;
}

export interface DashboardMetrics {
  activePlans: number;
  avgCompletionRate: number;
  onTrack: number;
  behind: number;
  avgDays: number;
  gapsClosed: number;
}

// API Error class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use default error message
    }

    throw new APIError(errorMessage, response.status);
  }

  const data = await response.json();

  if (!data.success && data.error) {
    throw new APIError(data.error);
  }

  return data;
}

// API Client
export const api = {
  /**
   * Analyze job description and extract competencies
   */
  async analyzeJobDescription(jobDescription: string): Promise<JDAnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/analyze-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobDescription }),
    });

    const result = await handleResponse<{ success: boolean; data: JDAnalysisResult }>(response);
    return result.data;
  },

  /**
   * Create complete onboarding plan
   */
  async createPlan(request: CreatePlanRequest): Promise<CreatePlanResponse> {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return handleResponse<CreatePlanResponse>(response);
  },

  /**
   * Get list of all employees
   */
  async getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${API_BASE_URL}/employees`);
    const result = await handleResponse<{ success: boolean; data: Employee[]; count: number }>(response);
    return result.data;
  },

  /**
   * Get onboarding plan for specific employee
   */
  async getOnboardingPlan(employeeId: string): Promise<OnboardingPlan> {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/onboarding-plan`);
    const result = await handleResponse<{ success: boolean; data: OnboardingPlan }>(response);
    return result.data;
  },

  /**
   * Get manager toolkit for specific employee
   */
  async getManagerToolkit(employeeId: string): Promise<ManagerToolkit> {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/manager-toolkit`);
    const result = await handleResponse<{ success: boolean; data: ManagerToolkit }>(response);
    return result.data;
  },

  /**
   * Get progress tracking for specific employee
   */
  async getProgressTracking(employeeId: string): Promise<ProgressTracking> {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/progress-tracking`);
    const result = await handleResponse<{ success: boolean; data: ProgressTracking }>(response);
    return result.data;
  },

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
    const result = await handleResponse<{ success: boolean; data: DashboardMetrics }>(response);
    return result.data;
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; llmProvider: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return handleResponse(response);
  },
};

export default api;
