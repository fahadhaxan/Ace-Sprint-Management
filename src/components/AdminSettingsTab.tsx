import React, { useState } from 'react';
import { 
  CustomStatus 
} from '../types';
import { 
  Settings, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  Layers, 
  Palette, 
  Save, 
  AlertTriangle 
} from 'lucide-react';

interface AdminSettingsTabProps {
  statuses: CustomStatus[];
  sprints: string[];
  onUpdateStatuses: (statuses: CustomStatus[]) => void;
  onUpdateSprints: (sprints: string[]) => void;
  onDeleteStatus: (id: string) => void;
  onDeleteSprint: (sprintToRemove: string) => void;
  onResetAllData: () => void;
}

const COLOR_PRESETS = [
  { name: 'Purple', textColor: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { name: 'Sky Blue', textColor: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
  { name: 'Emerald', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { name: 'Blue', textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { name: 'Amber', textColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { name: 'Teal', textColor: 'text-teal-800', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { name: 'Rose', textColor: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { name: 'Red', textColor: 'text-red-800', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  { name: 'Slate', textColor: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
];

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  statuses,
  sprints,
  onUpdateStatuses,
  onUpdateSprints,
  onDeleteStatus,
  onDeleteSprint,
  onResetAllData,
}) => {
  // Status Configurator Form
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusName, setStatusName] = useState('');
  const [statusCategory, setStatusCategory] = useState<'request' | 'ticket' | 'both'>('both');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Sprints Form
  const [newSprintName, setNewSprintName] = useState('');

  // Confirmation for reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle reorder status
  const handleMoveStatus = (index: number, direction: 'up' | 'down') => {
    const newStatuses = [...statuses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStatuses.length) return;

    const temp = newStatuses[index];
    newStatuses[index] = newStatuses[targetIndex];
    newStatuses[targetIndex] = temp;

    // re-assign order
    const updated = newStatuses.map((s, idx) => ({ ...s, order: idx + 1 }));
    onUpdateStatuses(updated);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusName.trim()) return;

    const preset = COLOR_PRESETS[selectedColorIndex] || COLOR_PRESETS[0];

    if (editingStatusId) {
      // Edit existing
      const updated = statuses.map((s) => {
        if (s.id === editingStatusId) {
          return {
            ...s,
            name: statusName.trim(),
            category: statusCategory,
            textColor: preset.textColor,
            bgColor: preset.bgColor,
            borderColor: preset.borderColor,
          };
        }
        return s;
      });
      onUpdateStatuses(updated);
      setEditingStatusId(null);
    } else {
      // Add new
      const newStatus: CustomStatus = {
        id: `st-custom-${Date.now()}`,
        name: statusName.trim(),
        category: statusCategory,
        textColor: preset.textColor,
        bgColor: preset.bgColor,
        borderColor: preset.borderColor,
        order: statuses.length + 1,
        isSystem: false,
      };
      onUpdateStatuses([...statuses, newStatus]);
    }

    setStatusName('');
    setStatusCategory('both');
    setSelectedColorIndex(0);
  };

  const handleStartEdit = (st: CustomStatus) => {
    setEditingStatusId(st.id);
    setStatusName(st.name);
    setStatusCategory(st.category);
    const colorIdx = COLOR_PRESETS.findIndex((c) => c.textColor === st.textColor);
    setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
  };

  const handleDeleteStatus = (id: string) => {
    const updated = statuses.filter((s) => s.id !== id);
    onUpdateStatuses(updated);
    onDeleteStatus(id);
  };

  const handleAddSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    if (sprints.includes(newSprintName.trim())) return;

    onUpdateSprints([...sprints, newSprintName.trim()]);
    setNewSprintName('');
  };

  const handleDeleteSprint = (sprintToRemove: string) => {
    if (sprints.length <= 1) return;
    onUpdateSprints(sprints.filter((s) => s !== sprintToRemove));
    onDeleteSprint(sprintToRemove);
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center shadow-2xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Admin Settings & Lifecycle Configurator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure dynamic workflow statuses, sprint cadences, global parameters, and system defaults
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-red-800 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 self-start sm:self-auto">
          Role: Systems Admin
        </span>
      </div>

      {/* Module 4: Status Lifecycle Configurator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-red-700" />
              <span>Status Lifecycle Configurator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically create, reorder, color-code, or retire workflow statuses across Request Register and Sprint Tracker
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {statuses.length} Active Statuses
          </span>
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSaveStatus} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
          <div className="font-bold text-slate-800">
            {editingStatusId ? 'Edit Status Definition' : '+ Create New Workflow Status'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Name</label>
              <input
                id="input-status-name"
                type="text"
                required
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="e.g., In Security Review, Blocked..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-600/30"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Applicable To</label>
              <select
                id="select-status-category"
                value={statusCategory}
                onChange={(e) => setStatusCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-600/30"
              >
                <option value="both">Both (Requests & Sprint Tickets)</option>
                <option value="request">Request Register Only</option>
                <option value="ticket">Sprint Tracker Only</option>
              </select>
            </div>

            {/* Color Preset */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Badge Color Styling</label>
              <select
                id="select-status-color"
                value={selectedColorIndex}
                onChange={(e) => setSelectedColorIndex(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-600/30"
              >
                {COLOR_PRESETS.map((preset, idx) => (
                  <option key={preset.name} value={idx}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Preview */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Badge Preview:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${COLOR_PRESETS[selectedColorIndex].bgColor} ${COLOR_PRESETS[selectedColorIndex].textColor} ${COLOR_PRESETS[selectedColorIndex].borderColor}`}
              >
                {statusName || 'Status Preview'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {editingStatusId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStatusId(null);
                    setStatusName('');
                  }}
                  className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                id="btn-save-status"
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingStatusId ? 'Update Status' : 'Add Status'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Statuses List Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3 w-12 text-center">Order</th>
                <th className="py-2.5 px-3">Status Name</th>
                <th className="py-2.5 px-3">Badge Tag Render</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Reorder</th>
                <th className="py-2.5 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statuses.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {st.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${st.bgColor} ${st.textColor} ${st.borderColor}`}
                    >
                      {st.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 capitalize">
                    {st.category === 'both' ? 'Requests & Tickets' : st.category === 'request' ? 'Requests Only' : 'Tickets Only'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStatus(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStatus(idx, 'down')}
                        disabled={idx === statuses.length - 1}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(st)}
                        className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                        title="Edit Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStatus(st.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete Status"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sprints Cadence Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-700" />
              <span>Sprint Cadence Parameters</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage active sprint iterations available in intake forms and batch assignments
            </p>
          </div>
        </div>

        {/* Add Sprint */}
        <form onSubmit={handleAddSprint} className="flex items-center gap-2">
          <input
            id="input-new-sprint-name"
            type="text"
            required
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
            placeholder="e.g., Sprint 24.10"
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg max-w-xs focus:ring-2 focus:ring-red-600/30"
          />
          <button
            id="btn-add-sprint"
            type="submit"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sprint</span>
          </button>
        </form>

        {/* Sprint Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {sprints.map((sp) => (
            <div
              key={sp}
              className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              <span>{sp}</span>
              {sprints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSprint(sp)}
                  className="text-slate-400 hover:text-red-700 cursor-pointer"
                  title="Remove Sprint"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
