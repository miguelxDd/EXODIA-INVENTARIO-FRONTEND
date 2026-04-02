import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '@core/constants';
import { ContenedorStockResponse, ProductoBodegaStockResponse, PaginaResponse } from '@core/models';
import { BaseApiService } from './base-api.service';

export interface StockConsolidadoFiltros {
  bodegaId?: number;
  productoId?: number;
  proveedorId?: number;
  codigoBarras?: string;
  numeroLote?: string;
  pagina?: number;
  tamanio?: number;
}

@Injectable({ providedIn: 'root' })
export class StockService extends BaseApiService {

  stockPorContenedor(contenedorId: number): Observable<number> {
    return this.get<number>(`${API.STOCK}/contenedor/${contenedorId}`);
  }

  stockPorBarcode(codigoBarras: string): Observable<number> {
    return this.get<number>(`${API.STOCK}/barcode/${codigoBarras}`);
  }

  stockPorProductoYBodega(productoId: number, bodegaId: number): Observable<number> {
    return this.get<number>(`${API.STOCK}/producto-bodega`, { productoId, bodegaId });
  }

  stockConsolidado(filtros: StockConsolidadoFiltros = {}): Observable<PaginaResponse<ContenedorStockResponse>> {
    return this.getPaginated<ContenedorStockResponse>(`${API.STOCK}/consolidado`, {
      ...filtros,
      pagina: filtros.pagina ?? 0,
      tamanio: filtros.tamanio ?? 20,
    });
  }

  stockAgrupado(bodegaId?: number, productoId?: number): Observable<ProductoBodegaStockResponse[]> {
    return this.get<ProductoBodegaStockResponse[]>(`${API.STOCK}/agrupado`, { bodegaId, productoId });
  }

  proximosAVencer(bodegaId?: number): Observable<ContenedorStockResponse[]> {
    return this.get<ContenedorStockResponse[]>(`${API.STOCK}/proximos-a-vencer`, { bodegaId });
  }

  disponiblesFEFO(productoId: number, bodegaId: number): Observable<ContenedorStockResponse[]> {
    return this.get<ContenedorStockResponse[]>(`${API.STOCK}/disponible-fefo`, { productoId, bodegaId });
  }
}
