import React, { useState, useMemo } from 'react';
import { 
  SprintTicket, 
  CustomStatus,
  ComplianceRequest
} from '../types';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRightLeft, 
  Eye, 
  ExternalLink,
  KanbanSquare,
  Layers,
  ChevronDown,
  ChevronRight,
  Bookmark,
  MoreVertical,
  Sparkles,
  Calendar,
  FolderOpen,
  FolderClosed,
  ChevronsUpDown,
  CheckSquare,
  Square,
  ListFilter
} from 'lucide-react';
import { exportSprintTicketsToExcel } from '../utils/excel';
import { getStatusBadgeStyle } from '../utils/statusUtils';

interface SprintTrackerTabProps {
  tickets: SprintTicket[];
  customStatuses: CustomStatus[];
  sprints?: string[];
  onOpenNewTicketModal: () => void;
  onOpenSprintWizard?: () => void;
  onOpenPullRequestsModal?: (targetSprint?: string) => void;
  onEditTicket: (ticket: SprintTicket) => void;
  onUpdateTicketStatus?: (ticketId: string, newStatus: string) => void;
  onSoftDeleteTicket: (ticket: SprintTicket) => void;
  onBulkSoftDelete: (ticketIds: string[]) => void;
  onMarkCompleteTicket: (ticket: SprintTicket) => void;
  onBulkMarkComplete: (ticketIds: string[]) => void;
  onUploadExcelFiles?: (files: FileList | File[]) => void;
  onOpenDetailModal: (ticket: SprintTicket) => void;
  watchedIds?: string[];
  onToggleWatch?: (id: string) => void;
  allRequests?: ComplianceRequest[];
  onNavigateToTab?: (tab: string) => void;
}

