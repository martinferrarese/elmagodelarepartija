## Why

La app ya reparte bien, pero la interfaz se siente genérica (blanco + MUI + botón purple). Queremos una apariencia alineada al mago: púrpura dominante, tipografía con carácter, logo del sombrero y la frase “cuentas claras, no magia…”, sin cambiar la lógica de negocio.

## What Changes

- Tema visual “capa elegante”: fondo púrpura profundo, superficies lavanda, acento oro en CTAs y paso activo.
- Tipografía: display para marca/títulos + sans legible para UI y montos (ver design).
- Branding: logo del sombrero (recorte del asset de referencia) + título + tagline **“cuentas claras, no magia…”**.
- Reorganizar layout de los tres pasos (jerarquía, espaciado, bloques de subgrupo más claros) sin alterar el flujo ni el settlement.
- Actualizar favicon/theme-color si encaja con el sombrero.
- Sin F3 (alta tardía). Sin cambiar reglas de cálculo.

## Capabilities

### New Capabilities

### Modified Capabilities
- `repartija`: requisitos de apariencia/branding y presentación ordenada del wizard.

## Impact

- `App.tsx`, `ListaIntegrantes.tsx`, CSS/tema MUI, `public/` (logo/favicon), fonts (Google Fonts o self-host).
- Posible ThemeProvider de MUI.
- Tests: App.test puede necesitar buscar el tagline/marca; dominio intacto.
