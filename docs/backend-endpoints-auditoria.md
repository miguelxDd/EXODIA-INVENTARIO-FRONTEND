# Auditoria de endpoints backend vs frontend

Fecha de revision: 2026-04-02

## Alcance

Esta auditoria cruza:

- Backend Spring Boot ubicado en `../inventario`
- Frontend Angular ubicado en `Exodia-inv-front/`
- Constantes API en `src/app/core/constants/api.constants.ts`
- Servicios en `src/app/core/services/`
- Pantallas y rutas en `src/app/features/`

## Resumen ejecutivo

- El backend expone 23 controladores y 92 operaciones HTTP.
- El frontend consume 11 operaciones directamente desde pantalla.
- Hay 44 operaciones con servicio Angular creado, pero todavia sin flujo real de UI o con UI parcial.
- Hay 37 operaciones que siguen pendientes de crear/conectar en frontend.
- Hay 2 desalineaciones claras de rutas ya detectadas en el frontend:
  - `API.REPORTES` apunta a `/api/v1/reportes/inventario`, pero el backend expone `/api/v1/reportes`.
  - `API.VENTAS_AJUSTE` apunta a `/api/v1/ventas/ajuste`, pero el backend expone `/api/v1/ventas-ajustes`.
- Hay 1 posible inconsistencia adicional:
  - `GET /api/v1/mermas` usa `Pageable` directo. Si no existe configuracion global extra, esperaria `page/size/sort` y no `pagina/tamanio` como el resto del backend.

## Contrato comun

### Headers

- `X-Empresa-Id`: requerido en practicamente todos los endpoints revisados.
- `Authorization: Bearer <token>`: el frontend lo adjunta si encuentra token en `localStorage`.

### Respuesta estandar

La mayoria de endpoints responde con:

```json
{
  "exito": true,
  "mensaje": "Operacion exitosa",
  "datos": {},
  "codigoError": null,
  "timestamp": "2026-04-02T10:00:00Z"
}
```

### Paginacion

Patron dominante del backend:

- `pagina`
- `tamanio`

Shape comun:

```json
{
  "contenido": [],
  "pagina": 0,
  "tamanio": 20,
  "totalElementos": 0,
  "totalPaginas": 0,
  "primera": true,
  "ultima": true
}
```

## Leyenda de estado

- `UI`: ya se consume desde una pantalla del frontend.
- `Servicio`: existe servicio Angular, pero no hay flujo visible en pantalla o el boton no esta cableado.
- `Pendiente`: no existe servicio Angular ni pantalla.
- `Desalineado`: existe referencia en frontend, pero la ruta no coincide con el backend.

## Hallazgos de UI

- `Bodegas` es el unico catalogo que hoy ya lista y crea desde UI.
- `Ubicaciones`, `Unidades`, `Stock`, `Kardex`, `Recepciones`, `Transferencias`, `Ajustes`, `Picking` y `Conteos` solo tienen flujo de listado.
- En `Recepciones`, `Transferencias`, `Ajustes`, `Picking` y `Conteos` ya hay botones tipo "Nuevo...", pero no tienen accion conectada.
- En `Transferencias` ya aparecen botones visuales para `Confirmar` y `Despachar`, pero no estan enlazados a los metodos del servicio.
- En `Picking` ya aparece el boton `Ejecutar`, pero no esta enlazado.
- En `Conteos` ya aparece el boton `Aplicar`, pero no esta enlazado.
- `Conversiones de unidad` y `Movimientos de contenedores` ya tienen servicio Angular, pero todavia no tienen ruta ni pagina.

## Catalogos

### Bodegas

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearBodegaRequest`: `codigo`, `nombre`, `direccion?`, `ciudad?`, `pais?`, `esProductoTerminado?`, `esConsignacion?`
- `ActualizarBodegaRequest`: `nombre?`, `direccion?`, `ciudad?`, `pais?`, `esProductoTerminado?`, `esConsignacion?`

Respuesta principal:

- `BodegaResponse`: `id`, `codigo`, `nombre`, `direccion`, `ciudad`, `pais`, `esProductoTerminado`, `esConsignacion`, `ubicacionStandbyId`

Endpoints:

- `POST /api/v1/bodegas`
  - Estado front: `UI`
  - Envia: body `CrearBodegaRequest`
  - Responde: `ApiResponse<BodegaResponse>`
  - Uso: crear una nueva bodega de la empresa
- `GET /api/v1/bodegas/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<BodegaResponse>`
  - Uso: ver detalle de una bodega
- `GET /api/v1/bodegas`
  - Estado front: `UI`
  - Envia: sin query params
  - Responde: `ApiResponse<List<BodegaResponse>>`
  - Uso: listar bodegas disponibles
- `PATCH /api/v1/bodegas/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `ActualizarBodegaRequest`
  - Responde: `ApiResponse<BodegaResponse>`
  - Uso: actualizar datos de una bodega
