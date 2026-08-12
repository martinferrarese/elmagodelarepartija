## 1. Texto para copiar

- [x] 1.1 Agregar helper puro `formatearResultadoParaCopiar(transferencias, aliases)` (módulo bajo `src/repartija/` o junto a UI si preferís mínimo)
- [x] 1.2 Tests: con transferencias + alias; sin alias (sin placeholder vacío); lista vacía → mensaje de “nada que transferir”; el string no menciona desglose

## 2. UI resultado — alias

- [x] 2.1 Derivar acreedores únicos desde `transferencias` (orden por nombre)
- [x] 2.2 Estado sesión `aliases: Record<string, string>` y TextField opcional por acreedor en el paso resultado
- [x] 2.3 Ocultar el bloque de alias cuando no hay transferencias

## 3. UI resultado — copiar

- [x] 3.1 Botón “Copiar resultado” que usa el helper + `navigator.clipboard.writeText`
- [x] 3.2 Feedback breve de éxito (“Copiado”) y mensaje corto si falla el clipboard
- [x] 3.3 Smoke/manual: alias en acreedor aparece en lo pegado; desglose no

## 4. Cierre

- [x] 4.1 Correr tests existentes + nuevos en verde
- [x] 4.2 Confirmar que settlement / desglose / pasos del wizard no cambiaron de comportamiento
