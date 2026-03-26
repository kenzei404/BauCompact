import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../core/models/task.model';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { UserRole } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../shared/utils/role-label.util';
import { taskStatusLabel } from '../../shared/utils/status-label.util';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.scss',
})
export class TasksPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);

  protected readonly filterOptions: Array<{ value: 'all' | TaskStatus; label: string }> = [
    { value: 'all', label: 'Alle' },
    { value: 'open', label: 'Offen' },
    { value: 'in_progress', label: 'In Arbeit' },
    { value: 'done', label: 'Erledigt' },
  ];
  protected readonly statusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'open', label: 'Offen' },
    { value: 'in_progress', label: 'In Arbeit' },
    { value: 'done', label: 'Erledigt' },
  ];
  protected readonly roleOptions = [
    'architect',
    'planner',
    'company',
    'site_manager',
    'worker',
  ] satisfies UserRole[];

  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly tasks = toSignal(this.taskService.getTasks(), { initialValue: [] });
  protected readonly selectedFilter = signal<'all' | TaskStatus>('all');
  protected readonly editingTaskId = signal<string | null>(null);
  protected readonly roleLabel = roleLabel;
  protected readonly taskStatusLabel = taskStatusLabel;
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['open' as TaskStatus, Validators.required],
    projectId: ['', Validators.required],
    assignedRole: ['worker' as UserRole, Validators.required],
  });
  protected readonly taskItems = computed(() =>
    this.tasks()
      .filter((task) => this.selectedFilter() === 'all' || task.status === this.selectedFilter())
      .map((task) => ({
        ...task,
        projectName:
          this.projects().find((project) => project.id === task.projectId)?.name ?? 'Unbekannt',
      })),
  );

  protected setFilter(filter: 'all' | TaskStatus): void {
    this.selectedFilter.set(filter);
  }

  protected submitTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const editingTaskId = this.editingTaskId();

    if (editingTaskId) {
      this.taskService.updateTask({
        id: editingTaskId,
        ...formValue,
      });
    } else {
      this.taskService.addTask(formValue);
    }

    this.resetForm();
  }

  protected editTask(task: Task): void {
    this.editingTaskId.set(task.id);
    this.taskForm.reset({
      title: task.title,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      assignedRole: task.assignedRole,
    });
  }

  protected cancelEditing(): void {
    this.resetForm();
  }

  protected advanceTaskStatus(task: Task): void {
    const nextStatus = this.getNextStatus(task.status);

    this.taskService.updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: nextStatus,
      projectId: task.projectId,
      assignedRole: task.assignedRole,
    });
  }

  protected isEditingTask(taskId: string): boolean {
    return this.editingTaskId() === taskId;
  }

  protected taskTone(status: TaskStatus): 'progress' | 'success' | 'warning' {
    if (status === 'done') {
      return 'success';
    }

    if (status === 'open') {
      return 'warning';
    }

    return 'progress';
  }

  protected nextStatusLabel(status: TaskStatus): string {
    return `Status auf ${this.taskStatusLabel(this.getNextStatus(status))} setzen`;
  }

  private getNextStatus(status: TaskStatus): TaskStatus {
    if (status === 'open') {
      return 'in_progress';
    }

    if (status === 'in_progress') {
      return 'done';
    }

    return 'open';
  }

  private resetForm(): void {
    this.editingTaskId.set(null);
    this.taskForm.reset({
      title: '',
      description: '',
      status: 'open',
      projectId: '',
      assignedRole: 'worker',
    });
  }
}
