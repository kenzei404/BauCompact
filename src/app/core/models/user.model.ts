export type UserRole = 'architect' | 'planner' | 'company' | 'site_manager' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
