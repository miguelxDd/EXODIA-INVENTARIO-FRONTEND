export interface ContenedorStockResponse {
  contenedorId: number;
  codigoBarras: string;
  productoId: number;
  proveedorId?: number;
  unidadId: number;
  bodegaId: number;
  ubicacionId?: number;
  precioUnitario?: number;
  numeroLote?: string;
  fechaVencimiento?: string;
  estadoCodigo: string;
  stockCantidad: number;
  cantidadReservada?: number;
  cantidadDisponible?: number;
}

export interface ProductoBodegaStockResponse {
  productoId: number;
  bodegaId: number;
  unidadId: number;
  stockCantidad: number;
}
