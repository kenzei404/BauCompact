import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { roleLabel } from '../../shared/utils/role-label.util';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navigationItems = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Meine Arbeit', link: '/my-work' },
    { label: 'Projekte', link: '/projects' },
    { label: 'Aufgaben', link: '/tasks' },
    { label: 'Kalender', link: '/calendar' },
  ];

  protected readonly roleLabel = roleLabel;

  protected get currentUser() {
    return this.authService.currentUser();
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