export const SprintTrackerTab: React.FC<SprintTrackerTabProps> = ({
  tickets,
  customStatuses,
  sprints = [],
  onOpenNewTicketModal,
  onOpenSprintWizard,
  onOpenPullRequestsModal,
  onEditTicket,
  onUpdateTicketStatus,
  onSoftDeleteTicket,
  onBulkSoftDelete,
  onMarkCompleteTicket,
  onBulkMarkComplete,
  onOpenDetailModal,
  watchedIds = [],
  onToggleWatch,
  allRequests = [],
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [sprintFilter, setSprintFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  // View mode: 'grouped' (expandable/collapsible per sprint) or 'flat' (classic single table)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Checkbox multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action Dropdown State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Summary card metrics
  const totalCount = tickets.length;
  const doneCount = tickets.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
  const backlogCount = tickets.filter((t) => t.status === 'Backlog').length;
  const deferredCount = tickets.filter((t) => t.deferred === 'Yes').length;

  // Filter options
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.intakeMonth) set.add(t.intakeMonth);
    });
    return Array.from(set).sort();
  }, [tickets]);

  const uniqueSprints = useMemo(() => {
    const set = new Set<string>(sprints);
    tickets.forEach((t) => {
      if (t.sprint) set.add(t.sprint);
    });
    return Array.from(set).sort();
  }, [tickets, sprints]);

  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set).sort();
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));

      const matchesMonth = monthFilter === 'ALL' || t.intakeMonth === monthFilter;
      const matchesSprint = sprintFilter === 'ALL' || t.sprint === sprintFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || t.assignee === assigneeFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

      return matchesSearch && matchesMonth && matchesSprint && matchesStatus && matchesAssignee && matchesPriority;
    });
  }, [tickets, searchTerm, monthFilter, sprintFilter, statusFilter, assigneeFilter, priorityFilter]);

  // Group tickets by sprint
  const groupedBySprint = useMemo(() => {
    const groups: { [key: string]: SprintTicket[] } = {};
    
    // Ensure all known unique sprints have a group header even if currently empty
    uniqueSprints.forEach((sp) => {
      if (sprintFilter === 'ALL' || sp === sprintFilter) {
        groups[sp] = [];
      }
    });

    filteredTickets.forEach((ticket) => {
      const sp = ticket.sprint || 'Unassigned / Backlog';
      if (!groups[sp]) {
        groups[sp] = [];
      }
      groups[sp].push(ticket);
    });

    return Object.entries(groups)
      .filter(([name, list]) => {
        if (sprintFilter !== 'ALL' && name !== sprintFilter) return false;
        // Keep group if it has tickets or if no search/status filters are applied
        return list.length > 0 || (searchTerm === '' && statusFilter === 'ALL' && priorityFilter === 'ALL' && assigneeFilter === 'ALL');
      })
      .sort(([a], [b]) => {
        // Put Backlog at the end
        if (a.toLowerCase().includes('backlog')) return 1;
        if (b.toLowerCase().includes('backlog')) return -1;
        return b.localeCompare(a); // Most recent sprint first
      });
  }, [filteredTickets, uniqueSprints, sprintFilter, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  // Expand / Collapse state for sprint groups (default: all expanded)
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());

  const toggleSprintCollapse = (sprintName: string) => {
    const next = new Set(collapsedSprints);
    if (next.has(sprintName)) {
      next.delete(sprintName);
    } else {
      next.add(sprintName);
    }
    setCollapsedSprints(next);
  };

  const expandAllSprints = () => {
    setCollapsedSprints(new Set());
  };

  const collapseAllSprints = () => {
    const allNames = new Set(groupedBySprint.map(([name]) => name));
    setCollapsedSprints(allNames);
  };

  // Selection helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredTickets.length && filteredTickets.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTickets.map((t) => t.id)));
    }
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleToggleSprintGroupSelect = (sprintTickets: SprintTicket[]) => {
    const sprintIds = sprintTickets.map((t) => t.id);
    const allInSprintSelected = sprintIds.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);

    if (allInSprintSelected) {
      sprintIds.forEach((id) => next.delete(id));
    } else {
      sprintIds.forEach((id) => next.add(id));
    }
    setSelectedIds(next);
  };

  const isAllFilteredSelected = filteredTickets.length > 0 && selectedIds.size === filteredTickets.length;
  const isSomeSelected = selectedIds.size > 0;

  const handleExportFiltered = () => {
    exportSprintTicketsToExcel(filteredTickets, 'Filtered_Sprint_Tickets');
  };

  const handleExportSprint = (sprintName: string, sprintTickets: SprintTicket[]) => {
    exportSprintTicketsToExcel(sprintTickets, `${sprintName.replace(/\s+/g, '_')}_Tickets`);
  };

  // Helper to render the ticket table rows
  const renderTicketRows = (ticketList: SprintTicket[]) => {
    if (ticketList.length === 0) {
      return (
        <tr>
          <td colSpan={11} className="py-8 text-center text-slate-400 bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">No tickets in this sprint yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the Sprint Wizard or add a new ticket above to pull requests.</p>
          </td>
        </tr>
      );
    }

    return ticketList.map((ticket) => {
      const isSelected = selectedIds.has(ticket.id);
      const isDone = ticket.status === 'Done' || ticket.status === 'Completed';
      const statusStyle = getStatusBadgeStyle(ticket.status, customStatuses);
      const linkedRequest = allRequests?.find((r) => r.id === ticket.originalRequestId);

      return (
        <tr
          key={ticket.id}
          className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
            isSelected ? 'bg-red-50/40' : isDone ? 'bg-emerald-50/20' : ''
          }`}
        >
          {/* Checkbox */}
          <td className="py-3 px-3 text-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleRow(ticket.id)}
              aria-label={`Select ticket ${ticket.id}`}
              className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
            />
          </td>

          {/* Ticket ID */}
          <td className="py-3 px-3 font-mono font-bold text-red-700 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              {onToggleWatch && (
                <button
                  id={`btn-watch-tkt-${ticket.id}`}
                  type="button"
                  onClick={() => onToggleWatch(ticket.id)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    watchedIds && watchedIds.includes(ticket.id)
                      ? 'text-red-700 bg-red-50 hover:bg-red-100'
                      : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                  title={watchedIds && watchedIds.includes(ticket.id) ? 'Remove from My Watchlist' : 'Add to My Watchlist'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${watchedIds && watchedIds.includes(ticket.id) ? 'fill-red-700 text-red-700' : ''}`} />
                </button>
              )}
              {isDone && (
                <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Completed ticket">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
              <span className={isDone ? 'text-slate-700' : ''}>{ticket.id}</span>
            </div>
          </td>

          {/* Title (View-only popup on click) */}
          <td className="py-3 px-3">
            <button
              type="button"
              onClick={() => onOpenDetailModal(ticket)}
              className={`text-left font-bold transition-colors block cursor-pointer ${
                isDone 
                  ? 'text-slate-700 hover:text-red-700 hover:underline' 
                  : 'text-slate-900 hover:text-red-700 hover:underline'
              }`}
              title="Click to view full read-only ticket details"
            >
              {ticket.title}
            </button>
            {ticket.notes && (
              <p 
                onClick={() => onOpenDetailModal(ticket)}
                className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 cursor-pointer hover:text-slate-700"
              >
                {ticket.notes}
              </p>
            )}
            {linkedRequest && onNavigateToTab && (
              <div className="mt-1.5 flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToTab('requests');
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
                  title={`Generated from Intake Request ${linkedRequest.id}! Click to view in Request Register.`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Linked Intake: {linkedRequest.id}
                </button>
              </div>
            )}
          </td>

          {/* Type */}
          <td className="py-3 px-3 whitespace-nowrap">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {ticket.type}
            </span>
          </td>

          {/* Assignee */}
          <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
            {ticket.assignee}
          </td>

          {/* Priority */}
          <td className="py-3 px-3 whitespace-nowrap">
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
              ticket.priority === 'Highest' || ticket.priority === 'High'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {ticket.priority}
            </span>
          </td>

          {/* Status (Interactive selector) */}
          <td className="py-3 px-3 whitespace-nowrap">
            {onUpdateTicketStatus ? (
              <select
                value={ticket.status}
                onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value)}
                className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-red-600/30 transition-colors ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
                title="Change ticket status directly"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
                {customStatuses
                  .filter((s) => !['Backlog', 'In Progress', 'In Review', 'Done', 'Blocked'].includes(s.name))
                  .map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))
                }
              </select>
            ) : (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
              >
                {ticket.status}
              </span>
            )}
          </td>

          {/* Sprint */}
          <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
            {ticket.sprint}
          </td>

          {/* Target Date */}
          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
            {ticket.targetDate}
          </td>

          {/* Deferred */}
          <td className="py-3 px-3 text-center whitespace-nowrap">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
              ticket.deferred === 'Yes'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {ticket.deferred}
            </span>
          </td>

          {/* Actions */}
          <td className="py-3 px-3 text-center whitespace-nowrap">
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === ticket.id ? null : ticket.id);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 focus:outline-hidden transition-colors cursor-pointer"
                title="Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {openMenuId === ticket.id && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white border border-slate-200 divide-y divide-slate-100 focus:outline-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="py-1">
                      {/* View Read-Only */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenDetailModal(ticket);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                        title="View Full Read-Only Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Details</span>
                      </button>
                      
                      {/* Edit Ticket */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEditTicket(ticket);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left font-medium cursor-pointer"
                        title="Edit Ticket"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit</span>
                      </button>
                      {linkedRequest && onNavigateToTab && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onNavigateToTab('requests');
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 border-t border-slate-100 w-full text-left font-semibold cursor-pointer"
                          title="Go to original intake request details"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                          <span>View Intake Request</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      {/* Mark Done / In Progress Toggle */}
                      {!isDone ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            if (onUpdateTicketStatus) {
                              onUpdateTicketStatus(ticket.id, 'Done');
                            } else {
                              onMarkCompleteTicket(ticket);
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 w-full text-left font-medium cursor-pointer"
                          title="Mark ticket as Done (remains in this sprint group)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Mark as Done</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            if (onUpdateTicketStatus) {
                              onUpdateTicketStatus(ticket.id, 'In Progress');
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 w-full text-left font-medium cursor-pointer"
                          title="Reopen ticket to In Progress"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Reopen (In Progress)</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      {/* Soft Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onSoftDeleteTicket(ticket);
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
    });
  };

  return (
    <div className="space-y-4">

      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Sprint Items */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Total Tickets
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100">
              <KanbanSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">all sprints</span>
          </div>
        </div>

        {/* Done / Completed */}
        <div className="glass-card p-4 rounded-2xl bg-emerald-50/30 border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Done / Complete
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-950">{doneCount}</span>
            <span className="text-xs text-emerald-700 font-medium">in-sprint</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              In Progress
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-950">{inProgressCount}</span>
            <span className="text-xs text-blue-600 font-medium">active sprint</span>
          </div>
        </div>

        {/* Backlog */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Backlog
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{backlogCount}</span>
            <span className="text-xs text-slate-500 font-medium">unassigned</span>
          </div>
        </div>

        {/* Deferred / Spillover */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Deferred
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900">{deferredCount}</span>
            <span className="text-xs text-amber-600 font-medium">spillover</span>
          </div>
        </div>

      </div>

      {/* 2. Filters & Batch Operations Toolbar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-ticket-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets by ID, summary, or assignee..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Mode Toggle: Grouped vs Flat */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grouped'
                    ? 'bg-white text-red-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Group tickets by Sprint (Expandable/Collapsible)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grouped</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'flat'
                    ? 'bg-white text-red-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View all tickets as a flat list"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Flat List</span>
              </button>
            </div>

            {/* Month */}
            <select
              id="select-ticket-filter-month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Month: All</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Sprint */}
            <select
              id="select-ticket-filter-sprint"
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Sprint: All</option>
              {uniqueSprints.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Status */}
            <select
              id="select-ticket-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">Status: All</option>
              <option value="Done">Done</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Backlog">Backlog</option>
              <option value="Blocked">Blocked</option>
            </select>

            {/* Export View */}
            <button
              id="btn-export-ticket-view"
              type="button"
              onClick={handleExportFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Export filtered sprint view to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export</span>
            </button>

            {/* CREATE SPRINT WIZARD BUTTON (PROMINENT) */}
            {onOpenSprintWizard && (
              <button
                id="btn-sprint-create-wizard"
                type="button"
                onClick={onOpenSprintWizard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 rounded-lg shadow-sm transition-all cursor-pointer ring-1 ring-red-900/20"
                title="Create a new sprint by month/year and pull requests"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>+ Create Sprint Wizard</span>
              </button>
            )}

            {/* PULL REQUESTS INTO EXISTING SPRINT BUTTON */}
            {onOpenPullRequestsModal && (
              <button
                id="btn-sprint-pull-requests"
                type="button"
                onClick={() => onOpenPullRequestsModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Include and pull active intake requests into any sprint"
              >
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                <span>+ Pull Requests into Sprint</span>
              </button>
            )}

            {/* New Ticket */}
            <button
              id="btn-sprint-new-ticket"
              type="button"
              onClick={onOpenNewTicketModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-700" />
              <span>+ Quick Ticket</span>
            </button>
          </div>
        </div>

        {/* Global Expand / Collapse All Controls in Grouped Mode */}
        {viewMode === 'grouped' && groupedBySprint.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium text-[11px]">
                {groupedBySprint.length} Sprint Group{groupedBySprint.length !== 1 ? 's' : ''}
              </span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={expandAllSprints}
                className="text-slate-600 hover:text-red-700 font-semibold underline text-[11px] cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={collapseAllSprints}
                className="text-slate-600 hover:text-red-700 font-semibold underline text-[11px] cursor-pointer"
              >
                Collapse All
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              Showing tickets grouped by their target sprint
            </span>
          </div>
        )}

        {/* Batch Operations Bar */}
        {isSomeSelected && (
          <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-700 text-white font-bold text-xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-red-900">
                {selectedIds.size === 1 ? '1 Ticket Selected' : `${selectedIds.size} Tickets Selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-ticket-bulk-complete"
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
                id="btn-ticket-bulk-delete"
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

      {/* 3. Render Views: Grouped by Sprint (Expandable/Collapsible) OR Flat Table */}
      {viewMode === 'grouped' ? (
        /* ================= GROUPED SPRINT VIEW (EXPANDABLE/COLLAPSIBLE) ================= */
        <div className="space-y-4">
          {groupedBySprint.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No sprint groups match the selected filters.</p>
              <p className="text-xs text-slate-400 mt-1">Use the "+ Create Sprint Wizard" button to plan and pull new requests.</p>
            </div>
          ) : (
            groupedBySprint.map(([sprintName, sprintTickets]) => {
              const isCollapsed = collapsedSprints.has(sprintName);
              const sprintDone = sprintTickets.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
              const sprintInProgress = sprintTickets.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
              const sprintBacklog = sprintTickets.filter((t) => t.status === 'Backlog').length;
              
              const allInSprintSelected = sprintTickets.length > 0 && sprintTickets.every((t) => selectedIds.has(t.id));
              const someInSprintSelected = sprintTickets.some((t) => selectedIds.has(t.id));

              return (
                <div 
                  key={sprintName}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs transition-all duration-200"
                >
                  {/* Sprint Header Banner (Expandable/Collapsible Toggle) */}
                  <div 
                    onClick={() => toggleSprintCollapse(sprintName)}
                    className="px-4 py-3 bg-gradient-to-r from-slate-100 via-white to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    {/* Left: Chevron + Sprint Name + Ticket count */}
                    <div className="flex items-center gap-3">
                      <div className="text-slate-500 hover:text-slate-800 p-1 rounded-md">
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5 text-slate-600 transition-transform" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600 transition-transform" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 tracking-tight">
                          {sprintName}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                          {sprintTickets.length} Ticket{sprintTickets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Status Pills Breakdown */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {sprintDone > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {sprintDone} Done
                        </span>
                      )}
                      {sprintInProgress > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {sprintInProgress} Active
                        </span>
                      )}
                      {sprintBacklog > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Layers className="w-3 h-3 text-slate-500" />
                          {sprintBacklog} Backlog
                        </span>
                      )}
                    </div>

                    {/* Right: Group Actions */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Pull / Add Requests to this specific Sprint */}
                      {onOpenPullRequestsModal && (
                        <button
                          type="button"
                          onClick={() => onOpenPullRequestsModal(sprintName)}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white shadow-2xs transition-colors cursor-pointer"
                          title={`Pull active intake requests into ${sprintName}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Requests</span>
                        </button>
                      )}

                      {/* Select all in this sprint */}
                      {sprintTickets.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleToggleSprintGroupSelect(sprintTickets)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                            allInSprintSelected 
                              ? 'bg-red-50 text-red-800 border-red-200' 
                              : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                          title="Select / Deselect all tickets in this sprint group"
                        >
                          {allInSprintSelected ? 'Deselect Sprint' : 'Select Sprint'}
                        </button>
                      )}

                      {/* Export Sprint */}
                      {sprintTickets.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleExportSprint(sprintName, sprintTickets)}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="Export this sprint's tickets to Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Sprint Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={allInSprintSelected}
                                onChange={() => handleToggleSprintGroupSelect(sprintTickets)}
                                aria-label={`Select all tickets in ${sprintName}`}
                                className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Ticket ID</th>
                            <th className="py-2.5 px-3 min-w-[220px]">Title</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Assignee</th>
                            <th className="py-2.5 px-3">Priority</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Sprint</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3 text-center">Deferred</th>
                            <th className="py-2.5 px-3 text-center min-w-[130px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {sprintTickets.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-8 text-center text-slate-400">
                                <p className="text-xs font-semibold text-slate-600">No tickets in this sprint yet.</p>
                                {onOpenPullRequestsModal && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenPullRequestsModal(sprintName)}
                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Pull Requests from Register into {sprintName}</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ) : (
                            renderTicketRows(sprintTickets)
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ================= FLAT LIST VIEW ================= */
        <div className="glass-card rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Header */}
              <thead>
                <tr className="bg-slate-200/30 text-slate-700 border-b border-slate-200/50 font-bold tracking-wider uppercase text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all sprint tickets"
                      className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3 min-w-[220px]">Title</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Sprint</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-center">Deferred</th>
                  <th className="py-3 px-3 text-center min-w-[130px]">Actions</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-medium">No sprint tickets match the selected filters.</p>
                      <p className="text-xs mt-1">Use the "+ Create Sprint Wizard" or add a new ticket above.</p>
                    </td>
                  </tr>
                ) : (
                  renderTicketRows(filteredTickets)
                )}
              </tbody>

            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> total sprint tickets
            </span>
            <span className="text-[11px] text-slate-400">
              ACE Sprint Backlog Engine
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
