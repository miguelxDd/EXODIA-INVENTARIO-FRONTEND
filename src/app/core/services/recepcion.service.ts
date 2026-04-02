import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { RecepcionResponse, CrearRecepcionRequest, PaginaResponse } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class RecepcionService extends BaseApiService {

  listar(pagina = 0, tamanio = 20): Observable<PaginaResponse<RecepcionResponse>> {
    return this.getPaginated<RecepcionResponse>(API.RECEPCIONES, { pagina, tamanio });
  }

  obtenerPorId(id: number): Observable<RecepcionResponse> {
    return this.get<RecepcionResponse>(`${API.RECEPCIONES}/${id}`);
  }

  crear(request: CrearRecepcionRequest): Observable<RecepcionResponse> {
    return this.post<RecepcionResponse>(API.RECEPCIONES, request);
  }
}
