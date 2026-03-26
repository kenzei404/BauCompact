import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project.model';
import { MOCK_PROJECTS } from '../mocks/project.mock';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  getProjects(): Observable<Project[]> {
    return of(MOCK_PROJECTS);
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return of(MOCK_PROJECTS.find((project) => project.id === id));
  }
}
