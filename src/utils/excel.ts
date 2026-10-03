import * as XLSX from 'xlsx';
import { ComplianceRequest, SprintTicket, DeletedItem, CompletedRecord } from '../types';

// 1. Export Master Workbook with multiple sheets
export function exportMasterWorkbook(
  requests: ComplianceRequest[],
  tickets: SprintTicket[],
  completed: CompletedRecord[],
  deleted: DeletedItem[]
) {
  const wb = XLSX.utils.book_new();

  // Requests sheet
  const requestRows = requests.map((r) => ({
    'Request ID': r.id,
    'Date': r.date,
    'Submitted By': r.submittedBy,
    'Title': r.title,
    'Type': r.type,
    'Status': r.status,
    'Target Sprint': r.targetSprint,
    'BRD Required': r.brdRequired,
    'Jira Link': r.jiraLink || '',
    'Priority': r.priorityTier || '',
    'Description': r.description,
    'Source / Trigger': r.sourceTrigger,
    'Notes': r.notes,
  }));
  const wsRequests = XLSX.utils.json_to_sheet(requestRows);
  XLSX.utils.book_append_sheet(wb, wsRequests, 'Request Register');

  // Tickets sheet
  const ticketRows = tickets.map((t) => ({
    'JIRA ID': t.id,
    'Title': t.title,
    'Type': t.type,
    'Assignee': t.assignee,
    'Priority': t.priority,
    'Status': t.status,
    'Intake Month': t.intakeMonth,
    'Sprint': t.sprint,
    'Target Date': t.targetDate,
    'Last Updated': t.lastUpdated,
    'Deferred': t.deferred,
    'Jira Link': t.jiraLink || '',
    'Notes': t.notes,
  }));
  const wsTickets = XLSX.utils.json_to_sheet(ticketRows);
  XLSX.utils.book_append_sheet(wb, wsTickets, 'Sprint Tracker');

  // Completed sheet
  const completedRows = completed.map((c) => ({
    'Original ID': c.originalId,
    'Source Type': c.sourceType,
    'Title': c.title,
    'Type': c.type,
    'Submitted / Assigned': c.submittedOrAssigned,
    'Sprint': c.sprint,
    'Resolution Date': c.resolutionDate,
    'Completed By': c.completedBy,
    'Jira Link': c.jiraLink || '',
    'Final Notes': c.finalNotes || '',
  }));
  const wsCompleted = XLSX.utils.json_to_sheet(completedRows);
  XLSX.utils.book_append_sheet(wb, wsCompleted, 'Completed Records');

  // Deleted Items sheet
  const deletedRows = deleted.map((d) => ({
    'ID': d.originalId,
    'Source Type': d.sourceType,
    'Title': d.title,
    'Type': d.type,
    'Status': d.status,
    'Priority / Tier': d.priorityOrTier,
    'Sprint / Month': d.sprintOrMonth,
    'Deleted At': d.deletedAt,
  }));
  const wsDeleted = XLSX.utils.json_to_sheet(deletedRows);
  XLSX.utils.book_append_sheet(wb, wsDeleted, 'Trash & Deleted');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ACE_Compliance_Portal_Master_${nowStr}.xlsx`);
}

// 2. Export Filtered Requests
export function exportRequestsToExcel(requests: ComplianceRequest[], filenamePrefix = 'ACE_Requests') {
  const rows = requests.map((r) => ({
    'Request ID': r.id,
    'Date': r.date,
    'Submitted By': r.submittedBy,
    'Title': r.title,
    'Type': r.type,
    'Status': r.status,
    'Target Sprint': r.targetSprint,
    'BRD Required': r.brdRequired,
    'Jira Link': r.jiraLink || '',
    'Priority': r.priorityTier || '',
    'Description': r.description,
    'Source / Trigger': r.sourceTrigger,
    'Notes': r.notes,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Requests');
  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${nowStr}.xlsx`);
}

