## Why

La app ya existe y se puede usar en local, pero no está fácilmente disponible en una URL pública. El repo ya tiene restos de GitHub Pages (`gh-pages`, CNAME, script `deploya`), pero la config está inconsistente (typo en `homepage`, dominio custom) y el deploy no es automático. Queremos publicar en `github.io` y que cada push a `main` deje el sitio actualizado.

## What Changes

- Corregir `homepage` en `package.json` a la URL de GitHub Pages del repo (`https://martinferrarese.github.io/elmagodelarepartija`).
- Dejar de usar el dominio custom (`.com.ar`) para este deploy: remover o dejar de depender de `CNAME` / `_config.yml` en el flujo de Pages del repo.
- Agregar un workflow de GitHub Actions que, en push a `main`, haga build y publique a la branch `gh-pages` (o al destino que Pages use).
- Habilitar/confirmar GitHub Pages para servir desde esa publicación.
- Mantener (o alinear) el script local `deploya` como opción manual, sin que sea el camino principal.

## Capabilities

### New Capabilities
- `site-hosting`: publicación estática de la app en GitHub Pages con URL `github.io` y deploy automático en push a `main`.

### Modified Capabilities

## Impact

- `package.json` (`homepage`, posiblemente scripts).
- Archivos de config de Pages/dominio (`CNAME`, `_config.yml`) según el diseño.
- Nuevo workflow en `.github/workflows/`.
- Branch `gh-pages` actualizada por CI.
- Sin cambios de lógica de negocio ni UI de la app en este change.
