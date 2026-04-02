export interface ConversionUnidadResponse {
  id: number;
  unidadOrigenId: number;
  unidadDestinoId: number;
  factor: number;
  productoId?: number;
}

export interface CrearConversionUnidadRequest {
  unidadOrigenId: number;
  unidadDestinoId: number;
  factor: number;
  productoId?: number;
}

export interface ActualizarConversionUnidadRequest {
  factor?: number;
}
