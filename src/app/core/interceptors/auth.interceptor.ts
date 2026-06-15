import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONSTANTS } from '@core/constants';
import { CompanyContextService } from '@core/services';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const companyContext = inject(CompanyContextService);
  const isBrowser = typeof window !== 'undefined';

  const token = isBrowser
    ? window.localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)
    : null;

  const empresaId = companyContext.currentCompanyId();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (empresaId) {
    headers = headers.set('X-Empresa-Id', String(empresaId));
  }

  return next(req.clone({ headers }));
};
