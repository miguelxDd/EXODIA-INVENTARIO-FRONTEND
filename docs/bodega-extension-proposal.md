# Propuesta de ampliacion para bodega y ubicacion

Fecha: 2026-04-02

## Estado actual

Hoy el backend de inventario solo soporta para `Bodega`:

- `codigo`
- `nombre`
- `direccion`
- `ciudad`
- `pais`
- `esProductoTerminado`
- `esConsignacion`
- `ubicacionStandbyId` como respuesta

Esto significa que el frontend no puede persistir todavia:

- capacidad en m2 o m3
- peso maximo
- coordenadas geograficas
- proveedor de mapa
- telefono o contacto
- horario operativo
- zona termica
- layout interno

## Payload actual soportado

### POST `/api/v1/bodegas`

```json
{
  "codigo": "BOD-CENTRAL",
  "nombre": "Bodega Central",
  "direccion": "Final avenida Las Palmas, #245, zona industrial",
  "ciudad": "San Salvador",
  "pais": "El Salvador",
  "esProductoTerminado": true,
  "esConsignacion": false
}
```

### PATCH `/api/v1/bodegas/{id}`

```json
{
  "nombre": "Bodega Central",
  "direccion": "Final avenida Las Palmas, #245, zona industrial",
  "ciudad": "San Salvador",
  "pais": "El Salvador",
  "esProductoTerminado": true,
  "esConsignacion": false
}
```

El `codigo` solo se define al crear. En actualizacion no existe en el DTO actual.

## Separacion recomendada

No conviene meter todo en `Bodega`.

### Campos que si pertenecen a `Bodega`

- `codigo`
- `nombre`
- `direccion`
- `ciudad`
- `pais`
- `latitud`
- `longitud`
- `mapProvider`
- `mapPlaceId`
- `capacidadAreaM2`
- `capacidadVolumenM3`
- `capacidadPesoKg`
- `telefono`
- `email`
- `contactoResponsable`
- `regimenTemperatura`
- `tipoOperacion`
- `horarioOperacion`
- `muellesCarga`

### Campos que pertenecen mejor a `Ubicacion`

- `zona`
- `subzona`
- `pasillo`
- `estante`
- `nivel`
- `posicion`
- `tipoZona`
- `ambiente`
- `anchoCm`
- `altoCm`
- `profundidadCm`
- `volumenMaximoM3`
- `pesoMaximoKg`
- `permitePicking`
- `permiteReserva`
- `permiteCuarentena`

## Tipos sugeridos

### Regimen de temperatura para bodega

- `SECO`
- `REFRIGERADO`
- `CONGELADO`
- `CONTROLADO`

### Tipo de zona para ubicacion

- `GENERAL`
- `PICKING`
- `RESERVA`
- `CUARENTENA`
- `DEVOLUCIONES`
- `RECIBO`
- `DESPACHO`
- `MERMA`
- `BULK`

## Cambios de backend necesarios

Para soportar esto bien, hace falta:

1. Migracion SQL sobre `inv_bodegas`
2. Migracion SQL sobre `inv_ubicaciones`
3. Actualizar entidades JPA
4. Actualizar DTOs `Crear*Request`, `Actualizar*Request` y `*Response`
5. Actualizar mapeadores
6. Actualizar servicios de aplicacion
7. Ajustar validaciones
8. Exponer nuevos campos en frontend

## Geolocalizacion y mapas

Si quieres ubicar la bodega con Google Maps u OpenStreetMap, lo recomendable es guardar al menos:

- `latitud`
- `longitud`
- `mapProvider`
- `mapPlaceId` o `osmPlaceId`
- `direccionNormalizada`

Si solo se guarda una direccion de texto, se puede mostrar un link a mapa, pero no hay georreferencia real ni busqueda espacial.

### Recomendacion de implementacion

Para una primera fase funcional:

1. Guardar `latitud` y `longitud`
2. Guardar `mapProvider`
3. Guardar `mapPlaceId` o `osmPlaceId`
4. Mantener `direccion` como texto editable por usuario

Con eso ya se puede:

- centrar la bodega en mapa
- abrir Google Maps u OpenStreetMap
- reutilizar la ubicacion para futuras rutas o analitica

## Paises

Para paises, lo correcto a mediano plazo no es depender de strings libres en frontend.

Lo recomendable es una de estas dos opciones:

1. Catalogo maestro de paises en backend
2. Tabla propia basada en ISO 3166-1 con `codigo`, `nombre`, `activo`

Mientras eso existe, el frontend puede usar sugerencias de pais para mejorar captura, pero no reemplaza un catalogo oficial.

## Orden sugerido de implementacion

1. Mejorar `Bodega` con capacidad, contacto y geolocalizacion
2. Extender `Ubicacion` con layout fisico y tipo de zona
3. Crear catalogos controlados para pais y regimen de temperatura
4. Agregar visualizacion en mapa
5. Agregar restricciones de capacidad por ubicacion

## Ejemplo de siguiente fase

### Bodega extendida

```json
{
  "codigo": "BOD-CENTRAL",
  "nombre": "Bodega Central",
  "direccion": "Final avenida Las Palmas, #245, zona industrial",
  "ciudad": "San Salvador",
  "paisCodigo": "SV",
  "paisNombre": "El Salvador",
  "latitud": 13.7014,
  "longitud": -89.2244,
  "mapProvider": "GOOGLE",
  "mapPlaceId": "abc123",
  "capacidadAreaM2": 2500,
  "capacidadVolumenM3": 9800,
  "capacidadPesoKg": 300000,
  "telefono": "+503 2222 3333",
  "contactoResponsable": "Encargado de bodega",
  "regimenTemperatura": "SECO",
  "tipoOperacion": "DISTRIBUCION",
  "muellesCarga": 4,
  "esProductoTerminado": true,
  "esConsignacion": false
}
```

### Ubicacion extendida

```json
{
  "codigo": "A-01-02-03",
  "nombre": "Pasillo A Estante 01 Nivel 02 Posicion 03",
  "bodegaId": 10,
  "zona": "A",
  "pasillo": "01",
  "estante": "02",
  "nivel": "03",
  "posicion": "01",
  "tipoZona": "PICKING",
  "ambiente": "SECO",
  "altoCm": 200,
  "anchoCm": 120,
  "profundidadCm": 100,
  "volumenMaximoM3": 2.4,
  "pesoMaximoKg": 1200,
  "permitePicking": true,
  "permiteReserva": true,
  "permiteCuarentena": false
}
```
