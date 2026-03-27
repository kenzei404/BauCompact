import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_DATA_SOURCE } from '../firebase/firebase.config';
import { Task } from '../models/task.model';
import { UserRole } from '../models/user.model';
import { CreateTaskInput, MockTaskStoreService, UpdateTaskInput } from './mock-task-store.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly dataSource = inject(APP_DATA_SOURCE);
  private readonly mockStore = inject(MockTaskStoreService);
  private readonly source = this.resolveSource();

  getTasks(): Observable<Task[]> {
    return this.source.getTasks();
  }

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return this.source.getTasksByProjectId(projectId);
  }

  getAvailableTasksForRole(role: UserRole, userId?: string): Observable<Task[]> {
    return this.source.getAvailableTasksForRole(role, userId);
  }

  getNextTaskForRole(role: UserRole, userId?: string): Observable<Task | undefined> {
    return this.source.getNextTaskForRole(role, userId);
  }

  addTask(task: CreateTaskInput): void {
    this.source.addTask(task);
  }

  updateTask(updatedTask: UpdateTaskInput): void {
    this.source.updateTask(updatedTask);
  }

  deleteTask(id: string): void {
    this.source.deleteTask(id);
  }

  canStartTask(task: Task): boolean {
    return this.source.canStartTask(task);
  }

  completeTask(taskId: string): void {
    this.source.completeTask(taskId);
  }

  private resolveSource(): MockTaskStoreService {
    if (this.dataSource === 'firebase') {
      return this.mockStore;
    }

    return this.mockStore;
  }
}
