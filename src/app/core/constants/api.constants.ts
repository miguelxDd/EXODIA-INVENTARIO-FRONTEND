import { environment } from '@env/environment';

export const API = {
  BASE_URL: environment.apiUrl,
  TIMEOUT: 30_000,

  BODEGAS: '/api/v1/bodegas',
  UBICACIONES: '/api/v1/ubicaciones',
  UNIDADES: '/api/v1/unidades',
  LOTES: '/api/v1/lotes',
  CONVERSIONES_UNIDAD: '/api/v1/conversiones-unidad',

  STOCK: '/api/v1/inventario/stock',
  KARDEX: '/api/v1/inventario/kardex',

  RECEPCIONES: '/api/v1/recepciones',
  TRANSFERENCIAS: '/api/v1/transferencias',
  AJUSTES: '/api/v1/ajustes',
  PICKING: '/api/v1/picking',
  CONTEOS: '/api/v1/conteos',
  MOVIMIENTOS: '/api/v1/movimientos/contenedores',

  RESERVAS: '/api/v1/reservas',
  MERMAS: '/api/v1/mermas',
  CONFIG_MERMA: '/api/v1/config-merma',
  CONFIG_EMPRESA: '/api/v1/configuracion-empresa',
  CONFIG_PRODUCTO: '/api/v1/configuracion-producto',
  MAXIMOS_MINIMOS: '/api/v1/maximos-minimos',
  VALORIZACION: '/api/v1/valorizacion',
  CONVERSION_INVENTARIO: '/api/v1/inventario/conversiones',
  ETIQUETAS: '/api/v1/etiquetas',
  REPORTES: '/api/v1/reportes',
  VENTAS_AJUSTE: '/api/v1/ventas-ajustes',
} as const;
