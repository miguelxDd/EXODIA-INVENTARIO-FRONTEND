export interface TransferenciaResponse {
  id: number;
  numeroTransferencia: string;
  tipoTransferencia: string;
  bodegaOrigenId: number;
  bodegaOrigenCodigo: string;
  bodegaDestinoId: number;
  bodegaDestinoCodigo: string;
  estadoCodigo: string;
  comentarios?: string;
  fechaDespacho?: string;
  fechaRecepcion?: string;
  lineas: TransferenciaLineaResponse[];
  contenedores: TransferenciaContenedorResponse[];
  creadoEn: string;
}

export interface TransferenciaLineaResponse {
  id: number;
  productoId: number;
  unidadId: number;
  cantidadSolicitada: number;
  cantidadDespachada?: number;
  cantidadRecibida?: number;
}

export interface TransferenciaContenedorResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  cantidad: number;
  recibido?: boolean;
}

export interface CrearTransferenciaRequest {
  bodegaOrigenId: number;
  bodegaDestinoId: number;
  tipoTransferencia: string;
  comentarios?: string;
  lineas: TransferenciaLineaRequest[];
}

export interface TransferenciaLineaRequest {
  productoId: number;
  unidadId: number;
  cantidadSolicitada: number;
  contenedorId?: number;
}

export interface RecibirTransferenciaRequest {
  ubicacionDestinoId: number;
  contenedores: RecepcionContenedorRequest[];
}

export interface RecepcionContenedorRequest {
  contenedorId: number;
  cantidadRecibida?: number;
}
