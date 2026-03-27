import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../shared/utils/role-label.util';
import { taskStatusLabel } from '../../shared/utils/status-label.util';

@Component({
  selector: 'app-my-work-page',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './my-work.page.html',
  styleUrl: './my-work.page.scss',
})
export class MyWorkPage {
  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);

  protected readonly currentUser = this.authService.currentUser();
  protected readonly roleLabel = roleLabel;
  protected readonly taskStatusLabel = taskStatusLabel;
  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly availableTasks = toSignal(
    this.taskService.getAvailableTasksForRole(
      this.currentUser?.role ?? 'worker',
      this.currentUser?.id,
    ),
    { initialValue: [] },
  );
  protected readonly nextTask = toSignal(
    this.taskService.getNextTaskForRole(this.currentUser?.role ?? 'worker', this.currentUser?.id),
    { initialValue: undefined },
  );
  protected readonly nextTaskCard = computed(() => this.mapTaskForView(this.nextTask()));
  protected readonly queuedTasks = computed(() => {
    const nextTaskId = this.nextTask()?.id;

    return this.availableTasks()
      .filter((task) => task.id !== nextTaskId)
      .map((task) => this.mapTaskForView(task));
  });

  protected advanceTask(task: Task): void {
    if (task.status === 'open') {
      this.taskService.updateTask({
        id: task.id,
        status: 'in_progress',
      });
      return;
    }

    if (task.status === 'in_progress') {
      this.taskService.completeTask(task.id);
    }
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

  protected priorityLabel(priority?: TaskPriority): string {
    if (priority === 'high') {
      return 'Hoch';
    }

    if (priority === 'low') {
      return 'Niedrig';
    }

    return 'Mittel';
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

  private mapTaskForView(task: Task | undefined) {
    if (!task) {
      return null;
    }

    return {
      ...task,
      projectName:
        this.projects().find((project) => project.id === task.projectId)?.name ?? 'Unbekannt',
    };
  }
}
