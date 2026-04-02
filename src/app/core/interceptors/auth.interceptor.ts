import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONSTANTS } from '@core/constants';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = typeof window !== 'undefined';

  const token = isBrowser
    ? window.localStorage.getItem(APP_CONSTANTS.TOKEN_KEY)
    : null;

  const storedEmpresaId = isBrowser
    ? window.localStorage.getItem(APP_CONSTANTS.EMPRESA_ID_KEY)
    : null;

  const empresaId = storedEmpresaId
    ?? (environment.defaultEmpresaId ? String(environment.defaultEmpresaId) : null);

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (empresaId) {
    headers = headers.set('X-Empresa-Id', empresaId);
  }

  return next(req.clone({ headers }));
};
