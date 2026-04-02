import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { ConversionUnidadResponse, CrearConversionUnidadRequest, ActualizarConversionUnidadRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ConversionUnidadService extends BaseApiService {

  listar(): Observable<ConversionUnidadResponse[]> {
    return this.get<ConversionUnidadResponse[]>(API.CONVERSIONES_UNIDAD);
  }

  obtenerPorId(id: number): Observable<ConversionUnidadResponse> {
    return this.get<ConversionUnidadResponse>(`${API.CONVERSIONES_UNIDAD}/${id}`);
  }

  crear(request: CrearConversionUnidadRequest): Observable<ConversionUnidadResponse> {
    return this.post<ConversionUnidadResponse>(API.CONVERSIONES_UNIDAD, request);
  }

  actualizar(id: number, request: ActualizarConversionUnidadRequest): Observable<ConversionUnidadResponse> {
    return this.patch<ConversionUnidadResponse>(`${API.CONVERSIONES_UNIDAD}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.delete(`${API.CONVERSIONES_UNIDAD}/${id}/desactivar`);
  }
}
