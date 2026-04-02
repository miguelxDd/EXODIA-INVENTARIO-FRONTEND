export interface UbicacionResponse {
  id: number;
  bodegaId: number;
  codigo: string;
  nombre: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
}

export interface CrearUbicacionRequest {
  bodegaId: number;
  codigo: string;
  nombre: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
}

export interface ActualizarUbicacionRequest {
  nombre?: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
}