- `DELETE /api/v1/bodegas/{id}/desactivar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar bodega sin borrado fisico

### Ubicaciones

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearUbicacionRequest`: `bodegaId`, `codigo`, `nombre`, `codigoBarras?`, `tipoUbicacion?`
- `ActualizarUbicacionRequest`: `nombre?`, `codigoBarras?`, `tipoUbicacion?`

Respuesta principal:

- `UbicacionResponse`: `id`, `bodegaId`, `codigo`, `nombre`, `codigoBarras`, `tipoUbicacion`

Endpoints:

- `POST /api/v1/ubicaciones`
  - Estado front: `Servicio`
  - Envia: body `CrearUbicacionRequest`
  - Responde: `ApiResponse<UbicacionResponse>`
  - Uso: crear ubicacion operativa o de apoyo dentro de una bodega
- `GET /api/v1/ubicaciones/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<UbicacionResponse>`
  - Uso: ver detalle de una ubicacion
- `GET /api/v1/ubicaciones?bodegaId={id}`
  - Estado front: `UI`
  - Envia: `bodegaId`
  - Responde: `ApiResponse<List<UbicacionResponse>>`
  - Uso: listar ubicaciones por bodega
- `PATCH /api/v1/ubicaciones/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `ActualizarUbicacionRequest`
  - Responde: `ApiResponse<UbicacionResponse>`
  - Uso: ajustar nombre, barcode o tipo de ubicacion
- `DELETE /api/v1/ubicaciones/{id}/desactivar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar ubicacion

### Unidades

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearUnidadRequest`: `codigo`, `nombre`, `abreviatura?`
- `ActualizarUnidadRequest`: `nombre?`, `abreviatura?`

Respuesta principal:

- `UnidadResponse`: `id`, `codigo`, `nombre`, `abreviatura`

Endpoints:

- `POST /api/v1/unidades`
  - Estado front: `Servicio`
  - Envia: body `CrearUnidadRequest`
  - Responde: `ApiResponse<UnidadResponse>`
  - Uso: crear unidad de medida
- `GET /api/v1/unidades/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<UnidadResponse>`
  - Uso: ver detalle de una unidad
- `GET /api/v1/unidades`
  - Estado front: `UI`
  - Envia: sin query params
  - Responde: `ApiResponse<List<UnidadResponse>>`
  - Uso: listar unidades de la empresa
- `PATCH /api/v1/unidades/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `ActualizarUnidadRequest`
  - Responde: `ApiResponse<UnidadResponse>`
  - Uso: actualizar nombre o abreviatura
- `DELETE /api/v1/unidades/{id}/desactivar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar unidad

### Conversiones de unidad

Estado general: `Solo servicio`

Payloads:

- `CrearConversionUnidadRequest`: `unidadOrigenId`, `unidadDestinoId`, `factorConversion`, `tipoOperacion`, `productoId?`
- `ActualizarConversionUnidadRequest`: `factorConversion?`, `tipoOperacion?`

Respuesta principal:

- `ConversionUnidadResponse`: `id`, `unidadOrigenId`, `unidadOrigenCodigo`, `unidadDestinoId`, `unidadDestinoCodigo`, `factorConversion`, `tipoOperacion`, `productoId`

Endpoints:

- `POST /api/v1/conversiones-unidad`
  - Estado front: `Servicio`
  - Envia: body `CrearConversionUnidadRequest`
  - Responde: `ApiResponse<ConversionUnidadResponse>`
  - Uso: crear regla de conversion entre unidades
- `GET /api/v1/conversiones-unidad/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<ConversionUnidadResponse>`
  - Uso: ver detalle de una conversion
- `GET /api/v1/conversiones-unidad`
  - Estado front: `Servicio`
  - Envia: sin query params
  - Responde: `ApiResponse<List<ConversionUnidadResponse>>`
  - Uso: listar reglas de conversion
- `PATCH /api/v1/conversiones-unidad/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `ActualizarConversionUnidadRequest`
  - Responde: `ApiResponse<ConversionUnidadResponse>`
  - Uso: actualizar factor o tipo de operacion
