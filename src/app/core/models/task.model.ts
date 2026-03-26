import { UserRole } from './user.model';

export type TaskStatus = 'open' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedRole: UserRole;
}
