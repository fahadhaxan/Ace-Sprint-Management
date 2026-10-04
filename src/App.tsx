import React, { useState, useEffect, useCallback } from 'react';
import { 
  ActiveTab, 
  ComplianceRequest, 
  SprintTicket, 
  CompletedRecord, 
  DeletedItem, 
  CustomStatus, 
  SystemUser, 
  ActivityFeedItem,
  UserRole,
  UserStatus,
  BugRequest,
  AiParsedIntake,
  CustomTask
} from './types';
import { calculateScore, getPriorityTier } from './utils/scoreCalculator';
import { 
  loadRequests, 
  saveRequests, 
  loadTickets, 
  saveTickets, 
  loadCompleted, 
  saveCompleted, 
  loadDeletedItems, 
  saveDeletedItems, 
  loadStatuses, 
  saveStatuses, 
  loadUsers, 
  saveUsers, 
  loadActivities, 
  saveActivities, 
  loadSprints, 
  saveSprints, 
  resetAllToDefault,
  loadBugs,
  saveBugs,
  saveWatchedIds,
  loadCustomTasks,
  saveCustomTasks,
  deleteRecord,
  deleteRecords
} from './utils/storage';
import { ParsedWorkbookResult, parseExcelFile } from './utils/excel';
import { supabase } from './utils/supabase';
import { Auth } from './components/Auth';

// Component imports
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardTab } from './components/DashboardTab';
import { RequestRegisterTab } from './components/RequestRegisterTab';
import { BugRequestsTab } from './components/BugRequestsTab';
import { SprintTrackerTab } from './components/SprintTrackerTab';
import { CompletedTab } from './components/CompletedTab';
import { TrashTab } from './components/TrashTab';
import { ReportsTab } from './components/ReportsTab';
import { AdminSettingsTab } from './components/AdminSettingsTab';
import { UserManagementTab } from './components/UserManagementTab';
import { WatchlistTab } from './components/WatchlistTab';

