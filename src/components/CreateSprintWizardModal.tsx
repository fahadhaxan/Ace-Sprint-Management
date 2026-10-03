import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import { ComplianceRequest, CustomStatus } from '../types';
import { getStatusBadgeStyle } from '../utils/statusUtils';

interface CreateSprintWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ComplianceRequest[];
  existingSprints: string[];
  customStatuses: CustomStatus[];
  onCreateSprint: (data: {
    month: string;
    year: string;
    sprintName: string;
    sprintGoal: string;
    selectedRequestIds: string[];
  }) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CreateSprintWizardModal: React.FC<CreateSprintWizardModalProps> = ({
  isOpen,
  onClose,
  requests,
  existingSprints,
  customStatuses,
  onCreateSprint,
}) => {
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()] || 'September';
  const currentYearStr = currentDate.getFullYear().toString();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [sprintName, setSprintName] = useState<string>('');
  const [isCustomName, setIsCustomName] = useState<boolean>(false);
  const [sprintGoal, setSprintGoal] = useState<string>('');
  
  // Step 2 selections & filters
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [portalFilter, setPortalFilter] = useState<string>('ALL');

  // Auto-generate sprint name when month/year changes if user hasn't explicitly customized
  useEffect(() => {
    if (!isOpen) return;

    const monthIndex = MONTHS.indexOf(selectedMonth) + 1;
    const month2Digit = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
    const year2Digit = selectedYear.slice(-2);
    const suggestedName = `Sprint ${year2Digit}.${month2Digit}`;

    if (!isCustomName) {
      setSprintName(suggestedName);
    }
  }, [selectedMonth, selectedYear, isCustomName, isOpen]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMonth(currentMonthName);
      setSelectedYear(currentYearStr);
      setIsCustomName(false);
      setSprintGoal('');
      setSelectedRequestIds(new Set());
      setSearchTerm('');
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
      setPortalFilter('ALL');
    }
  }, [isOpen]);

  // Filter requests available for pulling
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.submittedBy.toLowerCase().includes(q) ||
        (req.description && req.description.toLowerCase().includes(q)) ||
        (req.portalLabel && req.portalLabel.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || req.priorityTier === priorityFilter;
      const matchesPortal = portalFilter === 'ALL' || req.portalLabel === portalFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesPortal;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, portalFilter]);

  const uniquePortals = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.portalLabel) set.add(r.portalLabel);
    });
    return Array.from(set);
  }, [requests]);

  const toggleSelectRequest = (id: string) => {
    const next = new Set(selectedRequestIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRequestIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedRequestIds);
    filteredRequests.forEach((r) => next.add(r.id));
    setSelectedRequestIds(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedRequestIds);
    filteredRequests.forEach((r) => next.delete(r.id));
    setSelectedRequestIds(next);
  };

  const selectOnlyApproved = () => {
    const next = new Set(selectedRequestIds);
    requests
      .filter((r) => r.status.toLowerCase() === 'approved')
      .forEach((r) => next.add(r.id));
    setSelectedRequestIds(next);
  };

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) return;
    setStep(2);
  };

  const handleFinalSubmit = () => {
    onCreateSprint({
      month: selectedMonth,
      year: selectedYear,
      sprintName: sprintName.trim(),
      sprintGoal: sprintGoal.trim(),
      selectedRequestIds: Array.from(selectedRequestIds),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Wizard Step Indicator */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Create Sprint & Pull Requests</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-red-800/80 text-red-100 border border-red-700/50">
                  Sprint Planning Wizard
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {step === 1 ? 'Step 1 of 2: Define Month, Year & Sprint Schedule' : 'Step 2 of 2: Select & Pull Intake Requests'}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
              step === 1 ? 'bg-red-700 text-white ring-2 ring-red-300' : 'bg-emerald-600 text-white'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`font-semibold ${step === 1 ? 'text-red-900' : 'text-slate-700'}`}>
              1. Month & Year Details
            </span>
          </div>

          <div className="h-0.5 flex-1 mx-4 bg-slate-300 relative">
            <div 
              className="h-0.5 bg-red-700 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : '100%' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
              step === 2 ? 'bg-red-700 text-white ring-2 ring-red-300' : 'bg-slate-300 text-slate-600'
            }`}>
              2
            </div>
            <span className={`font-semibold ${step === 2 ? 'text-red-900' : 'text-slate-500'}`}>
              2. Pull Requests ({selectedRequestIds.size} selected)
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {step === 1 ? (
            /* STEP 1: Month & Year Details */
            <form id="form-sprint-step1" onSubmit={handleNextStep} className="space-y-6 max-w-2xl mx-auto py-2">
              
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Sprint Schedule Setup</span>
                  Specify the delivery month and year for this sprint cycle. This organizes backlog tickets, provides grouped timeline tracking, and auto-completes pulled requests from the intake register.
                </div>
              </div>

              {/* Month and Year Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Delivery Month <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="select-sprint-wizard-month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                    required
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Delivery Year <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="select-sprint-wizard-year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                    required
                  >
                    {['2024', '2025', '2026', '2027', '2028'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sprint Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Sprint Identifier / Name <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomName(!isCustomName);
                      if (isCustomName) {
                        const mIdx = MONTHS.indexOf(selectedMonth) + 1;
                        const m2 = mIdx < 10 ? `0${mIdx}` : `${mIdx}`;
                        setSprintName(`Sprint ${selectedYear.slice(-2)}.${m2}`);
                      }
                    }}
                    className="text-[11px] font-semibold text-red-700 hover:text-red-800 underline cursor-pointer"
                  >
                    {isCustomName ? 'Reset to Default (e.g. Sprint 26.09)' : 'Customize Name'}
                  </button>
                </div>
                <input
                  id="input-sprint-wizard-name"
                  type="text"
                  value={sprintName}
                  onChange={(e) => {
                    setIsCustomName(true);
                    setSprintName(e.target.value);
                  }}
                  placeholder="e.g. Sprint 26.09"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 font-medium"
                  required
                />
                {existingSprints.includes(sprintName.trim()) && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    A sprint with this name already exists. Tickets will be grouped into the existing sprint.
                  </p>
                )}
              </div>

              {/* Sprint Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sprint Goal / Focus Area (Optional)
                </label>
                <textarea
                  id="input-sprint-wizard-goal"
                  rows={2}
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  placeholder="e.g. AML Tier-2 transaction alerts, SAR backoffice enhancements, and GCR rule updates"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 resize-none"
                />
              </div>
            </form>
          ) : (
            /* STEP 2: Filter and Pull Intake Requests */
            <div className="space-y-4">
              
              {/* Notice & Summary Banner */}
              <div className="bg-gradient-to-r from-red-50 via-slate-50 to-indigo-50 border border-red-200/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Pulling for: <span className="text-red-700">{sprintName}</span> ({selectedMonth} {selectedYear})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select intake requests to pull into this sprint. Selected items will be converted to Sprint Tickets and marked as <strong className="text-emerald-700">auto-completed</strong> in the Request Register.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Selected for Pull</div>
                    <div className="text-lg font-bold text-red-700">
                      {selectedRequestIds.size} <span className="text-xs font-normal text-slate-500">/ {requests.length} requests</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  
                  {/* Search */}
                  <div className="relative flex-1 w-full">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="input-wizard-search-requests"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search requests by ID, title, submitter, portal..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    id="select-wizard-filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
                  >
                    <option value="ALL">Status: All</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Submitted">Submitted</option>
                    <option value="In Progress">In Progress</option>
                  </select>

                  {/* Priority filter */}
                  <select
                    id="select-wizard-filter-priority"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
                  >
                    <option value="ALL">Priority: All</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                  </select>

                  {/* Portal filter */}
                  {uniquePortals.length > 0 && (
                    <select
                      id="select-wizard-filter-portal"
                      value={portalFilter}
                      onChange={(e) => setPortalFilter(e.target.value)}
                      className="w-full sm:w-auto px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700"
                    >
                      <option value="ALL">Portal: All</option>
                      {uniquePortals.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Bulk Selection Shortcuts */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="text-xs font-semibold text-slate-700 hover:text-red-700 underline cursor-pointer"
                    >
                      Select All Filtered ({filteredRequests.length})
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={selectOnlyApproved}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Select Approved Only
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={deselectAllFiltered}
                      className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Showing {filteredRequests.length} available requests
                  </span>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredRequests.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-xs text-slate-700">No intake requests match your filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing search or changing the filters above.</p>
                  </div>
                ) : (
                  filteredRequests.map((req) => {
                    const isSelected = selectedRequestIds.has(req.id);
                    const statusStyle = getStatusBadgeStyle(req.status, customStatuses);

                    return (
                      <div
                        key={req.id}
                        onClick={() => toggleSelectRequest(req.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-red-50/50 border-red-300 shadow-xs'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-700" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {req.id}
                            </span>

                            {/* Status Badge */}
                            <span 
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
                            >
                              {req.status}
                            </span>

                            {/* Priority Badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              req.priorityTier === 'High Priority'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : req.priorityTier === 'Low Priority'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {req.priorityTier || 'Medium Priority'}
                            </span>

                            {/* Portal Tag */}
                            {req.portalLabel && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                {req.portalLabel}
                              </span>
                            )}

                            {req.brdRequired && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                BRD
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 leading-snug">
                            {req.title}
                          </h4>

                          {req.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {req.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                            <span>Submitter: <strong className="text-slate-600 font-medium">{req.submittedBy}</strong></span>
                            <span>•</span>
                            <span>Target Date: <strong className="text-slate-600 font-medium">{req.date}</strong></span>
                            {req.targetSprint && (
                              <>
                                <span>•</span>
                                <span>Suggested: <strong className="text-slate-600 font-medium">{req.targetSprint}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="form-sprint-step1"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Next: Select Requests ({requests.length} available)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sprint Schedule</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedRequestIds.size === 0
                      ? `Create Empty ${sprintName}`
                      : `Create Sprint & Pull ${selectedRequestIds.size} Requests`}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
