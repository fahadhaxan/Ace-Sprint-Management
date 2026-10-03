import React, { useMemo } from 'react';
import { 
  ComplianceRequest, 
  SprintTicket, 
  CompletedRecord, 
  ActivityFeedItem, 
  CustomStatus,
  ActiveTab
} from '../types';
import { 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Activity, 
  ArrowUpRight, 
  ExternalLink, 
  PlusCircle, 
  FileSpreadsheet,
  KanbanSquare,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid,
  Legend
} from 'recharts';
import { getStatusBadgeStyle } from '../utils/statusUtils';

interface DashboardTabProps {
  requests?: ComplianceRequest[];
  tickets?: SprintTicket[];
  completed?: CompletedRecord[];
  completedRecords?: CompletedRecord[];
  activities?: ActivityFeedItem[];
  activityFeed?: ActivityFeedItem[];
  customStatuses?: CustomStatus[];
  onNavigate?: (tab: ActiveTab) => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenNewRequestModal?: () => void;
  onOpenImportModal?: () => void;
  onOpenImportExcel?: () => void;
  onSelectRequestForDetail?: (req: ComplianceRequest) => void;
}

const TYPE_COLORS = ['#991B1B', '#C2410C', '#D97706', '#059669', '#2563EB', '#7C3AED'];
const STATUS_COLORS: { [k: string]: string } = {
  'New': '#9333EA',
  'Under Review': '#0284C7',
  'Approved': '#059669',
  'In Dev': '#2563EB',
  'In Progress': '#2563EB',
  'Completed': '#0D9488',
  'Done': '#10B981',
  'Rejected': '#DC2626',
  'Backlog': '#64748B',
  'Blocked': '#E11D48',
};

