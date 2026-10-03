import { CustomStatus } from '../types';

export function getStatusBadgeStyle(statusName: string, customStatuses: CustomStatus[] = []) {
  const found = customStatuses.find(
    (s) => s.name.trim().toLowerCase() === (statusName || '').trim().toLowerCase()
  );

  if (found) {
    return {
      textColor: found.textColor,
      bgColor: found.bgColor,
      borderColor: found.borderColor,
    };
  }

  // Built-in intelligent defaults
  const lower = (statusName || '').toLowerCase().trim();
  if (lower === 'done' || lower === 'completed') {
    return { textColor: 'text-emerald-800', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300' };
  }
  if (lower === 'approved') {
    return { textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
  }
  if (lower === 'in progress' || lower === 'in dev') {
    return { textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  }
  if (lower === 'under review' || lower === 'in review') {
    return { textColor: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' };
  }
  if (lower === 'new') {
    return { textColor: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
  }
  if (lower === 'blocked') {
    return { textColor: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' };
  }
  if (lower === 'rejected') {
    return { textColor: 'text-red-800', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
  }
  if (lower === 'backlog') {
    return { textColor: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' };
  }

  return { textColor: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' };
}
