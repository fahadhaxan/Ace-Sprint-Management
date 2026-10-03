import { ScoreMatrix, PriorityTier } from '../types';

export function calculateScore(matrix: ScoreMatrix): number {
  const reg = Math.min(30, Math.max(0, Number(matrix.regulatoryRisk) || 0));
  const op = Math.min(25, Math.max(0, Number(matrix.operationalPain) || 0));
  const strat = Math.min(20, Math.max(0, Number(matrix.strategicAlignment) || 0));
  const risk = Math.min(15, Math.max(0, Number(matrix.riskOfInaction) || 0));
  const clarity = Math.min(10, Math.max(0, Number(matrix.requestClarity) || 0));
  return reg + op + strat + risk + clarity;
}

export function getPriorityTier(score: number): PriorityTier {
  if (score <= 0) return 'Unscored';
  if (score <= 40) return 'Low Priority';
  if (score <= 70) return 'Medium Priority';
  return 'High Priority';
}

export function getTierBadgeClasses(tier: PriorityTier | string): string {
  switch (tier) {
    case 'High Priority':
    case 'Highest':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Medium Priority':
    case 'High':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Low Priority':
    case 'Medium':
    case 'Low':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Unscored':
    case 'Lowest':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'Approved':
    case 'Done':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Under Review':
    case 'In Progress':
    case 'In Review':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'New':
    case 'Backlog':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Rejected':
    case 'Blocked':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
