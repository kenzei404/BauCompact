import { Task } from '../models/task.model';

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Deckendurchbruch freigeben',
    description: 'Statik und MEP-Abstimmung vor Ort pruefen.',
    status: 'open',
    projectId: 'project-1',
    assignedRole: 'planner',
    scheduledDate: '2026-03-30',
  },
  {
    id: 'task-2',
    title: 'Baustellenprotokoll aktualisieren',
    description: 'Neue Sicherheitsmassen und Liefertermine erfassen.',
    status: 'in_progress',
    projectId: 'project-2',
    assignedRole: 'site_manager',
    scheduledDate: '2026-03-31',
  },
  {
    id: 'task-3',
    title: 'Fensteraufmass bestaetigen',
    description: 'Masse mit Montagefirma gegenpruefen.',
    status: 'done',
    projectId: 'project-3',
    assignedRole: 'company',
    scheduledDate: '2026-04-01',
  },
  {
    id: 'task-4',
    title: 'Geruestabnahme dokumentieren',
    description: 'Status und Fotos fuer die Tagesfreigabe hinterlegen.',
    status: 'open',
    projectId: 'project-1',
    assignedRole: 'worker',
    scheduledDate: '2026-04-02',
  },
];
