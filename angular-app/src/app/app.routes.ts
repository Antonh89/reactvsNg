import { Routes } from '@angular/router';

import { AppLayout } from './shared/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
      },
      {
        path: 'counter',
        loadComponent: () => import('./pages/counter/counter').then((m) => m.CounterPage),
      },
      {
        path: 'todos',
        loadComponent: () => import('./pages/todos/todos').then((m) => m.TodosPage),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
