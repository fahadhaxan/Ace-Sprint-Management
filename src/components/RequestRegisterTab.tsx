import React, { useState, useMemo, useEffect } from 'react';
import { 
  ComplianceRequest, 
  CustomStatus,
  ScoreMatrix,
  AiParsedIntake,
  BugRequest
} from '../types';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ExternalLink, 
  Eye, 
  RotateCcw, 
  Link2, 
  FileSpreadsheet,
  FileText,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  Square,
  X,
  Sparkles,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { getStatusBadgeStyle } from '../utils/statusUtils';
import { exportRequestsToExcel } from '../utils/excel';
import { calculateScore, getPriorityTier, getTierBadgeClasses } from '../utils/scoreCalculator';
import { AiIntakeModal } from './AiIntakeModal';
import { AiDuplicateAlert } from './AiDuplicateAlert';

interface RequestRegisterTabProps {
  requests: ComplianceRequest[];
  customStatuses: CustomStatus[];
  sprints: string[];
  allBugs?: BugRequest[];
  allTickets?: any[];
  onAddRequest: (req: ComplianceRequest) => void;
  onEditRequest: (req: ComplianceRequest) => void;
  onSoftDeleteRequest: (req: ComplianceRequest) => void;
  onBulkSoftDelete: (reqIds: string[]) => void;
  onMarkCompleteRequest: (req: ComplianceRequest) => void;
  onBulkMarkComplete: (reqIds: string[]) => void;
  onAssignJira: (req: ComplianceRequest) => void;
  onOpenDetailModal: (req: ComplianceRequest) => void;
  onOpenAuditDuplicates?: () => void;
  isNewFormOpenDefault?: boolean;
  watchedIds?: string[];
  onToggleWatch?: (id: string) => void;
  onPromoteToSprint?: (req: ComplianceRequest) => void;
  onBulkAddToSprint?: (targetSprint: string, reqIds: string[]) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const RequestRegisterTab: React.FC<RequestRegisterTabProps> = ({
  requests,
  customStatuses,
  sprints,
  allBugs = [],
  allTickets = [],
  onAddRequest,
  onEditRequest,
  onSoftDeleteRequest,
  onBulkSoftDelete,
  onMarkCompleteRequest,
  onBulkMarkComplete,
  onAssignJira,
  onOpenDetailModal,
  onOpenAuditDuplicates,
  isNewFormOpenDefault = false,
  watchedIds = [],
  onToggleWatch,
  onPromoteToSprint,
  onBulkAddToSprint,
  onNavigateToTab,
}) => {
  // Manual Entry Form Pop-up Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(isNewFormOpenDefault);
  const [isLocalAiIntakeOpen, setIsLocalAiIntakeOpen] = useState(false);

  useEffect(() => {
    if (isNewFormOpenDefault) {
      setIsAddModalOpen(true);
    }
  }, [isNewFormOpenDefault]);

  const [formTitle, setFormTitle] = useState('');
  const [formSubmittedBy, setFormSubmittedBy] = useState('');
  const [formType, setFormType] = useState('Compliance');
  const [formStatus, setFormStatus] = useState('New');
  const [formTargetSprint, setFormTargetSprint] = useState(sprints[0] || 'Sprint 24.07');
  const [formBrdRequired, setFormBrdRequired] = useState<'Yes' | 'No'>('No');
  const [formPortalLabel, setFormPortalLabel] = useState('Backoffice');
  const [formTypeLabel, setFormTypeLabel] = useState('Sprint request');
  
  const [formScoreMatrix, setFormScoreMatrix] = useState<ScoreMatrix>({
    regulatoryRisk: 12,
    operationalPain: 18,
    strategicAlignment: 14,
    riskOfInaction: 8,
    requestClarity: 7,
  });

  const [formDescription, setFormDescription] = useState('');
  const [formSourceTrigger, setFormSourceTrigger] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});

  // Table Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sprintFilter, setSprintFilter] = useState('ALL');
  const [portalFilter, setPortalFilter] = useState('ALL');
  const [typeLabelFilter, setTypeLabelFilter] = useState('ALL');
  const [bulkTargetSprint, setBulkTargetSprint] = useState(sprints[0] || 'Sprint 26.09');

  // Multi-Select Checkboxes State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action Dropdown State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Metrics matching Bug Register card format
  const totalCount = requests.length;
  const criticalCount = requests.filter(r => r.priorityTier === 'High Priority').length;
  const underReviewCount = requests.filter(r => r.status === 'Under Review' || r.status === 'New').length;
  const inDevCount = requests.filter(r => r.status === 'In Dev' || r.status === 'Approved').length;
  const completedCount = requests.filter(r => r.status === 'Completed' || r.status === 'Done').length;
  const jiraLinkedCount = requests.filter(r => Boolean(r.jiraLink && r.jiraLink.trim().length > 0)).length;

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.submittedBy.toLowerCase().includes(q) ||
        req.type.toLowerCase().includes(q) ||
        (req.jiraLink && req.jiraLink.toLowerCase().includes(q)) ||
        (req.description && req.description.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || req.type === typeFilter;
      const matchesPriority = priorityFilter === 'ALL' || req.priorityTier === priorityFilter;
      const matchesSprint = sprintFilter === 'ALL' || req.targetSprint === sprintFilter;
      const matchesPortal = portalFilter === 'ALL' || req.portalLabel === portalFilter;
      const matchesTypeLabel = typeLabelFilter === 'ALL' || req.typeLabel === typeLabelFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesSprint && matchesPortal && matchesTypeLabel;
    });
  }, [requests, searchTerm, statusFilter, typeFilter, priorityFilter, sprintFilter, portalFilter, typeLabelFilter]);

  const uniqueSubmitters = useMemo(() => {
    const submitters = new Set<string>();
    requests.forEach(r => {
      if (r.submittedBy && r.submittedBy.trim()) {
        submitters.add(r.submittedBy.trim());
      }
    });
    return Array.from(submitters).sort();
  }, [requests]);

  // Handle Select All
  const isAllFilteredSelected = filteredRequests.length > 0 && filteredRequests.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Unselect all filtered
      const newSet = new Set(selectedIds);
      filteredRequests.forEach(r => newSet.delete(r.id));
      setSelectedIds(newSet);
    } else {
      // Select all filtered
      const newSet = new Set(selectedIds);
      filteredRequests.forEach(r => newSet.add(r.id));
      setSelectedIds(newSet);
    }
  };

  const handleToggleRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleApplyAiSpec = (parsed: AiParsedIntake) => {
    setFormTitle(parsed.summary || parsed.title || '');
    setFormType(parsed.type || 'Compliance');
    setFormSourceTrigger(parsed.sourceTrigger || '');
    setFormBrdRequired(parsed.brdRequired || 'No');
    setFormPortalLabel(parsed.portalLabel || 'Backoffice');
    setFormTypeLabel(parsed.typeLabel || 'Sprint request');
    if (parsed.targetSprintSuggestion && sprints.includes(parsed.targetSprintSuggestion)) {
      setFormTargetSprint(parsed.targetSprintSuggestion);
    }
    
    // Combine the 6 drafted fields cleanly
    const descSections: string[] = [];
    if (parsed.description) {
      descSections.push(`### Description\n${parsed.description}`);
    }
    if (parsed.useCases && parsed.useCases.length > 0) {
      descSections.push(`### Use Cases\n${parsed.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')}`);
    }
    if (parsed.acceptanceCriteria && parsed.acceptanceCriteria.length > 0) {
      descSections.push(`### Acceptance Criteria\n${parsed.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
    }
    if (parsed.assumptions && parsed.assumptions.length > 0) {
      descSections.push(`### Assumptions\n${parsed.assumptions.map((a) => `• ${a}`).join('\n')}`);
    }
    if (parsed.impactAnalysis) {
      descSections.push(`### Impact Analysis\n${parsed.impactAnalysis}`);
    }

    setFormDescription(descSections.join('\n\n'));

    if (parsed.recommendedScores) {
      setFormScoreMatrix(parsed.recommendedScores);
    }

    setIsAddModalOpen(true);
  };

  const handleClearForm = () => {
    setFormTitle('');
    setFormSubmittedBy('');
    setFormType('Compliance');
    setFormStatus('New');
    setFormTargetSprint(sprints[0] || 'Sprint 24.07');
    setFormBrdRequired('No');
    setFormPortalLabel('Backoffice');
    setFormTypeLabel('Sprint request');
    setFormScoreMatrix({
      regulatoryRisk: 12,
      operationalPain: 18,
      strategicAlignment: 14,
      riskOfInaction: 8,
      requestClarity: 7,
    });
    setFormDescription('');
    setFormSourceTrigger('');
    setFormNotes('');
    setFormErrors({});
  };

  const handleScoreChange = (field: keyof ScoreMatrix, val: number, max: number) => {
    setFormScoreMatrix((prev) => ({
      ...prev,
      [field]: Math.min(max, Math.max(0, val)),
    }));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!formTitle.trim()) errs.title = 'Request Title is required';
    if (!formSubmittedBy.trim()) errs.submittedBy = 'Submitted By is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const newReq: ComplianceRequest = {
      id: `REQ-${String(Math.floor(100 + Math.random() * 900))}`,
      date: new Date().toISOString().slice(0, 10),
      title: formTitle.trim(),
      submittedBy: formSubmittedBy.trim(),
      type: formType,
      status: formStatus,
      targetSprint: formTargetSprint,
      brdRequired: formBrdRequired,
      description: formDescription.trim(),
      sourceTrigger: formSourceTrigger.trim(),
      notes: formNotes.trim(),
      jiraLink: '',
      scoreMatrix: formScoreMatrix,
      priorityTier: getPriorityTier(calculateScore(formScoreMatrix)),
      portalLabel: formPortalLabel || 'Backoffice',
      typeLabel: formTypeLabel || 'Sprint request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddRequest(newReq);
    handleClearForm();
    setIsAddModalOpen(false);
  };

  const handleExportFiltered = () => {
    exportRequestsToExcel(filteredRequests, 'ACE_Filtered_Requests');
  };

  const availableStatuses = customStatuses.length > 0 
    ? customStatuses.filter(s => s.category === 'request' || s.category === 'both').map(s => s.name)
    : ['New', 'Under Review', 'Approved', 'In Dev', 'Completed', 'Rejected'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Summary */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Request Register & Regulatory Intake
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-open-ai-intake"
            type="button"
            onClick={() => setIsLocalAiIntakeOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 shadow-xs transition-colors cursor-pointer"
            title="Generate structured request from raw circulars or memos"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>AI Intake</span>
          </button>

          <button
            id="btn-open-add-request-modal"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white text-red-900 hover:bg-red-50 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-700" />
            <span>Add Request</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Requests</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{totalCount}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Critical Tier
          </span>
          <span className="text-xl font-bold text-red-700 mt-1 block">{criticalCount}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Under Review
          </span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">{underReviewCount}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">In Dev / Review</span>
          <span className="text-xl font-bold text-purple-700 mt-1 block">{inDevCount}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{completedCount}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Jira Linked
          </span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{jiraLinkedCount}</span>
        </div>

      </div>

      {/* Pop-up Modal for Manual Entry Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    New Request Manual Entry Form
                  </h3>
                </div>
              </div>
              <button
                id="btn-close-add-req-modal"
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <div className="overflow-y-auto p-6 flex-1">
              {/* Top AI Intake Quick Auto-Fill Banner */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">
                    Have a regulatory circular, audit finding, or compliance memo?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocalAiIntakeOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0 border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-300" />
                  <span>Auto-Fill with AI Intake</span>
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Request Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Request Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-new-req-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sanctions Daily Delta Automated Ingestion"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 ${
                    formErrors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Submitted By */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submitted By <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-new-req-submitter"
                  type="text"
                  list="submitter-list"
                  required
                  value={formSubmittedBy}
                  onChange={(e) => setFormSubmittedBy(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (Financial Crime Unit)"
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 ${
                    formErrors.submittedBy ? 'border-red-500 bg-red-50/50' : 'border-slate-300 bg-white'
                  }`}
                />
                <datalist id="submitter-list">
                  {uniqueSubmitters.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
                {formErrors.submittedBy && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.submittedBy}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type
                </label>
                <select
                  id="select-new-req-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
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
                  id="select-new-req-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                >
                  {availableStatuses.map((st) => (
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
                  id="select-new-req-sprint"
                  value={formTargetSprint}
                  onChange={(e) => setFormTargetSprint(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
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
                  id="select-new-req-brd"
                  value={formBrdRequired}
                  onChange={(e) => setFormBrdRequired(e.target.value as 'Yes' | 'No')}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                >
                  <option value="Yes">Yes (BRD Mandatory)</option>
                  <option value="No">No (Engineering Light-Spec)</option>
                </select>
              </div>

              {/* Portal Label */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Label
                </label>
                <select
                  id="select-new-req-portal-label"
                  value={formPortalLabel}
                  onChange={(e) => setFormPortalLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
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
                  id="select-new-req-type-label"
                  value={formTypeLabel}
                  onChange={(e) => setFormTypeLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                >
                  <option value="Sprint request">Sprint request</option>
                  <option value="Bug">Bug</option>
                  <option value="Support">Support</option>
                </select>
              </div>

            </div>

            {/* Prioritisation Score Matrix Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 my-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Prioritisation Score Matrix
                    </h3>
                    <span className="text-xs text-slate-500 font-normal">
                      (Auto-calculates Tier / Total Score out of 100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adjust standard parameters to rank requests objectively against regulatory scrutiny.
                  </p>
                </div>
                {/* Dynamic Score & Tier Indicator */}
                <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-medium">Total Score</div>
                    <div className="text-lg font-extrabold text-slate-900 leading-tight">
                      {calculateScore(formScoreMatrix)} <span className="text-xs font-medium text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200" />
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getTierBadgeClasses(getPriorityTier(calculateScore(formScoreMatrix)))}`}>
                    {getPriorityTier(calculateScore(formScoreMatrix))}
                  </span>
                </div>
              </div>

              {/* Matrix Sliders / Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Regulatory Risk (/30) */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">Regulatory Risk</span>
                    <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      {formScoreMatrix.regulatoryRisk} / 30
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={formScoreMatrix.regulatoryRisk}
                    onChange={(e) => handleScoreChange('regulatoryRisk', parseInt(e.target.value) || 0, 30)}
                    className="w-full accent-red-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (None)</span>
                    <span>15 (Standard)</span>
                    <span>30 (Critical Audit/Fines)</span>
                  </div>
                </div>

                {/* 2. Operational Pain (/25) */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">Operational Pain</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                      {formScoreMatrix.operationalPain} / 25
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={formScoreMatrix.operationalPain}
                    onChange={(e) => handleScoreChange('operationalPain', parseInt(e.target.value) || 0, 25)}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Low)</span>
                    <span>12 (Manual work)</span>
                    <span>25 (Severe Bottleneck)</span>
                  </div>
                </div>

                {/* 3. Strategic Alignment (/20) */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">Strategic Alignment</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {formScoreMatrix.strategicAlignment} / 20
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={formScoreMatrix.strategicAlignment}
                    onChange={(e) => handleScoreChange('strategicAlignment', parseInt(e.target.value) || 0, 20)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Ad-hoc)</span>
                    <span>10 (Departmental)</span>
                    <span>20 (Core OKR)</span>
                  </div>
                </div>

                {/* 4. Risk of Inaction (/15) */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">Risk of Inaction</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                      {formScoreMatrix.riskOfInaction} / 15
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={formScoreMatrix.riskOfInaction}
                    onChange={(e) => handleScoreChange('riskOfInaction', parseInt(e.target.value) || 0, 15)}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Tolerable)</span>
                    <span>7 (Growing debt)</span>
                    <span>15 (System failure)</span>
                  </div>
                </div>

                {/* 5. Request Clarity (/10) */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">Request Clarity</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {formScoreMatrix.requestClarity} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formScoreMatrix.requestClarity}
                    onChange={(e) => handleScoreChange('requestClarity', parseInt(e.target.value) || 0, 10)}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Vague)</span>
                    <span>5 (Drafted)</span>
                    <span>10 (Ready for Dev)</span>
                  </div>
                </div>

                {/* Quick score presets */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">Quick Score Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormScoreMatrix({ regulatoryRisk: 28, operationalPain: 22, strategicAlignment: 18, riskOfInaction: 14, requestClarity: 9 })}
                      className="text-[10px] px-2 py-1 bg-red-50 text-red-700 font-semibold rounded hover:bg-red-100 cursor-pointer"
                    >
                      High Regulatory
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormScoreMatrix({ regulatoryRisk: 12, operationalPain: 18, strategicAlignment: 14, riskOfInaction: 8, requestClarity: 7 })}
                      className="text-[10px] px-2 py-1 bg-amber-50 text-amber-800 font-semibold rounded hover:bg-amber-100 cursor-pointer"
                    >
                      Medium Pain
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormScoreMatrix({ regulatoryRisk: 5, operationalPain: 8, strategicAlignment: 6, riskOfInaction: 4, requestClarity: 5 })}
                      className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded hover:bg-blue-100 cursor-pointer"
                    >
                      Low Ad-hoc
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Text fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Business Logic
                </label>
                <textarea
                  id="input-new-req-desc"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain the functional requirement, compliance objective, and desired system behavior..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source / Trigger / Notes
                </label>
                <textarea
                  id="input-new-req-source"
                  rows={2}
                  value={formSourceTrigger}
                  onChange={(e) => setFormSourceTrigger(e.target.value)}
                  placeholder="e.g. Audit Finding #2024-AC-04 or GCR Section 4.2..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                />
              </div>
            </div>

            {/* Feature 4: Semantic Duplicate & Conflict Check Widget */}
            <div className="pt-2">
              <AiDuplicateAlert
                draftTitle={formTitle}
                draftDescription={formDescription}
                draftType={formType}
                existingItems={[
                  ...requests.map(r => ({ ...r, sourceType: 'Request' })),
                  ...allBugs.map(b => ({ ...b, sourceType: 'Bug' })),
                  ...allTickets.map(t => ({ ...t, sourceType: 'Ticket' })),
                ]}
                onViewItem={(id) => {
                  const item = requests.find(r => r.id === id);
                  if (item) onOpenDetailModal(item);
                }}
              />
            </div>

            {/* Actions: Clear, Cancel, and + Add Request */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                id="btn-clear-new-req"
                type="button"
                onClick={handleClearForm}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-new-req"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Request</span>
                </button>
              </div>
            </div>

          </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Table Filters & Toolbar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-req-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, about details, Jira reference..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm glass-input rounded-lg"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <select
              id="select-filter-req-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Status: All</option>
              {availableStatuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              id="select-filter-req-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Priority: All</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Low Priority">Low Priority</option>
            </select>

            {/* Type Filter */}
            <select
              id="select-filter-req-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Type: All</option>
              <option value="Compliance">Compliance</option>
              <option value="New Feature">New Feature</option>
              <option value="Defect">Defect</option>
              <option value="Policy Update">Policy Update</option>
              <option value="Audit Requirement">Audit Requirement</option>
              <option value="Automation">Automation</option>
            </select>

            {/* Portal Filter */}
            <select
              id="select-filter-req-portal"
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Portal: All</option>
              <option value="Backoffice">Backoffice</option>
              <option value="ARMS">ARMS</option>
              <option value="SAR ticketing">SAR ticketing</option>
              <option value="Chargeback">Chargeback</option>
              <option value="Fraud">Fraud</option>
            </select>

            {/* Type Label Filter */}
            <select
              id="select-filter-req-type-label"
              value={typeLabelFilter}
              onChange={(e) => setTypeLabelFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Label: All</option>
              <option value="Sprint request">Sprint request</option>
              <option value="Bug">Bug</option>
              <option value="Support">Support</option>
            </select>

            {/* Sprint Filter */}
            <select
              id="select-filter-req-sprint"
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Sprint: All</option>
              {sprints.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>

            {/* Export Filtered */}
            <button
              id="btn-export-req-view"
              type="button"
              onClick={handleExportFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Export filtered request view to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export View</span>
            </button>

            {/* AI Duplicate & Conflict Auditor */}
            {onOpenAuditDuplicates && (
              <button
                id="btn-audit-duplicates-req"
                type="button"
                onClick={onOpenAuditDuplicates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                title="Scan entire backlog for semantic duplicates and conflicts using AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Audit Duplicates (AI)</span>
              </button>
            )}

          </div>
        </div>

        {/* Bulk Action Bar (Visible when items selected) */}
        {isSomeSelected && (
          <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-700 text-white font-bold text-xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-red-900">
                {selectedIds.size === 1 ? '1 Request Selected' : `${selectedIds.size} Requests Selected`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk Add to Sprint */}
              {onBulkAddToSprint && (
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-300 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-600">Sprint:</span>
                  <select
                    id="select-bulk-target-sprint"
                    value={bulkTargetSprint}
                    onChange={(e) => setBulkTargetSprint(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
                  >
                    {sprints.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                  <button
                    id="btn-bulk-add-to-sprint"
                    type="button"
                    onClick={() => {
                      onBulkAddToSprint(bulkTargetSprint, Array.from(selectedIds));
                      setSelectedIds(new Set());
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded transition-colors cursor-pointer"
                    title={`Pull selected requests into ${bulkTargetSprint}`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Add to Sprint</span>
                  </button>
                </div>
              )}

              <button
                id="btn-bulk-complete"
                type="button"
                onClick={() => {
                  onBulkMarkComplete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulk Mark as Complete</span>
              </button>

              <button
                id="btn-bulk-delete"
                type="button"
                onClick={() => {
                  onBulkSoftDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-800 bg-white hover:bg-red-100 border border-red-300 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Request Register Table */}
      <div className="glass-card rounded-2xl overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-200/30 text-slate-700 border-b border-slate-200/50 font-bold tracking-wider uppercase text-[11px]">
                
                {/* Multi-Select Checkbox Column */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all filtered requests"
                    className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                  />
                </th>

                <th className="py-3 px-3">Request ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Submitted By</th>
                <th className="py-3 px-3 min-w-[220px]">Title & About (Remove)</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Sprint</th>
                <th className="py-3 px-3 text-center">BRD</th>
                <th className="py-3 px-3">Jira Link</th>
                <th className="py-3 px-3 text-center min-w-[130px]">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No requests match the current filters.</p>
                    <p className="text-xs mt-1">Try clearing filters or adding a new compliance intake item.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedIds.has(req.id);
                  const isApproved = req.status.toLowerCase() === 'approved';
                  const statusStyle = getStatusBadgeStyle(req.status, customStatuses);
                  const linkedTicket = allTickets?.find((t) => t.originalRequestId === req.id);

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(req.id)}
                          aria-label={`Select request ${req.id}`}
                          className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                        />
                      </td>

                      {/* Request ID */}
                      <td className="py-3 px-3 font-mono font-bold text-red-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {onToggleWatch && (
                            <button
                              id={`btn-watch-req-${req.id}`}
                              type="button"
                              onClick={() => onToggleWatch(req.id)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                watchedIds && watchedIds.includes(req.id)
                                  ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                              }`}
                              title={watchedIds && watchedIds.includes(req.id) ? 'Remove from My Watchlist' : 'Add to My Watchlist'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${watchedIds && watchedIds.includes(req.id) ? 'fill-red-700 text-red-700' : ''}`} />
                            </button>
                          )}
                          <span>{req.id}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {req.date}
                      </td>

                      {/* Submitted By */}
                      <td className="py-3 px-3 font-medium text-slate-700 max-w-[150px] truncate" title={req.submittedBy}>
                        {req.submittedBy}
                      </td>

                      {/* Title (Clickable -> opens read-only modal) */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onEditRequest(req)}
                          className="text-left font-bold text-slate-900 hover:text-red-700 hover:underline transition-colors block cursor-pointer"
                          title="Click to view/edit full details"
                        >
                          {req.title}
                        </button>
                        {req.description && (
                          <p 
                            onClick={() => onOpenDetailModal(req)}
                            className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 cursor-pointer hover:text-slate-700"
                          >
                            {req.description}
                          </p>
                        )}
                        {(req.portalLabel || req.typeLabel) && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {req.portalLabel && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" id={`tag-portal-${req.id}`}>
                                {req.portalLabel}
                              </span>
                            )}
                            {req.typeLabel && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200" id={`tag-type-label-${req.id}`}>
                                {req.typeLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {req.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Sprint */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{req.targetSprint || 'N/A'}</span>
                          {linkedTicket && onNavigateToTab && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToTab('sprint');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 w-fit transition-colors cursor-pointer"
                              title="Active Sprint Ticket! Click to view in Sprint Tracker."
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {linkedTicket.id}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* BRD */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            req.brdRequired === 'Yes'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {req.brdRequired}
                        </span>
                      </td>

                      {/* Jira Link */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {req.jiraLink ? (
                          <a
                            href={req.jiraLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-red-700 hover:text-red-900 hover:underline"
                            title={req.jiraLink}
                          >
                            <span>{req.jiraLink.split('/').pop() || 'JIRA'}</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        ) : isApproved ? (
                          <button
                            type="button"
                            onClick={() => onAssignJira(req)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 transition-colors cursor-pointer"
                            title="Approved! Click to assign Jira link"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>+ Assign Jira</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px] italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === req.id ? null : req.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 focus:outline-hidden transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openMenuId === req.id && (
                            <>
                              {/* Invisible backdrop to close the menu on click outside */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 rounded-md shadow-lg bg-white border border-slate-200 divide-y divide-slate-100 focus:outline-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                                <div className="py-1">
                                  {/* View Read-Only */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onOpenDetailModal(req);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                    title="View Full Read-Only Details"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </button>
                                  
                                  {/* Edit Request */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onEditRequest(req);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                    title="Edit Request"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* Promote to Sprint */}
                                  {onPromoteToSprint && !linkedTicket && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        onPromoteToSprint(req);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 w-full text-left font-semibold cursor-pointer"
                                      title="Promote this intake request to active Sprint Ticket"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>Promote to Sprint</span>
                                    </button>
                                  )}

                                  {/* View Sprint Ticket */}
                                  {linkedTicket && onNavigateToTab && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        onNavigateToTab('sprint');
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left font-semibold cursor-pointer"
                                      title="Go to linked active Sprint Ticket"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>View Sprint Ticket</span>
                                    </button>
                                  )}

                                  {/* Assign Jira */}
                                  {!req.jiraLink && isApproved && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        onAssignJira(req);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                      title="Approved! Click to assign Jira link"
                                    >
                                      <Link2 className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Assign Jira</span>
                                    </button>
                                  )}

                                  {/* Mark as Complete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onMarkCompleteRequest(req);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left font-medium cursor-pointer"
                                    title="Mark as Complete (Move to Completed Tab)"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Mark Complete</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* Soft Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onSoftDeleteRequest(req);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left font-medium cursor-pointer"
                                    title="Soft delete to Trash"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    <span>Move to Trash</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong> total compliance intake items
          </span>
          <span className="text-[11px] text-slate-400">
            ACE Compliance Portal • Systems Dept
          </span>
        </div>
      </div>

      {/* Feature 1: AI Intake & BRD Spec Modal */}
      <AiIntakeModal
        isOpen={isLocalAiIntakeOpen}
        onClose={() => setIsLocalAiIntakeOpen(false)}
        onApplyIntake={handleApplyAiSpec}
      />

    </div>
  );
};
