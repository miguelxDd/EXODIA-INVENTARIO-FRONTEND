export interface UbicacionResponse {
  id: number;
  bodegaId: number;
  codigo: string;
  nombre: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
  zona?: string;
  subzona?: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  posicion?: string;
  tipoZona?: string;
  ambiente?: string;
  anchoCm?: number;
  altoCm?: number;
  profundidadCm?: number;
  volumenMaximoM3?: number;
  pesoMaximoKg?: number;
  permitePicking?: boolean;
  permiteReserva?: boolean;
  permiteCuarentena?: boolean;
}

export interface CrearUbicacionRequest {
  bodegaId: number;
  codigo: string;
  nombre: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
  zona?: string;
  subzona?: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  posicion?: string;
  tipoZona?: string;
  ambiente?: string;
  anchoCm?: number;
  altoCm?: number;
  profundidadCm?: number;
  volumenMaximoM3?: number;
  pesoMaximoKg?: number;
  permitePicking?: boolean;
  permiteReserva?: boolean;
  permiteCuarentena?: boolean;
}

export interface ActualizarUbicacionRequest {
  nombre?: string;
  codigoBarras?: string;
  tipoUbicacion?: string;
  zona?: string;
  subzona?: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  posicion?: string;
  tipoZona?: string;
  ambiente?: string;
  anchoCm?: number;
  altoCm?: number;
  profundidadCm?: number;
  volumenMaximoM3?: number;
  pesoMaximoKg?: number;
  permitePicking?: boolean;
  permiteReserva?: boolean;
  permiteCuarentena?: boolean;
}
