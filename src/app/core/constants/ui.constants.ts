export const HTTP_ERROR_MESSAGES = {
  NETWORK: 'No se pudo conectar con el servidor. Verifica tu conexion a internet.',
  UNAUTHORIZED: 'Tu sesion ha expirado. Por favor inicia sesion nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta accion.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  UNPROCESSABLE_ENTITY: 'Los datos enviados no son validos. Revisa el formulario e intenta de nuevo.',
  SERVER_ERROR: 'Ocurrio un error en el servidor. Intenta de nuevo mas tarde.',
  UNEXPECTED: (status: number) => `Error inesperado (${status}). Intenta de nuevo.`,
} as const;

export const UI_MESSAGES = {
  EMPTY_VALUE: '-',
  SELECT_BODEGA: 'Selecciona una bodega para ver sus ubicaciones.',
  LOAD_BODEGAS: 'No se pudieron cargar las bodegas. Intenta de nuevo.',
  CREATE_BODEGA: 'No se pudo crear la bodega. Revisa los datos e intenta de nuevo.',
  LOAD_UBICACIONES: 'No se pudieron cargar las ubicaciones. Intenta de nuevo.',
  LOAD_UNIDADES: 'No se pudieron cargar las unidades. Intenta de nuevo.',
  LOAD_STOCK: 'No se pudo cargar el stock. Intenta de nuevo.',
  LOAD_KARDEX: 'No se pudo cargar el kardex. Intenta de nuevo.',
  LOAD_RECEPCIONES: 'No se pudieron cargar las recepciones. Intenta de nuevo.',
  LOAD_TRANSFERENCIAS: 'No se pudieron cargar las transferencias. Intenta de nuevo.',
  LOAD_AJUSTES: 'No se pudieron cargar los ajustes. Intenta de nuevo.',
  LOAD_PICKING: 'No se pudieron cargar las ordenes de picking. Intenta de nuevo.',
  LOAD_CONTEOS: 'No se pudieron cargar los conteos fisicos. Intenta de nuevo.',
  REQUIRED_FIELD: 'Este campo es obligatorio.',
} as const;
