import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  BookmarkMinus,
  CheckSquare, 
  Square,
  ClipboardList,
  Bug,
  KanbanSquare,
  AlertCircle,
  HelpCircle,
  Check,
  Briefcase
} from 'lucide-react';
import { ComplianceRequest, BugRequest, SprintTicket, CustomTask, CustomStatus } from '../types';

interface WatchlistTabProps {
  requests: ComplianceRequest[];
  bugs: BugRequest[];
  tickets: SprintTicket[];
  watchedIds: string[];
  onToggleWatch: (id: string) => void;
  customTasks: CustomTask[];
  onAddCustomTask: (title: string) => void;
  onToggleCustomTaskStatus: (id: string) => void;
  onDeleteCustomTask: (id: string) => void;
  onOpenDetailModal: (item: any) => void;
  customStatuses: CustomStatus[];
}

export const WatchlistTab: React.FC<WatchlistTabProps> = ({
  requests,
  bugs,
  tickets,
  watchedIds,
  onToggleWatch,
  customTasks,
  onAddCustomTask,
  onToggleCustomTaskStatus,
  onDeleteCustomTask,
  onOpenDetailModal,
  customStatuses,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'request' | 'bug' | 'ticket'>('all');

  // Filter watched items from the arrays
  const watchedRequests = requests.filter(r => watchedIds.includes(r.id));
  const watchedBugs = bugs.filter(b => watchedIds.includes(b.id));
  const watchedTickets = tickets.filter(t => watchedIds.includes(t.id));

  const totalWatchedCount = watchedRequests.length + watchedBugs.length + watchedTickets.length;
  const completedCustomTasksCount = customTasks.filter(t => t.status === 'Done').length;

  const pendingTasks = customTasks.filter(t => t.status !== 'Done');
  const completedTasks = customTasks.filter(t => t.status === 'Done');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddCustomTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Premium Header */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-100 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Active Work & Watchlist</h2>
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <div className="flex-1 bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Watched Items</span>
              <span className="text-lg font-black text-red-700 mt-0.5 block">{totalWatchedCount}</span>
            </div>
            <div className="flex-1 bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">My Checklist</span>
              <span className="text-lg font-black text-slate-800 mt-0.5 block">
                {completedCustomTasksCount} / {customTasks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Watched System Records */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls & Segment Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-card p-3 rounded-2xl">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-1">
              Currently Monitoring:
            </span>
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                All ({totalWatchedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('request')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'request' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Requests ({watchedRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('bug')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'bug' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Bugs ({watchedBugs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('ticket')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === 'ticket' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Tickets ({watchedTickets.length})
              </button>
            </div>
          </div>

          {/* List of watched records */}
          <div className="space-y-3">
            
            {/* 1. Watched Compliance Requests (Risks) */}
            {(filterType === 'all' || filterType === 'request') && watchedRequests.map((req) => (
              <div 
                key={req.id} 
                className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-red-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                      <ClipboardList className="w-3 h-3" />
                      REQUEST REGISTER
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {req.id}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {req.portalLabel || 'Backoffice'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate group-hover:text-red-900">
                    {req.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {req.description}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">Target Sprint</span>
                    <span className="text-xs font-bold text-slate-700">{req.targetSprint}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(req)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="View Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWatch(req.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <BookmarkMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 2. Watched Bug Requests */}
            {(filterType === 'all' || filterType === 'bug') && watchedBugs.map((bug) => (
              <div 
                key={bug.id} 
                className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-red-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                      <Bug className="w-3 h-3" />
                      BUG REQUEST
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {bug.id}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {bug.environment || 'Production'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate group-hover:text-amber-900">
                    {bug.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {bug.about}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">Severity</span>
                    <span className="text-xs font-bold text-amber-700">{bug.severity}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(bug)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="View Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWatch(bug.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <BookmarkMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* 3. Watched Sprint Tickets */}
            {(filterType === 'all' || filterType === 'ticket') && watchedTickets.map((tkt) => (
              <div 
                key={tkt.id} 
                className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-red-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      <KanbanSquare className="w-3 h-3" />
                      SPRINT BACKLOG
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {tkt.id}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {tkt.sprint}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug truncate group-hover:text-blue-900">
                    {tkt.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {tkt.notes}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">Assignee</span>
                    <span className="text-xs font-bold text-slate-700">{tkt.assignee}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(tkt)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="View Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleWatch(tkt.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <BookmarkMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {totalWatchedCount === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
                <h4 className="text-sm font-bold text-slate-800 mt-3">Watchlist is Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Pin critical compliance items, defects, or backlog tickets by clicking the Bookmark icon in any active tab.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Custom Quick Tasks Checklist */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Personal Scratchpad & Tasks
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Draft quick action-items or reminders that are top-of-mind. Offline persistent to your device.
              </p>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTaskSubmit} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Type quick task & hit Enter..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600/30 bg-white"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Checklist Lists */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              
              {/* 1. To-Do / Active Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  To-Do / Active ({pendingTasks.length})
                </span>
                
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-white border-slate-200 hover:border-slate-300 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleCustomTaskStatus(task.id)}
                        className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className="w-4 h-4 rounded-md border border-slate-400 bg-white" />
                        </div>
                        <span className="text-xs font-semibold leading-relaxed truncate text-slate-800">
                          {task.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCustomTask(task.id)}
                        className="text-slate-400 hover:text-red-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {pendingTasks.length === 0 && (
                    <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-3">
                      <p className="text-[11px] text-slate-400">
                        No active reminders. Add one above!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Completed Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Completed Tasks ({completedTasks.length})
                </span>

                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-slate-50/70 border-slate-200/60 opacity-70 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleCustomTaskStatus(task.id)}
                        className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3px]" />
                          </div>
                        </div>
                        <span className="text-xs font-semibold leading-relaxed truncate line-through text-slate-500">
                          {task.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCustomTask(task.id)}
                        className="text-slate-400 hover:text-red-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {completedTasks.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-[11px] font-medium italic">
                      No tasks completed yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
