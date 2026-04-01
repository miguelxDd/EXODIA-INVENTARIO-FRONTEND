import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem('exodia-token')
    : null;

  if (token) {
    return true;
  }

  return router.createUrlTree(['/']);
};
