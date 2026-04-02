import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { AjusteResponse, CrearAjusteRequest, PaginaResponse } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class AjusteService extends BaseApiService {

  listar(pagina = 0, tamanio = 20): Observable<PaginaResponse<AjusteResponse>> {
    return this.getPaginated<AjusteResponse>(API.AJUSTES, { pagina, tamanio });
  }

  obtenerPorId(id: number): Observable<AjusteResponse> {
    return this.get<AjusteResponse>(`${API.AJUSTES}/${id}`);
  }

  crear(request: CrearAjusteRequest): Observable<AjusteResponse> {
    return this.post<AjusteResponse>(API.AJUSTES, request);
  }
}
