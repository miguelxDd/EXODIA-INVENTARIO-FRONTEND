export interface AjusteResponse {
  id: number;
  numeroAjuste: string;
  bodegaId: number;
  tipoAjusteCodigo: string;
  tipoAjusteNombre: string;
  motivo?: string;
  estado: string;
  lineas: AjusteLineaResponse[];
  creadoEn: string;
}

export interface AjusteLineaResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  cantidadAnterior?: number;
  cantidadNueva?: number;
  cantidadAjuste?: number;
  precioAnterior?: number;
  precioNuevo?: number;
}

export interface CrearAjusteRequest {
  bodegaId: number;
  tipoAjusteCodigo: string;
  motivo?: string;
  lineas: AjusteLineaRequest[];
}

export interface AjusteLineaRequest {
  contenedorId: number;
  cantidadNueva?: number;
  precioNuevo?: number;
}
