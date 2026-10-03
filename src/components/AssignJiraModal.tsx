import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Save, Link2 } from 'lucide-react';
import { ComplianceRequest, SprintTicket, BugRequest } from '../types';

interface AssignJiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: any, jiraLink: string) => void;
  request?: ComplianceRequest | null;
  item?: ComplianceRequest | SprintTicket | BugRequest | null;
}

export const AssignJiraModal: React.FC<AssignJiraModalProps> = ({
  isOpen,
  onClose,
  onSave,
  request,
  item,
}) => {
  const activeItem = request || item;
  const [jiraLink, setJiraLink] = useState('');

  useEffect(() => {
    if (activeItem) {
      setJiraLink(activeItem.jiraLink || '');
    }
  }, [activeItem, isOpen]);

  if (!isOpen || !activeItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activeItem, jiraLink.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Assign Jira Ticket</h3>
              <p className="text-[11px] text-slate-400">
                {activeItem.id} - {activeItem.title.slice(0, 30)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jira URL or Issue Key
            </label>
            <input
              id="input-assign-jira-link"
              type="text"
              required
              value={jiraLink}
              onChange={(e) => setJiraLink(e.target.value)}
              placeholder="e.g. https://jira.internal.ace/browse/ACE-1042 or ACE-1042"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Links engineering tickets to this regulatory compliance intake item.
            </p>
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
              id="btn-save-jira"
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Jira Link</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
