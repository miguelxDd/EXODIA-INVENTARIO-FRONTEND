export interface OperacionResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  productoId: number;
  bodegaId: number;
  ubicacionId?: number;
  unidadId: number;
  tipoOperacionCodigo: string;
  cantidad: number;
  precioUnitario?: number;
  numeroLote?: string;
  fechaVencimiento?: string;
  tipoReferencia?: string;
  referenciaId?: number;
  comentarios?: string;
  fechaOperacion: string;
}
