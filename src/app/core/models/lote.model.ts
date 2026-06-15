export interface LoteResponse {
  id: number;
  empresaId: number;
  numeroLote: string;
  productoId: number;
  fechaProduccion?: string;
  fechaVencimiento?: string;
  proveedorId?: number;
  estado: string;
  notas?: string;
  activo: boolean;
  creadoEn: string;
  modificadoEn?: string;
}

export interface ActualizarLoteRequest {
  estado?: string;
  notas?: string;
}
