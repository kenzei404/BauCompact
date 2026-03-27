import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_DATA_SOURCE } from '../firebase/firebase.config';
import { Project } from '../models/project.model';
import {
  CreateProjectInput,
  MockProjectStoreService,
  UpdateProjectInput,
} from './mock-project-store.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly dataSource = inject(APP_DATA_SOURCE);
  private readonly mockStore = inject(MockProjectStoreService);
  private readonly source = this.resolveSource();

  getProjects(): Observable<Project[]> {
    return this.source.getProjects();
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.source.getProjectById(id);
  }

  addProject(project: CreateProjectInput): void {
    this.source.addProject(project);
  }

  updateProject(project: UpdateProjectInput): void {
    this.source.updateProject(project);
  }

  deleteProject(id: string): void {
    this.source.deleteProject(id);
  }

  private resolveSource(): MockProjectStoreService {
    if (this.dataSource === 'firebase') {
      return this.mockStore;
    }

    return this.mockStore;
  }
}
