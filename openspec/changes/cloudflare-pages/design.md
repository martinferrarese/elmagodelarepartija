## Context

CRA + Yarn; production build is `yarn build` → `build/`. Today GitHub Actions publishes that folder to `gh-pages`, and `package.json` `homepage` prefixes assets for `https://martinferrarese.github.io/elmagodelarepartija`. There is no React Router. DNS for `www.elmagodelarepartija.com.ar` is already at nic.ar. See proposal.md for why the origin is moving.

## Goals / Non-Goals

**Goals:**
- Serve the CRA bundle from Cloudflare Pages Git integration on push to `main`.
- Make production asset URLs work at the www domain root.
- Cut GitHub Pages as a deploy path (CI workflow and local `gh-pages` scripts).

**Non-Goals:**
- Cloudflare Worker, Wrangler, or `wrangler.toml`.
- Apex (`elmagodelarepartija.com.ar` without www) or redirect apex → www.
- Changing app UI or adding client-side routing / `_redirects`.
- Keeping github.io as a backup origin.

## Decisions

### 1. Cloudflare Pages (Git), not a Worker
Connect the GitHub repo in the Pages dashboard. Build happens on Cloudflare; no deploy token in GitHub Actions.

**Alternatives considered:** Worker + static assets + `wrangler deploy` — extra files and secrets for a static SPA. GitHub Action that uploads to Pages — duplicates what Pages Git already does.

### 2. `homepage` is `"."`
CRA must emit root-relative assets. The current github.io `homepage` would keep requesting JS/CSS from GitHub even on www.

**Alternatives considered:** `PUBLIC_URL=/` only in Cloudflare env — works but leaves `package.json` lying for any other build. Full `https://www.elmagodelarepartija.com.ar` — unnecessary; `"."` is portable for Pages previews (`*.pages.dev`) and www.

### 3. Remove GitHub Pages automation entirely
Delete `.github/workflows/deploy-pages.yml`. Remove `predeploy`/`deploya` and the `gh-pages` dependency. After the first good Pages deploy, disable GitHub Pages in repo settings (manual).

**Alternatives considered:** leave the workflow — two hosts with incompatible `homepage`. Keep `deploya` — unused second path.

### 4. Dashboard build settings
Framework Create React App (or None). Build command `yarn build`. Output directory `build`. Root directory empty. Production env `NODE_VERSION=20`. Pin Yarn classic: `package.json` `packageManager` `yarn@1.22.19` (Pages v2 defaults to Yarn 4, which refuses a v1 `yarn.lock` with YN0028). Optional dashboard backup: `YARN_VERSION=1`. Custom domain `www.elmagodelarepartija.com.ar`. Align nic.ar CNAME `www` with the `*.pages.dev` target Pages shows.

**Alternatives considered:** commit a `wrangler.toml` only for docs — rejected; Git dashboard is the source of truth for this app.

### 5. No SPA fallback file
No `_redirects` until there are client routes.

## Risks / Trade-offs

- [CNAME mismatch] → When adding the custom domain, compare Cloudflare’s expected CNAME with nic.ar; fix the target if it still points at GitHub or another host.
- [SSL pending] → Site on `*.pages.dev` can be verified first; www waits on DNS + certificate.
- [Apex 404 / parking] → Users who omit `www` may not hit the app; accepted (out of scope).
- [Stale github.io] → Until GitHub Pages is disabled, the old URL may still serve an outdated build; not supported.
- [First deploy needs dashboard] → Repo changes alone do not publish to Cloudflare; tasks include the one-time Pages project + domain.

## Migration Plan

1. Land `homepage` + remove GitHub Pages deploy path on `main` (or land after Pages is connected so `main` builds once with the new homepage).
2. Create the Pages project, confirm a green build on `*.pages.dev`.
3. Attach `www.elmagodelarepartija.com.ar`, confirm CNAME, wait for HTTPS.
4. Disable GitHub Pages / ignore `gh-pages`.
5. Rollback: revert the `homepage`/workflow commit and/or point www CNAME back; previous GitHub Pages site is not guaranteed to match the new homepage.
