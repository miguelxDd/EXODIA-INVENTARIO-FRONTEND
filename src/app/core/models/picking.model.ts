export interface OrdenPickingResponse {
  id: number;
  numeroOrden: string;
  bodegaId: number;
  tipoPicking: string;
  tipoReferencia?: string;
  referenciaId?: number;
  estado: string;
  comentarios?: string;
  lineas: PickingLineaResponse[];
  creadoEn: string;
}

export interface PickingLineaResponse {
  id: number;
  productoId: number;
  unidadId: number;
  cantidadSolicitada: number;
  cantidadPickeada?: number;
  contenedorSolicitadoId?: number;
  contenedorId?: number;
  operacionId?: number;
  asignaciones: PickingLineaAsignacionResponse[];
}

export interface PickingLineaAsignacionResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  cantidadPickeada: number;
  operacionId?: number;
}

export interface CrearOrdenPickingRequest {
  bodegaId: number;
  tipoPicking: string;
  tipoReferencia?: string;
  referenciaId?: number;
  comentarios?: string;
  lineas: PickingLineaRequest[];
}

export interface PickingLineaRequest {
  productoId: number;
  unidadId: number;
  cantidadSolicitada: number;
  contenedorId?: number;
}
