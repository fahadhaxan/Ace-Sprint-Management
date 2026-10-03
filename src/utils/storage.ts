import { 
  ComplianceRequest, 
  SprintTicket, 
  CompletedRecord, 
  DeletedItem, 
  CustomStatus, 
  SystemUser, 
  ActivityFeedItem,
  BugRequest,
  CustomTask
} from '../types';
import { 
  initialRequests, 
  initialSprintTickets, 
  initialCompletedRecords, 
  initialStatuses, 
  initialUsers, 
  initialActivities,
  initialBugs 
} from '../data/initialData';

const STORAGE_KEYS = {
  REQUESTS: 'ace_compliance_requests_v2',
  TICKETS: 'ace_compliance_tickets_v2',
  BUGS: 'ace_compliance_bugs_v2',
  COMPLETED: 'ace_compliance_completed_v2',
  DELETED: 'ace_compliance_deleted_v2',
  STATUSES: 'ace_compliance_statuses_v2',
  USERS: 'ace_compliance_users_v2',
  ACTIVITIES: 'ace_compliance_activities_v2',
  SPRINTS: 'ace_compliance_sprints_v2',
};

export const defaultSprints = [
  'Sprint 24.05',
  'Sprint 24.06',
  'Sprint 24.07',
  'Sprint 24.08',
  'Sprint 24.09',
  'Backlog'
];

export function loadRequests(): ComplianceRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      saveRequests(initialRequests);
      return initialRequests;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load requests from localStorage', err);
    return initialRequests;
  }
}

export function saveRequests(requests: ComplianceRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage', err);
  }
}

export function loadTickets(): SprintTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      saveTickets(initialSprintTickets);
      return initialSprintTickets;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tickets from localStorage', err);
    return initialSprintTickets;
  }
}

export function saveTickets(tickets: SprintTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save tickets to localStorage', err);
  }
}

export function loadBugs(): BugRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUGS);
    if (!raw) {
      saveBugs(initialBugs);
      return initialBugs;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load bugs from localStorage', err);
    return initialBugs;
  }
}

export function saveBugs(bugs: BugRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUGS, JSON.stringify(bugs));
  } catch (err) {
    console.error('Failed to save bugs to localStorage', err);
  }
}

export function loadCompleted(): CompletedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    if (!raw) {
      saveCompleted(initialCompletedRecords);
      return initialCompletedRecords;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load completed from localStorage', err);
    return initialCompletedRecords;
  }
}

export function saveCompleted(records: CompletedRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save completed records to localStorage', err);
  }
}

export function loadDeletedItems(): DeletedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load deleted items from localStorage', err);
    return [];
  }
}

export function saveDeletedItems(items: DeletedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save deleted items to localStorage', err);
  }
}

export function loadStatuses(): CustomStatus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATUSES);
    if (!raw) {
      saveStatuses(initialStatuses);
      return initialStatuses;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load statuses from localStorage', err);
    return initialStatuses;
  }
}

export function saveStatuses(statuses: CustomStatus[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
  } catch (err) {
    console.error('Failed to save statuses to localStorage', err);
  }
}

export function loadUsers(): SystemUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsers(initialUsers);
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load users from localStorage', err);
    return initialUsers;
  }
}

export function saveUsers(users: SystemUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function loadActivities(): ActivityFeedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      saveActivities(initialActivities);
      return initialActivities;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load activities from localStorage', err);
    return initialActivities;
  }
}

export function saveActivities(activities: ActivityFeedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save activities to localStorage', err);
  }
}

export function loadSprints(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPRINTS);
    if (!raw) {
      saveSprints(defaultSprints);
      return defaultSprints;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sprints from localStorage', err);
    return defaultSprints;
  }
}

export function saveSprints(sprints: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPRINTS, JSON.stringify(sprints));
  } catch (err) {
    console.error('Failed to save sprints to localStorage', err);
  }
}

export function loadWatchedIds(): string[] {
  try {
    const raw = localStorage.getItem('ace_compliance_watched_ids_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load watched IDs from localStorage', err);
    return [];
  }
}

export function saveWatchedIds(ids: string[]): void {
  try {
    localStorage.setItem('ace_compliance_watched_ids_v1', JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save watched IDs to localStorage', err);
  }
}

export function loadCustomTasks(): CustomTask[] {
  try {
    const raw = localStorage.getItem('ace_compliance_custom_tasks_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom tasks from localStorage', err);
    return [];
  }
}

export function saveCustomTasks(tasks: CustomTask[]): void {
  try {
    localStorage.setItem('ace_compliance_custom_tasks_v1', JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save custom tasks to localStorage', err);
  }
}

export function resetAllToDefault() {
  saveRequests(initialRequests);
  saveTickets(initialSprintTickets);
  saveBugs(initialBugs);
  saveCompleted(initialCompletedRecords);
  saveDeletedItems([]);
  saveStatuses(initialStatuses);
  saveUsers(initialUsers);
  saveActivities(initialActivities);
  saveSprints(defaultSprints);
  saveWatchedIds([]);
  saveCustomTasks([]);

  return {
    requests: initialRequests,
    tickets: initialSprintTickets,
    bugs: initialBugs,
    completed: initialCompletedRecords,
    deleted: [],
    statuses: initialStatuses,
    users: initialUsers,
    activities: initialActivities,
    sprints: defaultSprints,
    watchedIds: [],
    customTasks: [],
  };
}
