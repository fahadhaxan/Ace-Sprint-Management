import React, { useState, useMemo } from 'react';
import { 
  ReportType, 
  ComplianceRequest, 
  SprintTicket 
} from '../types';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  KanbanSquare, 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import { exportReportToExcel } from '../utils/excel';

interface ReportsTabProps {
  requests: ComplianceRequest[];
  tickets: SprintTicket[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ requests, tickets }) => {
  const [reportType, setReportType] = useState<ReportType>('Monthly Activity');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedSprint, setSelectedSprint] = useState<string>('ALL');
  const [hasGenerated, setHasGenerated] = useState(true);

  // Extract unique intake months and sprints
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => t.intakeMonth && set.add(t.intakeMonth));
    return Array.from(set).sort();
  }, [tickets]);

  const uniqueSprints = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => t.sprint && set.add(t.sprint));
    requests.forEach((r) => r.targetSprint && set.add(r.targetSprint));
    return Array.from(set).sort();
  }, [tickets, requests]);

  // Compute report data
  const reportData = useMemo(() => {
    if (reportType === 'Monthly Activity') {
      const filteredTickets = selectedMonth === 'ALL'
        ? tickets
        : tickets.filter((t) => t.intakeMonth === selectedMonth);

      const total = filteredTickets.length;
      const done = filteredTickets.filter((t) => t.status === 'Done').length;
      const inProgress = filteredTickets.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
      const backlog = filteredTickets.filter((t) => t.status === 'Backlog').length;
      const deferred = filteredTickets.filter((t) => t.deferred === 'Yes').length;
      const highRisk = filteredTickets.filter((t) => t.priority === 'Highest' || t.priority === 'High').length;

      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        title: `Monthly Activity Report: ${selectedMonth === 'ALL' ? 'All Months' : selectedMonth}`,
        subtitle: `Operational activity snapshot across systems & compliance intake`,
        total,
        done,
        inProgress,
        backlog,
        deferred,
        highRisk,
        completionRate,
        records: filteredTickets.map((t) => ({
          'Identifier': t.id,
          'Title': t.title,
          'Type': t.type,
          'Assignee': t.assignee,
          'Priority': t.priority,
          'Status': t.status,
          'Intake Period': t.intakeMonth,
          'Sprint': t.sprint,
          'Deferred': t.deferred,
          'Target Date': t.targetDate,
        })),
        rawTickets: filteredTickets,
      };
    } else if (reportType === 'Sprint Summary') {
      const filteredTickets = selectedSprint === 'ALL'
        ? tickets
        : tickets.filter((t) => t.sprint === selectedSprint);

      const matchingRequests = selectedSprint === 'ALL'
        ? requests
        : requests.filter((r) => r.targetSprint === selectedSprint);

      const total = filteredTickets.length;
      const done = filteredTickets.filter((t) => t.status === 'Done').length;
      const inProgress = filteredTickets.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
      const backlog = filteredTickets.filter((t) => t.status === 'Backlog').length;
      const deferred = filteredTickets.filter((t) => t.deferred === 'Yes').length;
      const highRisk = filteredTickets.filter((t) => t.priority === 'Highest' || t.priority === 'High').length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        title: `Sprint Summary: ${selectedSprint === 'ALL' ? 'All Active Sprints' : selectedSprint}`,
        subtitle: `Delivery tracking and regulatory release readiness`,
        total,
        done,
        inProgress,
        backlog,
        deferred,
        highRisk,
        completionRate,
        records: filteredTickets.map((t) => ({
          'Identifier': t.id,
          'Title': t.title,
          'Type': t.type,
          'Assignee': t.assignee,
          'Priority': t.priority,
          'Status': t.status,
          'Sprint': t.sprint,
          'Deferred': t.deferred,
          'Target Date': t.targetDate,
        })),
        rawTickets: filteredTickets,
      };
    } else {
      // Deferred & Spillover
      const deferredTickets = tickets.filter((t) => t.deferred === 'Yes');
      const total = deferredTickets.length;
      const inProgress = deferredTickets.filter((t) => t.status === 'In Progress').length;
      const backlog = deferredTickets.filter((t) => t.status === 'Backlog').length;
      const blocked = deferredTickets.filter((t) => t.status === 'Blocked').length;
      const highRisk = deferredTickets.filter((t) => t.priority === 'Highest' || t.priority === 'High').length;

      return {
        title: `Deferred & Spillover Audit Report (All Sprints)`,
        subtitle: `Analysis of delayed regulatory commitments and operational bottlenecks`,
        total,
        done: 0,
        inProgress,
        backlog,
        deferred: total,
        highRisk,
        completionRate: 0,
        records: deferredTickets.map((t) => ({
          'Identifier': t.id,
          'Title': t.title,
          'Type': t.type,
          'Assignee': t.assignee,
          'Priority': t.priority,
          'Status': t.status,
          'Original Sprint': t.sprint,
          'Notes / Blocker': t.notes || 'Unspecified',
        })),
        rawTickets: deferredTickets,
      };
    }
  }, [reportType, selectedMonth, selectedSprint, tickets, requests]);

  const handleExportReport = () => {
    const summaryMetrics = [
      { metric: 'Report Title', value: reportData.title },
      { metric: 'Generated Date', value: new Date().toISOString().slice(0, 10) },
      { metric: 'Total Records Evaluated', value: reportData.total },
      { metric: 'Done / Completed', value: reportData.done },
      { metric: 'In Progress / Review', value: reportData.inProgress },
      { metric: 'Backlog / Open', value: reportData.backlog },
      { metric: 'Deferred / Spillover', value: reportData.deferred },
      { metric: 'High / Highest Priority', value: reportData.highRisk },
      { metric: 'Delivery Completion Rate', value: `${reportData.completionRate}%` },
    ];

    exportReportToExcel(reportData.title, summaryMetrics, reportData.records);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Report Builder Configuration Bar */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <span>Compliance & Systems Report Builder</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compile monthly performance audits, sprint completion velocities, and spillover tracking.
            </p>
          </div>

          <button
            id="btn-export-report-excel"
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-red-700 hover:bg-red-800 shadow-2xs transition-colors cursor-pointer self-start lg:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (.xlsx)</span>
          </button>
        </div>

        {/* Parameter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 items-end">
          
          {/* Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setHasGenerated(true);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
            >
              <option value="Monthly Activity">1. Monthly Activity</option>
              <option value="Sprint Summary">2. Sprint Summary</option>
              <option value="Deferred & Spillover">3. Deferred & Spillover</option>
            </select>
          </div>

          {/* Conditional Parameter Selector */}
          {reportType === 'Monthly Activity' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Intake Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="ALL">All Intake Months</option>
                {uniqueMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'Sprint Summary' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Sprint
              </label>
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="ALL">All Sprints</option>
                {uniqueSprints.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'Deferred & Spillover' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Scope
              </label>
              <div className="px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
                All Sprints Consolidated
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div>
            <button
              type="button"
              onClick={() => setHasGenerated(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Report</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Compiled Report View */}
      {hasGenerated && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {reportData.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reportData.subtitle}
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Compiled: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Sample</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{reportData.total}</div>
              </div>

              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase">Done</div>
                <div className="text-2xl font-bold text-emerald-800 mt-1">{reportData.done}</div>
              </div>

              <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-100">
                <div className="text-[11px] font-semibold text-sky-800 uppercase">In Progress</div>
                <div className="text-2xl font-bold text-sky-800 mt-1">{reportData.inProgress}</div>
              </div>

              <div className="bg-slate-100/70 p-3 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase">Backlog</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{reportData.backlog}</div>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                <div className="text-[11px] font-semibold text-amber-800 uppercase">Deferred</div>
                <div className="text-2xl font-bold text-amber-900 mt-1">{reportData.deferred}</div>
              </div>

              <div className="bg-red-50/60 p-3 rounded-lg border border-red-100">
                <div className="text-[11px] font-semibold text-red-800 uppercase">High Priority</div>
                <div className="text-2xl font-bold text-red-900 mt-1">{reportData.highRisk}</div>
              </div>
            </div>

            {/* Visual Progress / Velocity Bar */}
            {reportData.total > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Execution & Delivery Progress</span>
                  <span className="font-mono text-emerald-700 font-bold">{reportData.completionRate}% Done</span>
                </div>
                
                {/* Multi-segment stacked progress bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  <div 
                    style={{ width: `${(reportData.done / reportData.total) * 100}%` }}
                    className="bg-emerald-600 transition-all duration-500"
                    title={`Done: ${reportData.done}`}
                  />
                  <div 
                    style={{ width: `${(reportData.inProgress / reportData.total) * 100}%` }}
                    className="bg-sky-500 transition-all duration-500"
                    title={`In Progress: ${reportData.inProgress}`}
                  />
                  <div 
                    style={{ width: `${(reportData.deferred / reportData.total) * 100}%` }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Deferred: ${reportData.deferred}`}
                  />
                  <div 
                    style={{ width: `${(reportData.backlog / reportData.total) * 100}%` }}
                    className="bg-slate-300 transition-all duration-500"
                    title={`Backlog: ${reportData.backlog}`}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span>Done ({reportData.done})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                    <span>In Progress ({reportData.inProgress})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span>Deferred ({reportData.deferred})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                    <span>Backlog ({reportData.backlog})</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Data Table */}
          <div className="glass-card rounded-2xl overflow-hidden mt-4">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Detailed Compilation Records ({reportData.records.length})
              </span>
              <span className="text-xs text-slate-500">
                Sorted by sprint order & priority
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    {reportData.records.length > 0 &&
                      Object.keys(reportData.records[0]).map((header) => (
                        <th key={header} className="py-2.5 px-3.5">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No records match the selected report parameters.
                      </td>
                    </tr>
                  ) : (
                    reportData.records.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3.5 text-slate-800">
                            {typeof val === 'string' && (val === 'Done' || val === 'Approved') ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {val}
                              </span>
                            ) : typeof val === 'string' && (val === 'Yes' || val === 'Highest' || val === 'High') ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {val}
                              </span>
                            ) : (
                              val
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
