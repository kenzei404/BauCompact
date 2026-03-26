import { UserRole } from './user.model';

export type ProjectStatus = 'draft' | 'in_progress' | 'review' | 'completed';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  ownerRole: UserRole;
}
