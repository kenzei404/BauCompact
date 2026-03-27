import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { MOCK_TASKS } from '../mocks/task.mock';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { UserRole } from '../models/user.model';

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedRole: UserRole;
  assignedUserId?: string;
  unit?: string;
  location?: string;
  trade?: string;
  sequence?: number;
  dependsOnTaskId?: string;
  scheduledDate?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockTaskStoreService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([...MOCK_TASKS]);

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    return this.tasksSubject
      .asObservable()
      .pipe(map((tasks) => tasks.filter((task) => task.projectId === projectId)));
  }

  getAvailableTasksForRole(role: UserRole, userId?: string): Observable<Task[]> {
    return this.tasksSubject.asObservable().pipe(
      map((tasks) =>
        tasks
          .filter((task) => this.isAssignedToRoleOrUser(task, role, userId))
          .filter((task) => this.canStartTask(task, tasks))
          .sort((left, right) => this.compareAvailableTasks(left, right)),
      ),
    );
  }

  getNextTaskForRole(role: UserRole, userId?: string): Observable<Task | undefined> {
    return this.getAvailableTasksForRole(role, userId).pipe(map((tasks) => tasks[0]));
  }

  addTask(task: CreateTaskInput): void {
    const nextTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
      description: task.description.trim(),
      title: task.title.trim(),
      unit: task.unit?.trim(),
      location: task.location?.trim(),
      trade: task.trade?.trim(),
      sequence: task.sequence ?? this.getNextSequence(task.projectId),
      scheduledDate: task.scheduledDate ?? new Date().toISOString().slice(0, 10),
      priority: task.priority ?? 'medium',
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
              title: updatedTask.title?.trim() ?? task.title,
              description: updatedTask.description?.trim() ?? task.description,
              unit: updatedTask.unit?.trim() ?? task.unit,
              location: updatedTask.location?.trim() ?? task.location,
              trade: updatedTask.trade?.trim() ?? task.trade,
              scheduledDate: updatedTask.scheduledDate ?? task.scheduledDate,
              priority: updatedTask.priority ?? task.priority,
              sequence: updatedTask.sequence ?? task.sequence,
              dependsOnTaskId: updatedTask.dependsOnTaskId ?? task.dependsOnTaskId,
              assignedUserId: updatedTask.assignedUserId ?? task.assignedUserId,
            }
          : task,
      ),
    );
  }

  deleteTask(id: string): void {
    this.tasksSubject.next(this.tasksSubject.value.filter((task) => task.id !== id));
  }

  canStartTask(task: Task): boolean {
    return this.canStartTask(task, this.tasksSubject.value);
  }

  completeTask(taskId: string): void {
    this.updateTask({
      id: taskId,
      status: 'done',
    });
  }

  private canStartTask(task: Task, allTasks: Task[]): boolean {
    if (task.status === 'done') {
      return false;
    }

    if (!task.dependsOnTaskId) {
      return true;
    }

    return allTasks.some(
      (candidate) => candidate.id === task.dependsOnTaskId && candidate.status === 'done',
    );
  }

  private isAssignedToRoleOrUser(task: Task, role: UserRole, userId?: string): boolean {
    if (task.assignedUserId) {
      return task.assignedUserId === userId;
    }

    return task.assignedRole === role;
  }

  private getNextSequence(projectId: string): number {
    const projectSequences = this.tasksSubject.value
      .filter((task) => task.projectId === projectId)
      .map((task) => task.sequence ?? 0);

    return Math.max(0, ...projectSequences) + 1;
  }

  private compareAvailableTasks(left: Task, right: Task): number {
    const statusOrder: Record<TaskStatus, number> = {
      in_progress: 0,
      open: 1,
      done: 2,
    };
    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return (
      statusOrder[left.status] - statusOrder[right.status] ||
      (left.sequence ?? Number.MAX_SAFE_INTEGER) - (right.sequence ?? Number.MAX_SAFE_INTEGER) ||
      (left.scheduledDate ?? '').localeCompare(right.scheduledDate ?? '') ||
      priorityOrder[left.priority ?? 'medium'] - priorityOrder[right.priority ?? 'medium'] ||
      left.title.localeCompare(right.title)
    );
  }
}
