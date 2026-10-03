import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  FileText,
  UploadCloud,
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenGcrRules: () => void;
  onOpenBackofficeManual: () => void;
  onOpenImportModal: () => void;
  onOpenAuditDuplicates?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGcrRules,
  onOpenBackofficeManual,
  onOpenImportModal,
  onOpenAuditDuplicates,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <header className="glass-header sticky top-0 z-30 shadow-xs">
      {/* Main Header bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo and System Title: ACE Compliance Portal - Systems Department */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Toggle Sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-lg bg-red-700 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
                  ACE Compliance Portal - Systems Department
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Links & Top Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Reference links */}
            <div className="hidden xl:flex items-center bg-slate-50/50 p-1 rounded-lg border border-slate-200/50 text-xs">
              <button
                id="btn-quicklink-gcr"
                type="button"
                onClick={onOpenGcrRules}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-red-700 hover:bg-white rounded font-medium transition-colors cursor-pointer"
                title="View Governance, Compliance & Regulatory Rules"
              >
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>GCR Rules</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                id="btn-quicklink-manual"
                type="button"
                onClick={onOpenBackofficeManual}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-red-700 hover:bg-white rounded font-medium transition-colors cursor-pointer"
                title="View Systems Department Operational Manual"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Backoffice Manual</span>
              </button>
            </div>

            {/* Top Action Controls: Import Excel */}
            <button
              id="btn-import-excel"
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-lg text-white bg-red-700 hover:bg-red-800 border border-red-800 transition-colors shadow-xs cursor-pointer"
              title="Import Excel workbooks (.xlsx, .xls)"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>Import Excel</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
