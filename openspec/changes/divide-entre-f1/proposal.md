## Why

La app solo reparte “entre todos” con una UI plana; en la práctica una juntada tiene gastos que comparten subconjuntos distintos (comida vs alcohol). Ya hay lógica experimental de subgrupos en la rama, incompleta y con un modelo (`divideEntre` por fila) que no refleja cómo se carga la data. Queremos un F1 usable: una persona carga la juntada por subgrupos y obtiene transferencias mínimas globales.

## What Changes

- **BREAKING:** reemplazar el flujo UI actual (nombre + monto → repartija) por un wizard: roster → subgrupos con montos → resultado de transferencias.
- **BREAKING:** reemplazar el modelo de entrada `IntegranteDelGrupo + divideEntre` por roster + subgrupos explícitos (miembros + monto ≥ 0 por miembro).
- Introducir cálculo por balances globales (puso − cuota por subgrupo) y settlement mínimo determinista.
- Montos enteros; cuota con redondeo hacia arriba; nombres de roster únicos; subgrupo con ≥ 2 personas.
- Base de tests que documente casos de aceptación F1 (juntada simple, alcohol+comida, multi-acreedor, validaciones).
- Fuera de alcance F1: detalle por subgrupo (F2), UX avanzada de “faltó alguien” (F3), persistencia/share.

## Capabilities

### New Capabilities
- `repartija`: carga de juntada (roster + subgrupos), reglas de validación, cálculo de balances y transferencias mínimas globales, y flujo UI F1.

### Modified Capabilities

## Impact

- `src/Logica.tsx`, `src/Interfaces.ts`, `src/ListaIntegrantes.tsx`, `src/App.tsx` y tests asociados (reemplazo / migración).
- Eliminación progresiva del API viejo (`divideEntre`, `identificarSubgrupos` orientado a sets implícitos) una vez la UI nueva esté cableada.
- La rama debe basarse en `main` (OpenSpec + GitHub Pages) antes o al integrar el work.
- No cambia el hosting (`site-hosting`); sí el producto que se publica.
