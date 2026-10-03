import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calculator, 
  AlertCircle, 
  Save, 
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Link2,
  FileText
} from 'lucide-react';
import { ComplianceRequest, RequestType, RequestStatus, ScoreMatrix, CustomStatus, AiParsedIntake } from '../types';
import { calculateScore, getPriorityTier, getTierBadgeClasses } from '../utils/scoreCalculator';
import { AiIntakeModal } from './AiIntakeModal';
import { AiDuplicateAlert } from './AiDuplicateAlert';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: ComplianceRequest) => void;
  editingRequest?: ComplianceRequest | null;
  customStatuses?: CustomStatus[];
  sprints?: string[];
  existingItems?: any[];
}

const defaultMatrix: ScoreMatrix = {
  regulatoryRisk: 12,
  operationalPain: 18,
  strategicAlignment: 14,
  riskOfInaction: 8,
  requestClarity: 7,
};

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRequest,
  customStatuses = [],
  sprints = ['Sprint 24.05', 'Sprint 24.06', 'Sprint 24.07', 'Sprint 24.08', 'Sprint 24.09', 'Backlog'],
  existingItems = [],
}) => {
  const [isAiIntakeOpen, setIsAiIntakeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [type, setType] = useState<RequestType | string>('Compliance');
  const [status, setStatus] = useState<string>('New');
  const [targetSprint, setTargetSprint] = useState('Sprint 24.07');
  const [brdRequired, setBrdRequired] = useState<'Yes' | 'No'>('Yes');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [jiraLink, setJiraLink] = useState('');
  
  const [scoreMatrix, setScoreMatrix] = useState<ScoreMatrix>(defaultMatrix);
  const [description, setDescription] = useState('');
  const [sourceTrigger, setSourceTrigger] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (editingRequest) {
      setTitle(editingRequest.title || '');
      setSubmittedBy(editingRequest.submittedBy || '');
      setType(editingRequest.type || 'Compliance');
      setStatus(editingRequest.status || 'New');
      setTargetSprint(editingRequest.targetSprint || 'Sprint 24.07');
      setBrdRequired(editingRequest.brdRequired || 'Yes');
      setDate(editingRequest.date || new Date().toISOString().slice(0, 10));
      setJiraLink(editingRequest.jiraLink || '');
      setScoreMatrix(editingRequest.scoreMatrix || defaultMatrix);
      setDescription(editingRequest.description || '');
      setSourceTrigger(editingRequest.sourceTrigger || '');
      setNotes(editingRequest.notes || '');
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingRequest, isOpen]);

  const resetForm = () => {
    setTitle('');
    setSubmittedBy('');
    setType('Compliance');
    setStatus('New');
    setTargetSprint('Sprint 24.07');
    setBrdRequired('Yes');
    setDate(new Date().toISOString().slice(0, 10));
    setJiraLink('');
    setScoreMatrix(defaultMatrix);
    setDescription('');
    setSourceTrigger('');
    setNotes('');
    setErrors({});
  };

  const handleApplyAiIntake = (parsed: AiParsedIntake) => {
    setTitle(parsed.summary || parsed.title || '');
    setType(parsed.type || 'Compliance');
    setSourceTrigger(parsed.sourceTrigger || '');
    setBrdRequired(parsed.brdRequired || 'No');
    if (parsed.targetSprintSuggestion && sprints.includes(parsed.targetSprintSuggestion)) {
      setTargetSprint(parsed.targetSprintSuggestion);
    }
    
    // Combine the 6 drafted fields cleanly
    const descSections: string[] = [];
    if (parsed.description) {
      descSections.push(`### Description\n${parsed.description}`);
    }
    if (parsed.useCases && parsed.useCases.length > 0) {
      descSections.push(`### Use Cases\n${parsed.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')}`);
    }
    if (parsed.acceptanceCriteria && parsed.acceptanceCriteria.length > 0) {
      descSections.push(`### Acceptance Criteria\n${parsed.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
    }
    if (parsed.assumptions && parsed.assumptions.length > 0) {
      descSections.push(`### Assumptions\n${parsed.assumptions.map((a) => `• ${a}`).join('\n')}`);
    }
    if (parsed.impactAnalysis) {
      descSections.push(`### Impact Analysis\n${parsed.impactAnalysis}`);
    }

    setDescription(descSections.join('\n\n'));

    if (parsed.recommendedScores) {
      setScoreMatrix(parsed.recommendedScores);
    }
  };

  const totalScore = calculateScore(scoreMatrix);
  const priorityTier = getPriorityTier(totalScore);

  const handleScoreChange = (field: keyof ScoreMatrix, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, isNaN(val) ? 0 : val));
    setScoreMatrix((prev) => ({ ...prev, [field]: clamped }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Request Title is required';
    if (!submittedBy.trim()) newErrors.submittedBy = 'Submitted By is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const calculatedTotal = calculateScore(scoreMatrix);
    const tier = getPriorityTier(calculatedTotal);

    let formattedJira = jiraLink.trim();
    if (formattedJira && !formattedJira.startsWith('http://') && !formattedJira.startsWith('https://')) {
      if (formattedJira.toUpperCase().startsWith('ACE-') || formattedJira.toUpperCase().startsWith('REQ-')) {
        formattedJira = `https://jira.internal.ace/browse/${formattedJira.toUpperCase()}`;
      } else {
        formattedJira = `https://${formattedJira}`;
      }
    }

    const record: ComplianceRequest = {
      id: editingRequest ? editingRequest.id : `REQ-${String(Math.floor(100 + Math.random() * 900))}`,
      date,
      title: title.trim(),
      submittedBy: submittedBy.trim(),
      type,
      status,
      targetSprint: targetSprint.trim() || 'Unassigned',
      brdRequired,
      scoreMatrix,
      totalScore: calculatedTotal,
      priorityTier: tier,
      description: description.trim(),
      sourceTrigger: sourceTrigger.trim(),
      notes: notes.trim(),
      jiraLink: formattedJira,
      createdAt: editingRequest ? editingRequest.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingRequest ? `Edit Request: ${editingRequest.id}` : 'New Compliance & Systems Request'}
              </h2>
              <p className="text-xs text-slate-500">
                Prioritisation scoring matrix automatically evaluates risk, pain, and priority tier.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* AI Intake Auto-Fill Banner */}
          {!editingRequest && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">
                  Generate fields, BRD requirements, and scoring matrix from raw regulatory text.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAiIntakeOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0 border border-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>Auto-Fill with AI</span>
              </button>
            </div>
          )}

          {/* Top basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Request Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Request Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Sanctions Daily Delta Automated Ingestion"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.title ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1 font-medium">{errors.title}</p>}
            </div>

            {/* Submitted By */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Submitted By <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => {
                  setSubmittedBy(e.target.value);
                  if (errors.submittedBy) setErrors((prev) => ({ ...prev, submittedBy: '' }));
                }}
                placeholder="e.g. Sarah Jenkins (Financial Crime Unit)"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.submittedBy ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.submittedBy && <p className="text-xs text-red-600 mt-1 font-medium">{errors.submittedBy}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RequestType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="Compliance">Compliance</option>
                <option value="Policy Update">Policy Update</option>
                <option value="Audit Requirement">Audit Requirement</option>
                <option value="New Feature">New Feature</option>
                <option value="Defect">Defect</option>
                <option value="Automation">Automation</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                {customStatuses && customStatuses.length > 0 ? (
                  customStatuses
                    .filter((s) => s.category === 'request' || s.category === 'both')
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))
                ) : (
                  <>
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="In Dev">In Dev</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
                {status && !['New', 'Under Review', 'Approved', 'In Dev', 'Completed', 'Rejected'].includes(status) && !customStatuses?.some(s => s.name === status) && (
                  <option value={status}>{status}</option>
                )}
              </select>
            </div>

            {/* Target Sprint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Sprint
              </label>
              <div className="relative">
                <input
                  list="sprint-options-list"
                  type="text"
                  value={targetSprint}
                  onChange={(e) => setTargetSprint(e.target.value)}
                  placeholder="e.g. Sprint 24.07"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <datalist id="sprint-options-list">
                  {sprints.map((sp) => (
                    <option key={sp} value={sp} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* BRD Required? */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                BRD Required?
              </label>
              <select
                value={brdRequired}
                onChange={(e) => setBrdRequired(e.target.value as 'Yes' | 'No')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Prioritisation Score Matrix Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Prioritisation Score Matrix
                  </h3>
                  <span className="text-xs text-slate-500 font-normal">
                    (Auto-calculates Tier / Total Score out of 100)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust standard parameters to rank requests objectively against regulatory scrutiny.
                </p>
              </div>

              {/* Dynamic Score & Tier Indicator */}
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Total Score</div>
                  <div className="text-lg font-extrabold text-slate-900 leading-tight">
                    {totalScore} <span className="text-xs font-medium text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="h-7 w-[1px] bg-slate-200" />
                <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getTierBadgeClasses(priorityTier)}`}>
                  {priorityTier}
                </span>
              </div>
            </div>

            {/* Matrix Sliders / Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Regulatory Risk (/30) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Regulatory Risk</span>
                  <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                    {scoreMatrix.regulatoryRisk} / 30
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={scoreMatrix.regulatoryRisk}
                  onChange={(e) => handleScoreChange('regulatoryRisk', parseInt(e.target.value) || 0, 30)}
                  className="w-full accent-red-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (None)</span>
                  <span>15 (Standard)</span>
                  <span>30 (Critical Audit/Fines)</span>
                </div>
              </div>

              {/* 2. Operational Pain (/25) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Operational Pain</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    {scoreMatrix.operationalPain} / 25
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scoreMatrix.operationalPain}
                  onChange={(e) => handleScoreChange('operationalPain', parseInt(e.target.value) || 0, 25)}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Low)</span>
                  <span>12 (Manual work)</span>
                  <span>25 (Severe Bottleneck)</span>
                </div>
              </div>

              {/* 3. Strategic Alignment (/20) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Strategic Alignment</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {scoreMatrix.strategicAlignment} / 20
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={scoreMatrix.strategicAlignment}
                  onChange={(e) => handleScoreChange('strategicAlignment', parseInt(e.target.value) || 0, 20)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Ad-hoc)</span>
                  <span>10 (Departmental)</span>
                  <span>20 (Core OKR)</span>
                </div>
              </div>

              {/* 4. Risk of Inaction (/15) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Risk of Inaction</span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                    {scoreMatrix.riskOfInaction} / 15
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={scoreMatrix.riskOfInaction}
                  onChange={(e) => handleScoreChange('riskOfInaction', parseInt(e.target.value) || 0, 15)}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Tolerable)</span>
                  <span>7 (Growing debt)</span>
                  <span>15 (System failure)</span>
                </div>
              </div>

              {/* 5. Request Clarity (/10) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Request Clarity</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    {scoreMatrix.requestClarity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={scoreMatrix.requestClarity}
                  onChange={(e) => handleScoreChange('requestClarity', parseInt(e.target.value) || 0, 10)}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (Vague)</span>
                  <span>5 (Drafted)</span>
                  <span>10 (Ready for Dev)</span>
                </div>
              </div>

              {/* Quick score presets */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-600">Quick Score Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScoreMatrix({ regulatoryRisk: 28, operationalPain: 22, strategicAlignment: 18, riskOfInaction: 14, requestClarity: 9 })}
                    className="text-[10px] px-2 py-1 bg-red-50 text-red-700 font-semibold rounded hover:bg-red-100 cursor-pointer"
                  >
                    High Regulatory
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreMatrix({ regulatoryRisk: 12, operationalPain: 18, strategicAlignment: 14, riskOfInaction: 8, requestClarity: 7 })}
                    className="text-[10px] px-2 py-1 bg-amber-50 text-amber-800 font-semibold rounded hover:bg-amber-100 cursor-pointer"
                  >
                    Medium Pain
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoreMatrix({ regulatoryRisk: 5, operationalPain: 8, strategicAlignment: 6, riskOfInaction: 4, requestClarity: 5 })}
                    className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded hover:bg-blue-100 cursor-pointer"
                  >
                    Low Ad-hoc
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            
            {/* Description / Business Logic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Business Logic
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the functional requirement, compliance objective, and desired system behavior..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Source / Trigger */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Source / Trigger
                </label>
                <input
                  type="text"
                  value={sourceTrigger}
                  onChange={(e) => setSourceTrigger(e.target.value)}
                  placeholder="e.g. Audit Finding #2024-AC-04"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Jira Ticket Link / Ref */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Jira Reference</span>
                  {jiraLink && (
                    <a
                      href={jiraLink.startsWith('http') ? jiraLink : `https://${jiraLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5 normal-case"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jiraLink}
                    onChange={(e) => setJiraLink(e.target.value)}
                    placeholder="e.g. ACE-104 or https://jira..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Legal approved data contract"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Feature 4: Semantic Duplicate & Conflict Detector */}
            <div className="pt-1">
              <AiDuplicateAlert
                draftTitle={title}
                draftDescription={description}
                draftType={type}
                currentId={editingRequest?.id}
                existingItems={existingItems}
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingRequest ? 'Update Request' : '+ Add Request'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Embedded AI Intake Modal */}
      <AiIntakeModal
        isOpen={isAiIntakeOpen}
        onClose={() => setIsAiIntakeOpen(false)}
        onApplyIntake={handleApplyAiIntake}
      />
    </div>
  );
};
