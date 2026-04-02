export interface RecepcionResponse {
  id: number;
  numeroRecepcion: string;
  bodegaId: number;
  tipoRecepcion: string;
  referenciaOrigenId?: number;
  proveedorId?: number;
  estado: string;
  comentarios?: string;
  lineas: RecepcionLineaResponse[];
  creadoEn: string;
}

export interface RecepcionLineaResponse {
  id: number;
  contenedorId: number;
  codigoBarras: string;
  productoId: number;
  unidadId: number;
  ubicacionId: number;
  cantidad: number;
  precioUnitario?: number;
  numeroLote?: string;
  fechaVencimiento?: string;
  barcodeGenerado?: boolean;
  barcodeReutilizado?: boolean;
}

export interface CrearRecepcionRequest {
  bodegaId: number;
  tipoRecepcion: string;
  referenciaOrigenId?: number;
  proveedorId?: number;
  comentarios?: string;
  lineas: RecepcionLineaRequest[];
}

export interface RecepcionLineaRequest {
  productoId: number;
  unidadId: number;
  ubicacionId: number;
  cantidad: number;
  cantidadMerma?: number;
  precioUnitario?: number;
  numeroLote?: string;
  fechaVencimiento?: string;
  proveedorId?: number;
  codigoBarras?: string;
}
