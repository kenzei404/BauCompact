import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { roleLabel } from '../../shared/utils/role-label.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
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
  protected readonly summaryCards = computed(() => [
    { label: 'Projekte', value: this.projects().length },
    { label: 'Offene Aufgaben', value: this.tasks().filter((task) => task.status !== 'done').length },
    { label: 'Erledigte Aufgaben', value: this.tasks().filter((task) => task.status === 'done').length },
  ]);
}
