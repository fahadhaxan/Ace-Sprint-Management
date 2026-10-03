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
import { supabase } from './supabase';

export const defaultSprints = [
  'Sprint 24.05',
  'Sprint 24.06',
  'Sprint 24.07',
  'Sprint 24.08',
  'Sprint 24.09',
  'Backlog'
];

export async function loadRequests(): Promise<ComplianceRequest[]> {
  try {
    const { data, error } = await supabase.from('compliance_requests').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load requests from Supabase', err);
    return [];
  }
}

export async function saveRequests(requests: ComplianceRequest[]): Promise<void> {
  try {
    // Basic optimistic upsert. For an array replace, we upsert all.
    // In a real app we'd target individual rows, but keeping signature same for now.
    const { error } = await supabase.from('compliance_requests').upsert(requests);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save requests to Supabase', err);
  }
}

export async function loadTickets(): Promise<SprintTicket[]> {
  try {
    const { data, error } = await supabase.from('sprint_tickets').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load tickets from Supabase', err);
    return [];
  }
}

export async function saveTickets(tickets: SprintTicket[]): Promise<void> {
  try {
    const { error } = await supabase.from('sprint_tickets').upsert(tickets);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save tickets to Supabase', err);
  }
}

export async function loadBugs(): Promise<BugRequest[]> {
  try {
    const { data, error } = await supabase.from('bug_requests').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load bugs from Supabase', err);
    return [];
  }
}

export async function saveBugs(bugs: BugRequest[]): Promise<void> {
  try {
    const { error } = await supabase.from('bug_requests').upsert(bugs);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save bugs to Supabase', err);
  }
}

export async function loadCompleted(): Promise<CompletedRecord[]> {
  try {
    const { data, error } = await supabase.from('completed_records').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load completed from Supabase', err);
    return [];
  }
}

export async function saveCompleted(records: CompletedRecord[]): Promise<void> {
  try {
    const { error } = await supabase.from('completed_records').upsert(records);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save completed records to Supabase', err);
  }
}

export async function loadDeletedItems(): Promise<DeletedItem[]> {
  try {
    const { data, error } = await supabase.from('deleted_items').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load deleted items from Supabase', err);
    return [];
  }
}

export async function saveDeletedItems(items: DeletedItem[]): Promise<void> {
  try {
    const { error } = await supabase.from('deleted_items').upsert(items);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save deleted items to Supabase', err);
  }
}

export async function loadStatuses(): Promise<CustomStatus[]> {
  try {
    const { data, error } = await supabase.from('custom_statuses').select('*').order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load statuses from Supabase', err);
    return [];
  }
}

export async function saveStatuses(statuses: CustomStatus[]): Promise<void> {
  try {
    const { error } = await supabase.from('custom_statuses').upsert(statuses);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save statuses to Supabase', err);
  }
}

export async function loadUsers(): Promise<SystemUser[]> {
  try {
    const { data, error } = await supabase.from('system_users').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load users from Supabase', err);
    return [];
  }
}

export async function saveUsers(users: SystemUser[]): Promise<void> {
  try {
    const { error } = await supabase.from('system_users').upsert(users);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save users to Supabase', err);
  }
}

export async function loadActivities(): Promise<ActivityFeedItem[]> {
  try {
    const { data, error } = await supabase.from('activity_feed').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load activities from Supabase', err);
    return [];
  }
}

export async function saveActivities(activities: ActivityFeedItem[]): Promise<void> {
  try {
    const { error } = await supabase.from('activity_feed').upsert(activities);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save activities to Supabase', err);
  }
}

export async function loadSprints(): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('sprints').select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(d => d.name);
    }
    return defaultSprints;
  } catch (err) {
    console.error('Failed to load sprints from Supabase', err);
    return defaultSprints;
  }
}

export async function saveSprints(sprints: string[]): Promise<void> {
  try {
    // Convert strings to objects for upsert
    const { error } = await supabase.from('sprints').upsert(
      sprints.map(name => ({ name }))
    );
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save sprints to Supabase', err);
  }
}

export async function loadWatchedIds(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase.from('watched_ids').select('item_id').eq('user_id', user.id);
    if (error) throw error;
    return data ? data.map(d => d.item_id) : [];
  } catch (err) {
    console.error('Failed to load watched IDs from Supabase', err);
    return [];
  }
}

export async function saveWatchedIds(ids: string[]): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Simplest way is to delete all for user and re-insert
    await supabase.from('watched_ids').delete().eq('user_id', user.id);
    
    if (ids.length > 0) {
      const records = ids.map(id => ({ user_id: user.id, item_id: id }));
      const { error } = await supabase.from('watched_ids').insert(records);
      if (error) throw error;
    }
  } catch (err) {
    console.error('Failed to save watched IDs to Supabase', err);
  }
}

export async function loadCustomTasks(): Promise<CustomTask[]> {
  try {
    const { data, error } = await supabase.from('custom_tasks').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to load custom tasks from Supabase', err);
    return [];
  }
}

export async function saveCustomTasks(tasks: CustomTask[]): Promise<void> {
  try {
    const { error } = await supabase.from('custom_tasks').upsert(tasks);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to save custom tasks to Supabase', err);
  }
}

export async function resetAllToDefault() {
  // Not implementing a full DB reset for production use.
  console.warn("resetAllToDefault is disabled when using Supabase");
  return {
    requests: [],
    tickets: [],
    bugs: [],
    completed: [],
    deleted: [],
    statuses: [],
    users: [],
    activities: [],
    sprints: defaultSprints,
    watchedIds: [],
    customTasks: [],
  };
}
