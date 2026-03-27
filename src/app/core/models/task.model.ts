import { UserRole } from './user.model';

export type TaskStatus = 'open' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedRole: UserRole;
  assignedUserId?: string;
  unit?: string;
  location?: string;
  trade?: string;
  sequence?: number;
  dependsOnTaskId?: string;
  scheduledDate?: string;
  priority?: TaskPriority;
}
