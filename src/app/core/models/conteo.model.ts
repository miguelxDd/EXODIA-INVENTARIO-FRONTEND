export interface ConteoFisicoResponse {
  id: number;
  numeroConteo: string;
  bodegaId: number;
  estado: string;
  fechaConteo: string;
  comentarios?: string;
  ajusteGeneradoId?: number;
  lineas: ConteoLineaResponse[];
  creadoEn: string;
}

export interface ConteoLineaResponse {
  id: number;
  contenedorId: number;
  cantidadSistema: number;
  cantidadContada: number;
  diferencia: number;
  aplicado?: boolean;
}

export interface CrearConteoFisicoRequest {
  bodegaId: number;
  comentarios?: string;
}

export interface RegistrarConteoLineaRequest {
  contenedorId: number;
  cantidadContada: number;
}
