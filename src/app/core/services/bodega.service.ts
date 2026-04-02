import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { BodegaResponse, CrearBodegaRequest, ActualizarBodegaRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class BodegaService extends BaseApiService {

  listar(): Observable<BodegaResponse[]> {
    return this.get<BodegaResponse[]>(API.BODEGAS);
  }

  obtenerPorId(id: number): Observable<BodegaResponse> {
    return this.get<BodegaResponse>(`${API.BODEGAS}/${id}`);
  }

  crear(request: CrearBodegaRequest): Observable<BodegaResponse> {
    return this.post<BodegaResponse>(API.BODEGAS, request);
  }

  actualizar(id: number, request: ActualizarBodegaRequest): Observable<BodegaResponse> {
    return this.patch<BodegaResponse>(`${API.BODEGAS}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.delete(`${API.BODEGAS}/${id}/desactivar`);
  }
}
