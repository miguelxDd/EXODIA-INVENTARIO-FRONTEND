export interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  datos: T;
  codigoError?: string;
  timestamp: string;
}

export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}
