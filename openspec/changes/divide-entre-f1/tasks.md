## 1. Base de rama

- [ ] 1.1 Rebasear (o mergear) `divide-entre` sobre `main` y resolver conflictos dejando Pages + OpenSpec + lógica de la feature
- [ ] 1.2 Verificar que `yarn test` / `yarn build` pasan en la base rebaseada

## 2. Dominio nuevo + tests de aceptación

- [ ] 2.1 Introducir tipos de juntada (roster, subgrupo, transferencia) sin cablear UI
- [ ] 2.2 Implementar cuota con `ceil`, balances por subgrupo, corrección determinista de resto y settlement greedy por nombre
- [ ] 2.3 Tests C1 juntada simple (1300/500/0 → Manita→Ferra 100, Cami→Ferra 600)
- [ ] 2.4 Tests C2 alcohol+comida (Ferra→Manita 8250, Cami→Manita 2500) y C3 ($0 en un grupo)
- [ ] 2.5 Tests C4 multi-acreedor, C5 equilibrado, C6 tres grupos con solapes
- [ ] 2.6 Tests de validación C7–C10 (subgrupo &lt;2, negativo, roster &lt;2, default 0)

## 3. UI wizard (reemplazo)

- [ ] 3.1 Paso roster: alta/baja, nombres únicos, no avanzar con &lt;2
- [ ] 3.2 Paso subgrupos: crear/borrar grupo, nombre genérico “Grupo N”, miembros, botón Todos, montos ≥0
- [ ] 3.3 Paso resultado: listar transferencias; recalcular tras ediciones básicas (C11–C13)
- [ ] 3.4 Quitar el flujo legacy de una sola pantalla y el modelo de entrada `divideEntre` en UI

## 4. Limpieza y cierre

- [ ] 4.1 Migrar o eliminar tests obsoletos del API `divideEntre` / `identificarSubgrupos` viejo
- [ ] 4.2 `yarn test` y `yarn build` verdes; smoke manual del Caso 1 en la UI
