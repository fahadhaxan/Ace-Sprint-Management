import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Trash2, ShieldAlert } from 'lucide-react';
import { GcrRule } from '../types';
import { AddGcrRuleModal } from './AddGcrRuleModal';

interface GcrRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: GcrRule[];
  onAddRule: (rule: GcrRule) => void;
  onDeleteRule: (id: string) => void;
}

export const GcrRulesModal: React.FC<GcrRulesModalProps> = ({ isOpen, onClose, rules, onAddRule, onDeleteRule }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Admin toggle for deleting
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'Rules Library' | 'Change Log'>('Rules Library');

  const counts = useMemo(() => {
    return {
      active: rules.filter(r => r.status === 'Active').length,
      testing: rules.filter(r => r.status === 'In Testing').length,
      inactive: rules.filter(r => r.status === 'Inactive' || r.status === 'Deprecated').length,
      unknown: rules.filter(r => !['Active', 'In Testing', 'Inactive', 'Deprecated'].includes(r.status)).length,
    };
  }, [rules]);

  if (!isOpen) return null;

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'All Categories' || r.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(rules.map(r => r.category).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(rules.map(r => r.status).filter(Boolean)));

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col border border-slate-200">
          
          {/* Custom Header matching screenshot */}
          <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200 bg-white rounded-t-xl">
            <div className="flex items-center gap-6">
              <button 
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'Rules Library' ? 'border-[#C92A2A] text-[#C92A2A]' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('Rules Library')}
              >
                Rules Library
              </button>
              <button 
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'Change Log' ? 'border-[#C92A2A] text-[#C92A2A]' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab('Change Log')}
              >
                Change Log
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'Change Log' ? 'bg-[#C92A2A] text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  2
                </span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isAdmin} 
                  onChange={(e) => setIsAdmin(e.target.checked)} 
                  className="rounded text-red-600 focus:ring-red-600"
                />
                Admin Mode (Enable Delete)
              </label>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search rules, categories, codes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-slate-50/50"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-50/50 min-w-[140px]"
              >
                <option value="All Statuses">All Statuses</option>
                {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-slate-50/50 min-w-[140px]"
              >
                <option value="All Categories">All Categories</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#C92A2A] hover:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
                  {counts.active} Active
                </div>
                <div className="px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
                  {counts.testing} Testing
                </div>
                <div className="px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-bold">
                  {counts.inactive} Inactive
                </div>
                <div className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
                  {counts.unknown} Unknown
                </div>
              </div>
            </div>
          </div>

          {/* Content (List like request register) */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">GCR CODE</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">RULE NAME</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">CATEGORY</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">STATUS</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">TRIGGER POINT</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">LOOKBACK</th>
                      <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">CHANGES</th>
                      <th scope="col" className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredRules.length > 0 ? (
                      filteredRules.map(rule => (
                        <tr key={rule.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                            {rule.code}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">
                            <span className="font-semibold">{rule.name}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-600">
                            {rule.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              rule.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                              rule.status === 'In Testing' ? 'bg-amber-100 text-amber-800' :
                              rule.status === 'Inactive' || rule.status === 'Deprecated' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {rule.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                            {rule.triggerPoint || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                            {rule.lookbackPeriod || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                            {rule.changes || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (isAdmin) {
                                  onDeleteRule(rule.id);
                                } else {
                                  alert("Only admins can delete rules. Please toggle 'Admin Mode' in the header to simulate admin rights.");
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors inline-flex ${
                                isAdmin 
                                  ? 'text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer' 
                                  : 'text-slate-300 cursor-not-allowed'
                              }`}
                              title={isAdmin ? "Delete Rule" : "Only admins can delete rules"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                          {rules.length === 0 ? "No GCR rules added yet. Click 'Add Rule' to create one." : "No matching rules found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AddGcrRuleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        nextRuleNumber={rules.length + 1}
        onSave={(newRuleData) => {
          onAddRule({ ...newRuleData, id: `gcr-rule-${Date.now()}` });
          setIsAddOpen(false);
        }}
      />
    </>
  );
};
