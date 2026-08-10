## Context

Wizard UI and brand theme already shipped. Small UX polish requested: center roster heading, make “Agregar grupo” more noticeable, editable subgroup names. Domain already has `nombre` on `SubgrupoJuntada`. See proposal.md.

## Goals / Non-Goals

**Goals:**
- Three focused UI tweaks with minimal code churn.
- Keep settlement and step order unchanged.

**Non-Goals:**
- Broader redesign.
- Renaming via modal/dialog unless inline edit proves awkward (prefer inline).

## Decisions

### 1. Center roster heading
`Typography` for “¿Quiénes están en la juntada?” with `textAlign: 'center'` (and full width).

### 2. “Agregar grupo” style
Use `variant="contained"` with **secondary** (cloak purple) — more solid/noticeable than outlined “Volver”, still not gold primary (`Calcular transferencias` / `Seguir` stay gold).

**Alternative:** outlined + gold border — rejected to avoid competing with primary CTAs.

### 3. Editable names
Inline `TextField` (or editable heading) bound to `subgrupo.nombre`. On blur, if trimmed empty → `Grupo ${id}`. Update via `setSubgrupos`. Desglose already uses `nombre`.

## Risks / Trade-offs

- [Secondary contained vs brand gold] → Document that purple = structural add, gold = progress/calculate.
- [Long custom names on mobile] → TextField fullWidth inside subgroup block; ellipsis in tight spots if needed later.

## Open Questions

None — assumptions above are sufficient for F1-style polish.
