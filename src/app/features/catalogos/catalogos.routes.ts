import { Routes } from '@angular/router';

export default [
  {
    path: 'bodegas',
    loadComponent: () => import('./bodegas/bodegas-page.component').then(m => m.BodegasPageComponent),
  },
  {
    path: 'ubicaciones',
    loadComponent: () => import('./ubicaciones/ubicaciones-page.component').then(m => m.UbicacionesPageComponent),
  },
  {
    path: 'unidades',
    loadComponent: () => import('./unidades/unidades-page.component').then(m => m.UnidadesPageComponent),
  },
  { path: '', redirectTo: 'bodegas', pathMatch: 'full' as const },
] satisfies Routes;
