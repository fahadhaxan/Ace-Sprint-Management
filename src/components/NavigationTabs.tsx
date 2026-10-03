import React from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Bug,
  KanbanSquare, 
  CheckCircle2, 
  Trash2, 
  BarChart3, 
  Settings, 
  Users,
  Bookmark
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  requestCount: number;
  bugCount?: number;
  ticketCount: number;
  completedCount: number;
  deletedCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'requests' as ActiveTab,
      label: 'Request Register',
      icon: ClipboardList,
    },
    {
      id: 'watchlist' as ActiveTab,
      label: 'My Watchlist',
      icon: Bookmark,
    },
    {
      id: 'bugs' as ActiveTab,
      label: 'Bug Requests',
      icon: Bug,
    },
    {
      id: 'sprint' as ActiveTab,
      label: 'Sprint Tracker',
      icon: KanbanSquare,
    },
    {
      id: 'completed' as ActiveTab,
      label: 'Completed',
      icon: CheckCircle2,
    },
    {
      id: 'trash' as ActiveTab,
      label: 'Trash',
      icon: Trash2,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Admin Settings',
      icon: Settings,
    },
    {
      id: 'users' as ActiveTab,
      label: 'Users',
      icon: Users,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 lg:hidden overflow-x-auto">
      <div className="w-full px-4 py-2">
        <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
