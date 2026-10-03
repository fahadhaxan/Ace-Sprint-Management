import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { ComplianceRequest, CustomStatus, PriorityTier } from '../types';
import { AiDuplicateAlert } from './AiDuplicateAlert';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: ComplianceRequest) => void;
  editingRequest?: ComplianceRequest | null;
  request?: ComplianceRequest | null;
  customStatuses?: CustomStatus[];
  sprints?: string[];
  existingItems?: any[];
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRequest,
  request,
  customStatuses = [],
  sprints = ['Sprint 24.05', 'Sprint 24.06', 'Sprint 24.07', 'Sprint 24.08', 'Sprint 24.09', 'Backlog'],
  existingItems = [],
}) => {
  const activeRequest = editingRequest || request;
  const [title, setTitle] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [type, setType] = useState('Compliance');
  const [status, setStatus] = useState('New');
  const [targetSprint, setTargetSprint] = useState('Sprint 24.07');
  const [brdRequired, setBrdRequired] = useState<'Yes' | 'No'>('Yes');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [sourceTrigger, setSourceTrigger] = useState('');
  const [notes, setNotes] = useState('');
  const [jiraLink, setJiraLink] = useState('');
  const [priorityTier, setPriorityTier] = useState<PriorityTier>('Medium Priority');
  const [portalLabel, setPortalLabel] = useState('Backoffice');
  const [typeLabel, setTypeLabel] = useState('Sprint request');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (activeRequest) {
      setTitle(activeRequest.title);
      setSubmittedBy(activeRequest.submittedBy);
      setType(activeRequest.type);
      setStatus(activeRequest.status);
      setTargetSprint(activeRequest.targetSprint || 'Sprint 24.07');
      setBrdRequired(activeRequest.brdRequired || 'Yes');
      setDate(activeRequest.date || new Date().toISOString().slice(0, 10));
      setDescription(activeRequest.description || '');
      setSourceTrigger(activeRequest.sourceTrigger || '');
      setNotes(activeRequest.notes || '');
      setJiraLink(activeRequest.jiraLink || '');
      setPriorityTier(activeRequest.priorityTier || 'Medium Priority');
      setPortalLabel(activeRequest.portalLabel || 'Backoffice');
      setTypeLabel(activeRequest.typeLabel || 'Sprint request');
    } else {
      resetForm();
    }
    setErrors({});
  }, [activeRequest, isOpen]);

  const resetForm = () => {
    setTitle('');
    setSubmittedBy('');
    setType('Compliance');
    setStatus('New');
    setTargetSprint(sprints[0] || 'Sprint 24.07');
    setBrdRequired('Yes');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setSourceTrigger('');
    setNotes('');
    setJiraLink('');
    setPriorityTier('Medium Priority');
    setPortalLabel('Backoffice');
    setTypeLabel('Sprint request');
    setErrors({});
  };

  if (!isOpen) return null;

  const isApproved = status.toLowerCase() === 'approved';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!title.trim()) errs.title = 'Request Title is required';
    if (!submittedBy.trim()) errs.submittedBy = 'Submitted By is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newReq: ComplianceRequest = {
      id: activeRequest ? activeRequest.id : `REQ-${String(Math.floor(100 + Math.random() * 900))}`,
      date,
      title: title.trim(),
      submittedBy: submittedBy.trim(),
      type,
      status,
      targetSprint,
      brdRequired,
      description: description.trim(),
      sourceTrigger: sourceTrigger.trim(),
      notes: notes.trim(),
      jiraLink: jiraLink.trim(),
      priorityTier,
      portalLabel,
      typeLabel,
      createdAt: activeRequest ? activeRequest.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newReq);
    onClose();
  };

  // Status options from customStatuses or default
  const statusOptions = customStatuses.length > 0 
    ? customStatuses.filter(s => s.category === 'request' || s.category === 'both').map(s => s.name)
    : ['New', 'Under Review', 'Approved', 'In Dev', 'Completed', 'Rejected'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {activeRequest ? `Edit Request (${activeRequest.id})` : 'New Compliance Request Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                ACE Systems Department Regulatory Intake Form
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Title <span className="text-red-600">*</span>
              </label>
              <input
                id="input-req-modal-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Automated Sanctions Daily Delta Feed Ingestion"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 ${
                  errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Submitted By */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Submitted By <span className="text-red-600">*</span>
              </label>
              <input
                id="input-req-modal-submitter"
                type="text"
                required
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="e.g., Sarah Jenkins (Financial Crime Unit)"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 ${
                  errors.submittedBy ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.submittedBy && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {errors.submittedBy}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Intake Date
              </label>
              <input
                id="input-req-modal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Type
              </label>
              <select
                id="select-req-modal-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="Compliance">Compliance</option>
                <option value="New Feature">New Feature</option>
                <option value="Defect">Defect</option>
                <option value="Policy Update">Policy Update</option>
                <option value="Audit Requirement">Audit Requirement</option>
                <option value="Automation">Automation</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                id="select-req-modal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Sprint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Sprint
              </label>
              <select
                id="select-req-modal-sprint"
                value={targetSprint}
                onChange={(e) => setTargetSprint(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                {sprints.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* BRD Required */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                BRD Required?
              </label>
              <select
                id="select-req-modal-brd"
                value={brdRequired}
                onChange={(e) => setBrdRequired(e.target.value as 'Yes' | 'No')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="Yes">Yes (Business Requirements Doc Mandatory)</option>
                <option value="No">No (Engineering Light-Spec)</option>
              </select>
            </div>

            {/* Portal Label */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Portal Label
              </label>
              <select
                id="select-req-modal-portal-label"
                value={portalLabel}
                onChange={(e) => setPortalLabel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="Backoffice">Backoffice</option>
                <option value="ARMS">ARMS</option>
                <option value="SAR ticketing">SAR ticketing</option>
                <option value="Chargeback">Chargeback</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>

            {/* Type Label */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Label Category
              </label>
              <select
                id="select-req-modal-type-label"
                value={typeLabel}
                onChange={(e) => setTypeLabel(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="Sprint request">Sprint request</option>
                <option value="Bug">Bug</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* Priority Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Tier
              </label>
              <select
                id="select-req-modal-priority"
                value={priorityTier}
                onChange={(e) => setPriorityTier(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="High Priority">High Priority (Regulatory Mandatory)</option>
                <option value="Medium Priority">Medium Priority (Scheduled Operations)</option>
                <option value="Low Priority">Low Priority (Backlog Wishlist)</option>
              </select>
            </div>

            {/* Jira Link (Always accessible, highlighted when Approved) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Jira Ticket Link</span>
                {isApproved && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Unlocked for Approved Status
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="input-req-modal-jira"
                  type="text"
                  value={jiraLink}
                  onChange={(e) => setJiraLink(e.target.value)}
                  placeholder="e.g., https://jira.internal.ace/browse/ACE-1042"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 ${
                    isApproved ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>
            </div>

          </div>

          {/* Description / Business Logic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Business Logic
            </label>
            <textarea
              id="input-req-modal-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the statutory or operational business logic, functional flow, and validation criteria..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white font-sans"
            />
          </div>

          {/* Feature 4: Semantic Duplicate & Conflict Detector */}
          <div className="py-1">
            <AiDuplicateAlert
              draftTitle={title}
              draftDescription={description}
              draftType={type}
              currentId={activeRequest?.id}
              existingItems={existingItems}
            />
          </div>

          {/* Source / Trigger / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Source / Trigger
              </label>
              <input
                id="input-req-modal-source"
                type="text"
                value={sourceTrigger}
                onChange={(e) => setSourceTrigger(e.target.value)}
                placeholder="e.g., External Regulatory Audit Finding #2024-AC-04"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operational Notes
              </label>
              <input
                id="input-req-modal-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Legal approved data contract; QA sign-off pending"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              id="btn-req-modal-reset"
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-req-modal-save"
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingRequest ? 'Save Changes' : '+ Add Request'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