// Modal imports
import { ViewDetailModal } from './components/ViewDetailModal';
import { EditRequestModal } from './components/EditRequestModal';
import { BugModal } from './components/BugModal';
import { CompleteItemModal } from './components/CompleteItemModal';
import { AssignJiraModal } from './components/AssignJiraModal';
import { TicketModal } from './components/TicketModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { GcrRulesModal } from './components/GcrRulesModal';
import { BackofficeManualModal } from './components/BackofficeManualModal';
import { AiIntakeModal } from './components/AiIntakeModal';
import { AiDuplicateDetectorModal } from './components/AiDuplicateDetectorModal';
import { CreateSprintWizardModal } from './components/CreateSprintWizardModal';
import { PullRequestsToSprintModal } from './components/PullRequestsToSprintModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Core Data States
  const [requests, setRequests] = useState<ComplianceRequest[]>([]);
  const [bugs, setBugs] = useState<BugRequest[]>([]);
  const [tickets, setTickets] = useState<SprintTicket[]>([]);
  const [completedRecords, setCompletedRecords] = useState<CompletedRecord[]>([]);
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [sprints, setSprints] = useState<string[]>([]);
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [detailItem, setDetailItem] = useState<ComplianceRequest | SprintTicket | CompletedRecord | BugRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editingRequest, setEditingRequest] = useState<ComplianceRequest | null>(null);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);

  const [editingBug, setEditingBug] = useState<BugRequest | null>(null);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  const [itemToComplete, setItemToComplete] = useState<ComplianceRequest | SprintTicket | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const [itemForJira, setItemForJira] = useState<ComplianceRequest | SprintTicket | BugRequest | null>(null);
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);

  const [editingTicket, setEditingTicket] = useState<SprintTicket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [isSprintWizardOpen, setIsSprintWizardOpen] = useState(false);
  const [isPullRequestsModalOpen, setIsPullRequestsModalOpen] = useState(false);
  const [pullModalTargetSprint, setPullModalTargetSprint] = useState<string | undefined>(undefined);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGcrModalOpen, setIsGcrModalOpen] = useState(false);
  const [gcrRules, setGcrRules] = useState<import('./types').GcrRule[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAiIntakeModalOpen, setIsAiIntakeModalOpen] = useState(false);
  const [isDuplicateAuditorOpen, setIsDuplicateAuditorOpen] = useState(false);

  // Flag to auto-open the request intake form when navigating from Dashboard
  const [isNewRequestFormOpen, setIsNewRequestFormOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Log Activity Helper
  const logActivity = useCallback((
    type: 'status_update' | 'jira_assigned' | 'completed' | 'created' | 'deleted' | 'restored',
    title: string,
    details: string,
    referenceId: string
  ) => {
    const newActivity: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      details,
      actor: 'ACE Systems Admin',
      referenceId,
    };
    setActivityFeed((prev) => {
      const updated = [newActivity, ...prev.slice(0, 49)];
      saveActivities(updated);
      return updated;
    });
  }, []);

  // Initial Data Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    });

    async function fetchData() {
      const [
        loadedRequests, loadedBugs, loadedTickets, loadedCompleted, loadedDeleted,
        loadedStatuses, loadedUsers, loadedActivities, loadedSprints, loadedWatched, loadedTasks
      ] = await Promise.all([
        loadRequests(), loadBugs(), loadTickets(), loadCompleted(), loadDeletedItems(),
        loadStatuses(), loadUsers(), loadActivities(), loadSprints(), loadWatchedIds(), loadCustomTasks()
      ]);

      setRequests(loadedRequests);
      setBugs(loadedBugs);
      setTickets(loadedTickets);
      setCompletedRecords(loadedCompleted);
      setDeletedItems(loadedDeleted);
      setCustomStatuses(loadedStatuses);
      setSystemUsers(loadedUsers);
      setActivityFeed(loadedActivities);
      setSprints(loadedSprints);
      setWatchedIds(loadedWatched);
      setCustomTasks(loadedTasks);
      setIsLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ==================== MY WATCHLIST OPERATIONAL HANDLERS ====================
  const handleToggleWatch = (id: string) => {
    setWatchedIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((x) => x !== id) : [...prev, id];
      saveWatchedIds(updated);
      addToast({
        type: exists ? 'warning' : 'success',
        title: exists ? 'Removed from Watchlist' : 'Added to Watchlist',
        description: exists ? `Item ${id} is no longer being monitored.` : `Item ${id} added to My Watchlist.`,
      });
      return updated;
    });
  };

  const handleAddCustomTask = (title: string) => {
    const newTask: CustomTask = {
      id: `TSK-${Date.now()}`,
      title,
      status: 'To Do',
      createdAt: new Date().toISOString(),
    };
    setCustomTasks((prev) => {
      const updated = [newTask, ...prev];
      saveCustomTasks(updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Task Created',
      description: `Task "${title}" added to your personal board.`,
    });
  };

  const handleToggleCustomTaskStatus = (id: string) => {
    setCustomTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === 'Done' ? 'To Do' : 'Done';
          return { ...t, status: newStatus as any };
        }
        return t;
      });
      saveCustomTasks(updated);
      return updated;
    });
  };

  const handleDeleteCustomTask = (id: string) => {
    setCustomTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTasks(updated);
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Task Deleted',
      description: 'Personal checklist item removed.',
    });
  };

  // ==================== REQUEST REGISTER HANDLERS ====================

  const handleAddRequest = (newReq: ComplianceRequest) => {
    const updated = [newReq, ...requests];
    setRequests(updated);
    saveRequests(updated);
    logActivity('created', 'New Request Logged', `Registered ${newReq.id}: "${newReq.title}"`, newReq.id);
    addToast({
      type: 'success',
      title: 'Request Created',
      description: `Intake ${newReq.id} added to active register.`,
    });
  };

  const handleOpenEditRequest = (req: ComplianceRequest) => {
    setEditingRequest(req);
    setIsEditRequestModalOpen(true);
  };

  const handleSaveEditedRequest = (updatedReq: ComplianceRequest) => {
    const updated = requests.map((r) => (r.id === updatedReq.id ? updatedReq : r));
    setRequests(updated);
    saveRequests(updated);
    setIsEditRequestModalOpen(false);
    logActivity('status_update', 'Request Updated', `Updated details for ${updatedReq.id}`, updatedReq.id);
    addToast({
      type: 'success',
      title: 'Request Updated',
      description: `Changes saved for ${updatedReq.id}.`,
    });
  };

  const handleSoftDeleteRequest = (req: ComplianceRequest) => {
    const updatedRequests = requests.filter((r) => r.id !== req.id);
    const newDeleted: DeletedItem = {
      id: `DEL-${Date.now()}`,
      originalId: req.id,
      sourceType: 'Request',
      title: req.title,
      type: req.type,
      status: req.status,
      priorityOrTier: req.priorityTier || 'High Priority',
      sprintOrMonth: req.targetSprint,
      deletedAt: new Date().toISOString(),
      originalData: req,
    };
    const updatedDeletedList = [newDeleted, ...deletedItems];

    setRequests(updatedRequests);
    saveRequests(updatedRequests);
    deleteRecord('compliance_requests', 'id', req.id);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Request Moved to Trash', `Soft-deleted ${req.id}`, req.id);
    addToast({
      type: 'warning',
      title: 'Moved to Trash',
      description: `Request ${req.id} moved to Trash. Recover anytime from Deleted Items.`,
    });
  };

  const handleBulkSoftDeleteRequests = (reqIds: string[]) => {
    const toDelete = requests.filter((r) => reqIds.includes(r.id));
    const remaining = requests.filter((r) => !reqIds.includes(r.id));

    const newDeletedItems: DeletedItem[] = toDelete.map((req) => ({
      id: `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalId: req.id,
      sourceType: 'Request',
      title: req.title,
      type: req.type,
      status: req.status,
      priorityOrTier: req.priorityTier || 'High Priority',
      sprintOrMonth: req.targetSprint,
      deletedAt: new Date().toISOString(),
      originalData: req,
    }));

    const updatedDeletedList = [...newDeletedItems, ...deletedItems];

    setRequests(remaining);
    saveRequests(remaining);
    deleteRecords('compliance_requests', 'id', reqIds);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Bulk Requests Moved to Trash', `Soft-deleted ${reqIds.length} requests`, 'BATCH');
    addToast({
      type: 'warning',
      title: 'Bulk Deleted',
      description: `Moved ${reqIds.length} requests to Trash.`,
    });
  };

  const handleOpenCompleteRequest = (req: ComplianceRequest) => {
    setItemToComplete(req);
    setIsCompleteModalOpen(true);
  };

  const handleBulkMarkCompleteRequests = (reqIds: string[]) => {
    const toComplete = requests.filter((r) => reqIds.includes(r.id));
    const remaining = requests.filter((r) => !reqIds.includes(r.id));

    const now = new Date().toISOString().slice(0, 10);
    const newCompletedRecords: CompletedRecord[] = toComplete.map((req) => ({
      id: `CMP-${req.id}`,
      originalId: req.id,
      sourceType: 'Request',
      title: req.title,
      type: req.type,
      submittedOrAssigned: req.submittedBy,
      sprint: req.targetSprint,
      resolutionDate: now,
      completedBy: 'ACE Systems Admin',
      jiraLink: req.jiraLink || '',
      finalNotes: 'Batch completed via bulk actions toolbar.',
      originalData: { ...req, status: 'Completed', completedAt: now, completedBy: 'ACE Systems Admin' },
    }));

    const updatedCompleted = [...newCompletedRecords, ...completedRecords];

    setRequests(remaining);
    saveRequests(remaining);
    setCompletedRecords(updatedCompleted);
    saveCompleted(updatedCompleted);

    logActivity('completed', 'Bulk Requests Completed', `Finalized and archived ${reqIds.length} requests`, 'BATCH');
    addToast({
      type: 'success',
      title: 'Bulk Completed',
      description: `Moved ${reqIds.length} requests to the Completed Tab.`,
    });
  };

  // ==================== BUG REQUESTS HANDLERS ====================

  const handleSaveBug = (bugData: BugRequest) => {
    const exists = bugs.some((b) => b.id === bugData.id);
    let updated: BugRequest[];
    if (exists) {
      updated = bugs.map((b) => (b.id === bugData.id ? bugData : b));
      logActivity('status_update', 'Bug Updated', `Updated defect details for ${bugData.id}`, bugData.id);
      addToast({
        type: 'success',
        title: 'Bug Updated',
        description: `Changes saved for ${bugData.id}.`,
      });
    } else {
      updated = [bugData, ...bugs];
      logActivity('created', 'New Bug Reported', `Logged defect ${bugData.id}: "${bugData.title}"`, bugData.id);
      addToast({
        type: 'success',
        title: 'Bug Logged',
        description: `Defect ${bugData.id} registered in audit tracker.`,
      });
    }
    setBugs(updated);
    saveBugs(updated);
    setIsBugModalOpen(false);
    setEditingBug(null);
  };

  const handleOpenEditBug = (bug: BugRequest) => {
    setEditingBug(bug);
    setIsBugModalOpen(true);
  };

  const handleSoftDeleteBug = (bug: BugRequest) => {
    const updatedBugs = bugs.filter((b) => b.id !== bug.id);
    const newDeleted: DeletedItem = {
      id: `DEL-${Date.now()}`,
      originalId: bug.id,
      sourceType: 'Bug Request',
      title: bug.title,
      type: `Bug (${bug.severity})`,
      status: bug.status,
      priorityOrTier: bug.severity,
      sprintOrMonth: bug.environment || 'Production',
      deletedAt: new Date().toISOString(),
      originalData: bug,
    };
    const updatedDeletedList = [newDeleted, ...deletedItems];

    setBugs(updatedBugs);
    saveBugs(updatedBugs);
    deleteRecord('bug_requests', 'id', bug.id);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Bug Moved to Trash', `Soft-deleted defect ${bug.id}`, bug.id);
    addToast({
      type: 'warning',
      title: 'Bug Moved to Trash',
      description: `${bug.id} moved to the Trash tab.`,
    });
  };

  const handleBulkSoftDeleteBugs = (bugIds: string[]) => {
    const toDelete = bugs.filter((b) => bugIds.includes(b.id));
    const remaining = bugs.filter((b) => !bugIds.includes(b.id));

    const now = new Date().toISOString();
    const newDeletedItems: DeletedItem[] = toDelete.map((bug) => ({
      id: `DEL-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      originalId: bug.id,
      sourceType: 'Bug Request',
      title: bug.title,
      type: `Bug (${bug.severity})`,
      status: bug.status,
      priorityOrTier: bug.severity,
      sprintOrMonth: bug.environment || 'Production',
      deletedAt: now,
      originalData: bug,
    }));

    const updatedDeletedList = [...newDeletedItems, ...deletedItems];

    setBugs(remaining);
    saveBugs(remaining);
    deleteRecords('bug_requests', 'id', bugIds);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Bulk Bugs Moved to Trash', `Soft-deleted ${bugIds.length} defects`, 'BATCH');
    addToast({
      type: 'warning',
      title: 'Bugs Deleted',
      description: `Moved ${bugIds.length} defects to Trash.`,
    });
  };

  const handleMarkCompleteBug = (bug: BugRequest) => {
    const updatedBugs = bugs.filter((b) => b.id !== bug.id);
    const now = new Date().toISOString().slice(0, 10);
    const completedRecord: CompletedRecord = {
      id: `CMP-${bug.id}`,
      originalId: bug.id,
      sourceType: 'Bug Request',
      title: bug.title,
      type: `Defect Fix (${bug.severity})`,
      submittedOrAssigned: bug.reportedBy,
      sprint: bug.environment || 'Production',
      resolutionDate: now,
      completedBy: bug.assignedTo || 'ACE Systems Admin',
      jiraLink: bug.jiraLink || '',
      finalNotes: `Resolved defect: ${bug.about}`,
      originalData: { ...bug, status: 'Resolved', resolvedAt: now },
    };

    const updatedCompleted = [completedRecord, ...completedRecords];
    setBugs(updatedBugs);
    saveBugs(updatedBugs);
    deleteRecord('bug_requests', 'id', bug.id);
    setCompletedRecords(updatedCompleted);
    saveCompleted(updatedCompleted);

    logActivity('completed', 'Bug Resolved & Archived', `Finalized defect ${bug.id}`, bug.id);
    addToast({
      type: 'success',
      title: 'Defect Resolved',
      description: `${bug.id} marked as resolved and archived in Completed Tab.`,
    });
  };

  const handleBulkMarkCompleteBugs = (bugIds: string[]) => {
    const toComplete = bugs.filter((b) => bugIds.includes(b.id));
    const remaining = bugs.filter((b) => !bugIds.includes(b.id));

    const now = new Date().toISOString().slice(0, 10);
    const newCompletedRecords: CompletedRecord[] = toComplete.map((bug) => ({
      id: `CMP-${bug.id}`,
      originalId: bug.id,
      sourceType: 'Bug Request',
      title: bug.title,
      type: `Defect Fix (${bug.severity})`,
      submittedOrAssigned: bug.reportedBy,
      sprint: bug.environment || 'Production',
      resolutionDate: now,
      completedBy: bug.assignedTo || 'ACE Systems Admin',
      jiraLink: bug.jiraLink || '',
      finalNotes: `Bulk resolved defect: ${bug.about}`,
      originalData: { ...bug, status: 'Resolved', resolvedAt: now },
    }));

    const updatedCompleted = [...newCompletedRecords, ...completedRecords];

    setBugs(remaining);
    saveBugs(remaining);
    deleteRecords('bug_requests', 'id', bugIds);
    setCompletedRecords(updatedCompleted);
    saveCompleted(updatedCompleted);

    logActivity('completed', 'Bulk Bugs Resolved', `Archived ${bugIds.length} defects`, 'BATCH');
    addToast({
      type: 'success',
      title: 'Bulk Resolved',
      description: `Moved ${bugIds.length} defects to Completed Tab.`,
    });
  };

  // ==================== SPRINT TRACKER HANDLERS ====================

  const handleSaveTicket = (ticket: SprintTicket) => {
    let updated: SprintTicket[];
    const exists = tickets.some((t) => t.id === ticket.id);
    if (exists) {
      updated = tickets.map((t) => (t.id === ticket.id ? ticket : t));
      logActivity('status_update', 'Ticket Updated', `Updated ticket ${ticket.id} (${ticket.status})`, ticket.id);
      addToast({
        type: 'success',
        title: 'Ticket Updated',
        description: `Ticket ${ticket.id} saved.`,
      });
    } else {
      updated = [ticket, ...tickets];
      logActivity('created', 'Ticket Created', `Created sprint ticket ${ticket.id}`, ticket.id);
      addToast({
        type: 'success',
        title: 'Ticket Created',
        description: `Ticket ${ticket.id} added to ${ticket.sprint}.`,
      });
    }
    setTickets(updated);
    saveTickets(updated);
    setIsTicketModalOpen(false);
  };

  const handleOpenEditTicket = (ticket: SprintTicket) => {
    setEditingTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleSoftDeleteTicket = (ticket: SprintTicket) => {
    const updatedTickets = tickets.filter((t) => t.id !== ticket.id);
    const newDeleted: DeletedItem = {
      id: `DEL-${Date.now()}`,
      originalId: ticket.id,
      sourceType: 'Sprint Ticket',
      title: ticket.title,
      type: ticket.type,
      status: ticket.status,
      priorityOrTier: ticket.priority,
      sprintOrMonth: ticket.sprint,
      deletedAt: new Date().toISOString(),
      originalData: ticket,
    };
    const updatedDeletedList = [newDeleted, ...deletedItems];

    setTickets(updatedTickets);
    saveTickets(updatedTickets);
    deleteRecord('sprint_tickets', 'id', ticket.id);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Sprint Ticket Moved to Trash', `Soft-deleted ticket ${ticket.id}`, ticket.id);
    addToast({
      type: 'warning',
      title: 'Ticket Moved to Trash',
      description: `Ticket ${ticket.id} moved to Trash.`,
    });
  };

  const handleBulkSoftDeleteTickets = (ticketIds: string[]) => {
    const toDelete = tickets.filter((t) => ticketIds.includes(t.id));
    const remaining = tickets.filter((t) => !ticketIds.includes(t.id));

    const newDeletedItems: DeletedItem[] = toDelete.map((ticket) => ({
      id: `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalId: ticket.id,
      sourceType: 'Sprint Ticket',
      title: ticket.title,
      type: ticket.type,
      status: ticket.status,
      priorityOrTier: ticket.priority,
      sprintOrMonth: ticket.sprint,
      deletedAt: new Date().toISOString(),
      originalData: ticket,
    }));

    const updatedDeletedList = [...newDeletedItems, ...deletedItems];

    setTickets(remaining);
    saveTickets(remaining);
    deleteRecords('sprint_tickets', 'id', ticketIds);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Bulk Tickets Moved to Trash', `Soft-deleted ${ticketIds.length} tickets`, 'BATCH');
    addToast({
      type: 'warning',
      title: 'Bulk Deleted',
      description: `Moved ${ticketIds.length} tickets to Trash.`,
    });
  };

  const handleOpenCompleteTicket = (ticket: SprintTicket) => {
    setItemToComplete(ticket);
    setIsCompleteModalOpen(true);
  };

  const handleBulkMarkCompleteTickets = (ticketIds: string[]) => {
    const now = new Date().toISOString().slice(0, 10);
    const linkedReqIds: string[] = [];
    const autoCompletedReqRecords: CompletedRecord[] = [];

    // Keep all tickets in sprint tracker, updating their status to 'Done'
    const updatedTickets = tickets.map((ticket) => {
      if (ticketIds.includes(ticket.id)) {
        if (ticket.originalRequestId) {
          const linkedReq = requests.find((r) => r.id === ticket.originalRequestId);
          if (linkedReq) {
            linkedReqIds.push(linkedReq.id);
            autoCompletedReqRecords.push({
              id: `CMP-${linkedReq.id}`,
              originalId: linkedReq.id,
              sourceType: 'Request',
              title: linkedReq.title,
              type: linkedReq.type,
              submittedOrAssigned: linkedReq.submittedBy,
              sprint: linkedReq.targetSprint,
              resolutionDate: now,
              completedBy: 'ACE Systems Admin',
              jiraLink: ticket.jiraLink || linkedReq.jiraLink || '',
              finalNotes: `Auto-completed via bulk completion of Sprint Ticket ${ticket.id}.`,
              originalData: { ...linkedReq, status: 'Completed', completedAt: now, completedBy: 'ACE Systems Admin' },
            });
          }
        }
        return {
          ...ticket,
          status: 'Done',
          completedAt: now,
          completedBy: 'ACE Systems Admin',
          lastUpdated: now,
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    saveTickets(updatedTickets);

    if (linkedReqIds.length > 0) {
      const remainingReqs = requests.filter((r) => !linkedReqIds.includes(r.id));
      setRequests(remainingReqs);
      saveRequests(remainingReqs);

      const updatedCompleted = [...autoCompletedReqRecords, ...completedRecords];
      setCompletedRecords(updatedCompleted);
      saveCompleted(updatedCompleted);
    }

    logActivity('status_update', 'Bulk Tickets Marked Done', `Updated ${ticketIds.length} sprint tickets to Done`, 'BATCH');
    addToast({
      type: 'success',
      title: 'Tickets Marked as Done',
      description: `Updated ${ticketIds.length} ticket(s) to Done status within their sprint groups.`,
    });
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: string) => {
    const now = new Date().toISOString().slice(0, 10);
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        const isDone = newStatus === 'Done' || newStatus === 'Completed';
        return {
          ...t,
          status: newStatus,
          completedAt: isDone ? (t.completedAt || now) : undefined,
          completedBy: isDone ? (t.completedBy || 'ACE Systems Team') : undefined,
          lastUpdated: now,
        };
      }
      return t;
    });
    setTickets(updatedTickets);
    saveTickets(updatedTickets);

    logActivity('status_update', 'Ticket Status Changed', `Changed ${ticketId} status to ${newStatus}`, ticketId);
    addToast({
      type: 'info',
      title: 'Status Updated',
      description: `Ticket ${ticketId} status changed to ${newStatus}.`,
    });
  };

  // Direct dropzone upload from Sprint Tracker
  const handleDirectFileUpload = async (files: FileList | File[]) => {
    try {
      let totalMergedTickets = 0;
      let currentTickets = [...tickets];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parsed = await parseExcelFile(file);
        
        const incomingTickets = parsed.tickets.length > 0 
          ? parsed.tickets 
          : parsed.requests.map((r) => ({
              id: `ACE-${r.id.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
              title: r.title,
              type: 'Compliance Task' as const,
              assignee: r.submittedBy.split(' ')[0] || 'Unassigned',
              priority: 'High' as const,
              status: 'Backlog' as const,
              intakeMonth: 'July 2024',
              sprint: r.targetSprint,
              targetDate: r.date,
              lastUpdated: r.date,
              deferred: 'No' as const,
              notes: r.description,
              createdAt: new Date().toISOString(),
            }));

        incomingTickets.forEach((ticket) => {
          const idx = currentTickets.findIndex((t) => t.id.toLowerCase() === ticket.id.toLowerCase());
          if (idx >= 0) {
            currentTickets[idx] = { ...currentTickets[idx], ...ticket };
          } else {
            currentTickets.unshift(ticket);
          }
          totalMergedTickets++;
        });
      }

      setTickets(currentTickets);
      saveTickets(currentTickets);

      logActivity('created', 'Excel Files Imported', `Imported ${totalMergedTickets} tickets into backlog`, 'UPLOAD');
      addToast({
        type: 'success',
        title: 'Workbooks Processed',
        description: `Successfully merged ${totalMergedTickets} tickets into sprint backlog.`,
      });
    } catch (err) {
      console.error('Failed to parse dropped files', err);
      addToast({
        type: 'error',
        title: 'Import Failed',
        description: 'Could not parse workbook. Please check file format.',
      });
    }
  };

  const handlePromoteToSprint = (req: ComplianceRequest) => {
    // Generate a unique ticket ID like ACE-1042 or check highest numeric ACE- ID
    const baseNum = tickets.reduce((max, t) => {
      const match = t.id.match(/ACE-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);
    const newTktId = `ACE-${baseNum + 1}`;

    const newTicket: SprintTicket = {
      id: newTktId,
      title: req.title,
      type: 'Compliance Task',
      assignee: 'Unassigned',
      priority: req.priorityTier === 'High Priority' ? 'High' : req.priorityTier === 'Low Priority' ? 'Low' : 'Medium',
      status: 'Backlog',
      intakeMonth: new Date(req.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'September 2026',
      sprint: req.targetSprint,
      targetDate: req.date,
      lastUpdated: new Date().toISOString().slice(0, 10),
      deferred: 'No',
      jiraLink: req.jiraLink || '',
      notes: req.description || '',
      originalRequestId: req.id,
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    saveTickets(updatedTickets);

    // Update original request status to "In Progress"
    const updatedRequests = requests.map((r) => r.id === req.id ? { ...r, status: 'In Progress' } : r);
    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    logActivity('created', 'Request Promoted to Sprint', `Promoted ${req.id} to Sprint Ticket ${newTktId} on ${req.targetSprint}`, req.id);
    addToast({
      type: 'success',
      title: 'Promoted to Sprint',
      description: `Successfully converted ${req.id} to Sprint Ticket ${newTktId}.`,
    });
  };

  const handleCreateSprintWithRequests = (data: {
    month: string;
    year: string;
    sprintName: string;
    sprintGoal: string;
    selectedRequestIds: string[];
  }) => {
    // 1. Ensure sprint is saved to sprints list
    if (!sprints.includes(data.sprintName)) {
      const updatedSprints = [...sprints, data.sprintName];
      setSprints(updatedSprints);
      saveSprints(updatedSprints);
    }

    // 2. Find selected requests
    const selectedReqs = requests.filter((r) => data.selectedRequestIds.includes(r.id));
    const remainingReqs = requests.filter((r) => !data.selectedRequestIds.includes(r.id));

    // Determine starting numeric ID for tickets
    let currentMax = tickets.reduce((max, t) => {
      const match = t.id.match(/ACE-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);

    const newTickets: SprintTicket[] = [];
    const autoCompletedRecords: CompletedRecord[] = [];
    const resolutionDate = new Date().toISOString().slice(0, 10);

    selectedReqs.forEach((req) => {
      currentMax += 1;
      const tktId = `ACE-${currentMax}`;

      const newTicket: SprintTicket = {
        id: tktId,
        title: req.title,
        type: req.type === 'Bug' ? ('Bug Fix' as any) : 'Compliance Task',
        assignee: 'Unassigned',
        priority: req.priorityTier === 'High Priority' ? 'High' : req.priorityTier === 'Low Priority' ? 'Low' : 'Medium',
        status: 'Backlog',
        intakeMonth: `${data.month} ${data.year}`,
        sprint: data.sprintName,
        targetDate: req.date || resolutionDate,
        lastUpdated: resolutionDate,
        deferred: 'No',
        jiraLink: req.jiraLink || '',
        notes: req.description || (data.sprintGoal ? `Sprint Goal: ${data.sprintGoal}` : ''),
        originalRequestId: req.id,
        createdAt: new Date().toISOString(),
      };
      newTickets.push(newTicket);

      // Auto-complete the request from the Request Register
      const completedRecord: CompletedRecord = {
        id: `CMP-${req.id}`,
        originalId: req.id,
        sourceType: 'Request',
        title: req.title,
        type: req.type,
        submittedOrAssigned: req.submittedBy,
        sprint: data.sprintName,
        resolutionDate,
        completedBy: 'Sprint Planning Wizard',
        jiraLink: req.jiraLink || '',
        finalNotes: `Auto-completed & pulled into ${data.sprintName} (${data.month} ${data.year}) as active Sprint Ticket ${tktId}.${data.sprintGoal ? ' Goal: ' + data.sprintGoal : ''}`,
        originalData: {
          ...req,
          status: 'Completed',
          completedAt: resolutionDate,
          completedBy: 'Sprint Planning Wizard',
          targetSprint: data.sprintName,
          finalNotes: `Pulled into ${data.sprintName}`,
        },
      };
      autoCompletedRecords.push(completedRecord);
    });

    if (newTickets.length > 0) {
      const updatedTickets = [...newTickets, ...tickets];
      setTickets(updatedTickets);
      saveTickets(updatedTickets);

      setRequests(remainingReqs);
      saveRequests(remainingReqs);

      const updatedCompleted = [...autoCompletedRecords, ...completedRecords];
      setCompletedRecords(updatedCompleted);
      saveCompleted(updatedCompleted);
    }

    logActivity(
      'created',
      'Sprint Created via Wizard',
      `Created ${data.sprintName} (${data.month} ${data.year}) with ${newTickets.length} tickets. ${selectedReqs.length} requests auto-completed from register.`,
      data.sprintName
    );

    addToast({
      type: 'success',
      title: 'Sprint Created Successfully',
      description: `Created ${data.sprintName} (${data.month} ${data.year}) with ${newTickets.length} sprint tickets. ${selectedReqs.length} request(s) auto-completed from the Request Register.`,
    });
  };

  const handlePullRequestsIntoSprint = (targetSprint: string, requestIds: string[]) => {
    if (!targetSprint || requestIds.length === 0) return;

    // 1. Ensure sprint is saved in sprints list
    if (!sprints.includes(targetSprint)) {
      const updatedSprints = [...sprints, targetSprint];
      setSprints(updatedSprints);
      saveSprints(updatedSprints);
    }

    // 2. Separate selected requests from remaining
    const selectedReqs = requests.filter((r) => requestIds.includes(r.id));
    const remainingReqs = requests.filter((r) => !requestIds.includes(r.id));

    // Determine starting numeric ID for tickets
    let currentMax = tickets.reduce((max, t) => {
      const match = t.id.match(/ACE-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);

    const newTickets: SprintTicket[] = [];
    const autoCompletedRecords: CompletedRecord[] = [];
    const resolutionDate = new Date().toISOString().slice(0, 10);

    selectedReqs.forEach((req) => {
      currentMax += 1;
      const tktId = `ACE-${currentMax}`;

      const newTicket: SprintTicket = {
        id: tktId,
        title: req.title,
        type: req.type === 'Bug' ? ('Bug Fix' as any) : 'Compliance Task',
        assignee: 'Unassigned',
        priority: req.priorityTier === 'High Priority' ? 'High' : req.priorityTier === 'Low Priority' ? 'Low' : 'Medium',
        status: 'Backlog',
        intakeMonth: new Date(req.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'September 2026',
        sprint: targetSprint,
        targetDate: req.date || resolutionDate,
        lastUpdated: resolutionDate,
        deferred: 'No',
        jiraLink: req.jiraLink || '',
        notes: req.description || '',
        originalRequestId: req.id,
        createdAt: new Date().toISOString(),
      };
      newTickets.push(newTicket);

      // Auto-complete the request from the Request Register
      const completedRecord: CompletedRecord = {
        id: `CMP-${req.id}`,
        originalId: req.id,
        sourceType: 'Request',
        title: req.title,
        type: req.type,
        submittedOrAssigned: req.submittedBy,
        sprint: targetSprint,
        resolutionDate,
        completedBy: 'Sprint Manager',
        jiraLink: req.jiraLink || '',
        finalNotes: `Auto-completed & pulled into ${targetSprint} as active Sprint Ticket ${tktId}.`,
        originalData: {
          ...req,
          status: 'Completed',
          completedAt: resolutionDate,
          completedBy: 'Sprint Manager',
          targetSprint: targetSprint,
          finalNotes: `Pulled into ${targetSprint}`,
        },
      };
      autoCompletedRecords.push(completedRecord);
    });

    if (newTickets.length > 0) {
      const updatedTickets = [...newTickets, ...tickets];
      setTickets(updatedTickets);
      saveTickets(updatedTickets);

      setRequests(remainingReqs);
      saveRequests(remainingReqs);

      const updatedCompleted = [...autoCompletedRecords, ...completedRecords];
      setCompletedRecords(updatedCompleted);
      saveCompleted(updatedCompleted);
    }

    logActivity(
      'created',
      'Requests Pulled into Sprint',
      `Pulled ${newTickets.length} requests into ${targetSprint}. Auto-completed from register.`,
      targetSprint
    );

    addToast({
      type: 'success',
      title: 'Requests Added to Sprint',
      description: `Successfully added ${newTickets.length} request(s) into ${targetSprint} as active sprint tickets.`,
    });
  };

  // ==================== COMPLETION & JIRA MODAL HANDLERS ====================

  const handleConfirmCompletion = (data: {
    item: ComplianceRequest | SprintTicket;
    resolutionDate: string;
    completedBy: string;
    jiraLink: string;
    finalNotes: string;
  }) => {
    const isRequest = 'brdRequired' in data.item;
    const originalId = data.item.id;

    if (isRequest) {
      // 1. For Intake Requests: Remove from active requests and move to Completed records
      const remainingRequests = requests.filter((r) => r.id !== originalId);
      setRequests(remainingRequests);
      saveRequests(remainingRequests);

      const newCompleted: CompletedRecord = {
        id: `CMP-${originalId}`,
        originalId,
        sourceType: 'Request',
        title: data.item.title,
        type: data.item.type,
        submittedOrAssigned: (data.item as ComplianceRequest).submittedBy,
        sprint: (data.item as ComplianceRequest).targetSprint,
        resolutionDate: data.resolutionDate,
        completedBy: data.completedBy,
        jiraLink: data.jiraLink,
        finalNotes: data.finalNotes,
        originalData: {
          ...data.item,
          status: 'Completed',
          completedAt: data.resolutionDate,
          completedBy: data.completedBy,
          finalNotes: data.finalNotes,
        },
      };

      const updatedCompleted = [newCompleted, ...completedRecords];
      setCompletedRecords(updatedCompleted);
      saveCompleted(updatedCompleted);

      setIsCompleteModalOpen(false);
      setItemToComplete(null);

      logActivity('completed', 'Request Finalized & Archived', `Moved ${originalId} to Completed Tab`, originalId);
      addToast({
        type: 'success',
        title: 'Request Finalized',
        description: `Request ${originalId} moved to the Completed Tab.`,
      });
    } else {
      // 2. For Sprint Tickets: REMAINS in sprint tracker table under its sprint group with status 'Done'
      const tkt = data.item as SprintTicket;
      let autoCompletedReqRecord: CompletedRecord | null = null;

      const updatedTickets = tickets.map((t) => {
        if (t.id === originalId) {
          return {
            ...t,
            status: 'Done',
            completedAt: data.resolutionDate,
            completedBy: data.completedBy,
            finalNotes: data.finalNotes,
            jiraLink: data.jiraLink || t.jiraLink || '',
            lastUpdated: new Date().toISOString().slice(0, 10),
          };
        }
        return t;
      });

      setTickets(updatedTickets);
      saveTickets(updatedTickets);

      // Check if linked original request is active in Request Register and auto-complete it
      if (tkt.originalRequestId) {
        const linkedReq = requests.find((r) => r.id === tkt.originalRequestId);
        if (linkedReq) {
          const remainingReqs = requests.filter((r) => r.id !== linkedReq.id);
          setRequests(remainingReqs);
          saveRequests(remainingReqs);

          autoCompletedReqRecord = {
            id: `CMP-${linkedReq.id}`,
            originalId: linkedReq.id,
            sourceType: 'Request',
            title: linkedReq.title,
            type: linkedReq.type,
            submittedOrAssigned: linkedReq.submittedBy,
            sprint: linkedReq.targetSprint,
            resolutionDate: data.resolutionDate,
            completedBy: data.completedBy,
            jiraLink: data.jiraLink || linkedReq.jiraLink || '',
            finalNotes: `Auto-completed via completion of Sprint Ticket ${originalId}. Notes: ${data.finalNotes}`,
            originalData: {
              ...linkedReq,
              status: 'Completed',
              completedAt: data.resolutionDate,
              completedBy: data.completedBy,
              finalNotes: data.finalNotes,
            },
          };

          const updatedCompleted = [autoCompletedReqRecord, ...completedRecords];
          setCompletedRecords(updatedCompleted);
          saveCompleted(updatedCompleted);
        }
      }

      setIsCompleteModalOpen(false);
      setItemToComplete(null);

      logActivity('status_update', 'Sprint Ticket Marked Done', `Ticket ${originalId} marked as Done in ${tkt.sprint}`, originalId);
      addToast({
        type: 'success',
        title: 'Ticket Marked as Done',
        description: `Sprint Ticket ${originalId} marked as Done within ${tkt.sprint}.${
          autoCompletedReqRecord ? ` Also auto-completed linked Intake Request ${autoCompletedReqRecord.originalId}.` : ''
        }`,
      });
    }
  };

  const handleOpenAssignJira = (item: ComplianceRequest | SprintTicket | BugRequest) => {
    setItemForJira(item);
    setIsJiraModalOpen(true);
  };

  const handleSaveJiraLink = (itemOrId: ComplianceRequest | SprintTicket | BugRequest | string, jiraLink: string) => {
    const targetId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id;
    const isRequest = typeof itemOrId === 'object' && itemOrId !== null
      ? 'brdRequired' in itemOrId
      : requests.some((r) => r.id === targetId);
    const isBug = typeof itemOrId === 'object' && itemOrId !== null
      ? 'about' in itemOrId || targetId.startsWith('BUG-')
      : bugs.some((b) => b.id === targetId);

    if (isRequest) {
      const updated = requests.map((r) => (r.id === targetId ? { ...r, jiraLink } : r));
      setRequests(updated);
      saveRequests(updated);
    } else if (isBug) {
      const updated = bugs.map((b) => (b.id === targetId ? { ...b, jiraLink } : b));
      setBugs(updated);
      saveBugs(updated);
    } else {
      const updated = tickets.map((t) => (t.id === targetId ? { ...t, jiraLink } : t));
      setTickets(updated);
      saveTickets(updated);
    }

    setIsJiraModalOpen(false);
    setItemForJira(null);

    logActivity('jira_assigned', 'Jira Issue Associated', `Linked ${jiraLink} to ${targetId}`, targetId);
    addToast({
      type: 'success',
      title: 'Jira Link Saved',
      description: `Associated ${targetId} with ${jiraLink}.`,
    });
  };

  // ==================== COMPLETED TAB HANDLERS ====================

  const handleReopenCompletedRecord = (record: CompletedRecord) => {
    // Remove from completed
    const updatedCompleted = completedRecords.filter((c) => c.id !== record.id);
    setCompletedRecords(updatedCompleted);
    saveCompleted(updatedCompleted);

    if (record.sourceType === 'Request') {
      const originalReq = record.originalData as ComplianceRequest;
      const restoredReq: ComplianceRequest = {
        ...originalReq,
        status: 'Approved',
      };
      const updatedRequests = [restoredReq, ...requests];
      setRequests(updatedRequests);
      saveRequests(updatedRequests);
    } else if (record.sourceType === 'Bug Request') {
      const originalBug = record.originalData as BugRequest;
      const restoredBug: BugRequest = {
        ...originalBug,
        status: 'In Dev',
      };
      const updatedBugs = [restoredBug, ...bugs];
      setBugs(updatedBugs);
      saveBugs(updatedBugs);
    } else {
      const originalTicket = record.originalData as SprintTicket;
      const restoredTicket: SprintTicket = {
        ...originalTicket,
        status: 'In Progress',
      };
      const updatedTickets = [restoredTicket, ...tickets];
      setTickets(updatedTickets);
      saveTickets(updatedTickets);
    }

    logActivity('restored', 'Record Reopened', `Reopened ${record.originalId} and restored to active register`, record.originalId);
    addToast({
      type: 'info',
      title: 'Record Reopened',
      description: `${record.originalId} has been moved back to active status.`,
    });
  };

  const handleBulkReopenCompleted = (recordIds: string[]) => {
    const toReopen = completedRecords.filter((c) => recordIds.includes(c.id));
    const remaining = completedRecords.filter((c) => !recordIds.includes(c.id));

    const reqsToRestore: ComplianceRequest[] = [];
    const bugsToRestore: BugRequest[] = [];
    const ticketsToRestore: SprintTicket[] = [];

    toReopen.forEach((rec) => {
      if (rec.sourceType === 'Request') {
        reqsToRestore.push({
          ...(rec.originalData as ComplianceRequest),
          status: 'Approved',
        });
      } else if (rec.sourceType === 'Bug Request') {
        bugsToRestore.push({
          ...(rec.originalData as BugRequest),
          status: 'In Dev',
        });
      } else {
        ticketsToRestore.push({
          ...(rec.originalData as SprintTicket),
          status: 'In Progress',
        });
      }
    });

    setCompletedRecords(remaining);
    saveCompleted(remaining);

    if (reqsToRestore.length > 0) {
      const updatedReqs = [...reqsToRestore, ...requests];
      setRequests(updatedReqs);
      saveRequests(updatedReqs);
    }

    if (bugsToRestore.length > 0) {
      const updatedBugs = [...bugsToRestore, ...bugs];
      setBugs(updatedBugs);
      saveBugs(updatedBugs);
    }

    if (ticketsToRestore.length > 0) {
      const updatedTkts = [...ticketsToRestore, ...tickets];
      setTickets(updatedTkts);
      saveTickets(updatedTkts);
    }

    logActivity('restored', 'Bulk Records Reopened', `Reopened ${recordIds.length} archived items`, 'BATCH');
    addToast({
      type: 'info',
      title: 'Bulk Reopened',
      description: `Restored ${recordIds.length} records back to active registers.`,
    });
  };

  const handleSoftDeleteCompletedRecord = (record: CompletedRecord) => {
    const updatedCompleted = completedRecords.filter((c) => c.id !== record.id);
    const newDeleted: DeletedItem = {
      id: `DEL-${Date.now()}`,
      originalId: record.originalId,
      sourceType: 'Completed Record',
      title: record.title,
      type: record.type,
      status: 'Archived Completed',
      priorityOrTier: 'Completed',
      sprintOrMonth: record.sprint,
      deletedAt: new Date().toISOString(),
      originalData: record,
    };
    const updatedDeletedList = [newDeleted, ...deletedItems];

    setCompletedRecords(updatedCompleted);
    saveCompleted(updatedCompleted);
    deleteRecord('completed_records', 'id', record.id);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Completed Record Moved to Trash', `Soft-deleted archive ${record.originalId}`, record.originalId);
    addToast({
      type: 'warning',
      title: 'Moved to Trash',
      description: `Archive record ${record.originalId} moved to Trash.`,
    });
  };

  const handleBulkSoftDeleteCompleted = (recordIds: string[]) => {
    const toDelete = completedRecords.filter((c) => recordIds.includes(c.id));
    const remaining = completedRecords.filter((c) => !recordIds.includes(c.id));

    const newDeletedItems: DeletedItem[] = toDelete.map((rec) => ({
      id: `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      originalId: rec.originalId,
      sourceType: 'Completed Record',
      title: rec.title,
      type: rec.type,
      status: 'Archived Completed',
      priorityOrTier: 'Completed',
      sprintOrMonth: rec.sprint,
      deletedAt: new Date().toISOString(),
      originalData: rec,
    }));

    const updatedDeletedList = [...newDeletedItems, ...deletedItems];

    setCompletedRecords(remaining);
    saveCompleted(remaining);
    deleteRecords('completed_records', 'id', recordIds);
    setDeletedItems(updatedDeletedList);
    saveDeletedItems(updatedDeletedList);

    logActivity('deleted', 'Bulk Completed Records Moved to Trash', `Moved ${recordIds.length} items to Trash`, 'BATCH');
    addToast({
      type: 'warning',
      title: 'Bulk Deleted',
      description: `Moved ${recordIds.length} archived records to Trash.`,
    });
  };

  // ==================== TRASH & RESTORE HANDLERS ====================

  const handleRestoreTrashItem = (item: DeletedItem) => {
    if (item.sourceType === 'Request') {
      const restoredReq = item.originalData as ComplianceRequest;
      const updatedRequests = [restoredReq, ...requests];
      setRequests(updatedRequests);
      saveRequests(updatedRequests);
    } else if (item.sourceType === 'Bug Request') {
      const restoredBug = item.originalData as BugRequest;
      const updatedBugs = [restoredBug, ...bugs];
      setBugs(updatedBugs);
      saveBugs(updatedBugs);
    } else if (item.sourceType === 'Sprint Ticket') {
      const restoredTicket = item.originalData as SprintTicket;
      const updatedTickets = [restoredTicket, ...tickets];
      setTickets(updatedTickets);
      saveTickets(updatedTickets);
    } else {
      const restoredCompleted = item.originalData as CompletedRecord;
      const updatedCompleted = [restoredCompleted, ...completedRecords];
      setCompletedRecords(updatedCompleted);
      saveCompleted(updatedCompleted);
    }

    const updatedDeleted = deletedItems.filter((d) => d.id !== item.id);
    setDeletedItems(updatedDeleted);
    saveDeletedItems(updatedDeleted);

    logActivity('restored', 'Item Restored from Trash', `Restored ${item.originalId}`, item.originalId);
    addToast({
      type: 'success',
      title: 'Item Restored',
      description: `${item.sourceType} ${item.originalId} restored to active register.`,
    });
  };

  const handlePermanentlyDeleteTrashItem = (id: string) => {
    const target = deletedItems.find((d) => d.id === id);
    const updatedDeleted = deletedItems.filter((d) => d.id !== id);
    setDeletedItems(updatedDeleted);
    saveDeletedItems(updatedDeleted);
    deleteRecord('deleted_items', 'id', id);

    addToast({
      type: 'info',
      title: 'Permanently Purged',
      description: target ? `Purged ${target.originalId} from storage.` : 'Item purged.',
    });
  };

  const handleRestoreAllTrash = () => {
    const reqsToRestore: ComplianceRequest[] = [];
    const bugsToRestore: BugRequest[] = [];
    const ticketsToRestore: SprintTicket[] = [];
    const completedToRestore: CompletedRecord[] = [];

    deletedItems.forEach((item) => {
      if (item.sourceType === 'Request') {
        reqsToRestore.push(item.originalData as ComplianceRequest);
      } else if (item.sourceType === 'Bug Request') {
        bugsToRestore.push(item.originalData as BugRequest);
      } else if (item.sourceType === 'Sprint Ticket') {
        ticketsToRestore.push(item.originalData as SprintTicket);
      } else {
        completedToRestore.push(item.originalData as CompletedRecord);
      }
    });

    const newRequests = [...reqsToRestore, ...requests];
    const newBugs = [...bugsToRestore, ...bugs];
    const newTickets = [...ticketsToRestore, ...tickets];
    const newCompleted = [...completedToRestore, ...completedRecords];

    setRequests(newRequests);
    saveRequests(newRequests);
    setBugs(newBugs);
    saveBugs(newBugs);
    setTickets(newTickets);
    saveTickets(newTickets);
    setCompletedRecords(newCompleted);
    saveCompleted(newCompleted);

    setDeletedItems([]);
    saveDeletedItems([]);

    logActivity('restored', 'Trash Restored', `Restored ${deletedItems.length} records back to active states`, 'TRASH');
    addToast({
      type: 'success',
      title: 'All Items Restored',
      description: `Restored all items from Trash.`,
    });
  };

  const handleEmptyTrash = () => {
    const allDeletedIds = deletedItems.map((d) => d.id);
    setDeletedItems([]);
    saveDeletedItems([]);
    if (allDeletedIds.length > 0) {
      deleteRecords('deleted_items', 'id', allDeletedIds);
    }
    addToast({
      type: 'info',
      title: 'Trash Emptied',
      description: 'Soft-deleted items permanently cleared.',
    });
  };

  // ==================== ADMIN & USER MANAGEMENT ====================

  const handleUpdateStatuses = (newStatuses: CustomStatus[]) => {
    setCustomStatuses(newStatuses);
    saveStatuses(newStatuses);
    addToast({
      type: 'success',
      title: 'Statuses Updated',
      description: 'Workflow lifecycle configurator updated.',
    });
  };

  const handleUpdateSprints = (newSprints: string[]) => {
    setSprints(newSprints);
    saveSprints(newSprints);
    addToast({
      type: 'success',
      title: 'Sprints Updated',
      description: 'Active sprint cadence parameters updated.',
    });
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    const updated = systemUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setSystemUsers(updated);
    saveUsers(updated);
    addToast({
      type: 'success',
      title: 'User Role Updated',
      description: `Access role changed to ${newRole}.`,
    });
  };

  const handleUpdateUserStatus = (userId: string, newStatus: UserStatus) => {
    const updated = systemUsers.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    setSystemUsers(updated);
    saveUsers(updated);
    addToast({
      type: 'success',
      title: 'Account Status Updated',
      description: `Status updated to ${newStatus}.`,
    });
  };

  const handleAddUser = (newUser: SystemUser) => {
    const updated = [newUser, ...systemUsers];
    setSystemUsers(updated);
    saveUsers(updated);
    addToast({
      type: 'success',
      title: 'User Added',
      description: `Created user account for ${newUser.name}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const updated = systemUsers.filter((u) => u.id !== userId);
    setSystemUsers(updated);
    saveUsers(updated);
    deleteRecord('system_users', 'id', userId);
    addToast({
      type: 'info',
      title: 'User Removed',
      description: 'User access credentials revoked.',
    });
  };

  const handleResetAllData = () => {
    const defaults = resetAllToDefault();
    setRequests(defaults.requests);
    setBugs(defaults.bugs);
    setTickets(defaults.tickets);
    setCompletedRecords(defaults.completed);
    setDeletedItems(defaults.deleted);
    setCustomStatuses(defaults.statuses);
    setSystemUsers(defaults.users);
    setActivityFeed(defaults.activities);
    setSprints(defaults.sprints);
    setWatchedIds(defaults.watchedIds);
    setCustomTasks(defaults.customTasks);

    addToast({
      type: 'info',
      title: 'Portal Reset to Factory Defaults',
      description: 'Loaded original compliance and sprint backlog dataset.',
    });
  };

  // Universal Import from Modal
  const handleConfirmImport = (
    result: ParsedWorkbookResult,
    targetOverride: 'auto' | 'tickets' | 'requests'
  ) => {
    let importedRequestsCount = 0;
    let importedTicketsCount = 0;

    let updatedRequests = [...requests];
    let currentTickets = [...tickets];

    if (targetOverride === 'tickets') {
      const incoming = [
        ...result.tickets,
        ...result.requests.map((r) => ({
          id: `ACE-${r.id.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
          title: r.title,
          type: 'Compliance Task' as const,
          assignee: r.submittedBy.split(' ')[0] || 'Unassigned',
          priority: 'High' as const,
          status: 'Backlog' as const,
          intakeMonth: 'July 2024',
          sprint: r.targetSprint,
          targetDate: r.date,
          lastUpdated: r.date,
          deferred: 'No' as const,
          notes: r.description,
          createdAt: new Date().toISOString(),
        })),
      ];

      incoming.forEach((t) => {
        const idx = currentTickets.findIndex((ct) => ct.id.toLowerCase() === t.id.toLowerCase());
        if (idx >= 0) {
          currentTickets[idx] = { ...currentTickets[idx], ...t };
        } else {
          currentTickets.unshift(t);
        }
        importedTicketsCount++;
      });
    } else if (targetOverride === 'requests') {
      result.requests.forEach((r) => {
        const idx = updatedRequests.findIndex((ur) => ur.id.toLowerCase() === r.id.toLowerCase());
        if (idx >= 0) {
          updatedRequests[idx] = { ...updatedRequests[idx], ...r };
        } else {
          updatedRequests.unshift(r);
        }
        importedRequestsCount++;
      });
    } else {
      // Auto
      result.requests.forEach((r) => {
        const idx = updatedRequests.findIndex((ur) => ur.id.toLowerCase() === r.id.toLowerCase());
        if (idx >= 0) {
          updatedRequests[idx] = { ...updatedRequests[idx], ...r };
        } else {
          updatedRequests.unshift(r);
        }
        importedRequestsCount++;
      });

      result.tickets.forEach((t) => {
        const idx = currentTickets.findIndex((ct) => ct.id.toLowerCase() === t.id.toLowerCase());
        if (idx >= 0) {
          currentTickets[idx] = { ...currentTickets[idx], ...t };
        } else {
          currentTickets.unshift(t);
        }
        importedTicketsCount++;
      });
    }

    setRequests(updatedRequests);
    saveRequests(updatedRequests);
    setTickets(currentTickets);
    saveTickets(currentTickets);

    setIsImportModalOpen(false);
    logActivity('created', 'Excel Import Completed', `Imported ${importedRequestsCount} requests & ${importedTicketsCount} tickets`, 'IMPORT');
    addToast({
      type: 'success',
      title: 'Import & Merge Complete',
      description: `Synced ${importedRequestsCount} requests and ${importedTicketsCount} tickets.`,
    });
  };

  // Handle parsed AI intake applied from header quick-action
  const handleApplyAiIntakeFromHeader = (parsed: AiParsedIntake, portalLabel?: string, typeLabel?: string) => {
    const recommendedMatrix = parsed.recommendedScores || {
      regulatoryRisk: 18,
      operationalPain: 16,
      strategicAlignment: 14,
      riskOfInaction: 12,
      requestClarity: 8,
    };
    const scoreVal = calculateScore(recommendedMatrix);
    const tierVal = getPriorityTier(scoreVal);

    // Build clean description containing the 6 drafted fields
    const descSections: string[] = [];
    if (parsed.description) {
      descSections.push(`### Description\n${parsed.description}`);
    }
    if (parsed.useCases && parsed.useCases.length > 0) {
      descSections.push(`### Use Cases\n${parsed.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')}`);
    }
    if (parsed.acceptanceCriteria && parsed.acceptanceCriteria.length > 0) {
      descSections.push(`### Acceptance Criteria\n${parsed.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
    }
    if (parsed.assumptions && parsed.assumptions.length > 0) {
      descSections.push(`### Assumptions\n${parsed.assumptions.map((a) => `• ${a}`).join('\n')}`);
    }
    if (parsed.impactAnalysis) {
      descSections.push(`### Impact Analysis\n${parsed.impactAnalysis}`);
    }

    const fullDesc = descSections.join('\n\n');

    const newReq: ComplianceRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      title: parsed.summary || parsed.title || 'Untitled Compliance Intake',
      type: (parsed.type as any) || 'Compliance',
      status: 'New',
      submittedBy: 'AI Intake Drafter',
      targetSprint: (parsed.targetSprintSuggestion && sprints.includes(parsed.targetSprintSuggestion)) 
        ? parsed.targetSprintSuggestion 
        : (sprints[0] || 'Sprint 24.07'),
      brdRequired: parsed.brdRequired || 'Yes',
      description: fullDesc,
      sourceTrigger: parsed.sourceTrigger || 'Regulatory / Change Intake',
      notes: 'Drafted with Summary, Description, Use Cases, Acceptance Criteria, Assumptions, and Impact Analysis via AI Intake',
      scoreMatrix: recommendedMatrix,
      totalScore: scoreVal,
      priorityTier: tierVal,
      portalLabel: portalLabel || parsed.portalLabel || 'Backoffice',
      typeLabel: typeLabel || parsed.typeLabel || 'Sprint request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => {
      const updated = [newReq, ...prev];
      saveRequests(updated);
      return updated;
    });

    logActivity('created', newReq.title, `Drafted via AI Intake: ${newReq.id}`, newReq.id);
    addToast({
      title: 'AI Intake Draft Created',
      description: `Created ${newReq.id} with Summary, Description, Use Cases, Criteria, Assumptions & Impact Analysis!`,
      type: 'success',
    });

    setActiveTab('requests');
    // Open edit modal for immediate review/fine-tuning
    setEditingRequest(newReq);
    setIsEditRequestModalOpen(true);
  };

  // Open read-only detail popup
  const handleOpenDetailModal = (item: ComplianceRequest | SprintTicket | CompletedRecord | BugRequest) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };

  if (!session) {
    return <Auth />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Workspace...</h2>
          <p className="text-gray-500">Connecting to secure database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-mesh text-slate-800 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900 relative overflow-x-hidden">
      
      {/* Aesthetic Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Soft amber/rose orb */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-linear-to-br from-rose-200/15 to-amber-200/15 blur-[100px]" />
        {/* Soft blue/indigo orb */}
        <div className="absolute top-[30%] left-[-10%] w-[60vw] h-[60vw] max-w-[700px] rounded-full bg-linear-to-br from-indigo-200/10 to-sky-200/15 blur-[120px]" />
        {/* Soft teal/cyan orb */}
        <div className="absolute bottom-[-10%] right-[15%] w-[45vw] h-[45vw] max-w-[500px] rounded-full bg-linear-to-br from-teal-100/10 to-cyan-200/15 blur-[90px]" />
      </div>
      
      {/* Global Header */}
      <Header
        onOpenGcrRules={() => setIsGcrModalOpen(true)}
        onOpenBackofficeManual={() => setIsManualModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAuditDuplicates={() => setIsDuplicateAuditorOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpen={isSidebarOpenMobile}
      />

      {/* Mobile Top Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        requestCount={requests.length}
        ticketCount={tickets.length}
        bugCount={bugs.length}
        completedCount={completedRecords.length}
        deletedCount={deletedItems.length}
      />

      {/* Layout Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full">
        
        {/* Desktop & Mobile Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          requestCount={requests.length}
          ticketCount={tickets.length}
          bugCount={bugs.length}
          completedCount={completedRecords.length}
          deletedCount={deletedItems.length}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          userEmail={session?.user?.email}
          onLogout={() => supabase.auth.signOut()}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          
          {/* 1. Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              requests={requests}
              tickets={tickets}
              completed={completedRecords}
              completedRecords={completedRecords}
              customStatuses={customStatuses}
              activities={activityFeed}
              activityFeed={activityFeed}
              onNavigate={setActiveTab}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'requests') {
                  setIsNewRequestFormOpen(true);
                }
              }}
              onOpenNewRequestModal={() => {
                setActiveTab('requests');
                setIsNewRequestFormOpen(true);
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onOpenImportExcel={() => setIsImportModalOpen(true)}
              onSelectRequestForDetail={handleOpenDetailModal}
            />
          )}

          {/* 2. Request Register Tab */}
          {activeTab === 'requests' && (
            <RequestRegisterTab
              requests={requests}
              customStatuses={customStatuses}
              sprints={sprints}
              allBugs={bugs}
              allTickets={tickets}
              onAddRequest={handleAddRequest}
              onEditRequest={handleOpenEditRequest}
              onSoftDeleteRequest={handleSoftDeleteRequest}
              onBulkSoftDelete={handleBulkSoftDeleteRequests}
              onMarkCompleteRequest={handleOpenCompleteRequest}
              onBulkMarkComplete={handleBulkMarkCompleteRequests}
              onAssignJira={handleOpenAssignJira}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenAuditDuplicates={() => setIsDuplicateAuditorOpen(true)}
              isNewFormOpenDefault={isNewRequestFormOpen}
              watchedIds={watchedIds}
              onToggleWatch={handleToggleWatch}
              onPromoteToSprint={handlePromoteToSprint}
              onBulkAddToSprint={handlePullRequestsIntoSprint}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* 2.5 My Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <WatchlistTab
              requests={requests}
              bugs={bugs}
              tickets={tickets}
              watchedIds={watchedIds}
              onToggleWatch={handleToggleWatch}
              customTasks={customTasks}
              onAddCustomTask={handleAddCustomTask}
              onToggleCustomTaskStatus={handleToggleCustomTaskStatus}
              onDeleteCustomTask={handleDeleteCustomTask}
              onOpenDetailModal={handleOpenDetailModal}
              customStatuses={customStatuses}
            />
          )}

          {/* 3. Bug Requests Tab */}
          {activeTab === 'bugs' && (
            <BugRequestsTab
              bugs={bugs}
              customStatuses={customStatuses}
              onAddBug={handleSaveBug}
              onEditBug={handleOpenEditBug}
              onSoftDeleteBug={handleSoftDeleteBug}
              onBulkSoftDelete={handleBulkSoftDeleteBugs}
              onMarkCompleteBug={handleMarkCompleteBug}
              onBulkMarkComplete={handleBulkMarkCompleteBugs}
              onAssignJira={handleOpenAssignJira}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenNewBugModal={() => {
                setEditingBug(null);
                setIsBugModalOpen(true);
              }}
              onOpenAuditDuplicates={() => setIsDuplicateAuditorOpen(true)}
              watchedIds={watchedIds}
              onToggleWatch={handleToggleWatch}
            />
          )}

          {/* 4. Sprint Tracker Tab */}
          {activeTab === 'sprint' && (
            <SprintTrackerTab
              tickets={tickets}
              customStatuses={customStatuses}
              sprints={sprints}
              allRequests={requests}
              onOpenSprintWizard={() => setIsSprintWizardOpen(true)}
              onOpenPullRequestsModal={(sprintName) => {
                setPullModalTargetSprint(sprintName);
                setIsPullRequestsModalOpen(true);
              }}
              onOpenNewTicketModal={() => {
                setEditingTicket(null);
                setIsTicketModalOpen(true);
              }}
              onEditTicket={handleOpenEditTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onSoftDeleteTicket={handleSoftDeleteTicket}
              onBulkSoftDelete={handleBulkSoftDeleteTickets}
              onMarkCompleteTicket={handleOpenCompleteTicket}
              onBulkMarkComplete={handleBulkMarkCompleteTickets}
              onUploadExcelFiles={handleDirectFileUpload}
              onOpenDetailModal={handleOpenDetailModal}
              watchedIds={watchedIds}
              onToggleWatch={handleToggleWatch}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* 4. Completed Tab */}
          {activeTab === 'completed' && (
            <CompletedTab
              completedRecords={completedRecords}
              customStatuses={customStatuses}
              onReopenRecord={handleReopenCompletedRecord}
              onBulkReopen={handleBulkReopenCompleted}
              onSoftDeleteRecord={handleSoftDeleteCompletedRecord}
              onBulkSoftDelete={handleBulkSoftDeleteCompleted}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {/* 5. Trash Tab */}
          {activeTab === 'trash' && (
            <TrashTab
              deletedItems={deletedItems}
              onRestoreItem={handleRestoreTrashItem}
              onPermanentlyDeleteItem={handlePermanentlyDeleteTrashItem}
              onRestoreAll={handleRestoreAllTrash}
              onEmptyTrash={handleEmptyTrash}
            />
          )}

          {/* 6. Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab
              requests={requests}
              tickets={tickets}
            />
          )}

          {/* 7. Admin Settings Tab */}
          {activeTab === 'admin' && (
            <AdminSettingsTab
              statuses={customStatuses}
              sprints={sprints}
              onUpdateStatuses={handleUpdateStatuses}
              onUpdateSprints={handleUpdateSprints}
              onDeleteStatus={(id) => deleteRecord('custom_statuses', 'id', id)}
              onDeleteSprint={(sprint) => deleteRecord('sprints', 'name', sprint)}
              onResetAllData={handleResetAllData}
            />
          )}

          {/* 8. User Management Tab */}
          {activeTab === 'users' && (
            <UserManagementTab
              users={systemUsers}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUserStatus={handleUpdateUserStatus}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

        </main>
      </div>

      {/* Global Modals */}

      {/* 1. View-Only Detail Popup Modal */}
      <ViewDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailItem(null);
        }}
        item={detailItem}
        customStatuses={customStatuses}
      />

      {/* 2. Edit Request Modal (Without Scoring Matrix) */}
      <EditRequestModal
        isOpen={isEditRequestModalOpen}
        onClose={() => {
          setIsEditRequestModalOpen(false);
          setEditingRequest(null);
        }}
        onSave={handleSaveEditedRequest}
        request={editingRequest}
        customStatuses={customStatuses}
        sprints={sprints}
        existingItems={[
          ...requests.map(r => ({ ...r, sourceType: 'Request' })),
          ...bugs.map(b => ({ ...b, sourceType: 'Bug' })),
          ...tickets.map(t => ({ ...t, sourceType: 'Ticket' })),
        ]}
      />

      {/* 2b. Bug Request Modal (New/Edit) */}
      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => {
          setIsBugModalOpen(false);
          setEditingBug(null);
        }}
        onSave={handleSaveBug}
        editingBug={editingBug}
        existingItems={[
          ...requests.map(r => ({ ...r, sourceType: 'Request' })),
          ...bugs.map(b => ({ ...b, sourceType: 'Bug' })),
          ...tickets.map(t => ({ ...t, sourceType: 'Ticket' })),
        ]}
      />

      {/* 3. Mark as Complete Modal */}
      <CompleteItemModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setItemToComplete(null);
        }}
        onConfirm={handleConfirmCompletion}
        item={itemToComplete}
      />

      {/* 4. Assign Jira Link Modal */}
      <AssignJiraModal
        isOpen={isJiraModalOpen}
        onClose={() => {
          setIsJiraModalOpen(false);
          setItemForJira(null);
        }}
        onSave={handleSaveJiraLink}
        item={itemForJira}
      />

      {/* 5. Sprint Ticket Modal (New/Edit) */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setEditingTicket(null);
        }}
        onSave={handleSaveTicket}
        editingTicket={editingTicket}
      />

      {/* 6. Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmImport}
      />

      {/* 7. GCR Rules Modal */}
      <GcrRulesModal
        isOpen={isGcrModalOpen}
        onClose={() => setIsGcrModalOpen(false)}
        rules={gcrRules}
        onAddRule={(rule) => setGcrRules((prev) => [...prev, rule])}
        onDeleteRule={(id) => setGcrRules((prev) => prev.filter(r => r.id !== id))}
      />

      {/* 8. Backoffice Manual Modal */}
      <BackofficeManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Feature 1: Compliance Request Intake & BRD Generator Modal */}
      <AiIntakeModal
        isOpen={isAiIntakeModalOpen}
        onClose={() => setIsAiIntakeModalOpen(false)}
        onApplyIntake={handleApplyAiIntakeFromHeader}
      />

      {/* Feature 4: Semantic Duplicate & Conflict Auditor Modal */}
      <AiDuplicateDetectorModal
        isOpen={isDuplicateAuditorOpen}
        onClose={() => setIsDuplicateAuditorOpen(false)}
        allRequests={requests}
        allBugs={bugs}
        allTickets={tickets}
        onOpenDetailModal={handleOpenDetailModal}
      />

      {/* Sprint Planning & Pull Requests Wizard Modal */}
      <CreateSprintWizardModal
        isOpen={isSprintWizardOpen}
        onClose={() => setIsSprintWizardOpen(false)}
        requests={requests}
        existingSprints={sprints}
        customStatuses={customStatuses}
        onCreateSprint={handleCreateSprintWithRequests}
      />

      {/* Pull Requests into Existing Sprint Modal */}
      <PullRequestsToSprintModal
        isOpen={isPullRequestsModalOpen}
        onClose={() => {
          setIsPullRequestsModalOpen(false);
          setPullModalTargetSprint(undefined);
        }}
        requests={requests}
        existingSprints={sprints}
        customStatuses={customStatuses}
        initialSprint={pullModalTargetSprint}
        onPullRequests={handlePullRequestsIntoSprint}
      />

      {/* Global Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ACE Compliance Portal &bull; Systems Department Operations Hub</span>
        </div>
      </footer>

    </div>
  );
}
