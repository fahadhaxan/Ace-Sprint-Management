import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Layers,
  X
} from 'lucide-react';
import { AiDuplicateMatch, AiDuplicateResult } from '../types';
import { detectDuplicatesWithAi } from '../utils/aiClient';

interface AiDuplicateAlertProps {
  draftTitle: string;
  draftDescription?: string;
  draftType?: string;
  currentId?: string;
  existingItems: any[];
  onViewItem?: (itemId: string, sourceType: string) => void;
}

export const AiDuplicateAlert: React.FC<AiDuplicateAlertProps> = ({
  draftTitle,
  draftDescription,
  draftType,
  currentId,
  existingItems,
  onViewItem,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<AiDuplicateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheck = async () => {
    if (!draftTitle || !draftTitle.trim()) {
      setError('Please provide a title to check for duplicates.');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const data = await detectDuplicatesWithAi(
        {
          id: currentId,
          title: draftTitle,
          description: draftDescription,
          type: draftType,
        },
        existingItems
      );
      setResult(data);
      setIsExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to detect duplicates.');
    } finally {
      setIsChecking(false);
    }
  };

  const getConflictBadge = (type: string) => {
    switch (type) {
      case 'EXACT_DUPLICATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Exact Duplicate</span>;
      case 'SHARED_ROOT_CAUSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Shared Root Cause</span>;
      case 'REGULATORY_OVERLAP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Regulatory Overlap</span>;
      case 'SPRINT_CONFLICT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Sprint Conflict</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{type}</span>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={isChecking || !draftTitle?.trim()}
          onClick={handleCheck}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isChecking ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
              <span>Scanning Backlog with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Check Duplicates & Conflicts (AI)</span>
            </>
          )}
        </button>

        {result && (
          <span className="text-[11px] text-slate-500">
            Compared with {existingItems.length} active backlog items
          </span>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="rounded-xl border overflow-hidden text-xs animate-in fade-in duration-150">
          {!result.hasDuplicatesOrConflicts || result.matches.length === 0 ? (
            <div className="p-3 bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  No semantic duplicates or backlog conflicts detected.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-amber-50/70 border-amber-200">
              {/* Header */}
              <div className="p-3 border-b border-amber-200/80 flex items-center justify-between bg-amber-100/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900">
                      {result.matches.length} Potential Duplicate / Overlapping Item(s) Found
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">{result.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-amber-800 hover:text-amber-950 rounded cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="p-1 text-amber-800 hover:text-amber-950 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Matches List */}
              {isExpanded && (
                <div className="p-3 space-y-2.5 max-h-60 overflow-y-auto">
                  {result.matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-red-700">{m.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {m.sourceType}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {m.status}
                          </span>
                          {m.sprint && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({m.sprint})
                            </span>
                          )}
                          {getConflictBadge(m.conflictType)}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {m.similarityScore}% match
                          </span>
                          {onViewItem && (
                            <button
                              type="button"
                              onClick={() => onViewItem(m.id, m.sourceType)}
                              className="p-1 text-slate-500 hover:text-red-700 rounded hover:bg-slate-100 cursor-pointer"
                              title="View existing item details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="font-semibold text-slate-900">{m.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{m.reason}</p>
                      
                      <div className="pt-1 text-[11px] font-medium text-amber-900 bg-amber-50/50 p-1.5 rounded border border-amber-100/80">
                        <span className="font-bold">Recommended:</span> {m.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
