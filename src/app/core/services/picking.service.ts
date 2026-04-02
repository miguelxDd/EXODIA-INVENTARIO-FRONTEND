import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { OrdenPickingResponse, CrearOrdenPickingRequest, PaginaResponse } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class PickingService extends BaseApiService {

  listar(pagina = 0, tamanio = 20): Observable<PaginaResponse<OrdenPickingResponse>> {
    return this.getPaginated<OrdenPickingResponse>(API.PICKING, { pagina, tamanio });
  }

  obtenerPorId(id: number): Observable<OrdenPickingResponse> {
    return this.get<OrdenPickingResponse>(`${API.PICKING}/${id}`);
  }

  crear(request: CrearOrdenPickingRequest): Observable<OrdenPickingResponse> {
    return this.post<OrdenPickingResponse>(API.PICKING, request);
  }

  ejecutar(id: number): Observable<OrdenPickingResponse> {
    return this.patch<OrdenPickingResponse>(`${API.PICKING}/${id}/ejecutar`);
  }

  cancelar(id: number): Observable<OrdenPickingResponse> {
    return this.patch<OrdenPickingResponse>(`${API.PICKING}/${id}/cancelar`);
  }
}
