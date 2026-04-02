export interface AppNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
  readonly icon: string;
  readonly featureKey: string;
  readonly keywords: readonly string[];
}

export interface AppNavigationSection {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly items: readonly AppNavigationItem[];
}

// The shell registry is centralized so the layout can stay stable if feature areas move into remotes later on.
export const APP_NAVIGATION_SECTIONS: readonly AppNavigationSection[] = [
  {
    id: 'inventario',
    label: 'Inventario',
    description: 'Consulta operativa del stock y trazabilidad.',
    icon: 'pi pi-box',
    items: [
      {
        id: 'inventory-stock',
        label: 'Stock',
        description: 'Consulta consolidada de existencias por contenedor.',
        path: '/inventario/stock',
        icon: 'pi pi-box',
        featureKey: 'inventory.stock',
        keywords: ['existencias', 'disponible', 'contenedor', 'bodega'],
      },
      {
        id: 'inventory-kardex',
        label: 'Kardex',
        description: 'Historial de operaciones y movimientos de inventario.',
        path: '/inventario/kardex',
        icon: 'pi pi-list',
        featureKey: 'inventory.kardex',
        keywords: ['historial', 'movimientos', 'operaciones', 'trazabilidad'],
      },
    ],
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    description: 'Procesos que mueven y ajustan el inventario.',
    icon: 'pi pi-sync',
    items: [
      {
        id: 'operations-recepciones',
        label: 'Recepciones',
        description: 'Ingreso de inventario a bodegas.',
        path: '/operaciones/recepciones',
        icon: 'pi pi-download',
        featureKey: 'operations.receiving',
        keywords: ['ingreso', 'entrada', 'proveedor', 'recepcion'],
      },
      {
        id: 'operations-transferencias',
        label: 'Transferencias',
        description: 'Traslado de inventario entre bodegas.',
        path: '/operaciones/transferencias',
        icon: 'pi pi-arrows-h',
        featureKey: 'operations.transfers',
        keywords: ['traslado', 'origen', 'destino', 'transferencia'],
      },
      {
        id: 'operations-ajustes',
        label: 'Ajustes',
        description: 'Correcciones de cantidad y valorizacion.',
        path: '/operaciones/ajustes',
        icon: 'pi pi-sliders-h',
        featureKey: 'operations.adjustments',
        keywords: ['correccion', 'diferencia', 'precio', 'cantidad'],
      },
      {
        id: 'operations-picking',
        label: 'Picking',
        description: 'Preparacion de ordenes y salida de inventario.',
        path: '/operaciones/picking',
        icon: 'pi pi-shopping-cart',
        featureKey: 'operations.picking',
        keywords: ['despacho', 'salida', 'orden', 'alistamiento'],
      },
      {
        id: 'operations-conteos',
        label: 'Conteos',
        description: 'Conteos fisicos con generacion de ajustes.',
        path: '/operaciones/conteos',
        icon: 'pi pi-calculator',
        featureKey: 'operations.cycle-counts',
        keywords: ['inventario fisico', 'conteo', 'auditoria', 'revision'],
      },
    ],
  },
  {
    id: 'catalogos',
    label: 'Catálogos',
    description: 'Configuraciones base del inventario.',
    icon: 'pi pi-folder-open',
    items: [
      {
        id: 'catalogs-bodegas',
        label: 'Bodegas',
        description: 'Administracion de bodegas y centros de almacenamiento.',
        path: '/catalogos/bodegas',
        icon: 'pi pi-warehouse',
        featureKey: 'catalogs.warehouses',
        keywords: ['almacen', 'centro', 'bodega', 'ubicacion general'],
      },
      {
        id: 'catalogs-ubicaciones',
        label: 'Ubicaciones',
        description: 'Posiciones y zonas dentro de cada bodega.',
        path: '/catalogos/ubicaciones',
        icon: 'pi pi-map-marker',
        featureKey: 'catalogs.locations',
        keywords: ['rack', 'zona', 'pasillo', 'ubicacion'],
      },
      {
        id: 'catalogs-unidades',
        label: 'Unidades',
        description: 'Unidades de medida para operar inventario.',
        path: '/catalogos/unidades',
        icon: 'pi pi-hashtag',
        featureKey: 'catalogs.units',
        keywords: ['medida', 'unidad', 'conversion', 'empaque'],
      },
    ],
  },
] as const;

export const APP_NAVIGATION_ITEMS: readonly AppNavigationItem[] = APP_NAVIGATION_SECTIONS.flatMap(section => section.items);

export const SHELL_UI = {
  MENU_TITLE: 'Menú principal',
  MENU_HELPER: 'Encuentra rápido la pantalla que necesitas.',
  SEARCH_PLACEHOLDER: 'Buscar sección o pantalla',
  SEARCH_ARIA_LABEL: 'Buscar dentro del menú principal',
  SEARCH_EMPTY: 'No encontramos una pantalla con ese nombre. Prueba con otra palabra.',
  MENU_BUTTON_ARIA: 'Abrir menú principal',
  THEME_ARIA_LABEL: 'Cambiar entre tema claro y oscuro',
  CURRENT_LOCATION_LABEL: 'Estás en',
  MENU_AVAILABLE_LABEL: 'Opciones disponibles',
  MODULE_COUNT_LABEL: (count: number) => `${count} módulo${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}`,
  SEARCH_RESULT_LABEL: (count: number, query: string) =>
    `${count} resultado${count === 1 ? '' : 's'} para "${query}"`,
} as const;
