import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { UbicacionResponse, CrearUbicacionRequest, ActualizarUbicacionRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class UbicacionService extends BaseApiService {

  listarPorBodega(bodegaId: number): Observable<UbicacionResponse[]> {
    return this.get<UbicacionResponse[]>(API.UBICACIONES, { bodegaId });
  }

  obtenerPorId(id: number): Observable<UbicacionResponse> {
    return this.get<UbicacionResponse>(`${API.UBICACIONES}/${id}`);
  }

  crear(request: CrearUbicacionRequest): Observable<UbicacionResponse> {
    return this.post<UbicacionResponse>(API.UBICACIONES, request);
  }

  actualizar(id: number, request: ActualizarUbicacionRequest): Observable<UbicacionResponse> {
    return this.patch<UbicacionResponse>(`${API.UBICACIONES}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.delete(`${API.UBICACIONES}/${id}/desactivar`);
  }
}
