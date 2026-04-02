import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import {
  TransferenciaResponse,
  CrearTransferenciaRequest,
  RecibirTransferenciaRequest,
  PaginaResponse,
} from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class TransferenciaService extends BaseApiService {

  listar(pagina = 0, tamanio = 20): Observable<PaginaResponse<TransferenciaResponse>> {
    return this.getPaginated<TransferenciaResponse>(API.TRANSFERENCIAS, { pagina, tamanio });
  }

  obtenerPorId(id: number): Observable<TransferenciaResponse> {
    return this.get<TransferenciaResponse>(`${API.TRANSFERENCIAS}/${id}`);
  }

  crear(request: CrearTransferenciaRequest): Observable<TransferenciaResponse> {
    return this.post<TransferenciaResponse>(API.TRANSFERENCIAS, request);
  }

  confirmar(id: number): Observable<TransferenciaResponse> {
    return this.patch<TransferenciaResponse>(`${API.TRANSFERENCIAS}/${id}/confirmar`);
  }

  despachar(id: number): Observable<TransferenciaResponse> {
    return this.patch<TransferenciaResponse>(`${API.TRANSFERENCIAS}/${id}/despachar`);
  }

  recibir(id: number, request: RecibirTransferenciaRequest): Observable<TransferenciaResponse> {
    return this.patch<TransferenciaResponse>(`${API.TRANSFERENCIAS}/${id}/recibir`, request);
  }

  cancelar(id: number): Observable<TransferenciaResponse> {
    return this.patch<TransferenciaResponse>(`${API.TRANSFERENCIAS}/${id}/cancelar`);
  }
}