// 3. Export Sprint Tickets
export function exportSprintTicketsToExcel(tickets: SprintTicket[], filenamePrefix = 'ACE_Sprint_Tickets') {
  const rows = tickets.map((t) => ({
    'JIRA ID': t.id,
    'Title': t.title,
    'Type': t.type,
    'Assignee': t.assignee,
    'Priority': t.priority,
    'Status': t.status,
    'Intake Month': t.intakeMonth,
    'Sprint': t.sprint,
    'Target Date': t.targetDate,
    'Last Updated': t.lastUpdated,
    'Deferred': t.deferred,
    'Jira Link': t.jiraLink || '',
    'Notes': t.notes,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sprint Tracker');
  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${nowStr}.xlsx`);
}

// 4. Export Completed Records
export function exportCompletedToExcel(completed: CompletedRecord[], filenamePrefix = 'ACE_Completed_Records') {
  const rows = completed.map((c) => ({
    'Original ID': c.originalId,
    'Source Type': c.sourceType,
    'Title': c.title,
    'Type': c.type,
    'Submitted / Assigned': c.submittedOrAssigned,
    'Sprint': c.sprint,
    'Resolution Date': c.resolutionDate,
    'Completed By': c.completedBy,
    'Jira Link': c.jiraLink || '',
    'Final Notes': c.finalNotes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Completed');
  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${nowStr}.xlsx`);
}

// 5. Download Sample Workbook
export function downloadSampleWorkbook(type: 'tickets' | 'requests') {
  const wb = XLSX.utils.book_new();
  if (type === 'tickets') {
    const sampleTickets = [
      {
        'JIRA ID': 'ACE-2101',
        'Title': 'Sample OFAC feed schema validation check',
        'Type': 'Compliance Task',
        'Assignee': 'Alex Mercer',
        'Priority': 'Highest',
        'Status': 'In Progress',
        'Intake Month': 'July 2024',
        'Sprint': 'Sprint 24.08',
        'Target Date': '2024-08-15',
        'Last Updated': '2024-08-01',
        'Deferred': 'No',
        'Jira Link': 'https://jira.internal.ace/browse/ACE-2101',
        'Notes': 'Sample ticket for import demonstration',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleTickets);
    XLSX.utils.book_append_sheet(wb, ws, 'Sprint Tickets');
    XLSX.writeFile(wb, 'ACE_Sample_Sprint_Tickets.xlsx');
  } else {
    const sampleRequests = [
      {
        'Request ID': 'REQ-101',
        'Date': '2024-08-01',
        'Submitted By': 'Compliance Operations',
        'Title': 'Automated Sanctions Threshold Reporting',
        'Type': 'Compliance',
        'Status': 'New',
        'Target Sprint': 'Sprint 24.08',
        'BRD Required': 'Yes',
        'Jira Link': '',
        'Description': 'Automate extraction of threshold transactions for auditor packets.',
        'Source / Trigger': 'Annual Compliance Review',
        'Notes': 'Draft requirement',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRequests);
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    XLSX.writeFile(wb, 'ACE_Sample_Requests.xlsx');
  }
}

// 6. Parsed workbook result interface & parser
export interface ParsedWorkbookResult {
  sheetNames: string[];
  tickets: SprintTicket[];
  requests: ComplianceRequest[];
  totalRowsParsed: number;
}

export async function parseExcelFile(file: File): Promise<ParsedWorkbookResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const tickets: SprintTicket[] = [];
        const requests: ComplianceRequest[] = [];
        let totalRowsParsed = 0;

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (rawRows.length === 0) return;
          totalRowsParsed += rawRows.length;

          const isTicketSheet =
            sheetName.toLowerCase().includes('ticket') ||
            sheetName.toLowerCase().includes('sprint') ||
            sheetName.toLowerCase().includes('jira') ||
            rawRows.some((r) => 'JIRA ID' in r || 'Assignee' in r || 'Priority' in r);

          if (isTicketSheet) {
            rawRows.forEach((row, idx) => {
              const id = String(row['JIRA ID'] || row['ID'] || row['Key'] || `ACE-${2000 + idx}`).trim();
              const title = String(row['Title'] || row['Summary'] || row['Name'] || 'Untitled Ticket').trim();
              const type = (row['Type'] || row['Issue Type'] || 'Compliance Task') as any;
              const assignee = String(row['Assignee'] || row['Owner'] || 'Unassigned').trim();
              const priority = (row['Priority'] || 'High') as any;
              const status = String(row['Status'] || 'Backlog').trim();
              const intakeMonth = String(row['Intake Month'] || row['Month'] || 'July 2024').trim();
              const sprint = String(row['Sprint'] || 'Sprint 24.08').trim();
              const targetDate = String(row['Target Date'] || row['Due Date'] || new Date().toISOString().slice(0, 10)).trim();
              const lastUpdated = String(row['Last Updated'] || new Date().toISOString().slice(0, 10)).trim();
              const deferred = String(row['Deferred'] || 'No').trim().toLowerCase().startsWith('y') ? 'Yes' : 'No';
              const jiraLink = String(row['Jira Link'] || row['Jira'] || '').trim();
              const notes = String(row['Notes'] || row['Description'] || '').trim();

              tickets.push({
                id,
                title,
                type,
                assignee,
                priority,
                status,
                intakeMonth,
                sprint,
                targetDate,
                lastUpdated,
                deferred: deferred as 'Yes' | 'No',
                jiraLink,
                notes,
                createdAt: new Date().toISOString(),
              });
            });
          } else {
            rawRows.forEach((row, idx) => {
              const id = String(row['Request ID'] || row['ID'] || `REQ-${String(idx + 10).padStart(3, '0')}`).trim();
              const title = String(row['Title'] || row['Name'] || 'Untitled Request').trim();
              const submittedBy = String(row['Submitted By'] || row['Submitter'] || 'Compliance Ops').trim();
              const type = String(row['Type'] || 'Compliance').trim();
              const status = String(row['Status'] || 'New').trim();
              const targetSprint = String(row['Target Sprint'] || row['Sprint'] || 'Sprint 24.08').trim();
              const brdRequired = String(row['BRD Required'] || 'No').trim().toLowerCase().startsWith('y') ? 'Yes' : 'No';
              const jiraLink = String(row['Jira Link'] || row['Jira'] || '').trim();
              const priorityTier = (row['Priority Tier'] || row['Priority'] || 'Medium Priority') as any;
              const description = String(row['Description'] || '').trim();
              const sourceTrigger = String(row['Source / Trigger'] || row['Source Trigger'] || row['Trigger'] || '').trim();
              const notes = String(row['Notes'] || '').trim();
              const date = String(row['Date'] || new Date().toISOString().slice(0, 10)).trim();

              requests.push({
                id,
                date,
                title,
                submittedBy,
                type,
                status,
                targetSprint,
                brdRequired: brdRequired as 'Yes' | 'No',
                priorityTier,
                jiraLink,
                description,
                sourceTrigger,
                notes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            });
          }
        });

        resolve({
          sheetNames: workbook.SheetNames,
          tickets,
          requests,
          totalRowsParsed,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// 7. Export Custom Report Workbook
export function exportReportToExcel(
  reportTitle: string,
  summaryMetrics: { metric: string; value: string | number }[],
  records: Record<string, unknown>[]
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const wsSummary = XLSX.utils.json_to_sheet(summaryMetrics);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // Detailed Records Sheet
  if (records.length > 0) {
    const wsRecords = XLSX.utils.json_to_sheet(records);
    XLSX.utils.book_append_sheet(wb, wsRecords, 'Detailed Breakdown');
  }

  const cleanTitle = reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${cleanTitle}_${nowStr}.xlsx`);
}

