import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/overview/overview').then((m) => m.Overview),
        title: 'Overview · Harbor',
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders').then((m) => m.Orders),
        title: 'Orders · Harbor',
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers').then((m) => m.Customers),
        title: 'Customers · Harbor',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
