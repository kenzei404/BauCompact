import { Project } from '../models/project.model';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'Wohnanlage Lindenhof',
    status: 'in_progress',
    description: 'Koordination der Ausfuehrungsplaene fuer den Rohbau und die Haustechnik.',
    ownerRole: 'architect',
  },
  {
    id: 'project-2',
    name: 'Gewerbepark Nord',
    status: 'review',
    description: 'Freigabephase fuer Sicherheitskonzept und Materialabstimmung.',
    ownerRole: 'planner',
  },
  {
    id: 'project-3',
    name: 'Sanierung Schule West',
    status: 'draft',
    description: 'Vorbereitung der Ausschreibung fuer Dach und Fassadenarbeiten.',
    ownerRole: 'company',
  },
];
