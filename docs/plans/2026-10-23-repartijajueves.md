# Cuenta del jueves — plan de implementación

> **Para workers agénticos:** SUB-SKILL REQUERIDO: usar executing-plans (modo inline en esta sesión; el usuario pidió seguir sin pausas y pushear al final). Los pasos usan checkbox (`- [ ]`).

**Objetivo:** Anotar, en `/repartijajueves`, quién puso para la cuenta del asado y cuánto falta.

**Arquitectura:** La app elige la pantalla por `pathname`. La matemática y el parseo del `localStorage` viven en funciones puras. La pantalla solo las aplica. Un rewrite de Cloudflare sirve esa ruta.

**Stack:** React 18, TypeScript, MUI 5, Jest, Create React App, Cloudflare Pages.

**Spec:** `docs/specs/2026-10-23-repartijajueves-design.md`

---

### Tarea 1: Matemática de la cuenta

**Archivos:**
- Crear: `src/repartija/cuentaJueves.ts`
- Test: `src/repartija/cuentaJueves.test.ts`

- [x] Tests que fallan para cuota visible, redondeo a la centena, total a juntar, falta con polvo de centavos, morosos, pasan la cuota, Pagó, tope al editar, montos que no se mueven, ruta y `localStorage` roto.
- [x] Implementación mínima hasta que pasen.

### Tarea 2: Pantalla y ruta

**Archivos:**
- Crear: `src/CuentaJueves.tsx`
- Modificar: `src/App.tsx`
- Modificar: `src/App.css`
- Test: `src/CuentaJueves.test.tsx`

- [x] Tests de la pantalla: alta en cero, morosos, Pagó, redondeo sin pisar montos, tope, vaciar con confirmación, persistencia, ruta y ausencia de enlace en el mago.
- [x] Implementación mínima hasta que pasen.

### Tarea 3: Rewrite de Cloudflare

**Archivos:**
- Crear: `public/_redirects`

- [x] `/repartijajueves` y `/repartijajueves/` reescriben a `/index.html` con estado 200.

### Tarea 4: Verificación

- [x] `CI=true yarn test --watchAll=false`
- [x] Recorrer `/repartijajueves` en el navegador: total, redondeo, Pagó, morosos y vaciar.
