import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GcrRule } from '../types';

interface AddGcrRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<GcrRule, 'id'>) => void;
  nextRuleNumber: number;
}

export const AddGcrRuleModal: React.FC<AddGcrRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextRuleNumber
}) => {
  const [code, setCode] = useState(`GCR ${nextRuleNumber}`);
  const [status, setStatus] = useState('In Testing');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [implementationType, setImplementationType] = useState('');
  const [description, setDescription] = useState('');
  const [logicExplanation, setLogicExplanation] = useState('');
  const [otherParameters, setOtherParameters] = useState('');
  const [lookbackPeriod, setLookbackPeriod] = useState('');
  const [triggerPoint, setTriggerPoint] = useState('');
  const [changes, setChanges] = useState('v1.0');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      code,
      status,
      name,
      category,
      implementationType,
      description,
      logicExplanation,
      otherParameters,
      lookbackPeriod,
      triggerPoint,
      changes,
      vendorName,
      notes
    });
    // Reset
    setCode(`GCR ${nextRuleNumber + 1}`);
    setStatus('In Testing');
    setName('');
    setCategory('');
    setImplementationType('');
    setDescription('');
    setLogicExplanation('');
    setOtherParameters('');
    setLookbackPeriod('');
    setTriggerPoint('');
    setChanges('v1.0');
    setVendorName('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Rule</h2>
            <p className="text-sm text-slate-500">New entry — will be added as {code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">GCR CODE</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">STATUS</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white cursor-pointer">
                <option value="In Testing">In Testing</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">RULE NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">CATEGORY / DOMAIN</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white cursor-pointer">
                <option value="">— Select —</option>
                <option value="AML / KYC">AML / KYC</option>
                <option value="Sanctions">Sanctions</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">IMPLEMENTATION TYPE</label>
              <select value={implementationType} onChange={e => setImplementationType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white cursor-pointer">
                <option value="">— Select —</option>
                <option value="Automated">Automated</option>
                <option value="Manual">Manual</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">RULE DESCRIPTION</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">RULE LOGIC EXPLANATION</label>
            <textarea rows={3} value={logicExplanation} onChange={e => setLogicExplanation(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">OTHER PARAMETERS / SUB-RULES</label>
            <textarea rows={3} value={otherParameters} onChange={e => setOtherParameters(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">TRIGGER POINT</label>
              <input type="text" value={triggerPoint} onChange={e => setTriggerPoint(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" placeholder="e.g. Daily EOD Batch" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">LOOKBACK PERIOD</label>
              <input type="text" value={lookbackPeriod} onChange={e => setLookbackPeriod(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">CHANGES</label>
              <input type="text" value={changes} onChange={e => setChanges(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" placeholder="e.g. v1.0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">VENDOR NAME</label>
              <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-1">NOTES / ADDITIONAL INFO</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold text-white bg-[#C92A2A] hover:bg-red-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  );
};
