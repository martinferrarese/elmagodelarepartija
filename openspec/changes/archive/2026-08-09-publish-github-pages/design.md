## Context

CRA app with `homepage` currently set to a mistyped custom domain (`elmagodelarpartija.com.ar`). Repo already has `gh-pages` as a dependency, script `deploya`, a remote `gh-pages` branch with an old build, plus root `CNAME` / `_config.yml` aimed at the `.com.ar` domain. Target URL is project Pages: `https://martinferrarese.github.io/elmagodelarepartija/`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Correct CRA `homepage` so production assets use `/elmagodelarepartija/` as public URL base.
- Deploy via GitHub Actions on every push to `main`.
- Serve from GitHub Pages on the default `github.io` project URL (no custom domain).

**Non-Goals:**
- UX/product improvements to the app.
- Migrating off Create React App.
- Keeping or repairing the `.com.ar` custom domain.

## Decisions

### 1. Homepage = project Pages URL
Set `package.json` `homepage` to `https://martinferrarese.github.io/elmagodelarepartija` so CRA emits correct `PUBLIC_URL` / asset prefixes.

**Alternatives considered:** relative `homepage: "."` (more portable, but project Pages + CRA historically uses the full project URL; stick to the explicit URL the user chose).

### 2. GitHub Actions + `peaceiris/actions-gh-pages` (or equivalent) pushing to `gh-pages`
Reuse the existing `gh-pages` branch as the Pages source to minimize repo settings churn. Workflow on `push` to `main`: checkout → setup Node → `yarn install --frozen-lockfile` → `yarn build` → publish `build/` to `gh-pages`.

**Alternatives considered:**
- Manual `yarn deploya` only — rejected (user asked for automation).
- GitHub Actions `actions/upload-pages-artifact` + `actions/deploy-pages` (official Pages environment) — fine alternative; prefer branch-based deploy if Pages is already set to `gh-pages`, otherwise switch to the official flow and document the one-time Pages setting change.

### 3. Drop custom-domain artifacts from the published site
Remove root `CNAME` (and stop shipping it into `gh-pages`) so Pages does not enforce the custom domain. `_config.yml` is unused by CRA Pages and can be deleted or left inert; prefer delete to avoid confusion.

**Alternatives considered:** keep CNAME “just in case” — rejected because it would re-bind Pages to the custom domain.

### 4. Keep `deploya` as optional manual escape hatch
Leave or lightly align the existing `predeploy`/`deploya` scripts so a local deploy still works; CI is the primary path.

## Risks / Trade-offs

- [Pages source mismatch] → After first CI run, verify Settings → Pages points at `gh-pages` (or the Actions environment if using official deploy). Document the one-time check in tasks.
- [Permissions] → Workflow needs `contents: write` (branch deploy) or `pages: write` + `id-token` (official). Use the least privilege matching the chosen deploy method.
- [Old CNAME on `gh-pages`] → First successful publish must overwrite/remove the published CNAME so github.io works.
- [Yarn vs npm in CI] → Repo uses `yarn.lock`; CI MUST use Yarn for reproducible installs.

## Migration Plan

1. Land config + workflow on `main`.
2. Confirm GitHub Pages source in repo settings.
3. Let CI publish; verify `https://martinferrarese.github.io/elmagodelarepartija/`.
4. Rollback: revert the workflow commit on `main` and/or reset `gh-pages` to the previous commit if needed.
