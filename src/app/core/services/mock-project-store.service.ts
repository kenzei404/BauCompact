import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { MOCK_PROJECTS } from '../mocks/project.mock';
import { Project, ProjectStatus } from '../models/project.model';
import { UserRole } from '../models/user.model';

export interface CreateProjectInput {
  name: string;
  description: string;
  status: ProjectStatus;
  ownerRole: UserRole;
}

export interface UpdateProjectInput extends CreateProjectInput {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockProjectStoreService {
  private readonly projectsSubject = new BehaviorSubject<Project[]>([...MOCK_PROJECTS]);

  getProjects(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.projectsSubject
      .asObservable()
      .pipe(map((projects) => projects.find((project) => project.id === id)));
  }

  addProject(project: CreateProjectInput): void {
    const nextProject: Project = {
      id: `project-${Date.now()}`,
      ...project,
      name: project.name.trim(),
      description: project.description.trim(),
    };

    this.projectsSubject.next([nextProject, ...this.projectsSubject.value]);
  }

  updateProject(project: UpdateProjectInput): void {
    this.projectsSubject.next(
      this.projectsSubject.value.map((existingProject) =>
        existingProject.id === project.id
          ? {
              ...project,
              name: project.name.trim(),
              description: project.description.trim(),
            }
          : existingProject,
      ),
    );
  }

  deleteProject(id: string): void {
    this.projectsSubject.next(this.projectsSubject.value.filter((project) => project.id !== id));
  }
}