- `DELETE /api/v1/conversiones-unidad/{id}/desactivar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar conversion

## Inventario

### Stock

Estado general: `Servicio + UI parcial`

Respuesta principal:

- `ContenedorStockResponse`: `contenedorId`, `codigoBarras`, `productoId`, `proveedorId`, `unidadId`, `bodegaId`, `ubicacionId`, `precioUnitario`, `numeroLote`, `fechaVencimiento`, `estadoCodigo`, `stockCantidad`, `cantidadReservada`, `cantidadDisponible`
- `ProductoBodegaStockResponse`: `productoId`, `bodegaId`, `unidadId`, `stockCantidad`

Endpoints:

- `GET /api/v1/inventario/stock/contenedor/{contenedorId}`
  - Estado front: `Servicio`
  - Envia: `contenedorId` por path
  - Responde: `ApiResponse<BigDecimal>`
  - Uso: consultar stock puntual de un contenedor
- `GET /api/v1/inventario/stock/barcode/{codigoBarras}`
  - Estado front: `Servicio`
  - Envia: `codigoBarras` por path
  - Responde: `ApiResponse<BigDecimal>`
  - Uso: consultar stock por barcode
- `GET /api/v1/inventario/stock/producto-bodega?productoId=&bodegaId=`
  - Estado front: `Servicio`
  - Envia: `productoId`, `bodegaId`
  - Responde: `ApiResponse<BigDecimal>`
  - Uso: obtener stock total de un producto en una bodega
- `GET /api/v1/inventario/stock/consolidado`
  - Estado front: `UI`
  - Envia: query opcional `bodegaId`, `productoId`, `proveedorId`, `codigoBarras`, `numeroLote`, `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<ContenedorStockResponse>>`
  - Uso: vista principal de stock consolidado
- `GET /api/v1/inventario/stock/agrupado`
  - Estado front: `Servicio`
  - Envia: query opcional `bodegaId`, `productoId`
  - Responde: `ApiResponse<List<ProductoBodegaStockResponse>>`
  - Uso: resumen de stock por producto y bodega
- `GET /api/v1/inventario/stock/proximos-a-vencer`
  - Estado front: `Servicio`
  - Envia: query opcional `bodegaId`
  - Responde: `ApiResponse<List<ContenedorStockResponse>>`
  - Uso: alertas de vencimiento
- `GET /api/v1/inventario/stock/disponible-fefo`
  - Estado front: `Servicio`
  - Envia: `productoId`, `bodegaId`
  - Responde: `ApiResponse<List<ContenedorStockResponse>>`
  - Uso: seleccionar stock disponible segun FEFO

### Kardex

Estado general: `UI`

Respuesta principal:

- `OperacionResponse`: `id`, `contenedorId`, `codigoBarras`, `productoId`, `bodegaId`, `ubicacionId`, `unidadId`, `tipoOperacionCodigo`, `cantidad`, `precioUnitario`, `numeroLote`, `fechaVencimiento`, `tipoReferencia`, `referenciaId`, `comentarios`, `fechaOperacion`

Endpoints:

- `GET /api/v1/inventario/kardex`
  - Estado front: `UI`
  - Envia: query opcional `contenedorId`, `codigoBarras`, `productoId`, `bodegaId`, `fechaDesde`, `fechaHasta`, `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<OperacionResponse>>`
  - Uso: consultar historial de movimientos de inventario

### Conversion de inventario

Estado general: `Pendiente`

Payloads:

- `ConvertirInventarioRequest`: `contenedorId`, `unidadDestinoId`, `cantidadOrigen`, `comentarios?`

Respuesta principal:

- `ConversionInventarioResponse`: `contenedorOrigenId`, `codigoBarrasOrigen`, `contenedorDestinoId`, `codigoBarrasDestino`, `unidadOrigenId`, `unidadDestinoId`, `cantidadOrigen`, `cantidadDestino`, `precioUnitarioOrigen`, `precioUnitarioDestino`, `conversionTotal`, `operacionSalidaId`, `operacionEntradaId`

Endpoints:

- `POST /api/v1/inventario/conversiones`
  - Estado front: `Pendiente`
  - Envia: body `ConvertirInventarioRequest`
  - Responde: `ApiResponse<ConversionInventarioResponse>`
  - Uso: convertir stock operativo de una unidad a otra partiendo de un contenedor

## Operaciones

### Recepciones

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearRecepcionRequest`: `bodegaId`, `tipoRecepcion`, `referenciaOrigenId?`, `proveedorId?`, `comentarios?`, `lineas[]`
- `RecepcionLineaRequest`: `productoId`, `unidadId`, `ubicacionId`, `cantidad`, `cantidadMerma?`, `precioUnitario?`, `numeroLote?`, `fechaVencimiento?`, `proveedorId?`, `codigoBarras?`

