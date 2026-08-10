## Context

F1/F2 delivered working settlement + collapsible breakdown; UI is still CRA/MUI defaults. Brand direction agreed: elegant cloak (purple-dominant), tagline “cuentas claras, no magia…”, hat-only logo from the reference illustration. User unsure about fonts — choose concrete pair below. See proposal.md.

## Goals / Non-Goals

**Goals:**
- MUI ThemeProvider + CSS variables for palette.
- Brand header (hat + title + tagline).
- Typography pair loaded once.
- Visual cleanup of the three steps; no domain changes.

**Non-Goals:**
- Late-add UX (F3 discarded).
- Heavy animation / particle stars.
- Rewriting calculation or wizard step order.
- Using the full cape+staff illustration as the logo (hat crop only).

## Decisions

### 1. Fonts (concrete pick)
| Role | Font | Why |
|------|------|-----|
| Display (marca, títulos de paso) | **Fraunces** | Serif suave con personalidad “conjuro” sin verse disfraz de D&D; legible en hero |
| UI / montos / forms | **DM Sans** | Sans moderna, buena con números, contraste con Fraunces |

Load via Google Fonts (or Fontsource if we prefer npm). Drop Roboto as the primary face.

**Alternatives considered:** Cinzel (demasiado fantasy-poster); Playfair (más editorial); Inter (prohibido por convención de diseño / genérico).

### 2. Palette tokens
```
--cloak: #2A1450
--cloak-mid: #3B1F6E
--lining: #EDE4F8
--lining-deep: #D9C6F0
--ink-on-cloak: #F7F2FF
--ink-on-lining: #2A1450
--gold: #E8C547
--gold-press: #C9A62E
```
Subtle star pattern optional at ≤5% opacity on cloak only, never behind dense form fields.

### 3. Logo
Crop hat from reference asset → `public/sombrero.png` (+ favicon). Header: hat ~48–64px beside/above title. Not a card; sits in the purple field.

### 4. Layout
Full-bleed purple app shell; centered column (~sm) with lavender panel for step body. Step chips with gold underline/fill on active. Subgroup blocks: clear title row + member/amount rows; less ad-hoc button scatter.

### 5. MUI
`createTheme` mapping primary→cloak/gold strategy: `primary` for gold CTAs on purple, paper→lining. Replace inline `backgroundColor: 'purple'`.

## Risks / Trade-offs

- [Contrast on gold buttons] → dark ink on gold, not white-on-gold if contrast fails.
- [Hat crop quality] → if auto-crop is messy, ask user for a clean hat PNG.
- [Google Fonts dependency] → fine for Pages; document offline fallback to system serif/sans.

## Open Questions

None blocking — fonts chosen above unless user vetoes after seeing them live.
