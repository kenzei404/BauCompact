import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';
import { UserRole } from '../models/user.model';
import { MOCK_TASKS } from '../mocks/task.mock';

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedRole: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([...MOCK_TASKS]);

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return this.tasksSubject
      .asObservable()
      .pipe(map((tasks) => tasks.filter((task) => task.projectId === projectId)));
  }

  addTask(task: CreateTaskInput): void {
    const nextTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
      description: task.description.trim(),
      title: task.title.trim(),
    };

    this.tasksSubject.next([nextTask, ...this.tasksSubject.value]);
  }
}
