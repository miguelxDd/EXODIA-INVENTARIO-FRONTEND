export interface BodegaResponse {
  id: number;
  codigo: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  esProductoTerminado?: boolean;
  esConsignacion?: boolean;
  ubicacionStandbyId?: number;
}

export interface CrearBodegaRequest {
  codigo: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  esProductoTerminado?: boolean;
  esConsignacion?: boolean;
}

export interface ActualizarBodegaRequest {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  esProductoTerminado?: boolean;
  esConsignacion?: boolean;
}
