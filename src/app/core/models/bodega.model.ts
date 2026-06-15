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
  latitud?: number;
  longitud?: number;
  mapProvider?: string;
  mapPlaceId?: string;
  capacidadAreaM2?: number;
  capacidadVolumenM3?: number;
  capacidadPesoKg?: number;
  muellesCarga?: number;
  telefono?: string;
  email?: string;
  contactoResponsable?: string;
  horarioOperacion?: string;
  regimenTemperatura?: string;
  tipoOperacion?: string;
}

export interface CrearBodegaRequest {
  codigo: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  esProductoTerminado?: boolean;
  esConsignacion?: boolean;
  latitud?: number;
  longitud?: number;
  mapProvider?: string;
  mapPlaceId?: string;
  capacidadAreaM2?: number;
  capacidadVolumenM3?: number;
  capacidadPesoKg?: number;
  muellesCarga?: number;
  telefono?: string;
  email?: string;
  contactoResponsable?: string;
  horarioOperacion?: string;
  regimenTemperatura?: string;
  tipoOperacion?: string;
}

export interface ActualizarBodegaRequest {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  esProductoTerminado?: boolean;
  esConsignacion?: boolean;
  latitud?: number;
  longitud?: number;
  mapProvider?: string;
  mapPlaceId?: string;
  capacidadAreaM2?: number;
  capacidadVolumenM3?: number;
  capacidadPesoKg?: number;
  muellesCarga?: number;
  telefono?: string;
  email?: string;
  contactoResponsable?: string;
  horarioOperacion?: string;
  regimenTemperatura?: string;
  tipoOperacion?: string;
}
