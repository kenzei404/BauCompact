import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task } from '../models/task.model';
import { MOCK_TASKS } from '../mocks/task.mock';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  getTasks(): Observable<Task[]> {
    return of(MOCK_TASKS);
  }

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return of(MOCK_TASKS.filter((task) => task.projectId === projectId));
  }
}
