import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskStatus } from '../../core/models/task.model';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
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
  ] as const;

  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly tasks = toSignal(this.taskService.getTasks(), { initialValue: [] });
  protected readonly selectedFilter = signal<'all' | TaskStatus>('all');
  protected readonly roleLabel = roleLabel;
  protected readonly taskStatusLabel = taskStatusLabel;
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['open' as TaskStatus, Validators.required],
    projectId: ['', Validators.required],
    assignedRole: ['worker' as const, Validators.required],
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

    this.taskService.addTask(this.taskForm.getRawValue());
    this.taskForm.reset({
      title: '',
      description: '',
      status: 'open',
      projectId: '',
      assignedRole: 'worker',
    });
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
}
