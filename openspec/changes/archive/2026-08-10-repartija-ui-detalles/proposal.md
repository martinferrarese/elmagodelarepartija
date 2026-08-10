## Why

Tras el tema “mago”, quedan detalles de usabilidad en el wizard: el título del paso roster no está centrado con la composición, “Agregar grupo” compite poco visualmente con otras acciones, y los nombres genéricos “Grupo N” no se pueden personalizar (Alcohol, Comida, etc.).

## What Changes

- Centrar el encabezado “¿Quiénes están en la juntada?” en el paso de integrantes.
- Dar a “Agregar grupo” un estilo más notorio (distinto del resto de acciones secundarias), sin confundirlo con el CTA principal dorado de avance/cálculo.
- Permitir editar el nombre de cada subgrupo desde la UI; el valor se usa en el desglose y en la lista de grupos.
- Sin cambios al cálculo de settlement ni al flujo de pasos.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: presentación del título del roster, énfasis visual de “Agregar grupo”, y nombres de subgrupo editables.

## Impact

- `ListaIntegrantes.tsx` (y estilos menores si hacen falta).
- Posible ajuste de tests de UI si cubren textos fijos de “Grupo N”.
- Dominio ya soporta `SubgrupoJuntada.nombre`; solo falta edición en UI.
