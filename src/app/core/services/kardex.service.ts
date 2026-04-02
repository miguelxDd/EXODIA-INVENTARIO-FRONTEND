import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { OperacionResponse, PaginaResponse } from '@core/models';
import { BaseApiService } from './base-api.service';

export interface KardexFiltros {
  contenedorId?: number;
  codigoBarras?: string;
  productoId?: number;
  bodegaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  tamanio?: number;
}

@Injectable({ providedIn: 'root' })
export class KardexService extends BaseApiService {

  consultar(filtros: KardexFiltros = {}): Observable<PaginaResponse<OperacionResponse>> {
    return this.getPaginated<OperacionResponse>(API.KARDEX, {
      ...filtros,
      pagina: filtros.pagina ?? 0,
      tamanio: filtros.tamanio ?? 20,
    });
  }
}
