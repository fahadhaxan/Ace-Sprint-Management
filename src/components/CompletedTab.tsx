import React, { useState, useMemo } from 'react';
import { 
  CompletedRecord, 
  CustomStatus 
} from '../types';
import { 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Eye, 
  ExternalLink, 
  FileSpreadsheet, 
  Layers, 
  KanbanSquare, 
  Calendar, 
  User, 
  Filter 
} from 'lucide-react';
import { exportCompletedToExcel } from '../utils/excel';

interface CompletedTabProps {
  completedRecords: CompletedRecord[];
  customStatuses: CustomStatus[];
  onReopenRecord: (record: CompletedRecord) => void;
  onBulkReopen: (recordIds: string[]) => void;
  onSoftDeleteRecord: (record: CompletedRecord) => void;
  onBulkSoftDelete: (recordIds: string[]) => void;
  onOpenDetailModal: (record: CompletedRecord) => void;
}

export const CompletedTab: React.FC<CompletedTabProps> = ({
  completedRecords,
  customStatuses,
  onReopenRecord,
  onBulkReopen,
  onSoftDeleteRecord,
  onBulkSoftDelete,
  onOpenDetailModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'Request' | 'Sprint Ticket'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Metrics
  const totalCompleted = completedRecords.length;
  const requestsCompleted = completedRecords.filter(c => c.sourceType === 'Request').length;
  const ticketsCompleted = completedRecords.filter(c => c.sourceType === 'Sprint Ticket').length;

  // Filtered
  const filteredRecords = useMemo(() => {
    return completedRecords.filter((record) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        record.originalId.toLowerCase().includes(q) ||
        record.title.toLowerCase().includes(q) ||
        record.completedBy.toLowerCase().includes(q) ||
        (record.finalNotes && record.finalNotes.toLowerCase().includes(q));

      const matchesSource = sourceFilter === 'ALL' || record.sourceType === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [completedRecords, searchTerm, sourceFilter]);

  // Multi-select
  const isAllFilteredSelected = filteredRecords.length > 0 && filteredRecords.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const newSet = new Set(selectedIds);
      filteredRecords.forEach(r => newSet.delete(r.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filteredRecords.forEach(r => newSet.add(r.id));
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

  const handleExport = () => {
    exportCompletedToExcel(filteredRecords, 'ACE_Completed_Archive');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Total Finalized
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-950">{totalCompleted}</span>
            <span className="text-xs text-emerald-700 font-medium">audit archive records</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Requests Completed
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{requestsCompleted}</span>
            <span className="text-xs text-slate-500 font-medium">intake mandates</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Sprint Tickets Completed
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <KanbanSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{ticketsCompleted}</span>
            <span className="text-xs text-slate-500 font-medium">engineering stories/bugs</span>
          </div>
        </div>

      </div>

      {/* 2. Filters & Toolbar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-completed-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search completed records by ID, title, or sign-off lead..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="select-completed-source-filter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
            >
              <option value="ALL">All Sources</option>
              <option value="Request">Requests Only</option>
              <option value="Sprint Ticket">Sprint Tickets Only</option>
            </select>

            <button
              id="btn-export-completed"
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Export completed archive to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export View</span>
            </button>
          </div>

        </div>

        {/* Batch toolbar */}
        {isSomeSelected && (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-xs">
                {selectedIds.size}
              </span>
              <span className="text-xs font-bold text-emerald-900">
                {selectedIds.size === 1 ? '1 Record Selected' : `${selectedIds.size} Records Selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-bulk-reopen"
                type="button"
                onClick={() => {
                  onBulkReopen(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Bulk Reopen & Move to Active</span>
              </button>

              <button
                id="btn-bulk-delete-completed"
                type="button"
                onClick={() => {
                  onBulkSoftDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-800 bg-red-100 hover:bg-red-200 border border-red-300 rounded-md transition-colors cursor-pointer"
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

      {/* 3. Completed Records Table */}
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
                    aria-label="Select all completed records"
                    className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Original ID</th>
                <th className="py-3 px-3 min-w-[220px]">Title & Final Notes</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Resolution Date</th>
                <th className="py-3 px-3">Completed By</th>
                <th className="py-3 px-3">Jira Link</th>
                <th className="py-3 px-3 text-center min-w-[120px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No completed records in the archive yet.</p>
                    <p className="text-xs mt-1">When requests or sprint tickets are marked as complete, they appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isSelected = selectedIds.has(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rec.id)}
                          aria-label={`Select completed record ${rec.originalId}`}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                      </td>

                      {/* Source Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.sourceType === 'Request'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {rec.sourceType}
                        </span>
                      </td>

                      {/* Original ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {rec.originalId}
                      </td>

                      {/* Title & Notes (Clickable -> ViewDetailModal) */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(rec)}
                          className="text-left font-bold text-slate-900 hover:text-emerald-700 hover:underline transition-colors block cursor-pointer"
                          title="Click to view full read-only resolution details"
                        >
                          {rec.title}
                        </button>
                        {rec.finalNotes && (
                          <p 
                            onClick={() => onOpenDetailModal(rec)}
                            className="text-[11px] text-emerald-700 line-clamp-1 mt-0.5 cursor-pointer font-medium"
                          >
                            Sign-off: {rec.finalNotes}
                          </p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {rec.type}
                      </td>

                      {/* Resolution Date */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {rec.resolutionDate}
                      </td>

                      {/* Completed By */}
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {rec.completedBy}
                      </td>

                      {/* Jira Link */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {rec.jiraLink ? (
                          <a
                            href={rec.jiraLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-red-700 hover:text-red-900 hover:underline"
                            title={rec.jiraLink}
                          >
                            <span>{rec.jiraLink.split('/').pop() || 'JIRA'}</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Read-Only */}
                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(rec)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Full Read-Only Resolution Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Reopen / Move back to Active */}
                          <button
                            type="button"
                            onClick={() => onReopenRecord(rec)}
                            className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Reopen: Move back to Active Register / Sprint Tracker"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Soft Delete */}
                          <button
                            type="button"
                            onClick={() => onSoftDeleteRecord(rec)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Soft delete to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{completedRecords.length}</strong> archived records
          </span>
          <span className="text-[11px] text-slate-400">
            Audit Ready Resolution Repository
          </span>
        </div>
      </div>

    </div>
  );
};
