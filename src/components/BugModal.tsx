import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bug, 
  ExternalLink, 
  AlertCircle, 
  ShieldAlert, 
  Save, 
  Layers 
} from 'lucide-react';
import { BugRequest, BugSeverity, BugStatus } from '../types';
import { AiDuplicateAlert } from './AiDuplicateAlert';

interface BugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bug: BugRequest) => void;
  editingBug?: BugRequest | null;
  existingItems?: any[];
}

export const BugModal: React.FC<BugModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBug,
  existingItems = [],
}) => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [status, setStatus] = useState<BugStatus>('New');
  const [severity, setSeverity] = useState<BugSeverity>('Major');
  const [jiraLink, setJiraLink] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (editingBug) {
      setTitle(editingBug.title || '');
      setAbout(editingBug.about || '');
      setStatus(editingBug.status || 'New');
      setSeverity(editingBug.severity || 'Major');
      setJiraLink(editingBug.jiraLink || '');
      setReportedBy(editingBug.reportedBy || '');
      setAssignedTo(editingBug.assignedTo || '');
      setEnvironment(editingBug.environment || 'Production');
      setReproductionSteps(editingBug.reproductionSteps || '');
    } else {
      setTitle('');
      setAbout('');
      setStatus('New');
      setSeverity('Major');
      setJiraLink('');
      setReportedBy('');
      setAssignedTo('');
      setEnvironment('Production');
      setReproductionSteps('');
    }
    setErrors({});
  }, [editingBug, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!about.trim()) errs.about = 'About / Problem summary is required';
    if (!reportedBy.trim()) errs.reportedBy = 'Reporter name is required';
    
    if (jiraLink.trim()) {
      const clean = jiraLink.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.includes('jira')) {
        // We will auto-format to https:// if they type a URL, but check if it's reasonable
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let formattedJira = jiraLink.trim();
    if (formattedJira && !formattedJira.startsWith('http://') && !formattedJira.startsWith('https://')) {
      if (formattedJira.toUpperCase().startsWith('ACE-') || formattedJira.toUpperCase().startsWith('BUG-')) {
        formattedJira = `https://jira.internal.ace/browse/${formattedJira.toUpperCase()}`;
      } else {
        formattedJira = `https://${formattedJira}`;
      }
    }

    const bugData: BugRequest = {
      id: editingBug ? editingBug.id : `BUG-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      about: about.trim(),
      status,
      severity,
      jiraLink: formattedJira,
      reportedBy: reportedBy.trim(),
      assignedTo: assignedTo.trim() || undefined,
      environment,
      reproductionSteps: reproductionSteps.trim() || undefined,
      date: editingBug ? editingBug.date : new Date().toISOString().slice(0, 10),
      createdAt: editingBug ? editingBug.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(bugData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-700 text-rose-100 flex items-center justify-center shadow-xs">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  {editingBug ? `Edit Bug Request: ${editingBug.id}` : 'Report New Bug Request'}
                </h3>
                {editingBug && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700">
                    {editingBug.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ACE Systems Department Defect Tracking & Jira Integration
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bug Title <span className="text-red-500">*</span>
            </label>
            <input
              id="input-bug-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AML Daily Delta Feed Connection Timeout on Retry..."
              className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 ${
                errors.title ? 'border-red-500 ring-red-500/20' : 'border-slate-300 focus:ring-red-600/30'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* About / Problem Summary (Requested by user) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              About / Description & Impact <span className="text-red-500">*</span>
            </label>
            <textarea
              id="input-bug-about"
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Provide a clear explanation about the bug, root cause or symptoms, and regulatory/operational impact..."
              className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 ${
                errors.about ? 'border-red-500 ring-red-500/20' : 'border-slate-300 focus:ring-red-600/30'
              }`}
            />
            {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
          </div>

          {/* Feature 4: Semantic Duplicate Detector for Bugs */}
          <div className="py-1">
            <AiDuplicateAlert
              draftTitle={title}
              draftDescription={about}
              draftType="Bug"
              currentId={editingBug?.id}
              existingItems={existingItems}
            />
          </div>

          {/* Status & Severity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Status (Requested by user) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Investigation / Remediation Status <span className="text-red-500">*</span>
              </label>
              <select
                id="select-bug-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="New">New</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="In Dev">In Dev</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Severity / Urgency Tier
              </label>
              <select
                id="select-bug-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="Critical">Critical (Blocker / Compliance Breach)</option>
                <option value="Major">Major (Degraded Functional Flow)</option>
                <option value="Moderate">Moderate (Workaround Available)</option>
                <option value="Minor">Minor (Cosmetic / Low Impact)</option>
              </select>
            </div>

          </div>

          {/* Jira Ticket Reference (Hyperlink) - Requested by user */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Jira Ticket Reference (Hyperlink)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Optional URL or Key</span>
            </label>
            <div className="relative">
              <input
                id="input-bug-jira"
                type="text"
                value={jiraLink}
                onChange={(e) => setJiraLink(e.target.value)}
                placeholder="https://jira.internal.ace/browse/ACE-BUG-101 or ACE-BUG-101"
                className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 bg-white font-mono"
              />
              {jiraLink && (
                <a
                  href={jiraLink.startsWith('http') ? jiraLink : `https://${jiraLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2.5 top-2.5 text-blue-600 hover:text-blue-800"
                  title="Test link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Provides direct one-click navigation to the engineering issue in Atlassian Jira.
            </p>
          </div>

          {/* Reporter & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reported By <span className="text-red-500">*</span>
              </label>
              <input
                id="input-bug-reporter"
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Sarah Jenkins (Financial Crime)"
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 ${
                  errors.reportedBy ? 'border-red-500 ring-red-500/20' : 'border-slate-300 focus:ring-red-600/30'
                }`}
              />
              {errors.reportedBy && <p className="text-red-500 text-xs mt-1">{errors.reportedBy}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Engineer
              </label>
              <input
                id="input-bug-assignee"
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Vikram Mehta"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
              />
            </div>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Environment Observed
            </label>
            <select
              id="select-bug-env"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
            >
              <option value="Production">Production</option>
              <option value="UAT / Staging">UAT / Staging</option>
              <option value="QA / Test">QA / Test</option>
              <option value="Internal Backoffice">Internal Backoffice</option>
            </select>
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reproduction Steps & Observed Behavior (Optional)
            </label>
            <textarea
              id="input-bug-steps"
              rows={3}
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              placeholder="1. Navigate to...\n2. Click...\n3. Error message or unexpected behavior observed..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 font-mono text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingBug ? 'Save Changes' : 'Submit Bug Request'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
