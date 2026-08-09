# site-hosting Specification

## Purpose

Publica la app estática en GitHub Pages bajo la URL github.io del repositorio, con actualización automática en cada push a main.

## Requirements

### Requirement: Public URL on GitHub Pages
The system SHALL be available as a static site at `https://martinferrarese.github.io/elmagodelarepartija/` without requiring a custom domain.

#### Scenario: Site loads on github.io
- **WHEN** a user opens `https://martinferrarese.github.io/elmagodelarepartija/` in a browser
- **THEN** the app loads and the asset paths resolve correctly under the project subpath

### Requirement: Automated deploy on push to main
A successful push to the `main` branch MUST trigger a CI workflow that builds the production bundle and publishes it to GitHub Pages.

#### Scenario: Push updates the published site
- **WHEN** a commit is pushed to `main` and the build succeeds
- **THEN** GitHub Pages is updated with that build without a manual deploy step

#### Scenario: Failed build does not publish
- **WHEN** a push to `main` fails the production build
- **THEN** the previously published site MUST remain unchanged

### Requirement: No custom domain for this hosting path
The GitHub Pages publication for this change MUST NOT depend on `elmagodelarepartija.com.ar` (or any other custom domain) to be reachable.

#### Scenario: Reachable without custom DNS
- **WHEN** the custom domain DNS is unavailable or not configured
- **THEN** the site remains reachable via the `github.io` URL
