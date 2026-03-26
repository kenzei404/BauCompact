import { ProjectStatus } from '../../core/models/project.model';
import { TaskStatus } from '../../core/models/task.model';

export function projectStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    draft: 'Entwurf',
    in_progress: 'In Arbeit',
    review: 'Pruefung',
    completed: 'Abgeschlossen',
  };

  return labels[status];
}

export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    open: 'Offen',
    in_progress: 'In Arbeit',
    done: 'Erledigt',
  };

  return labels[status];
}
