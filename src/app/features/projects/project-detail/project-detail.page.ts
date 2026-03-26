import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ProjectStatus } from '../../../core/models/project.model';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { UserRole } from '../../../core/models/user.model';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../../shared/utils/role-label.util';
import { projectStatusLabel, taskStatusLabel } from '../../../shared/utils/status-label.util';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './project-detail.page.html',
  styleUrl: './project-detail.page.scss',
})
export class ProjectDetailPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

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
  private readonly projectId = this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
  protected readonly project = toSignal(
    this.projectId.pipe(switchMap((projectId) => this.projectService.getProjectById(projectId))),
    { initialValue: undefined },
  );
  protected readonly projectTasks = toSignal(
    this.projectId.pipe(switchMap((projectId) => this.taskService.getTasksByProjectId(projectId))),
    { initialValue: [] },
  );
  protected readonly roleLabel = roleLabel;
  protected readonly projectStatusLabel = projectStatusLabel;
  protected readonly taskStatusLabel = taskStatusLabel;
  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['open' as TaskStatus, Validators.required],
    assignedRole: ['worker' as UserRole, Validators.required],
  });
  protected readonly taskCountLabel = computed(() => {
    const count = this.projectTasks().length;
    return count === 1 ? '1 Aufgabe' : `${count} Aufgaben`;
  });

  protected submitTask(): void {
    if (this.taskForm.invalid || !this.project()) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.addTask({
      ...this.taskForm.getRawValue(),
      projectId: this.project()!.id,
    });

    this.taskForm.reset({
      title: '',
      description: '',
      status: 'open',
      assignedRole: 'worker',
    });
  }

  protected deleteTask(task: Task): void {
    const shouldDelete = confirm(`Aufgabe "${task.title}" wirklich loeschen?`);

    if (!shouldDelete) {
      return;
    }

    this.taskService.deleteTask(task.id);
  }

  protected projectTone(status: ProjectStatus): 'progress' | 'success' | 'warning' {
    if (status === 'completed') {
      return 'success';
    }

    if (status === 'review') {
      return 'warning';
    }

    return 'progress';
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
