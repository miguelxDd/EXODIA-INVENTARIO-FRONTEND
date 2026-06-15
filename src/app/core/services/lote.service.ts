import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { LoteResponse, ActualizarLoteRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class LoteService extends BaseApiService {

  listarPorEmpresa(): Observable<LoteResponse[]> {
    return this.get<LoteResponse[]>(API.LOTES);
  }

  obtenerPorId(id: number): Observable<LoteResponse> {
    return this.get<LoteResponse>(`${API.LOTES}/${id}`);
  }

  listarPorProducto(productoId: number): Observable<LoteResponse[]> {
    return this.get<LoteResponse[]>(`${API.LOTES}/por-producto/${productoId}`);
  }

  listarPorVencer(dias: number = 30): Observable<LoteResponse[]> {
    return this.get<LoteResponse[]>(`${API.LOTES}/por-vencer`, { dias });
  }

  actualizarEstado(id: number, request: ActualizarLoteRequest): Observable<LoteResponse> {
    return this.patch<LoteResponse>(`${API.LOTES}/${id}`, request);
  }
}