export const DashboardTab: React.FC<DashboardTabProps> = (props) => {
  const requests = props.requests ?? [];
  const tickets = props.tickets ?? [];
  const completed = props.completed ?? props.completedRecords ?? [];
  const activities = props.activities ?? props.activityFeed ?? [];
  const customStatuses = props.customStatuses ?? [];
  const onNavigate = props.onNavigate ?? props.onNavigateToTab ?? (() => {});
  const onOpenNewRequestModal = props.onOpenNewRequestModal ?? (() => onNavigate('requests'));
  const onOpenImportModal = props.onOpenImportModal ?? props.onOpenImportExcel ?? (() => {});
  const onSelectRequestForDetail = props.onSelectRequestForDetail ?? (() => {});

  // KPI Calculations
  const totalRequestsCount = requests.length;
  const activeCount = requests.filter(r => r.status === 'Approved' || r.status === 'In Dev').length;
  const pendingApprovalCount = requests.filter(r => r.status === 'New' || r.status === 'Under Review').length;
  const completedCount = completed.length;
  const highPriorityCount = requests.filter(r => r.priorityTier === 'High Priority').length;

  // 1. Chart Data: Breakdown of requests by Type
  const typeChartData = useMemo(() => {
    const counts: { [k: string]: number } = {};
    requests.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [requests]);

  // 2. Chart Data: Breakdown of requests by Status
  const statusChartData = useMemo(() => {
    const counts: { [k: string]: number } = {};
    requests.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [requests]);

  // 3. Monthly Submission Trends
  const monthlyTrendData = useMemo(() => {
    const monthsMap: { [k: string]: number } = {
      'May 2024': 0,
      'Jun 2024': 0,
      'Jul 2024': 0,
      'Aug 2024': 0,
    };
    requests.forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const m = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthsMap[m] !== undefined) {
        monthsMap[m] += 1;
      } else {
        monthsMap[m] = 1;
      }
    });
    return Object.entries(monthsMap).map(([month, submissions]) => ({
      month,
      submissions,
    }));
  }, [requests]);

  // 4. Sprint Completion Rates
  const sprintHealthData = useMemo(() => {
    const sprints: { [sp: string]: { sprint: string; done: number; inProgress: number; backlog: number } } = {};
    tickets.forEach(t => {
      const sp = t.sprint || 'Backlog';
      if (!sprints[sp]) {
        sprints[sp] = { sprint: sp, done: 0, inProgress: 0, backlog: 0 };
      }
      if (t.status === 'Done' || t.status === 'Completed') {
        sprints[sp].done += 1;
      } else if (t.status === 'In Progress' || t.status === 'In Review') {
        sprints[sp].inProgress += 1;
      } else {
        sprints[sp].backlog += 1;
      }
    });
    return Object.values(sprints).slice(0, 5);
  }, [tickets]);

  return (
    <div className="space-y-6">
      
      {/* Quick Action Top Bar */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Systems Department Operations & Compliance Hub
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/25 border border-white/10 text-xs text-red-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold tracking-wide">SYSTEMS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Requests */}
        <div 
          onClick={() => onNavigate('requests')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requests
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{totalRequestsCount}</span>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5">
              view all <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Intake register entries
          </div>
        </div>

        {/* Active / In-Progress */}
        <div 
          onClick={() => onNavigate('requests')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Active / In-Progress
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-blue-950">{activeCount}</span>
            <span className="text-[11px] font-medium text-blue-600">scheduled</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Approved & undergoing dev
          </div>
        </div>

        {/* Pending Approval */}
        <div 
          onClick={() => onNavigate('requests')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Pending Approval
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-purple-950">{pendingApprovalCount}</span>
            <span className="text-[11px] font-medium text-purple-600">triage</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            New & under review
          </div>
        </div>

        {/* Completed Requests */}
        <div 
          onClick={() => onNavigate('completed')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-950">{completedCount}</span>
            <span className="text-[11px] font-medium text-emerald-600">archived</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Production sign-offs
          </div>
        </div>

        {/* High Priority Count */}
        <div 
          onClick={() => onNavigate('requests')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              High Priority
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-red-950">{highPriorityCount}</span>
            <span className="text-[11px] font-medium text-red-600">critical</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Mandatory audit items
          </div>
        </div>

      </div>

      {/* Interactive Summary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Breakdown by Type */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-700" />
                <span>Requests by Category & Type</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across regulatory intake types</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {typeChartData.length} Types
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8B1E22" radius={[4, 4, 0, 0]}>
                  {typeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Breakdown by Status */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-red-700" />
                <span>Workflow Status Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Current stage across intake pipeline</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name] || TYPE_COLORS[index % TYPE_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Submission Trends */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-700" />
                <span>Monthly Intake Ingestion Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Volume of regulatory and technical requests received</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B1E22" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B1E22" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#8B1E22" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSubmissions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Sprint Ticket Health */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-red-700" />
                <span>Sprint Velocity & Completion Rates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Done vs. In Progress vs. Backlog per sprint</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sprint')}
              className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Sprints</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sprintHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="sprint" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="done" name="Done" fill="#10B981" stackId="a" />
                <Bar dataKey="inProgress" name="In Progress" fill="#2563EB" stackId="a" />
                <Bar dataKey="backlog" name="Backlog" fill="#94A3B8" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Action Feeds: Recent Activity & High Priority Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-700" />
                <span>Recent Operations & Audit Activity Feed</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Status updates, Jira assignments, and completion events</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Live Audit Log
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.slice(0, 6).map((act) => {
              return (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    {act.type === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {act.type === 'jira_assigned' && <ExternalLink className="w-4 h-4 text-blue-600" />}
                    {act.type === 'status_update' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                    {act.type === 'created' && <PlusCircle className="w-4 h-4 text-red-600" />}
                    {act.type === 'deleted' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {act.type === 'restored' && <ShieldCheck className="w-4 h-4 text-teal-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 truncate">
                        {act.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      {act.details}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Actor: <strong className="text-slate-600">{act.actor}</strong></span>
                      <span>•</span>
                      <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        {act.referenceId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Priority Watchlist (1 Col) */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span>High Priority Watchlist</span>
              </h3>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {highPriorityCount} Active
              </span>
            </div>
            
            <div className="space-y-3">
              {requests
                .filter(r => r.priorityTier === 'High Priority')
                .slice(0, 4)
                .map(req => {
                  const statusStyle = getStatusBadgeStyle(req.status, customStatuses);
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => onSelectRequestForDetail(req)}
                      className="p-3 rounded-xl border border-white/30 bg-white/20 hover:border-red-300 hover:bg-white/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-red-700">{req.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-800 mt-1 line-clamp-2 group-hover:text-red-900">
                        {req.title}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{req.targetSprint}</span>
                        <span>BRD: {req.brdRequired}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="w-full py-2 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center cursor-pointer"
            >
              Open Full Request Register &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
