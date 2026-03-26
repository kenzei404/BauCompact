import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectStatus } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../shared/utils/role-label.util';
import { projectStatusLabel } from '../../shared/utils/status-label.util';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss',
})
export class ProjectsPage {
  private readonly projectService = inject(ProjectService);

  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly roleLabel = roleLabel;
  protected readonly projectStatusLabel = projectStatusLabel;

  protected projectTone(status: ProjectStatus): 'progress' | 'success' | 'warning' {
    if (status === 'completed') {
      return 'success';
    }

    if (status === 'review') {
      return 'warning';
    }

    return 'progress';
  }
}
