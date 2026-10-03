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
  ShieldCheck, 
  X,
  ExternalLink,
  ChevronRight,
  Bookmark
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  requestCount: number;
  bugCount?: number;
  ticketCount: number;
  completedCount: number;
  deletedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
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
      label: 'User Management',
      icon: Users,
    },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between glass-sidebar w-60 md:w-64">
      {/* Top Brand info (Mobile close or Title) */}
      <div>
        <div className="p-4 border-b border-slate-200/50 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-sm">ACE Compliance</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav List */}
        <nav className="p-3 space-y-1" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-red-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-white/55 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-200/30 text-slate-600 group-hover:bg-white group-hover:text-red-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card & Environment Badge */}
      <div className="p-4 border-t border-slate-200/50 bg-white/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            AC
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-slate-900 truncate">
              ACE Systems Admin
            </span>
            <span className="block text-[10px] text-slate-500 truncate">
              ace-368@acehrm.net
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block flex-shrink-0 sticky top-[95px] h-[calc(100vh-95px)] overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};
