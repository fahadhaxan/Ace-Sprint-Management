import React, { useRef } from 'react';
import { X, FileText, CheckSquare, Layers, ShieldCheck, GitPullRequest, UploadCloud } from 'lucide-react';

interface BackofficeManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackofficeManualModal: React.FC<BackofficeManualModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Systems Department Backoffice Operational Manual
              </h2>
              <p className="text-xs text-slate-400">
                SOP-2024-SYS-09: Request Intake, Sprint Cadence & Audit Lifecycle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-700">
          
          {/* Workflow Overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              <span>1. Request Intake & Prioritisation Lifecycle</span>
            </h3>
            <p className="text-xs text-slate-600">
              All compliance enhancements, defect remediation, and audit findings follow a standardized 4-stage progression:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-purple-700">Stage 1: New</span>
                <p className="text-[11px] text-slate-500 mt-1">Submitted by unit. Prioritisation score matrix initialized.</p>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-sky-700">Stage 2: Under Review</span>
                <p className="text-[11px] text-slate-500 mt-1">Systems Architect & Compliance Officer technical review.</p>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-emerald-700">Stage 3: Approved</span>
                <p className="text-[11px] text-slate-500 mt-1">Accepted for target sprint. JIRA backlog ticket generated.</p>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-rose-700">Stage 4: Rejected</span>
                <p className="text-[11px] text-slate-500 mt-1">Insufficient regulatory mandate or technical feasibility issue.</p>
              </div>
            </div>
          </div>

          {/* BRD Rules */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-700" />
              <span>2. Business Requirements Document (BRD) Guidelines</span>
            </h3>
            <p className="text-xs text-slate-600">
              A formal BRD is mandatory for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Any change affecting legal regulatory filings (SAR, CTR, Sanctions).</li>
              <li>Changes with total score ≥ 70 (High Priority).</li>
              <li>Modifications requiring database schema migrations or core ledger adjustments.</li>
            </ul>
          </div>

          {/* Spillover & Deferred Tickets */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-amber-600" />
              <span>3. Spillover & Deferral Protocols</span>
            </h3>
            <p className="text-xs text-slate-600">
              When a deliverable cannot be completed in its assigned sprint, it must be marked as <strong className="text-amber-800">Deferred: Yes</strong> with a detailed reason in the notes field. Deferred items are automatically flagged in the <em>Deferred & Spillover Audit Report</em> for monthly management review.
            </p>
          </div>

          {/* Soft Delete & Trash Retention */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Audit Immutability & Trash Safeguards</span>
            </h3>
            <p className="text-xs text-slate-600">
              In accordance with Systems Department compliance regulations, accidental deletions cannot destroy records immediately. Items deleted from active views enter the <strong>Trash / Deleted Items</strong> stage, preserving historical state, origin, and original timestamps.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-2xs transition-colors cursor-pointer">
              <UploadCloud className="w-4 h-4" />
              Upload Document
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".jpeg,.jpg,.pdf,.csv" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    alert(`Selected ${e.target.files[0].name} for upload.`);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }} 
              />
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Supported: .jpeg, .jpg, .pdf, .csv</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close Manual
          </button>
        </div>

      </div>
    </div>
  );
};
