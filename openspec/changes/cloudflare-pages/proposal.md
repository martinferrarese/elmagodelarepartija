## Why

La app ya se publica en GitHub Pages (`github.io` + subpath del repo), pero el dominio propio `www.elmagodelarepartija.com.ar` (DNS en nic.ar) no es el origen canónico. Queremos un único hosting: Cloudflare Pages, build automático en cada push a `main`, y esa URL www como la pública.

## What Changes

- Publicar el build estático de CRA en **Cloudflare Pages** conectado al repo (Git), sin Worker ni Wrangler.
- **BREAKING**: la URL pública deja de ser `https://martinferrarese.github.io/elmagodelarepartija/` y pasa a `https://www.elmagodelarepartija.com.ar`.
- Ajustar `homepage` de CRA para servir en la **raíz** del dominio (no en un subpath de github.io).
- Dejar de desplegar a GitHub Pages (quitar el workflow de CI que publica `gh-pages` y el camino manual `deploya` / dependencia `gh-pages`).
- Documentar en tasks el one-time de dashboard Cloudflare (proyecto Pages, custom domain www) y la verificación del CNAME en nic.ar. El apex (`elmagodelarepartija.com.ar` sin www) queda fuera de alcance.

## Capabilities

### New Capabilities

### Modified Capabilities

- `site-hosting`: el sitio estático se sirve desde Cloudflare Pages en `www.elmagodelarepartija.com.ar`, con deploy automático en push a `main`; GitHub Pages deja de ser el hosting público.

## Impact

- `package.json` (`homepage`, scripts `predeploy`/`deploya`, dependencia `gh-pages`).
- `.github/workflows/deploy-pages.yml` (eliminar o desactivar).
- Dashboard de Cloudflare Pages (conexión Git, build `yarn build`, output `build`, dominio custom).
- DNS en nic.ar (CNAME de `www`; ya configurado, hay que alinear con el target que dé Pages).
- Settings de GitHub Pages / branch `gh-pages` (apagar o ignorar tras el corte).
- Sin cambios de lógica de negocio ni UI.
