import React, { useState, useMemo, useEffect } from 'react';
import { ComplianceRequest, CustomStatus } from '../types';
import { 
  X, 
  Search, 
  Layers, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import { getStatusBadgeStyle } from '../utils/statusUtils';

interface PullRequestsToSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ComplianceRequest[];
  existingSprints: string[];
  customStatuses: CustomStatus[];
  initialSprint?: string;
  onPullRequests: (targetSprint: string, requestIds: string[]) => void;
}

export const PullRequestsToSprintModal: React.FC<PullRequestsToSprintModalProps> = ({
  isOpen,
  onClose,
  requests,
  existingSprints,
  customStatuses,
  initialSprint,
  onPullRequests,
}) => {
  const [targetSprint, setTargetSprint] = useState<string>(initialSprint || existingSprints[0] || 'Sprint 26.09');
  const [isCustomSprint, setIsCustomSprint] = useState<boolean>(false);
  const [customSprintInput, setCustomSprintInput] = useState<string>('');

  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [portalFilter, setPortalFilter] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      if (initialSprint) {
        setTargetSprint(initialSprint);
        setIsCustomSprint(false);
      } else if (existingSprints.length > 0) {
        setTargetSprint(existingSprints[0]);
        setIsCustomSprint(false);
      }
      setSelectedRequestIds(new Set());
      setSearchQuery('');
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
      setPortalFilter('ALL');
    }
  }, [isOpen, initialSprint, existingSprints]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q) ||
        req.submittedBy.toLowerCase().includes(q) ||
        (req.portalLabel && req.portalLabel.toLowerCase().includes(q)) ||
        (req.description && req.description.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || req.priorityTier === priorityFilter;
      const matchesPortal = portalFilter === 'ALL' || req.portalLabel === portalFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesPortal;
    });
  }, [requests, searchQuery, statusFilter, priorityFilter, portalFilter]);

  const toggleSelectRequest = (id: string) => {
    setSelectedRequestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedRequestIds((prev) => {
      const next = new Set(prev);
      filteredRequests.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const handleSelectApprovedOnly = () => {
    setSelectedRequestIds((prev) => {
      const next = new Set(prev);
      filteredRequests
        .filter((r) => r.status.toLowerCase() === 'approved')
        .forEach((r) => next.add(r.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedRequestIds(new Set());
  };

  const handleConfirm = () => {
    const finalSprintName = isCustomSprint ? customSprintInput.trim() : targetSprint.trim();
    if (!finalSprintName) return;
    if (selectedRequestIds.size === 0) return;

    onPullRequests(finalSprintName, Array.from(selectedRequestIds));
    onClose();
  };

  if (!isOpen) return null;

  const finalSprint = isCustomSprint ? customSprintInput.trim() : targetSprint.trim();
  const canSubmit = finalSprint.length > 0 && selectedRequestIds.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Include Requests in Sprint
              </h2>
              <p className="text-xs text-slate-500">
                Pull active intake items into a sprint and auto-complete them from the Request Register
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Target Sprint Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Target Sprint
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {!isCustomSprint ? (
                <div className="flex-1">
                  <select
                    id="select-target-sprint"
                    value={targetSprint}
                    onChange={(e) => setTargetSprint(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                  >
                    {existingSprints.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <input
                    id="input-custom-target-sprint"
                    type="text"
                    value={customSprintInput}
                    onChange={(e) => setCustomSprintInput(e.target.value)}
                    placeholder="e.g. Sprint 26.10 or Q4 Special Release"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsCustomSprint(!isCustomSprint);
                  if (!isCustomSprint && !customSprintInput) {
                    setCustomSprintInput(targetSprint);
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                {isCustomSprint ? 'Choose Existing Sprint' : '+ New Sprint Name'}
              </button>
            </div>
          </div>

          {/* Search, Filter & Bulk Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-pull-requests-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests by ID, title, submitter, portal..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                id="filter-pull-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
              >
                <option value="ALL">All Statuses</option>
                <option value="Approved">Approved Only</option>
                <option value="New">New Only</option>
                <option value="In Progress">In Progress</option>
                {customStatuses
                  .filter((s) => !['Approved', 'New', 'In Progress'].includes(s.name))
                  .map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))
                }
              </select>

              {/* Priority Filter */}
              <select
                id="filter-pull-priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
              >
                <option value="ALL">All Priorities</option>
                <option value="High Priority">High Priority</option>
                <option value="Medium Priority">Medium Priority</option>
                <option value="Low Priority">Low Priority</option>
              </select>
            </div>

            {/* Quick Selection Helper Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Select All Filtered ({filteredRequests.length})
                </button>
                <button
                  type="button"
                  onClick={handleSelectApprovedOnly}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  Select Approved Only
                </button>
                {selectedRequestIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {/* Selected Count Indicator */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>{selectedRequestIds.size} request(s) selected to pull</span>
              </div>
            </div>
          </div>

          {/* Request List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-600">No requests match your filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try broadening your search or adjusting the filters.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequestIds.has(req.id);
                const statusStyle = getStatusBadgeStyle(req.status, customStatuses);

                return (
                  <div
                    key={req.id}
                    onClick={() => toggleSelectRequest(req.id)}
                    className={`p-3.5 flex items-start gap-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer ${
                      isSelected ? 'bg-red-50/40 border-l-4 border-l-red-600' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent container click
                        className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                      />
                    </div>

                    {/* Main Details */}
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
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                            {req.portalLabel}
                          </span>
                        )}

                        {/* BRD Indicator */}
                        {req.brdRequired === 'Yes' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                            BRD Req
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">
                        {req.title}
                      </p>

                      {/* Subtitle / Submitter / Date */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>Submitted by <strong className="text-slate-700">{req.submittedBy}</strong></span>
                        <span>&bull;</span>
                        <span>Date: {req.date || 'N/A'}</span>
                        {req.targetSprint && (
                          <>
                            <span>&bull;</span>
                            <span>Target: <strong className="text-slate-700">{req.targetSprint}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Informational Callout */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Automatic Lifecycle Processing</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Selected requests will be converted into active <strong>Sprint Tickets</strong> under <strong>{finalSprint || 'the chosen sprint'}</strong>, and their entries in the Request Register will be automatically finalized and archived into Completed records.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer ${
              canSubmit
                ? 'bg-red-700 hover:bg-red-800 text-white shadow-red-700/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Pull {selectedRequestIds.size} Request(s) into {finalSprint || 'Sprint'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
