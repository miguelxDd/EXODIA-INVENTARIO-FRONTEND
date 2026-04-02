import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_CONSTANTS } from '@core/constants';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)
    : null;

  if (token) {
    return true;
  }

  return router.createUrlTree(['/']);
};
