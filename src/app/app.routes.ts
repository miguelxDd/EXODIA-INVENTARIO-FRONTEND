import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'inventario',
        loadChildren: () => import('./features/inventario/inventario.routes'),
      },
      {
        path: 'operaciones',
        loadChildren: () => import('./features/operaciones/operaciones.routes'),
      },
      {
        path: 'catalogos',
        loadChildren: () => import('./features/catalogos/catalogos.routes'),
      },
      { path: '', redirectTo: 'inventario/stock', pathMatch: 'full' },
    ],
  },
];
