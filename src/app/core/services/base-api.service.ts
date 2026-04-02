import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API } from '@core/constants';
import { ApiResponse, PaginaResponse } from '@core/models';

export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = API.BASE_URL;

  protected get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.url(path), { params: this.buildParams(params) })
      .pipe(map(r => r.datos));
  }

  protected getPaginated<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<PaginaResponse<T>> {
    return this.http
      .get<ApiResponse<PaginaResponse<T>>>(this.url(path), { params: this.buildParams(params) })
      .pipe(map(r => r.datos));
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url(path), body)
      .pipe(map(r => r.datos));
  }

  protected patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.url(path), body ?? {})
      .pipe(map(r => r.datos));
  }

  protected delete(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path));
  }

  protected url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private buildParams(params?: Record<string, string | number | boolean | undefined>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }
}