Endpoints:

- `POST /api/v1/recepciones`
  - Estado front: `Servicio`
  - Envia: body `CrearRecepcionRequest`
  - Responde: `ApiResponse<RecepcionResponse>`
  - Uso: ingresar mercaderia o producto al inventario
- `GET /api/v1/recepciones/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<RecepcionResponse>`
  - Uso: ver detalle de una recepcion
- `GET /api/v1/recepciones`
  - Estado front: `UI`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<RecepcionResponse>>`
  - Uso: listar recepciones registradas

Observacion UI:

- Ya existe boton `Nueva Recepcion`, pero no esta conectado al `POST /api/v1/recepciones`.

### Transferencias

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearTransferenciaRequest`: `bodegaOrigenId`, `bodegaDestinoId`, `tipoTransferencia`, `comentarios?`, `lineas[]`
- `TransferenciaLineaRequest`: `productoId`, `unidadId`, `cantidadSolicitada`, `contenedorId?`
- `RecibirTransferenciaRequest`: `ubicacionDestinoId`, `contenedores[]`
- `RecibirTransferenciaRequest.RecepcionContenedorRequest`: `contenedorId`, `cantidadRecibida?`

Endpoints:

- `POST /api/v1/transferencias`
  - Estado front: `Servicio`
  - Envia: body `CrearTransferenciaRequest`
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: crear transferencia entre bodegas
- `GET /api/v1/transferencias/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: ver detalle de una transferencia
- `GET /api/v1/transferencias`
  - Estado front: `UI`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<TransferenciaResponse>>`
  - Uso: listar transferencias
- `PATCH /api/v1/transferencias/{id}/confirmar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: pasar transferencia de borrador a confirmada
- `PATCH /api/v1/transferencias/{id}/despachar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: despachar transferencia y generar salidas de inventario
- `PATCH /api/v1/transferencias/{id}/recibir`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `RecibirTransferenciaRequest`
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: recibir contenedores en bodega destino
- `PATCH /api/v1/transferencias/{id}/cancelar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<TransferenciaResponse>`
  - Uso: cancelar transferencia en estados permitidos

Observacion UI:

- El listado ya existe.
- Los botones visuales `Confirmar` y `Despachar` existen, pero no llaman al servicio.
- El boton `Nueva Transferencia` todavia no tiene flujo.

### Ajustes

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearAjusteRequest`: `bodegaId`, `tipoAjusteCodigo`, `motivo?`, `lineas[]`
- `AjusteLineaRequest`: `contenedorId`, `cantidadNueva?`, `precioNuevo?`

Endpoints:

- `POST /api/v1/ajustes`
  - Estado front: `Servicio`
  - Envia: body `CrearAjusteRequest`
  - Responde: `ApiResponse<AjusteResponse>`
  - Uso: ajustar cantidad y/o precio de inventario
- `GET /api/v1/ajustes/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<AjusteResponse>`
  - Uso: ver detalle de un ajuste
- `GET /api/v1/ajustes`
  - Estado front: `UI`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<AjusteResponse>>`
  - Uso: listar ajustes aplicados

Observacion UI:

- El boton `Nuevo Ajuste` todavia no tiene flujo.

### Picking

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearOrdenPickingRequest`: `bodegaId`, `tipoPicking`, `tipoReferencia?`, `referenciaId?`, `comentarios?`, `lineas[]`
- `PickingLineaRequest`: `productoId`, `unidadId`, `cantidadSolicitada`, `contenedorId?`

Endpoints:

- `POST /api/v1/picking`
  - Estado front: `Servicio`
  - Envia: body `CrearOrdenPickingRequest`
  - Responde: `ApiResponse<OrdenPickingResponse>`
  - Uso: crear orden de picking
- `PATCH /api/v1/picking/{id}/ejecutar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<OrdenPickingResponse>`
  - Uso: ejecutar picking segun politica de salida
- `GET /api/v1/picking/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<OrdenPickingResponse>`
  - Uso: ver detalle de una orden
- `GET /api/v1/picking`
  - Estado front: `UI`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<OrdenPickingResponse>>`
  - Uso: listar ordenes de picking
- `PATCH /api/v1/picking/{id}/cancelar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<OrdenPickingResponse>`
  - Uso: cancelar orden pendiente

Observacion UI:

