import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CreatePlanForm } from './components/CreatePlanForm';
import { OnboardingPlan } from './components/OnboardingPlan';
import { ManagerToolkit } from './components/ManagerToolkit';
import { ProgressTracking } from './components/ProgressTracking';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'create-plan',
        Component: CreatePlanForm,
      },
      {
        path: 'employees/:id/onboarding-plan',
        Component: OnboardingPlan,
      },
      {
        path: 'employees/:id/manager-toolkit',
        Component: ManagerToolkit,
      },
      {
        path: 'employees/:id/progress-tracking',
        Component: ProgressTracking,
      },
    ],
  },
]);