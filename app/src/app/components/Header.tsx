import { ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-xl font-semibold" style={{ color: '#0056D2' }}>
        Onboarding L&D
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        <span className="text-sm">Hiring Manager</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </header>
  );
}
