export interface MovimientoContenedorResponse {
  contenedorId: number;
  codigoBarras: string;
  bodegaOrigenId: number;
  ubicacionOrigenId: number;
  bodegaDestinoId: number;
  ubicacionDestinoId: number;
  cantidadMovida: number;
  estadoAnterior: string;
  estadoNuevo: string;
  operacionSalidaId?: number;
  operacionEntradaId?: number;
}

export interface MoverContenedorRequest {
  ubicacionDestinoId: number;
  comentarios?: string;
}

export interface OperacionContenedorRequest {
  comentarios?: string;
}
