## Why

En el paso de integrantes, los botones «Agregar» y «Seguir» están uno debajo del otro con el mismo color dorado primario, por lo que no se distingue la acción repetitiva de cargar personas de la acción de avanzar al paso de subgrupos.

## What Changes

- Cambiar el botón «Seguir» del paso de integrantes al color secundario violeta (`secondary`) de la paleta existente, manteniendo «Agregar» en dorado (`primary`).
- Sin cambios al flujo del wizard, a las validaciones del roster ni a la paleta del tema.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: diferenciación visual entre el botón «Agregar» y el botón «Seguir» en el paso de integrantes.

## Impact

- `src/ListaIntegrantes.tsx` (prop `color='secondary'` en el botón «Seguir»).
- `src/App.test.tsx` (test que verifique la distinción visual entre «Agregar» y «Seguir» en el paso inicial).
