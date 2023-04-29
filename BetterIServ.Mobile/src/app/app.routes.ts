import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'files',
    loadComponent: () => import('./pages/files/files.page').then( m => m.FilesPage)
  },
  {
    path: 'mails',
    loadComponent: () => import('./pages/mails/mails.page').then( m => m.MailsPage)
  },
  {
    path: 'substitution',
    loadComponent: () => import('./pages/substitution/substitution.page').then( m => m.SubstitutionPage)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.page').then( m => m.TasksPage)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./pages/schedule/schedule.page').then( m => m.SchedulePage)
  },
];
