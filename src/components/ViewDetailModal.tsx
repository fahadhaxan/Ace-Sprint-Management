import React from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  User, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ComplianceRequest, SprintTicket, CompletedRecord, CustomStatus, BugRequest } from '../types';
import { getStatusBadgeStyle } from '../utils/statusUtils';

interface ViewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ComplianceRequest | SprintTicket | CompletedRecord | BugRequest | null;
  item?: ComplianceRequest | SprintTicket | CompletedRecord | BugRequest | null;
  customStatuses?: CustomStatus[];
}

export const ViewDetailModal: React.FC<ViewDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  item,
  customStatuses = [],
}) => {
  const [copied, setCopied] = React.useState(false);

  const activeItem = data || item;
  if (!isOpen || !activeItem) return null;

  // Determine item type
  const isCompleted = 'resolutionDate' in activeItem;
  const isRequest = 'brdRequired' in activeItem && !isCompleted;
  const isTicket = 'assignee' in activeItem && !isCompleted;
  const isBug = ('about' in activeItem || 'severity' in activeItem) && !isCompleted;

  const id = isCompleted ? (activeItem as CompletedRecord).originalId : activeItem.id;
  const title = activeItem.title;
  const status = isCompleted ? 'Completed' : (activeItem as any).status || 'Active';
  const statusStyle = getStatusBadgeStyle(status, customStatuses);

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-800 text-red-100 flex items-center justify-center font-mono font-bold text-xs">
              {isRequest ? 'REQ' : isTicket ? 'JIRA' : isBug ? 'BUG' : 'DONE'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-red-300">{id}</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  Read-Only Record
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ACE Systems Department Compliance Audit Log
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyId}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy ID to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm text-slate-800">
          
          {/* Title & Status Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Item Title
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
              >
                {status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h3>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Submitter / Assignee / Reporter */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {isRequest ? 'Submitted By' : isTicket ? 'Assignee' : isBug ? 'Reported By' : 'Completed By'}
              </span>
              <div className="font-semibold text-slate-800 mt-1 truncate">
                {isRequest
                  ? (activeItem as ComplianceRequest).submittedBy
                  : isTicket
                  ? (activeItem as SprintTicket).assignee
                  : isBug
                  ? (activeItem as any).reportedBy || (activeItem as any).assignedTo || 'Internal QA'
                  : (activeItem as CompletedRecord).completedBy || (activeItem as CompletedRecord).submittedOrAssigned}
              </div>
            </div>

            {/* Target Sprint / Environment */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-slate-400" />
                {isBug ? 'Environment' : 'Target Sprint'}
              </span>
              <div className="font-semibold text-slate-800 mt-1">
                {isRequest
                  ? (activeItem as ComplianceRequest).targetSprint || 'N/A'
                  : isTicket
                  ? (activeItem as SprintTicket).sprint || 'N/A'
                  : isBug
                  ? (activeItem as any).environment || 'Production'
                  : (activeItem as CompletedRecord).sprint || 'N/A'}
              </div>
            </div>

            {/* Type / Severity */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                {isBug ? 'Severity' : 'Category / Type'}
              </span>
              <div className="font-semibold text-slate-800 mt-1">
                {isBug ? (activeItem as any).severity || 'Bug' : (activeItem as any).type || 'General'}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {isCompleted ? 'Resolution Date' : 'Registration Date'}
              </span>
              <div className="font-semibold text-slate-800 mt-1">
                {isCompleted
                  ? (activeItem as CompletedRecord).resolutionDate
                  : (activeItem as any).date || (activeItem as any).targetDate || 'N/A'}
              </div>
            </div>

            {/* BRD Required (for Request) or Priority */}
            {isRequest && (
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  BRD Required?
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      (activeItem as ComplianceRequest).brdRequired === 'Yes'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {(activeItem as ComplianceRequest).brdRequired}
                  </span>
                </div>
              </div>
            )}

            {isTicket && (
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Priority
                </span>
                <div className="font-semibold text-slate-800 mt-1">
                  {(activeItem as SprintTicket).priority}
                </div>
              </div>
            )}

            {isBug && (
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Assigned To
                </span>
                <div className="font-semibold text-slate-800 mt-1">
                  {(activeItem as any).assignedTo || 'Unassigned'}
                </div>
              </div>
            )}

            {/* Jira Ticket Reference Hyperlink */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-slate-400" />
                Jira Reference
              </span>
              <div className="font-semibold text-slate-800 mt-1 truncate">
                {(activeItem as any).jiraLink ? (
                  <a
                    href={(activeItem as any).jiraLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-700 hover:text-red-900 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                  >
                    <span>{(activeItem as any).jiraLink.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-normal italic">None Assigned</span>
                )}
              </div>
            </div>

          </div>

          {/* Description / About / Business Logic */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-700" />
              <span>{isBug ? 'About / Problem Summary' : 'Description / Business Logic'}</span>
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
              {(activeItem as any).about || (activeItem as any).description || (activeItem as any).notes || 'No description provided.'}
            </div>
          </div>

          {/* Reproduction Steps (for Bug) */}
          {isBug && (activeItem as any).reproductionSteps && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Reproduction Steps & Observed Behavior</span>
              </h4>
              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 text-slate-700 leading-relaxed font-sans whitespace-pre-wrap font-mono text-xs">
                {(activeItem as any).reproductionSteps}
              </div>
            </div>
          )}

          {/* Source / Trigger / Operational Notes */}
          {((activeItem as any).sourceTrigger || ((activeItem as any).notes && !isBug)) && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">
                Source / Trigger & Operational Context
              </h4>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 leading-relaxed whitespace-pre-wrap">
                {(activeItem as any).sourceTrigger || (activeItem as any).notes}
              </div>
            </div>
          )}

          {/* Final Notes (for Completed Records) */}
          {isCompleted && (activeItem as CompletedRecord).finalNotes && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Final Resolution & Compliance Signoff</span>
              </h4>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed whitespace-pre-wrap">
                {(activeItem as CompletedRecord).finalNotes}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Click anywhere outside or press Close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
