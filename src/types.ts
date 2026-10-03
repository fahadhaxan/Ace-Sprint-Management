export type RequestType = 
  | 'New Feature'
  | 'Defect'
  | 'Compliance'
  | 'Policy Update'
  | 'Audit Requirement'
  | 'Automation';

export type RequestStatus = 
  | 'New'
  | 'Under Review'
  | 'Approved'
  | 'In Dev'
  | 'Completed'
  | 'Rejected'
  | string;

export type PriorityTier = 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Unscored';

export interface ScoreMatrix {
  regulatoryRisk?: number;
  operationalPain?: number;
  strategicAlignment?: number;
  riskOfInaction?: number;
  requestClarity?: number;
}

export interface ComplianceRequest {
  id: string; // e.g. REQ-001
  date: string; // YYYY-MM-DD
  title: string;
  submittedBy: string;
  type: string;
  status: string;
  targetSprint: string;
  brdRequired: 'Yes' | 'No';
  description: string;
  sourceTrigger: string;
  notes: string;
  jiraLink?: string;
  priorityTier?: PriorityTier;
  totalScore?: number;
  scoreMatrix?: ScoreMatrix;
  portalLabel?: string; // 'Backoffice' | 'ARMS' | 'SAR ticketing' | 'Chargeback' | 'Fraud'
  typeLabel?: string;   // 'Sprint request' | 'Bug' | 'Support'
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completedBy?: string;
  finalNotes?: string;
}

export type TicketType = 'Story' | 'Bug' | 'Compliance Task' | 'Spike' | 'Improvement' | 'Audit Finding';
export type TicketPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
export type TicketStatus = 'Done' | 'In Progress' | 'Backlog' | 'In Review' | 'Blocked' | string;

export interface SprintTicket {
  id: string; // e.g. ACE-1042
  title: string;
  type: TicketType;
  assignee: string;
  priority: TicketPriority;
  status: string;
  intakeMonth: string; // e.g. May 2024, June 2024, July 2024
  sprint: string;      // e.g. Sprint 24.05, Sprint 24.06, Backlog
  targetDate: string;  // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
  deferred: 'Yes' | 'No';
  jiraLink?: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  finalNotes?: string;
  originalRequestId?: string;
}

export type BugStatus = 
  | 'New' 
  | 'Under Investigation' 
  | 'In Dev' 
  | 'In Review' 
  | 'Resolved' 
  | 'Closed' 
  | 'Rejected' 
  | string;

export type BugSeverity = 'Critical' | 'Major' | 'Moderate' | 'Minor';

export interface BugRequest {
  id: string; // e.g. BUG-101
  title: string;
  about: string; // user specifically requested "about"
  status: BugStatus; // user specifically requested "status"
  jiraLink?: string; // user specifically requested "jira ticket reference (which is hyper link)"
  severity: BugSeverity;
  reportedBy: string;
  assignedTo?: string;
  date: string; // YYYY-MM-DD
  environment?: string; // e.g. Production, Staging, QA
  reproductionSteps?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompletedRecord {
  id: string; // e.g. CMP-REQ-001 or CMP-ACE-1042
  originalId: string;
  sourceType: 'Request' | 'Sprint Ticket' | 'Bug Request';
  title: string;
  type: string;
  submittedOrAssigned: string;
  sprint: string;
  resolutionDate: string;
  completedBy: string;
  jiraLink: string;
  finalNotes: string;
  originalData: ComplianceRequest | SprintTicket | BugRequest;
}

export interface DeletedItem {
  id: string;
  originalId: string;
  sourceType: 'Request' | 'Sprint Ticket' | 'Completed Record' | 'Bug Request';
  title: string;
  type: string;
  status: string;
  priorityOrTier: string;
  sprintOrMonth: string;
  deletedAt: string;
  originalData: ComplianceRequest | SprintTicket | CompletedRecord | BugRequest;
}

export interface CustomStatus {
  id: string;
  name: string;
  category: 'request' | 'ticket' | 'both';
  textColor: string;
  bgColor: string;
  borderColor: string;
  order: number;
  isSystem?: boolean;
}

export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: 'status_update' | 'jira_assigned' | 'completed' | 'created' | 'deleted' | 'restored';
  title: string;
  details: string;
  actor: string;
  referenceId: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'requests'
  | 'watchlist'
  | 'bugs'
  | 'sprint'
  | 'completed'
  | 'trash'
  | 'reports'
  | 'admin'
  | 'users';

export interface CustomTask {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  createdAt: string;
}

export type ReportType = 'Monthly Activity' | 'Sprint Summary' | 'Deferred & Spillover';
export interface GcrRule {
  id: string;
  code: string;
  status: string;
  name: string;
  category: string;
  implementationType: string;
  description: string;
  logicExplanation: string;
  otherParameters: string;
  triggerPoint?: string;
  changes?: string;
  lookbackPeriod: string;
  vendorName: string;
  notes: string;
}

export interface AiParsedIntake {
  summary: string;
  description: string;
  useCases: string[];
  acceptanceCriteria: string[];
  assumptions: string[];
  impactAnalysis: string;
  // Optional convenience fields for backwards compatibility
  title?: string;
  type?: string;
  sourceTrigger?: string;
  brdRequired?: 'Yes' | 'No';
  brdRationale?: string;
  recommendedScores?: ScoreMatrix;
  scoreJustifications?: Record<string, string>;
  targetSprintSuggestion?: string;
  portalLabel?: string;
  typeLabel?: string;
}

export interface AiDuplicateMatch {
  id: string;
  title: string;
  sourceType: 'Request' | 'Ticket' | 'Bug';
  status: string;
  sprint?: string;
  similarityScore: number;
  conflictType: 'EXACT_DUPLICATE' | 'SHARED_ROOT_CAUSE' | 'REGULATORY_OVERLAP' | 'SPRINT_CONFLICT';
  reason: string;
  recommendation: string;
}

export interface AiDuplicateResult {
  hasDuplicatesOrConflicts: boolean;
  summary: string;
  matches: AiDuplicateMatch[];
}