- El boton `Nueva Orden` no esta conectado.
- El boton `Ejecutar` ya aparece en tabla, pero no llama al servicio.

### Conteos fisicos

Estado general: `Servicio + UI parcial`

Payloads:

- `CrearConteoFisicoRequest`: `bodegaId`, `comentarios?`
- `RegistrarConteoLineaRequest`: `contenedorId`, `cantidadContada`

Endpoints:

- `POST /api/v1/conteos`
  - Estado front: `Servicio`
  - Envia: body `CrearConteoFisicoRequest`
  - Responde: `ApiResponse<ConteoFisicoResponse>`
  - Uso: abrir conteo fisico
- `POST /api/v1/conteos/{id}/lineas`
  - Estado front: `Servicio`
  - Envia: `id` por path + body `RegistrarConteoLineaRequest`
  - Responde: `ApiResponse<ConteoFisicoResponse>`
  - Uso: registrar conteos por contenedor
- `PATCH /api/v1/conteos/{id}/aplicar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<ConteoFisicoResponse>`
  - Uso: aplicar diferencias y generar ajustes
- `GET /api/v1/conteos/{id}`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<ConteoFisicoResponse>`
  - Uso: ver detalle del conteo
- `GET /api/v1/conteos`
  - Estado front: `UI`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<ConteoFisicoResponse>>`
  - Uso: listar conteos fisicos
- `PATCH /api/v1/conteos/{id}/cancelar`
  - Estado front: `Servicio`
  - Envia: `id` por path
  - Responde: `ApiResponse<ConteoFisicoResponse>`
  - Uso: cancelar conteo en progreso

Observacion UI:

- El boton `Nuevo Conteo` no esta conectado.
- El boton `Aplicar` ya aparece en tabla, pero no llama al servicio.

### Movimientos de contenedores

Estado general: `Solo servicio`

Payloads:

- `MoverContenedorRequest`: `ubicacionDestinoId`, `comentarios?`
- `OperacionContenedorRequest`: `comentarios?`

Endpoints:

- `POST /api/v1/movimientos/contenedores/{contenedorId}/mover`
  - Estado front: `Servicio`
  - Envia: `contenedorId` por path + body `MoverContenedorRequest`
  - Responde: `ApiResponse<MovimientoContenedorResponse>`
  - Uso: mover contenedor a otra ubicacion
- `POST /api/v1/movimientos/contenedores/{contenedorId}/enviar-standby`
  - Estado front: `Servicio`
  - Envia: `contenedorId` por path + body opcional `OperacionContenedorRequest`
  - Responde: `ApiResponse<MovimientoContenedorResponse>`
  - Uso: mandar contenedor a standby
- `POST /api/v1/movimientos/contenedores/{contenedorId}/sacar-standby`
  - Estado front: `Servicio`
  - Envia: `contenedorId` por path + body `MoverContenedorRequest`
  - Responde: `ApiResponse<MovimientoContenedorResponse>`
  - Uso: sacar contenedor de standby

### Reservas

Estado general: `Pendiente`

Payloads:

- `CrearReservaRequest`: `contenedorId`, `cantidadReservada`, `tipoReferencia`, `referenciaId`, `referenciaLineaId?`, `fechaExpiracion?`

Respuesta principal:

- `ReservaResponse`: `id`, `contenedorId`, `codigoBarras`, `productoId`, `bodegaId`, `cantidadReservada`, `cantidadCumplida`, `cantidadPendiente`, `estado`, `tipoReferencia`, `referenciaId`, `fechaExpiracion`, `creadoEn`

Endpoints:

- `POST /api/v1/reservas`
  - Estado front: `Pendiente`
  - Envia: body `CrearReservaRequest`
  - Responde: `ApiResponse<ReservaResponse>`
  - Uso: reservar stock contra una referencia operativa
