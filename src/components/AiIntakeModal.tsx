import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldAlert,
  Lightbulb,
  HelpCircle,
  Zap,
  Layers,
  Activity,
  CheckSquare
} from 'lucide-react';
import { AiParsedIntake } from '../types';
import { parseIntakeWithAi } from '../utils/aiClient';

interface AiIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyIntake: (parsed: AiParsedIntake, portalLabel: string, typeLabel: string) => void;
}

const SAMPLE_CIRCULARS = [
  {
    title: 'AML Velocity & Corridor Threshold Directive',
    category: 'Regulatory Directive',
    text: `State Bank / FCA Circular Ref: AML-2024-V4.
Subject: Mandatory Automated Velocity Limits for UK to Pakistan / Bangladesh Corridors.
All Authorised Payment Institutions and Remittance Operators must implement real-time transaction velocity caps.
Any remitter initiating more than 3 transactions totalling over £3,000 within any rolling 48-hour period must trigger an automated Compliance Verification hold. 
The system must query the backoffice KYC verification status. If Tier-2 address proof is older than 12 months, immediate biometric re-verification must be enforced before payment dispatch.
Non-compliance exposes the institution to statutory audit sanctions and corridor license suspension. Target implementation within 30 days.`
  },
  {
    title: 'Sanctions Daily Delta & PEP Screening Ingestion',
    category: 'Audit Finding',
    text: `Internal Audit Finding #2024-AC-09: Systems Sanctions Feed Sync Failure.
Audit identified that the daily delta file from the Dow Jones / World-Check sanctions feed is currently processed via a scheduled batch cron that occasionally fails silently on network retry.
Requirement: Implement an automated webhook ingestion service with idempotency keying and dead-letter queueing.
If the delta file cannot be ingested within 60 minutes of publication, the backoffice must raise a Critical P1 alert to the Compliance Officer on duty.
Transactions against newly added SDN/OFSI entities must be halted immediately. Acceptance criteria must include automated reconciliation reports.`
  },
  {
    title: 'Card Scheme 3DS 2.2 Chargeback Mitigation',
    category: 'Operational Defect / Feature',
    text: `Card Acquiring Partner Notice: Visa & Mastercard 3D Secure 2.2 mandatory compliance.
Operations reports that debit card remittance transactions for first-time senders in the European corridor are encountering a 14% friction dropout rate due to outdated challenge screens in the web portal.
We need to upgrade the 3DS SDK to version 2.2 to support frictionless risk-based authentication and biometric app-switch.
Scope includes updating transaction risk data payloads sent to the acquiring gateway and logging 3DS authentication values (CAVV/ECI) for dispute evidence.`
  }
];

