import { Routes } from '@angular/router';

export default [
  {
    path: 'recepciones',
    loadComponent: () => import('./recepciones/recepciones-page.component').then(m => m.RecepcionesPageComponent),
  },
  {
    path: 'transferencias',
    loadComponent: () => import('./transferencias/transferencias-page.component').then(m => m.TransferenciasPageComponent),
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./ajustes/ajustes-page.component').then(m => m.AjustesPageComponent),
  },
  {
    path: 'picking',
    loadComponent: () => import('./picking/picking-page.component').then(m => m.PickingPageComponent),
  },
  {
    path: 'conteos',
    loadComponent: () => import('./conteos/conteos-page.component').then(m => m.ConteosPageComponent),
  },
  { path: '', redirectTo: 'recepciones', pathMatch: 'full' as const },
] satisfies Routes;
