import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage: string;

      switch (error.status) {
        case 0:
          userMessage = 'No se pudo conectar con el servidor. Verifica tu conexion a internet.';
          break;
        case 401:
          userMessage = 'Tu sesion ha expirado. Por favor inicia sesion nuevamente.';
          break;
        case 403:
          userMessage = 'No tienes permisos para realizar esta accion.';
          break;
        case 404:
          userMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 422:
          userMessage = 'Los datos enviados no son validos. Revisa el formulario e intenta de nuevo.';
          break;
        case 500:
          userMessage = 'Ocurrio un error en el servidor. Intenta de nuevo mas tarde.';
          break;
        default:
          userMessage = `Error inesperado (${error.status}). Intenta de nuevo.`;
      }

      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.message);

      return throwError(() => ({ ...error, userMessage }));
    }),
  );
