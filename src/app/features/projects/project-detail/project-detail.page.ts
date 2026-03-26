import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ProjectStatus } from '../../../core/models/project.model';
import { TaskStatus } from '../../../core/models/task.model';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../../shared/utils/role-label.util';
import { projectStatusLabel, taskStatusLabel } from '../../../shared/utils/status-label.util';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './project-detail.page.html',
  styleUrl: './project-detail.page.scss',
})
export class ProjectDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);

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
  protected readonly taskCountLabel = computed(() => {
    const count = this.projectTasks().length;
    return count === 1 ? '1 Aufgabe' : `${count} Aufgaben`;
  });

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
