export interface UnidadResponse {
  id: number;
  codigo: string;
  nombre: string;
  abreviatura?: string;
}

export interface CrearUnidadRequest {
  codigo: string;
  nombre: string;
  abreviatura?: string;
}

export interface ActualizarUnidadRequest {
  nombre?: string;
  abreviatura?: string;
}
