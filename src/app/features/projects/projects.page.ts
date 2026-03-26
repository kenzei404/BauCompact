import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Project, ProjectStatus } from '../../core/models/project.model';
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
  protected readonly editingProjectId = signal<string | null>(null);
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

    const formValue = this.projectForm.getRawValue();
    const editingProjectId = this.editingProjectId();

    if (editingProjectId) {
      this.projectService.updateProject({
        id: editingProjectId,
        ...formValue,
      });
    } else {
      this.projectService.addProject(formValue);
    }

    this.resetForm();
  }

  protected editProject(project: Project): void {
    this.editingProjectId.set(project.id);
    this.projectForm.reset({
      name: project.name,
      description: project.description,
      status: project.status,
      ownerRole: project.ownerRole,
    });
  }

  protected cancelEditing(): void {
    this.resetForm();
  }

  protected deleteProject(project: Project): void {
    const shouldDelete = confirm(`Projekt "${project.name}" wirklich loeschen?`);

    if (!shouldDelete) {
      return;
    }

    this.projectService.deleteProject(project.id);

    if (this.editingProjectId() === project.id) {
      this.resetForm();
    }
  }

  protected isEditingProject(projectId: string): boolean {
    return this.editingProjectId() === projectId;
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

  private resetForm(): void {
    this.editingProjectId.set(null);
    this.projectForm.reset({
      name: '',
      description: '',
      status: 'draft',
      ownerRole: 'architect',
    });
  }
}
