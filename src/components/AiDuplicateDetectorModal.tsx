import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Copy, 
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { AiDuplicateMatch, AiDuplicateResult } from '../types';
import { detectDuplicatesWithAi } from '../utils/aiClient';

interface AiDuplicateDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRequests: any[];
  allBugs: any[];
  allTickets: any[];
  onOpenDetailModal?: (item: any) => void;
}

export const AiDuplicateDetectorModal: React.FC<AiDuplicateDetectorModalProps> = ({
  isOpen,
  onClose,
  allRequests,
  allBugs,
  allTickets,
  onOpenDetailModal,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiDuplicateResult | null>(null);

  if (!isOpen) return null;

  // Combine items for selection and comparison
  const combinedItems = [
    ...allRequests.map((r) => ({ ...r, sourceType: 'Request' })),
    ...allBugs.map((b) => ({ ...b, sourceType: 'Bug' })),
    ...allTickets.map((t) => ({ ...t, sourceType: 'Ticket' })),
  ];

  const handleSelectPreload = (id: string) => {
    setSelectedItemId(id);
    if (!id) {
      setCustomTitle('');
      setCustomDesc('');
      return;
    }
    const found = combinedItems.find((item) => item.id === id);
    if (found) {
      setCustomTitle(found.title || '');
      setCustomDesc(found.description || found.about || '');
    }
  };

  const handleAudit = async () => {
    if (!customTitle.trim()) {
      setError('Please provide a title or select an item from the system.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await detectDuplicatesWithAi(
        {
          id: selectedItemId || undefined,
          title: customTitle.trim(),
          description: customDesc.trim(),
        },
        combinedItems
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to detect duplicates with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenItem = (id: string) => {
    const item = combinedItems.find((i) => i.id === id);
    if (item && onOpenDetailModal) {
      onOpenDetailModal(item);
    }
  };

  const getConflictBadge = (type: string) => {
    switch (type) {
      case 'EXACT_DUPLICATE':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Exact Duplicate</span>;
      case 'SHARED_ROOT_CAUSE':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Shared Root Cause</span>;
      case 'REGULATORY_OVERLAP':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Regulatory Overlap</span>;
      case 'SPRINT_CONFLICT':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Sprint Conflict</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/90 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Semantic Duplicate & Conflict Detector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-900 text-amber-200 border border-amber-700">
                  AI Deep Audit
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Identifies duplicate requirements, shared root-cause bugs, and conflicting sprint deliveries across {combinedItems.length} active items.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          
          {/* Item Selector & Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit an Existing System Item (or enter a new draft below):
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => handleSelectPreload(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
              >
                <option value="">-- Choose an item to audit against the backlog --</option>
                <optgroup label="Compliance Requests">
                  {allRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {r.title} ({r.status})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Bug Reports">
                  {allBugs.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.id}] {b.title} ({b.status})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sprint Tickets">
                  {allTickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] {t.title} ({t.status})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title to Audit:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Sanctions screening failure on European card remittances..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Context:
                </label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Brief details or symptoms..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                AI cross-references {combinedItems.length} active records for semantic intent, corridor rules, and underlying APIs.
              </span>
              <button
                type="button"
                disabled={isLoading || !customTitle.trim()}
                onClick={handleAudit}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Backlog...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Semantic Conflict Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Audit Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Summary Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                result.hasDuplicatesOrConflicts && result.matches.length > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {result.hasDuplicatesOrConflicts && result.matches.length > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {result.hasDuplicatesOrConflicts && result.matches.length > 0
                        ? `${result.matches.length} Semantic Overlap(s) / Conflict(s) Detected`
                        : 'No Backlog Duplicates or Conflicts Found'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Matches List */}
              {result.matches.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Detailed Overlap & Conflict Breakdown:
                  </span>
                  
                  {result.matches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-xs">
                            {match.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {match.sourceType}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            Status: {match.status}
                          </span>
                          {match.sprint && (
                            <span className="text-xs text-slate-500 font-medium">
                              Sprint: {match.sprint}
                            </span>
                          )}
                          {getConflictBadge(match.conflictType)}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                            {match.similarityScore}% Confidence
                          </span>
                          {onOpenDetailModal && (
                            <button
                              type="button"
                              onClick={() => handleOpenItem(match.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Item</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{match.title}</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {match.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-slate-700">
                          <span className="font-bold text-slate-900 mr-1.5">Action Plan:</span>
                          {match.recommendation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
