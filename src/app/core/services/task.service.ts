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
  scheduledDate?: string;
}

export interface UpdateTaskInput extends CreateTaskInput {
  id: string;
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
      scheduledDate: task.scheduledDate ?? new Date().toISOString().slice(0, 10),
    };

    this.tasksSubject.next([nextTask, ...this.tasksSubject.value]);
  }

  updateTask(updatedTask: UpdateTaskInput): void {
    this.tasksSubject.next(
      this.tasksSubject.value.map((task) =>
        task.id === updatedTask.id
          ? {
              ...task,
              ...updatedTask,
              title: updatedTask.title.trim(),
              description: updatedTask.description.trim(),
              scheduledDate: updatedTask.scheduledDate ?? task.scheduledDate,
            }
          : task,
      ),
    );
  }

  deleteTask(id: string): void {
    this.tasksSubject.next(this.tasksSubject.value.filter((task) => task.id !== id));
  }
}
