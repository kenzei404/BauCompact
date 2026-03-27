import { Routes } from '@angular/router';
import { authGuard, initialRedirectGuard, loginRedirectGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [initialRedirectGuard],
    loadComponent: () =>
      import('./shared/ui/route-redirect/route-redirect.component').then(
        (m) => m.RouteRedirectComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [loginRedirectGuard],
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects.page').then((m) => m.ProjectsPage),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.page').then(
            (m) => m.ProjectDetailPage,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks.page').then((m) => m.TasksPage),
      },
      {
        path: 'my-work',
        loadComponent: () => import('./features/my-work/my-work.page').then((m) => m.MyWorkPage),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.page').then((m) => m.CalendarPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