export const AiIntakeModal: React.FC<AiIntakeModalProps> = ({
  isOpen,
  onClose,
  onApplyIntake,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiParsedIntake | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [portalLabel, setPortalLabel] = useState('Backoffice');
  const [typeLabel, setTypeLabel] = useState('Sprint request');

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please paste regulatory or compliance text to process.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await parseIntakeWithAi(inputText, portalLabel, typeLabel);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while parsing with Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyIntake(result, portalLabel, typeLabel);
    onClose();
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyFullDraft = () => {
    if (!result) return;
    const fullDraft = [
      `### Summary\n${result.summary}`,
      `\n### Description\n${result.description}`,
      `\n### Use Cases\n${(result.useCases || []).map((u, i) => `${i + 1}. ${u}`).join('\n')}`,
      `\n### Acceptance Criteria\n${(result.acceptanceCriteria || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
      `\n### Assumptions\n${(result.assumptions || []).map((a) => `• ${a}`).join('\n')}`,
      `\n### Impact Analysis\n${result.impactAnalysis}`
    ].join('\n');

    handleCopyText(fullDraft, 'FULL_DRAFT');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/90 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  AI Intake Request Drafter
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-800 text-red-100 border border-red-700">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Draft sprint requests with Summary, Description, Use Cases, Acceptance Criteria, Assumptions, and Impact Analysis.
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

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Load an ACE Compliance Sample:
              </span>
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setResult(null);
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Text
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_CIRCULARS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample.text);
                    setResult(null);
                    setError(null);
                  }}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50/40 bg-slate-50 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider block">
                    {sample.category}
                  </span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-red-900 block truncate mt-0.5">
                    {sample.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Target Context Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" id="label-ai-portal">
                Target Portal
              </label>
              <select
                id="select-ai-portal-label"
                value={portalLabel}
                onChange={(e) => setPortalLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white shadow-2xs"
              >
                <option value="Backoffice">Backoffice</option>
                <option value="ARMS">ARMS</option>
                <option value="SAR ticketing">SAR ticketing</option>
                <option value="Chargeback">Chargeback</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" id="label-ai-type">
                Workflow Category Label
              </label>
              <select
                id="select-ai-type-label"
                value={typeLabel}
                onChange={(e) => setTypeLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white shadow-2xs"
              >
                <option value="Sprint request">Sprint request</option>
                <option value="Bug">Bug</option>
                <option value="Support">Support</option>
              </select>
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Raw Regulatory / Audit / Policy / Change Text:</span>
              <span className="text-[11px] font-normal text-slate-400">
                {inputText.length} characters
              </span>
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste email thread, central bank circular, internal audit finding, or change request here..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-white shadow-2xs"
            />
          </div>

          {/* Generate Button & Error Alert */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Drafts standard 6-field structured specification ready for sprint planning and engineering review.
            </div>
            <button
              type="button"
              disabled={isLoading || !inputText.trim()}
              onClick={handleProcess}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting with Gemini...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Draft Request with AI</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Generation Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Result Card: 6 Requested Fields */}
          {result && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-5 animate-in fade-in duration-200">
              
              {/* Draft Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Draft Generated
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    6 Standard Fields
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyFullDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copiedSection === 'FULL_DRAFT' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied Full Draft!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full Markdown Draft</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1. Summary (one liner summary) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    1. Summary (One-liner Summary)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(result.summary, 'SUMMARY')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Summary"
                  >
                    {copiedSection === 'SUMMARY' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {result.summary}
                </p>
              </div>

              {/* 2. Description (change description) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    2. Description (Change Description)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(result.description, 'DESCRIPTION')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Description"
                  >
                    {copiedSection === 'DESCRIPTION' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {result.description}
                </p>
              </div>

              {/* 3. Use Cases (few use cases how will change help in future) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    3. Use Cases (Future Operational & Business Benefits)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(result.useCases || []).length} use cases
                  </span>
                </div>
                <div className="space-y-2">
                  {(result.useCases || []).map((useCase, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/40 border border-amber-100/70 text-xs text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed flex-1">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Acceptance Criteria */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    4. Acceptance Criteria
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(result.acceptanceCriteria || []).length} criteria
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(result.acceptanceCriteria || []).map((criterion, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <span className="leading-relaxed flex-1">
                        <span className="font-bold text-slate-400 mr-1.5">{idx + 1}.</span>
                        {criterion}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(criterion, `AC_${idx}`)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 shrink-0 cursor-pointer"
                        title="Copy criterion"
                      >
                        {copiedSection === `AC_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Assumptions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    5. Assumptions
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(result.assumptions || []).length} key assumptions
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(result.assumptions || []).map((assumption, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/30 border border-blue-100/60 text-xs text-slate-700"
                    >
                      <span className="text-blue-600 font-bold shrink-0">&bull;</span>
                      <span className="leading-relaxed flex-1">{assumption}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Impact Analysis */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                    6. Impact Analysis
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(result.impactAnalysis, 'IMPACT')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copy Impact Analysis"
                  >
                    {copiedSection === 'IMPACT' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-purple-50/30 p-3 rounded-lg border border-purple-100/60">
                  {result.impactAnalysis}
                </p>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-2 px-6 py-2 text-xs sm:text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Populate Intake Form with Draft</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
