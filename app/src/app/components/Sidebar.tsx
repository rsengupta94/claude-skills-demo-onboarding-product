import { Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { api } from '../services/api';

interface SidebarEmployee {
  id: string;
  name: string;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePage = location.pathname === '/create-plan';

  const [employees, setEmployees] = useState<SidebarEmployee[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getEmployees().then((data) => {
      const mapped = data.map((e) => ({ id: e.employeeId, name: e.name }));
      setEmployees(mapped);
      // Auto-expand the employee matching current route
      const match = location.pathname.match(/\/employees\/([^/]+)/);
      if (match) {
        setExpandedItems(new Set([match[1]]));
      } else if (mapped.length > 0) {
        setExpandedItems(new Set([mapped[0].id]));
      }
    }).catch(() => {});
  }, [location.pathname]);

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const isActiveRoute = (employeeId: string, subRoute: string) => {
    return location.pathname === `/employees/${employeeId}/${subRoute}`;
  };

  return (
    <aside 
      className="h-full flex flex-col"
      style={{ width: '280px', backgroundColor: '#F5F7FA' }}
    >
      <div className="p-4">
        <button 
          onClick={() => navigate('/create-plan')}
          disabled={isCreatePage}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: isCreatePage ? '#94a3b8' : '#0056D2',
            color: 'white'
          }}
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-xs font-semibold tracking-wider text-gray-500 mb-3">
          VIEW ALL ONBOARDING
        </div>

        <div className="space-y-1">
          {/* New Hire Placeholder */}
          {isCreatePage && (
            <div className="px-3 py-2 text-sm text-gray-400 italic">
              New Hire
            </div>
          )}

          {/* Empty state message */}
          {!isCreatePage && employees.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400 italic">
              No plans yet
            </div>
          )}

          {/* Employee List - Dynamic */}
          {employees.map((employee) => (
            <div key={employee.id}>
              <button
                onClick={() => toggleItem(employee.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors text-left"
              >
                {expandedItems.has(employee.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700">{employee.name}</span>
              </button>
              {expandedItems.has(employee.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  <button 
                    onClick={() => navigate(`/employees/${employee.id}/onboarding-plan`)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActiveRoute(employee.id, 'onboarding-plan') ? '#0056D2' : 'transparent',
                      color: isActiveRoute(employee.id, 'onboarding-plan') ? 'white' : '#6b7280',
                    }}
                  >
                    Onboarding Plan
                  </button>
                  <button 
                    onClick={() => navigate(`/employees/${employee.id}/manager-toolkit`)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActiveRoute(employee.id, 'manager-toolkit') ? '#0056D2' : 'transparent',
                      color: isActiveRoute(employee.id, 'manager-toolkit') ? 'white' : '#6b7280',
                    }}
                  >
                    Manager Toolkit
                  </button>
                  <button 
                    onClick={() => navigate(`/employees/${employee.id}/progress-tracking`)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActiveRoute(employee.id, 'progress-tracking') ? '#0056D2' : 'transparent',
                      color: isActiveRoute(employee.id, 'progress-tracking') ? 'white' : '#6b7280',
                    }}
                  >
                    Progress Tracking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4">
        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center px-3 py-2 rounded-lg text-left font-medium transition-colors"
          style={{ 
            backgroundColor: location.pathname === '/' ? '#0056D2' : 'transparent',
            color: location.pathname === '/' ? 'white' : '#374151'
          }}
        >
          <span className="text-sm">Dashboard</span>
        </button>
      </div>
    </aside>
  );
}