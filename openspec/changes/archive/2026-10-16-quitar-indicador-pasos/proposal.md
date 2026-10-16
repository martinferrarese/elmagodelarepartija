## Why

Las etiquetas superiores `1 · Integrantes`, `2 · Subgrupos` y `3 · Resultado` tienen forma de cápsulas y parecen botones interactivos sin serlo, mientras cada pantalla ya tiene su propio encabezado y controles explícitos para avanzar o volver.

## What Changes

- Eliminar el indicador superior de pasos (`<nav className='step-indicator'>` y el arreglo `pasos`) de `src/ListaIntegrantes.tsx`.
- Eliminar los estilos `.step-indicator`, `.step-indicator__item` y `.step-indicator__item--active` de `src/App.css`.
- Sin cambios al flujo de los tres pasos ni a los botones de avance/retroceso.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: se omite el indicador superior de pasos en el panel del wizard y se actualizan los requerimientos visuales que lo mencionaban.

## Impact

- `src/ListaIntegrantes.tsx` (quitar `pasos` y `<nav className='step-indicator'>`).
- `src/App.css` (quitar reglas `.step-indicator*`).
- `src/App.test.tsx` (test que verifique que no se renderiza la navegación `Pasos` ni las etiquetas `1 · Integrantes`, `2 · Subgrupos`, `3 · Resultado`).
