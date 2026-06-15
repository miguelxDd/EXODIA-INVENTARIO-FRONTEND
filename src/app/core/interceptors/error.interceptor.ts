import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HTTP_ERROR_MESSAGES } from '@core/constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Try to extract the backend message from the ApiResponse body
      const backendMessage = error.error?.mensaje;
      const empresaNotFoundMatch = typeof backendMessage === 'string'
        ? backendMessage.match(/^Empresa con id (\d+) no encontrado$/)
        : null;
      const missingEmpresaHeader = typeof backendMessage === 'string'
        && backendMessage.includes('X-Empresa-Id');

      let userMessage: string;

      if (empresaNotFoundMatch) {
        userMessage = HTTP_ERROR_MESSAGES.COMPANY_CONTEXT_NOT_FOUND(empresaNotFoundMatch[1]);
      } else if (missingEmpresaHeader) {
        userMessage = HTTP_ERROR_MESSAGES.COMPANY_CONTEXT_REQUIRED;
      } else if (backendMessage && typeof backendMessage === 'string') {
        userMessage = backendMessage;
      } else {
        switch (error.status) {
          case 0:
            userMessage = HTTP_ERROR_MESSAGES.NETWORK;
            break;
          case 401:
            userMessage = HTTP_ERROR_MESSAGES.UNAUTHORIZED;
            break;
          case 403:
            userMessage = HTTP_ERROR_MESSAGES.FORBIDDEN;
            break;
          case 404:
            userMessage = HTTP_ERROR_MESSAGES.NOT_FOUND;
            break;
          case 422:
            userMessage = HTTP_ERROR_MESSAGES.UNPROCESSABLE_ENTITY;
            break;
          case 500:
            userMessage = HTTP_ERROR_MESSAGES.SERVER_ERROR;
            break;
          default:
            userMessage = HTTP_ERROR_MESSAGES.UNEXPECTED(error.status);
        }
      }

      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.message);

      return throwError(() => ({
        ...error,
        userMessage,
        codigoError: error.error?.codigoError ?? null,
      }));
    }),
  );
