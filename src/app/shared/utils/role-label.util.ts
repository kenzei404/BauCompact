import { UserRole } from '../../core/models/user.model';

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    architect: 'Architekt',
    planner: 'Planer',
    company: 'Unternehmen',
    site_manager: 'Bauleitung',
    worker: 'Facharbeiter',
  };

  return labels[role];
}
