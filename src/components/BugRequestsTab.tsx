import React, { useState, useMemo } from 'react';
import { 
  Bug, 
  Plus, 
  Search, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  FileSpreadsheet, 
  Edit3, 
  Eye, 
  RotateCcw, 
  Filter, 
  ShieldAlert, 
  Layers, 
  Clock, 
  Link2,
  Sparkles,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { BugRequest, BugSeverity, BugStatus, CustomStatus } from '../types';
import { exportRequestsToExcel } from '../utils/excel';

interface BugRequestsTabProps {
  bugs: BugRequest[];
  customStatuses: CustomStatus[];
  onAddBug: (bug: BugRequest) => void;
  onEditBug: (bug: BugRequest) => void;
  onSoftDeleteBug: (bug: BugRequest) => void;
  onBulkSoftDelete: (bugIds: string[]) => void;
  onMarkCompleteBug: (bug: BugRequest) => void;
  onBulkMarkComplete: (bugIds: string[]) => void;
  onAssignJira: (item: any) => void;
  onOpenDetailModal: (item: any) => void;
  onOpenNewBugModal: () => void;
  onOpenAuditDuplicates?: () => void;
  watchedIds?: string[];
  onToggleWatch?: (id: string) => void;
}

export const BugRequestsTab: React.FC<BugRequestsTabProps> = ({
  bugs,
  customStatuses,
  onAddBug,
  onEditBug,
  onSoftDeleteBug,
  onBulkSoftDelete,
  onMarkCompleteBug,
  onBulkMarkComplete,
  onAssignJira,
  onOpenDetailModal,
  onOpenNewBugModal,
  onOpenAuditDuplicates,
  watchedIds = [],
  onToggleWatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [environmentFilter, setEnvironmentFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = bugs.length;
    const critical = bugs.filter((b) => b.severity === 'Critical').length;
    const investigating = bugs.filter((b) => b.status === 'Under Investigation' || b.status === 'New').length;
    const inDev = bugs.filter((b) => b.status === 'In Dev' || b.status === 'In Review').length;
    const resolved = bugs.filter((b) => b.status === 'Resolved' || b.status === 'Closed').length;
    const withJira = bugs.filter((b) => !!b.jiraLink).length;

    return { total, critical, investigating, inDev, resolved, withJira };
  }, [bugs]);

  // Filtered bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      // 1. Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          bug.id.toLowerCase().includes(q) ||
          bug.title.toLowerCase().includes(q) ||
          (bug.about && bug.about.toLowerCase().includes(q)) ||
          (bug.jiraLink && bug.jiraLink.toLowerCase().includes(q)) ||
          (bug.reportedBy && bug.reportedBy.toLowerCase().includes(q)) ||
          (bug.assignedTo && bug.assignedTo.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status
      if (statusFilter !== 'ALL' && bug.status !== statusFilter) {
        return false;
      }

      // 3. Severity
      if (severityFilter !== 'ALL' && bug.severity !== severityFilter) {
        return false;
      }

      // 4. Environment
      if (environmentFilter !== 'ALL' && bug.environment !== environmentFilter) {
        return false;
      }

      return true;
    });
  }, [bugs, searchTerm, statusFilter, severityFilter, environmentFilter]);

  // Selection handlers
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllFilteredSelected = filteredBugs.length > 0 && filteredBugs.every((b) => selectedIds.has(b.id));
  const isSomeSelected = selectedIds.size > 0;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBugs.map((b) => b.id)));
    }
  };

  const handleExportFiltered = () => {
    const exportData = filteredBugs.map((b) => ({
      id: b.id,
      date: b.date,
      title: b.title,
      submittedBy: b.reportedBy,
      type: `Bug (${b.severity})`,
      status: b.status,
      targetSprint: b.environment || 'Production',
      brdRequired: 'No' as const,
      description: b.about,
      sourceTrigger: b.environment || '',
      notes: b.assignedTo ? `Assigned: ${b.assignedTo}` : '',
      jiraLink: b.jiraLink || '',
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
    exportRequestsToExcel(exportData);
  };

  const getSeverityBadge = (severity: BugSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200 font-bold';
      case 'Major':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
      case 'Moderate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Minor':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Investigation':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'In Dev':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Review':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Summary */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bug Requests & Defect Register
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-new-bug"
            type="button"
            onClick={onOpenNewBugModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white text-rose-900 hover:bg-rose-50 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-700" />
            <span>Report Bug</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bugs</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.total}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Critical Tier
          </span>
          <span className="text-xl font-bold text-red-700 mt-1 block">{stats.critical}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Investigating</span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">{stats.investigating}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">In Dev / Review</span>
          <span className="text-xl font-bold text-purple-700 mt-1 block">{stats.inDev}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{stats.resolved}</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Jira Linked
          </span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{stats.withJira}</span>
        </div>

      </div>

      {/* 3. Toolbar & Filters */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-bug-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, about details, Jira reference..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-600/30 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter (User requested status option) */}
            <select
              id="select-filter-bug-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-600/30"
            >
              <option value="ALL">Status: All</option>
              <option value="New">New</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="In Dev">In Dev</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Severity Filter */}
            <select
              id="select-filter-bug-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-600/30"
            >
              <option value="ALL">Severity: All</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Moderate">Moderate</option>
              <option value="Minor">Minor</option>
            </select>

            {/* Environment Filter */}
            <select
              id="select-filter-bug-env"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-600/30"
            >
              <option value="ALL">Environment: All</option>
              <option value="Production">Production</option>
              <option value="UAT / Staging">UAT / Staging</option>
              <option value="QA / Test">QA / Test</option>
              <option value="Internal Backoffice">Internal Backoffice</option>
            </select>

            {/* Export Filtered */}
            <button
              id="btn-export-bugs"
              type="button"
              onClick={handleExportFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Export filtered bug list to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export View</span>
            </button>

            {/* AI Duplicate Auditor */}
            {onOpenAuditDuplicates && (
              <button
                id="btn-audit-duplicates-bugs"
                type="button"
                onClick={onOpenAuditDuplicates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                title="Scan bugs and requests for semantic duplicates using AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Audit Duplicates (AI)</span>
              </button>
            )}

          </div>
        </div>

        {/* Bulk Action Bar */}
        {isSomeSelected && (
          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-700 text-white font-bold text-xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-rose-900">
                {selectedIds.size === 1 ? '1 Bug Selected' : `${selectedIds.size} Bugs Selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-bulk-bug-complete"
                type="button"
                onClick={() => {
                  onBulkMarkComplete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulk Mark as Resolved</span>
              </button>

              <button
                id="btn-bulk-bug-delete"
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

      {/* 4. Bug Requests Table */}
      <div className="glass-card rounded-2xl overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            <thead>
              <tr className="bg-slate-200/30 text-slate-700 border-b border-slate-200/50 font-bold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all filtered bugs"
                    className="w-4 h-4 rounded border-slate-300 text-rose-700 focus:ring-rose-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Bug ID</th>
                <th className="py-3 px-3 min-w-[240px]">Title & About (Remove)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3 min-w-[170px]">Jira Reference</th>
                <th className="py-3 px-3">Reported By</th>
                <th className="py-3 px-3">Environment</th>
                <th className="py-3 px-3 text-center min-w-[130px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Bug className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No bug requests found.</p>
                    <p className="text-xs mt-1">Try changing filters or report a new defect.</p>
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => {
                  const isSelected = selectedIds.has(bug.id);
                  const statusStyle = getStatusBadge(bug.status);
                  const severityStyle = getSeverityBadge(bug.severity);

                  return (
                    <tr
                      key={bug.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(bug.id)}
                          aria-label={`Select bug ${bug.id}`}
                          className="w-4 h-4 rounded border-slate-300 text-rose-700 focus:ring-rose-600 cursor-pointer"
                        />
                      </td>

                      {/* Bug ID */}
                      <td className="py-3 px-3 font-mono font-bold text-rose-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {onToggleWatch && (
                            <button
                              id={`btn-watch-bug-${bug.id}`}
                              type="button"
                              onClick={() => onToggleWatch(bug.id)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                watchedIds && watchedIds.includes(bug.id)
                                  ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                              }`}
                              title={watchedIds && watchedIds.includes(bug.id) ? 'Remove from My Watchlist' : 'Add to My Watchlist'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${watchedIds && watchedIds.includes(bug.id) ? 'fill-red-700 text-red-700' : ''}`} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(bug)}
                            className="hover:underline cursor-pointer text-left"
                            title="View read-only audit detail"
                          >
                            {bug.id}
                          </button>
                        </div>
                      </td>

                      {/* Title & About (Requested by user) */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onEditBug(bug)}
                          className="text-left font-bold text-slate-900 hover:text-rose-700 hover:underline transition-colors block cursor-pointer"
                          title="Click to view/edit full details"
                        >
                          {bug.title}
                        </button>
                        {bug.about && (
                          <p 
                            onClick={() => onEditBug(bug)}
                            className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 cursor-pointer hover:text-slate-700 leading-snug"
                            title={bug.about}
                          >
                            <span className="font-semibold text-slate-600">About:</span> {bug.about}
                          </p>
                        )}
                      </td>

                      {/* Status (Requested by user) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${statusStyle}`}
                          >
                            {bug.status}
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${severityStyle}`}
                        >
                          {bug.severity}
                        </span>
                      </td>

                      {/* Jira Ticket Reference (Hyperlink) - Requested by user */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {bug.jiraLink ? (
                          <a
                            href={bug.jiraLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 transition-colors font-mono text-xs font-semibold"
                            title={`Open Jira Ticket: ${bug.jiraLink}`}
                          >
                            <span>
                              {bug.jiraLink.includes('/browse/') 
                                ? bug.jiraLink.split('/browse/')[1] 
                                : bug.jiraLink.replace(/^https?:\/\//, '')}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssignJira(bug)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 hover:underline cursor-pointer"
                            title="Link a Jira ticket reference"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>+ Link Jira</span>
                          </button>
                        )}
                      </td>

                      {/* Reported By & Assignee */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{bug.reportedBy}</div>
                        {bug.assignedTo && (
                          <div className="text-[10px] text-slate-400">Assigned: {bug.assignedTo}</div>
                        )}
                      </td>

                      {/* Environment */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                          {bug.environment || 'Production'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === bug.id ? null : bug.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 focus:outline-hidden transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openMenuId === bug.id && (
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
                                      onOpenDetailModal(bug);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                    title="View Full Read-Only Audit Details"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </button>
                                  
                                  {/* Edit Bug */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onEditBug(bug);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                    title="Edit Bug Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* Link Jira */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onAssignJira(bug);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                                    title="Link / Update Jira Ticket"
                                  >
                                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Link Jira</span>
                                  </button>

                                  {/* Mark Resolved */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onMarkCompleteBug(bug);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left font-medium cursor-pointer"
                                    title="Mark as Resolved and Finalize"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Mark Resolved</span>
                                  </button>
                                </div>

                                <div className="py-1">
                                  {/* Soft Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      onSoftDeleteBug(bug);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left font-medium cursor-pointer"
                                    title="Move to Trash"
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

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredBugs.length} of {bugs.length} total bug requests</span>
          <span className="font-mono text-[11px] text-slate-400">SOC 2 Type II / ISO 27001 Defect Audit Trail</span>
        </div>
      </div>

    </div>
  );
};
