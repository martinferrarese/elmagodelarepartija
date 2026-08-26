## 1. Repo: origen en la raíz y corte de GitHub Pages

- [x] 1.1 Cambiar `homepage` en `package.json` a `"."`
- [x] 1.2 Eliminar `.github/workflows/deploy-pages.yml`
- [x] 1.3 Quitar scripts `predeploy` y `deploya` y la dependencia `gh-pages`; actualizar el lockfile
- [x] 1.4 Verificar que `yarn build` emite assets en la raíz (no con prefijo `/elmagodelarepartija/`)

## 2. Cloudflare Pages (one-time, dashboard)

- [ ] 2.1 Crear el proyecto Pages conectado a este repo, production branch `main`
- [ ] 2.2 Setear build command `yarn build`, output directory `build`, `NODE_VERSION=20`
- [ ] 2.3 Confirmar un deploy exitoso en la URL `*.pages.dev` y que la app carga

## 3. Dominio www y retiro de github.io

- [ ] 3.1 Agregar custom domain `www.elmagodelarepartija.com.ar` y alinear el CNAME de nic.ar con el target que muestre Pages
- [ ] 3.2 Verificar HTTPS y que `https://www.elmagodelarepartija.com.ar` carga la app con assets en ese origen
- [ ] 3.3 Desactivar GitHub Pages en el repo (Settings → Pages) para que github.io deje de ser un origen vivo