- `GET /api/v1/reservas/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `ApiResponse<ReservaResponse>`
  - Uso: ver detalle de una reserva
- `GET /api/v1/reservas/contenedor/{contenedorId}`
  - Estado front: `Pendiente`
  - Envia: `contenedorId` por path
  - Responde: `ApiResponse<List<ReservaResponse>>`
  - Uso: listar reservas activas de un contenedor
- `PATCH /api/v1/reservas/{id}/cancelar`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `ApiResponse<ReservaResponse>`
  - Uso: cancelar reserva activa

### Ajuste por venta facturada

Estado general: `Pendiente + ruta frontend desalineada`

Payloads:

- `CrearAjusteVentaRequest`: `bodegaId`, `ventaId`, `comentarios?`, `lineas[]`
- `AjusteVentaLineaRequest`: `productoId`, `unidadId`, `cantidad`, `contenedorId?`, `referenciaLineaId?`

Endpoints:

- `POST /api/v1/ventas-ajustes`
  - Estado front: `Pendiente`
  - Envia: body `CrearAjusteVentaRequest`
  - Responde: `ApiResponse<AjusteResponse>`
  - Uso: descontar inventario por venta facturada

Observacion:

- La constante actual del frontend esta mal: `'/api/v1/ventas/ajuste'`.

## Configuracion y extensiones

### Configuracion de empresa

Estado general: `Pendiente`

Payloads:

- `ActualizarConfiguracionEmpresaRequest`: `expiracionReservaHoras?`, `diasAlertaVencimiento?`, `barcodePrefijo?`, `barcodeLongitudPadding?`, `politicaSalida?`

Respuesta principal:

- `ConfiguracionEmpresaResponse`: `id`, `empresaId`, `expiracionReservaHoras`, `diasAlertaVencimiento`, `barcodePrefijo`, `barcodeLongitudPadding`, `politicaSalida`, `modificadoEn`

Endpoints:

- `GET /api/v1/configuracion-empresa`
  - Estado front: `Pendiente`
  - Envia: sin query params
  - Responde: `ApiResponse<ConfiguracionEmpresaResponse>`
  - Uso: cargar parametros globales de inventario por empresa
- `PATCH /api/v1/configuracion-empresa`
  - Estado front: `Pendiente`
  - Envia: body `ActualizarConfiguracionEmpresaRequest`
  - Responde: `ApiResponse<ConfiguracionEmpresaResponse>`
  - Uso: actualizar politica de salida, alertas y configuracion de barcode

### Configuracion de merma

Estado general: `Pendiente`

Payloads:

- `CrearConfigMermaRequest`: `productoId?`, `bodegaId?`, `tipoMerma`, `porcentajeMerma?`, `cantidadFijaMerma?`, `frecuenciaDias?`
- `ActualizarConfigMermaRequest`: `tipoMerma?`, `porcentajeMerma?`, `cantidadFijaMerma?`, `frecuenciaDias?`

Respuesta principal:

- `ConfigMermaResponse`: `id`, `productoId`, `bodegaId`, `tipoMerma`, `porcentajeMerma`, `cantidadFijaMerma`, `frecuenciaDias`, `activo`, `creadoEn`

Endpoints:

- `POST /api/v1/config-merma`
  - Estado front: `Pendiente`
  - Envia: body `CrearConfigMermaRequest`
  - Responde: `ApiResponse<ConfigMermaResponse>`
  - Uso: crear reglas de merma por producto y/o bodega
- `GET /api/v1/config-merma/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `ApiResponse<ConfigMermaResponse>`
  - Uso: ver configuracion puntual de merma
- `GET /api/v1/config-merma`
  - Estado front: `Pendiente`
  - Envia: sin query params
  - Responde: `ApiResponse<List<ConfigMermaResponse>>`
  - Uso: listar reglas activas de merma
