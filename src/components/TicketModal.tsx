import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, KanbanSquare } from 'lucide-react';
import { SprintTicket, TicketPriority, TicketStatus, TicketType } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: SprintTicket) => void;
  editingTicket?: SprintTicket | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTicket,
}) => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>('Compliance Task');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [status, setStatus] = useState<TicketStatus>('In Progress');
  const [intakeMonth, setIntakeMonth] = useState('July 2024');
  const [sprint, setSprint] = useState('Sprint 24.07');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [deferred, setDeferred] = useState<'Yes' | 'No'>('No');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (editingTicket) {
      setId(editingTicket.id);
      setTitle(editingTicket.title);
      setType(editingTicket.type);
      setAssignee(editingTicket.assignee);
      setPriority(editingTicket.priority);
      setStatus(editingTicket.status);
      setIntakeMonth(editingTicket.intakeMonth);
      setSprint(editingTicket.sprint);
      setTargetDate(editingTicket.targetDate);
      setDeferred(editingTicket.deferred);
      setNotes(editingTicket.notes);
    } else {
      setId(`ACE-${Math.floor(1100 + Math.random() * 8900)}`);
      setTitle('');
      setType('Compliance Task');
      setAssignee('');
      setPriority('High');
      setStatus('Backlog');
      setIntakeMonth('July 2024');
      setSprint('Sprint 24.07');
      setTargetDate(new Date().toISOString().slice(0, 10));
      setDeferred('No');
      setNotes('');
    }
    setErrors({});
  }, [editingTicket, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};
    if (!id.trim()) newErrors.id = 'JIRA ID is required';
    if (!title.trim()) newErrors.title = 'Ticket Title is required';
    if (!assignee.trim()) newErrors.assignee = 'Assignee is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const ticket: SprintTicket = {
      id: id.trim().toUpperCase(),
      title: title.trim(),
      type,
      assignee: assignee.trim(),
      priority,
      status,
      intakeMonth: intakeMonth.trim(),
      sprint: sprint.trim(),
      targetDate,
      lastUpdated: new Date().toISOString().slice(0, 10),
      deferred,
      notes: notes.trim(),
      createdAt: editingTicket ? editingTicket.createdAt : new Date().toISOString(),
    };

    onSave(ticket);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingTicket ? `Edit Ticket: ${editingTicket.id}` : 'Create Sprint Backlog Ticket'}
              </h2>
              <p className="text-xs text-slate-500">
                Assign development deliverables, intake months, and track spillover.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* JIRA ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                JIRA ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  if (errors.id) setErrors((prev) => ({ ...prev, id: '' }));
                }}
                placeholder="e.g. ACE-1090"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.id ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.id && <p className="text-xs text-red-600 mt-1 font-medium">{errors.id}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TicketType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="Compliance Task">Compliance Task</option>
                <option value="Story">Story</option>
                <option value="Bug">Bug</option>
                <option value="Spike">Spike</option>
                <option value="Improvement">Improvement</option>
                <option value="Audit Finding">Audit Finding</option>
              </select>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Title / Summary <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Integrate Sanctions fuzzy matching threshold config"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.title ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1 font-medium">{errors.title}</p>}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assignee <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  if (errors.assignee) setErrors((prev) => ({ ...prev, assignee: '' }));
                }}
                placeholder="e.g. Alex Mercer"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.assignee ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.assignee && <p className="text-xs text-red-600 mt-1 font-medium">{errors.assignee}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Deferred */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deferred / Spillover?
              </label>
              <select
                value={deferred}
                onChange={(e) => setDeferred(e.target.value as 'Yes' | 'No')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="No">No</option>
                <option value="Yes">Yes (Deferred / Spillover)</option>
              </select>
            </div>

            {/* Intake Month */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Intake Month
              </label>
              <input
                type="text"
                value={intakeMonth}
                onChange={(e) => setIntakeMonth(e.target.value)}
                placeholder="e.g. July 2024"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sprint Assigned
              </label>
              <input
                type="text"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                placeholder="e.g. Sprint 24.07"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Target Date */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notes / Spillover Reason
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Execution details, blockers, or reason for deferral..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingTicket ? 'Update Ticket' : 'Save Ticket'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
