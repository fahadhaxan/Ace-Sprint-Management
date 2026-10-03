import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, FileText, User, ExternalLink } from 'lucide-react';
import { ComplianceRequest, SprintTicket } from '../types';

interface CompleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    item: ComplianceRequest | SprintTicket;
    resolutionDate: string;
    completedBy: string;
    jiraLink: string;
    finalNotes: string;
  }) => void;
  item: ComplianceRequest | SprintTicket | null;
}

export const CompleteItemModal: React.FC<CompleteItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
}) => {
  const [finalNotes, setFinalNotes] = useState('');
  const [completedBy, setCompletedBy] = useState('ACE Systems Admin');
  const [jiraLink, setJiraLink] = useState('');

  useEffect(() => {
    if (item) {
      setJiraLink(item.jiraLink || '');
      setFinalNotes('');
      setCompletedBy(
        'submittedBy' in item ? item.submittedBy.split('(')[0].trim() : (item as SprintTicket).assignee || 'ACE Systems Admin'
      );
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isRequest = 'brdRequired' in item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      item,
      resolutionDate: new Date().toISOString().slice(0, 10),
      completedBy: completedBy.trim(),
      jiraLink: jiraLink.trim(),
      finalNotes: finalNotes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/80 text-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Mark as Complete & Move to Archive
              </h3>
              <p className="text-[11px] text-emerald-200">
                {isRequest ? 'Compliance Request' : 'Sprint Ticket'}: {item.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Item to Finalize
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {item.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Completed By / Sign-off Lead <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="input-complete-by"
                type="text"
                required
                value={completedBy}
                onChange={(e) => setCompletedBy(e.target.value)}
                placeholder="e.g., Sarah Jenkins"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Associated Jira Link
            </label>
            <input
              id="input-complete-jira"
              type="text"
              value={jiraLink}
              onChange={(e) => setJiraLink(e.target.value)}
              placeholder="e.g., https://jira.internal.ace/browse/ACE-1042"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resolution & Compliance Sign-off Notes
            </label>
            <textarea
              id="input-complete-notes"
              rows={3}
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              placeholder="Summary of deployment verification, regulatory audit clearance, or operational sign-off..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 bg-white font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-complete"
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Completion</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