- `PATCH /api/v1/config-merma/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path + body `ActualizarConfigMermaRequest`
  - Responde: `ApiResponse<ConfigMermaResponse>`
  - Uso: actualizar regla de merma
- `DELETE /api/v1/config-merma/{id}/desactivar`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar regla de merma

### Configuracion de producto

Estado general: `Pendiente`

Payloads:

- `CrearConfiguracionProductoRequest`: `productoId`, `manejaLote?`, `manejaVencimiento?`, `toleranciaMerma?`, `unidadBaseId?`
- `ActualizarConfiguracionProductoRequest`: `manejaLote?`, `manejaVencimiento?`, `toleranciaMerma?`, `unidadBaseId?`

Respuesta principal:

- `ConfiguracionProductoResponse`: `id`, `productoId`, `manejaLote`, `manejaVencimiento`, `toleranciaMerma`, `unidadBaseId`, `activo`, `modificadoEn`

Endpoints:

- `POST /api/v1/configuracion-producto`
  - Estado front: `Pendiente`
  - Envia: body `CrearConfiguracionProductoRequest`
  - Responde: `ApiResponse<ConfiguracionProductoResponse>`
  - Uso: parametrizar manejo de lote, vencimiento y unidad base por producto
- `GET /api/v1/configuracion-producto/{productoId}`
  - Estado front: `Pendiente`
  - Envia: `productoId` por path
  - Responde: `ApiResponse<ConfiguracionProductoResponse>`
  - Uso: obtener o inicializar configuracion de producto
- `GET /api/v1/configuracion-producto`
  - Estado front: `Pendiente`
  - Envia: sin query params
  - Responde: `ApiResponse<List<ConfiguracionProductoResponse>>`
  - Uso: listar configuraciones activas por empresa
- `PATCH /api/v1/configuracion-producto/{productoId}`
  - Estado front: `Pendiente`
  - Envia: `productoId` por path + body `ActualizarConfiguracionProductoRequest`
  - Responde: `ApiResponse<ConfiguracionProductoResponse>`
  - Uso: actualizar configuracion de producto

### Maximos y minimos

Estado general: `Pendiente`

Payloads:

- `CrearMaximoMinimoRequest`: `productoId`, `bodegaId`, `unidadId`, `stockMinimo`, `stockMaximo`, `puntoReorden?`
- `ActualizarMaximoMinimoRequest`: `stockMinimo?`, `stockMaximo?`, `puntoReorden?`

Respuesta principal:

- `MaximoMinimoResponse`: `id`, `productoId`, `bodegaId`, `unidadId`, `stockMinimo`, `stockMaximo`, `puntoReorden`, `stockActualCalculado`, `ultimaVerificacion`, `activo`

Endpoints:

- `POST /api/v1/maximos-minimos`
  - Estado front: `Pendiente`
  - Envia: body `CrearMaximoMinimoRequest`
  - Responde: `ApiResponse<MaximoMinimoResponse>`
  - Uso: crear regla de reabastecimiento
- `GET /api/v1/maximos-minimos/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `ApiResponse<MaximoMinimoResponse>`
  - Uso: ver configuracion puntual
- `GET /api/v1/maximos-minimos?bodegaId={id}`
  - Estado front: `Pendiente`
  - Envia: `bodegaId`
  - Responde: `ApiResponse<List<MaximoMinimoResponse>>`
  - Uso: listar configuraciones por bodega
