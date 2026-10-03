import React, { useState, useMemo } from 'react';
import { DeletedItem } from '../types';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  FileSpreadsheet, 
  ClipboardList, 
  KanbanSquare 
} from 'lucide-react';

interface TrashTabProps {
  deletedItems: DeletedItem[];
  onRestoreItem: (item: DeletedItem) => void;
  onPermanentlyDeleteItem: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
}

export const TrashTab: React.FC<TrashTabProps> = ({
  deletedItems,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onRestoreAll,
  onEmptyTrash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [confirmEmptyModal, setConfirmEmptyModal] = useState(false);
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return deletedItems.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.originalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource = sourceFilter === 'ALL' || item.sourceType === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [deletedItems, searchTerm, sourceFilter]);

  const requestDeletedCount = deletedItems.filter((d) => d.sourceType === 'Request').length;
  const ticketDeletedCount = deletedItems.filter((d) => d.sourceType === 'Sprint Ticket').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Overview Bar */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Trash & Soft-Deleted Lifecycle Management
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Soft-deleted records remain recoverable here. Restoring will place items back in their original register intact.
            </p>
          </div>

          {/* Quick Action buttons */}
          {deletedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRestoreAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore All ({deletedItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmEmptyModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </div>
          )}
        </div>

        {/* Counter Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="px-3 py-1 bg-slate-100 rounded-md font-semibold text-slate-700">
            Total Deleted: {deletedItems.length}
          </span>
          <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md font-medium">
            Requests: {requestDeletedCount}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium">
            Sprint Tickets: {ticketDeletedCount}
          </span>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deleted items by ID or title..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="Request">Requests Only</option>
              <option value="Sprint Ticket">Sprint Tickets Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Deleted Items Table */}
      <div className="glass-card rounded-2xl overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200/30 text-slate-700 border-b border-slate-200/50 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-28">Source Type</th>
                <th className="py-3 px-3 w-28">Original ID</th>
                <th className="py-3 px-3.5 min-w-[240px]">Item Title</th>
                <th className="py-3 px-3 w-32">Type / Category</th>
                <th className="py-3 px-3 w-28">Status</th>
                <th className="py-3 px-3 w-28">Priority / Tier</th>
                <th className="py-3 px-3 w-36">Deleted Date & Time</th>
                <th className="py-3 px-3.5 w-48 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Trash2 className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">Trash is empty</p>
                      <p className="text-xs text-slate-400">
                        Items deleted from Request Register or Sprint Tracker will appear here for safe recovery.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Source Type */}
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                        item.sourceType === 'Request'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.sourceType === 'Request' ? (
                          <ClipboardList className="w-3 h-3" />
                        ) : (
                          <KanbanSquare className="w-3 h-3" />
                        )}
                        <span>{item.sourceType}</span>
                      </span>
                    </td>

                    {/* Original ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {item.originalId}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3.5 font-medium text-slate-800">
                      {item.title}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-slate-600">
                      {item.type}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {item.status}
                      </span>
                    </td>

                    {/* Priority / Tier */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.priorityOrTier}
                    </td>

                    {/* Deleted Timestamp */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(item.deletedAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-restore-${item.id}`}
                          type="button"
                          onClick={() => onRestoreItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                          title="Restore back to original location"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>

                        <button
                          id={`btn-permanent-delete-${item.id}`}
                          type="button"
                          onClick={() => setItemToDeletePermanently(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 hover:text-white hover:bg-red-700 rounded border border-red-200 transition-colors cursor-pointer"
                          title="Permanently remove from storage"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Empty Trash */}
      {confirmEmptyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Empty All Deleted Items?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently purge all {deletedItems.length} soft-deleted records from storage. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEmptyModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onEmptyTrash();
                  setConfirmEmptyModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Single Permanent Delete */}
      {itemToDeletePermanently && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Permanently Delete Record?
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this item? It will be removed completely from local storage.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDeletePermanently(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentlyDeleteItem(itemToDeletePermanently);
                  setItemToDeletePermanently(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
