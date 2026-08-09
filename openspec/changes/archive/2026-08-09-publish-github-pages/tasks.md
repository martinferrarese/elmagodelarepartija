## 1. Config de publicación

- [x] 1.1 Corregir `homepage` en `package.json` a `https://martinferrarese.github.io/elmagodelarepartija`
- [x] 1.2 Eliminar `CNAME` y `_config.yml` del root (dejar de atar Pages al dominio custom)
- [x] 1.3 Verificar localmente que `yarn build` genera assets con prefijo `/elmagodelarepartija/`

## 2. Deploy automático

- [x] 2.1 Crear `.github/workflows/deploy-pages.yml` que en push a `main` instale con Yarn, buildee y publique `build/` a la branch `gh-pages`
- [x] 2.2 Configurar permisos del workflow (`contents: write` o el set equivalente según el action elegido)
- [x] 2.3 Asegurar que el publish no reintroduzca un `CNAME` custom en `gh-pages`

## 3. Activación y verificación

- [x] 3.1 Confirmar en Settings → Pages que el source apunta a `gh-pages` (o ajustar al método elegido)
- [x] 3.2 Pushear el change a `main`, esperar el workflow verde y verificar que carga `https://martinferrarese.github.io/elmagodelarepartija/`
- [x] 3.3 Confirmar que un build fallido no sobrescribe el sitio publicado (revisar condición del job / step de publish)
