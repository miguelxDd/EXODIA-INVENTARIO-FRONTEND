import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { UnidadResponse, CrearUnidadRequest, ActualizarUnidadRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class UnidadService extends BaseApiService {

  listar(): Observable<UnidadResponse[]> {
    return this.get<UnidadResponse[]>(API.UNIDADES);
  }

  obtenerPorId(id: number): Observable<UnidadResponse> {
    return this.get<UnidadResponse>(`${API.UNIDADES}/${id}`);
  }

  crear(request: CrearUnidadRequest): Observable<UnidadResponse> {
    return this.post<UnidadResponse>(API.UNIDADES, request);
  }

  actualizar(id: number, request: ActualizarUnidadRequest): Observable<UnidadResponse> {
    return this.patch<UnidadResponse>(`${API.UNIDADES}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.delete(`${API.UNIDADES}/${id}/desactivar`);
  }
}
