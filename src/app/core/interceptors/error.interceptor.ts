import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HTTP_ERROR_MESSAGES } from '@core/constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage: string;

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

      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.message);

      return throwError(() => ({ ...error, userMessage }));
    }),
  );
