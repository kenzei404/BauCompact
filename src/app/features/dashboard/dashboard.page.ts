import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Task, TaskStatus } from '../../core/models/task.model';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../shared/utils/role-label.util';
import { taskStatusLabel } from '../../shared/utils/status-label.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

  protected readonly currentUser = this.authService.currentUser();
  protected readonly roleLabel = roleLabel;
  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly tasks = toSignal(this.taskService.getTasks(), { initialValue: [] });
  protected readonly selectedStatus = signal<TaskStatus | null>(null);
  protected readonly taskStatusLabel = taskStatusLabel;
  protected readonly projectCount = computed(() => this.projects().length);
  protected readonly summaryCards = computed(() => [
    { key: 'open' as const, label: 'Offene Aufgaben', value: this.tasks().filter((task) => task.status === 'open').length },
    {
      key: 'in_progress' as const,
      label: 'Aufgaben in Bearbeitung',
      value: this.tasks().filter((task) => task.status === 'in_progress').length,
    },
    { key: 'done' as const, label: 'Erledigte Aufgaben', value: this.tasks().filter((task) => task.status === 'done').length },
  ]);
  protected readonly detailTasks = computed(() => {
    const activeStatus = this.selectedStatus();

    if (!activeStatus) {
      return [];
    }

    return this.tasks()
      .filter((task) => task.status === activeStatus)
      .map((task) => ({
        ...task,
        projectName:
          this.projects().find((project) => project.id === task.projectId)?.name ?? 'Unbekannt',
      }));
  });

  protected toggleStatusSection(status: TaskStatus): void {
    this.selectedStatus.set(this.selectedStatus() === status ? null : status);
  }

  protected advanceTaskStatus(task: Task): void {
    if (task.status === 'done') {
      return;
    }

    this.taskService.updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status === 'open' ? 'in_progress' : 'done',
      projectId: task.projectId,
      assignedRole: task.assignedRole,
    });
  }

  protected actionLabel(status: TaskStatus): string {
    if (status === 'open') {
      return 'Starten';
    }

    if (status === 'in_progress') {
      return 'Als erledigt markieren';
    }

    return '';
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