- `PATCH /api/v1/maximos-minimos/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path + body `ActualizarMaximoMinimoRequest`
  - Responde: `ApiResponse<MaximoMinimoResponse>`
  - Uso: actualizar minimos, maximos o punto de reorden
- `DELETE /api/v1/maximos-minimos/{id}/desactivar`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `204 No Content`
  - Uso: desactivar regla de reabastecimiento

### Mermas

Estado general: `Pendiente`

Payloads:

- `CrearMermaRequest`: `contenedorId`, `cantidadMerma`, `motivoCodigo?`, `comentarios?`

Respuesta principal:

- `MermaResponse`: `id`, `contenedorId`, `cantidadMerma`, `tipoMerma`, `motivoCodigo`, `comentarios`, `operacionId`, `creadoEn`

Endpoints:

- `POST /api/v1/mermas`
  - Estado front: `Pendiente`
  - Envia: body `CrearMermaRequest`
  - Responde: `ApiResponse<MermaResponse>`
  - Uso: registrar merma manual sobre un contenedor
- `GET /api/v1/mermas/{id}`
  - Estado front: `Pendiente`
  - Envia: `id` por path
  - Responde: `ApiResponse<MermaResponse>`
  - Uso: ver detalle de una merma
- `GET /api/v1/mermas`
  - Estado front: `Pendiente`
  - Envia: paginacion via `Pageable` directo; revisar si espera `page/size/sort`
  - Responde: `ApiResponse<PaginaResponse<MermaResponse>>`
  - Uso: listar mermas registradas

Observacion:

- Este endpoint no sigue el patron explicito `pagina/tamanio` del resto del backend.

### Valorizacion

Estado general: `Pendiente`

Respuesta principal:

- `FotoCostoResponse`: `id`, `productoId`, `bodegaId`, `unidadId`, `cantidadStock`, `costoUnitario`, `costoTotal`, `metodoCosto`, `fechaFoto`

Endpoints:

- `POST /api/v1/valorizacion/foto-costo`
  - Estado front: `Pendiente`
  - Envia: sin body
  - Responde: `ApiResponse<Void>`
  - Uso: generar snapshot de costo del inventario actual
- `GET /api/v1/valorizacion/fotos-costo`
  - Estado front: `Pendiente`
  - Envia: `pagina`, `tamanio`
  - Responde: `ApiResponse<PaginaResponse<FotoCostoResponse>>`
  - Uso: listar fotos de costo historicas

### Reportes

Estado general: `Pendiente + ruta frontend desalineada`

Respuesta principal:

- `AuxiliarInventarioResponse`: `empresaId`, `productoId`, `bodegaId`, `fechaDesde`, `fechaHasta`, `saldoInicialCantidad`, `saldoInicialValor`, `totalEntradas`, `totalSalidas`, `saldoFinalCantidad`, `saldoFinalValor`, `movimientos`
- `ValorizacionActualResponse`: `productoId`, `bodegaId`, `unidadId`, `cantidadStock`, `costoUnitario`, `costoTotal`

Endpoints:

- `GET /api/v1/reportes/auxiliar-inventario`
  - Estado front: `Pendiente`
  - Envia: `productoId`, `bodegaId?`, `fechaDesde?`, `fechaHasta?`
  - Responde: `ApiResponse<AuxiliarInventarioResponse>`
  - Uso: reconstruir auxiliar valorizado de inventario
- `GET /api/v1/reportes/auxiliar-inventario/exportar-csv`
  - Estado front: `Pendiente`
  - Envia: `productoId`, `bodegaId?`, `fechaDesde?`, `fechaHasta?`
  - Responde: archivo `text/csv`
  - Uso: exportar auxiliar a CSV
- `GET /api/v1/reportes/valorizacion-actual`
  - Estado front: `Pendiente`
  - Envia: `bodegaId?`, `productoId?`
  - Responde: `ApiResponse<List<ValorizacionActualResponse>>`
  - Uso: obtener valorizacion operativa actual sin persistir foto
- `GET /api/v1/reportes/valorizacion-actual/exportar-csv`
  - Estado front: `Pendiente`
  - Envia: `bodegaId?`, `productoId?`
  - Responde: archivo `text/csv`
  - Uso: exportar valorizacion actual

Observacion:

- La constante actual del frontend esta mal: `'/api/v1/reportes/inventario'`.

### Etiquetas

Estado general: `Pendiente`

Respuesta principal:

- `EtiquetaResponse`: `tipoEtiqueta`, `entidadId`, `codigoBarras`, `titulo`, `subtitulo`, `detalles[]`, `zpl`, `svgVistaPrevia`

Endpoints:

- `GET /api/v1/etiquetas/contenedores/{contenedorId}`
  - Estado front: `Pendiente`
  - Envia: `contenedorId` por path
  - Responde: `ApiResponse<EtiquetaResponse>`
  - Uso: obtener etiqueta lista para reimpresion de contenedor
- `GET /api/v1/etiquetas/contenedores/{contenedorId}/zpl`
  - Estado front: `Pendiente`
  - Envia: `contenedorId` por path
  - Responde: archivo `text/plain`
  - Uso: descargar ZPL para impresora
- `GET /api/v1/etiquetas/contenedores/{contenedorId}/svg`
  - Estado front: `Pendiente`
  - Envia: `contenedorId` por path
  - Responde: `image/svg+xml`
  - Uso: vista previa de etiqueta de contenedor
- `GET /api/v1/etiquetas/ubicaciones/{ubicacionId}`
  - Estado front: `Pendiente`
  - Envia: `ubicacionId` por path
  - Responde: `ApiResponse<EtiquetaResponse>`
  - Uso: obtener etiqueta lista para reimpresion de ubicacion
- `GET /api/v1/etiquetas/ubicaciones/{ubicacionId}/zpl`
  - Estado front: `Pendiente`
  - Envia: `ubicacionId` por path
  - Responde: archivo `text/plain`
  - Uso: descargar ZPL de ubicacion
- `GET /api/v1/etiquetas/ubicaciones/{ubicacionId}/svg`
  - Estado front: `Pendiente`
  - Envia: `ubicacionId` por path
  - Responde: `image/svg+xml`
  - Uso: vista previa de etiqueta de ubicacion

## Prioridad sugerida para conectar

1. Cerrar lo que ya tiene servicio pero no flujo de UI:
   - Recepciones
   - Transferencias
   - Ajustes
   - Picking
   - Conteos
   - Conversiones de unidad
   - Movimientos de contenedores
2. Corregir desalineaciones tecnicas antes de seguir:
   - `API.REPORTES`
   - `API.VENTAS_AJUSTE`
   - validar paginacion de `GET /api/v1/mermas`
3. Conectar extensiones con mas impacto operativo:
   - Reservas
   - Mermas
   - Configuracion de empresa
   - Configuracion de producto
   - Maximos y minimos
4. Dejar para una siguiente ola:
   - Valorizacion
   - Reportes CSV
   - Etiquetas
   - Ajuste por venta facturada
   - Conversion de inventario
