## Why

F1 ya entrega transferencias mínimas, pero el usuario no ve por qué salieron esos montos. F2 agrega un desglose por subgrupo (cuota / puso / saldo) para dar confianza sin cambiar el settlement.

## What Changes

- En el paso resultado, debajo de las transferencias, un bloque **colapsable** “Desglose por grupo”.
- Por cada subgrupo: totales (total gastado, cantidad de personas, cuota) y, por miembro, puso / cuota / saldo del grupo (`puso − cuota`).
- El detalle usa la matemática **local del subgrupo** (antes de la corrección global de resto del ceil); no muestra flechas intra-grupo.
- Sin cambios al algoritmo de settlement ni al flujo de carga (roster / subgrupos).
- Fuera de alcance: F3 (alta tardía / sumar a grupos), persistencia, redesign visual amplio.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: agregar requisito de detalle colapsable por subgrupo en el resultado.

## Impact

- Dominio: exponer cálculo de desglose por subgrupo (reutilizar `calcularCuota` / totales).
- UI: `ListaIntegrantes` paso resultado.
- Tests de dominio (+ smoke UI si aplica) para Caso 1 y alcohol+comida.
