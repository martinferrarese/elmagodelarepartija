## ADDED Requirements

### Requirement: Public URL on Cloudflare Pages
The system SHALL be available as a static site at `https://www.elmagodelarepartija.com.ar` with asset paths resolving at the domain root. Cloudflare Pages MUST be the only public hosting origin. The apex hostname `elmagodelarepartija.com.ar` (without `www`) is out of scope.

#### Scenario: Site loads on www
- **WHEN** a user opens `https://www.elmagodelarepartija.com.ar` in a browser
- **THEN** the app loads and static assets resolve from that origin (not from github.io or a repo subpath)

#### Scenario: github.io is not the public origin
- **WHEN** a user relies on the previously published GitHub Pages URL
- **THEN** that URL MUST NOT be treated as the supported public site for this capability

## MODIFIED Requirements

### Requirement: Automated deploy on push to main
A successful push to the `main` branch MUST trigger Cloudflare Pages to build the production bundle and publish it. A failed production build MUST leave the previously published site unchanged.

#### Scenario: Push updates the published site
- **WHEN** a commit is pushed to `main` and the Cloudflare Pages build succeeds
- **THEN** `https://www.elmagodelarepartija.com.ar` is updated with that build without a manual deploy step

#### Scenario: Failed build does not publish
- **WHEN** a push to `main` fails the production build on Cloudflare Pages
- **THEN** the previously published site MUST remain unchanged

## REMOVED Requirements

### Requirement: Public URL on GitHub Pages
**Reason**: Cloudflare Pages on the custom www domain replaces GitHub Pages as the only public origin.
**Migration**: Use `https://www.elmagodelarepartija.com.ar`. Stop publishing to the `gh-pages` branch and do not keep `github.io` as a supported URL.

### Requirement: No custom domain for this hosting path
**Reason**: The public site now depends on `www.elmagodelarepartija.com.ar` (DNS at nic.ar, custom domain on Cloudflare Pages).
**Migration**: Treat www as the canonical URL. Do not require reachability via github.io if custom DNS is unavailable.
