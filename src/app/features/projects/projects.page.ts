import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectStatus } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { UserRole } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { roleLabel } from '../../shared/utils/role-label.util';
import { projectStatusLabel } from '../../shared/utils/status-label.util';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss',
})
export class ProjectsPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  protected readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });
  protected readonly statusOptions: Array<{ value: ProjectStatus; label: string }> = [
    { value: 'draft', label: 'Entwurf' },
    { value: 'in_progress', label: 'In Arbeit' },
    { value: 'review', label: 'Pruefung' },
    { value: 'completed', label: 'Abgeschlossen' },
  ];
  protected readonly roleOptions = [
    'architect',
    'planner',
    'company',
    'site_manager',
    'worker',
  ] satisfies UserRole[];
  protected readonly roleLabel = roleLabel;
  protected readonly projectStatusLabel = projectStatusLabel;
  protected readonly projectForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['draft' as ProjectStatus, Validators.required],
    ownerRole: ['architect' as UserRole, Validators.required],
  });

  protected submitProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.projectService.addProject(this.projectForm.getRawValue());
    this.projectForm.reset({
      name: '',
      description: '',
      status: 'draft',
      ownerRole: 'architect',
    });
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
}
