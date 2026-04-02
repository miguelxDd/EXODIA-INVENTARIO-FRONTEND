import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import {
  ConteoFisicoResponse,
  CrearConteoFisicoRequest,
  RegistrarConteoLineaRequest,
  PaginaResponse,
} from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class ConteoFisicoService extends BaseApiService {

  listar(pagina = 0, tamanio = 20): Observable<PaginaResponse<ConteoFisicoResponse>> {
    return this.getPaginated<ConteoFisicoResponse>(API.CONTEOS, { pagina, tamanio });
  }

  obtenerPorId(id: number): Observable<ConteoFisicoResponse> {
    return this.get<ConteoFisicoResponse>(`${API.CONTEOS}/${id}`);
  }

  crear(request: CrearConteoFisicoRequest): Observable<ConteoFisicoResponse> {
    return this.post<ConteoFisicoResponse>(API.CONTEOS, request);
  }

  registrarLinea(conteoId: number, request: RegistrarConteoLineaRequest): Observable<ConteoFisicoResponse> {
    return this.post<ConteoFisicoResponse>(`${API.CONTEOS}/${conteoId}/lineas`, request);
  }

  aplicar(id: number): Observable<ConteoFisicoResponse> {
    return this.patch<ConteoFisicoResponse>(`${API.CONTEOS}/${id}/aplicar`);
  }

  cancelar(id: number): Observable<ConteoFisicoResponse> {
    return this.patch<ConteoFisicoResponse>(`${API.CONTEOS}/${id}/cancelar`);
  }
}
