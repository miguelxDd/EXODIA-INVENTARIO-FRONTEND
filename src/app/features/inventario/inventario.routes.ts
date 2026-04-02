import { Routes } from '@angular/router';

export default [
  {
    path: 'stock',
    loadComponent: () => import('./stock/stock-page.component').then(m => m.StockPageComponent),
  },
  {
    path: 'kardex',
    loadComponent: () => import('./kardex/kardex-page.component').then(m => m.KardexPageComponent),
  },
  { path: '', redirectTo: 'stock', pathMatch: 'full' as const },
] satisfies Routes;
