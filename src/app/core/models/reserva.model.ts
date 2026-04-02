export interface ReservaResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  productoId: number;
  bodegaId: number;
  cantidadReservada: number;
  cantidadCumplida?: number;
  cantidadPendiente?: number;
  estado: string;
  tipoReferencia?: string;
  referenciaId?: number;
  fechaExpiracion?: string;
  creadoEn: string;
}
