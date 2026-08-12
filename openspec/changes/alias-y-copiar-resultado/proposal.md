## Why

Al llegar al resultado, el usuario sabe quién le paga a quién pero no tiene un dato de cobro (alias MP/banco) ni una forma fácil de mandar el settlement al grupo. Cerrar ese último metro evita reescribir transferencias a mano en WhatsApp.

## What Changes

- En el paso resultado, permitir cargar un **alias de cobro opcional** solo para **acreedores** (personas que reciben al menos una transferencia).
- Agregar un botón **Copiar resultado** que pone en el portapapeles un texto plano con las transferencias; si hay alias, lo incluye junto al acreedor.
- El texto copiado **no** incluye el desglose por grupo.
- Alias y copy viven en **memoria de sesión** (sin persistencia, sin share link, sin validación de formato MP).
- Sin cambios al algoritmo de settlement ni al flujo roster → subgrupos → resultado.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: requisitos de alias de cobro por acreedor en el resultado y de copiar el settlement como texto plano para compartir.

## Impact

- UI: `ListaIntegrantes.tsx` (paso resultado) — campos de alias, botón copiar, feedback breve al copiar.
- Posible helper puro para armar el texto a copiar (testeable).
- Dominio de cálculo (`calcular`, balances, desglose) sin cambios.
- Sin backend, auth, localStorage ni `navigator.share` en este change.
