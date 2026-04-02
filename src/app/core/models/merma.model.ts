export interface MermaResponse {
  id: number;
  contenedorId: number;
  cantidadMerma: number;
  tipoMerma: string;
  motivoCodigo?: string;
  comentarios?: string;
  operacionId?: number;
  creadoEn: string;
}
