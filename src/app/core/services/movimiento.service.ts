import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { MovimientoContenedorResponse, MoverContenedorRequest, OperacionContenedorRequest } from '@core/models';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class MovimientoService extends BaseApiService {

  mover(contenedorId: number, request: MoverContenedorRequest): Observable<MovimientoContenedorResponse> {
    return this.post<MovimientoContenedorResponse>(
      `${API.MOVIMIENTOS}/${contenedorId}/mover`, request);
  }

  enviarAStandby(contenedorId: number, request?: OperacionContenedorRequest): Observable<MovimientoContenedorResponse> {
    return this.post<MovimientoContenedorResponse>(
      `${API.MOVIMIENTOS}/${contenedorId}/enviar-standby`, request ?? {});
  }

  sacarDeStandby(contenedorId: number, request: MoverContenedorRequest): Observable<MovimientoContenedorResponse> {
    return this.post<MovimientoContenedorResponse>(
      `${API.MOVIMIENTOS}/${contenedorId}/sacar-standby`, request);
  }
}
