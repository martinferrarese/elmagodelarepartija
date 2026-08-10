## Context

F1 shipped roster + subgroups + global minimum settlement; result step only lists transfers. Users want transparency without pairwise intra-group debts. Agreed UX: collapsible block under transfers; per group totals + per-person puso/cuota/saldo; local math (pre global remainder correction). See proposal.md.

## Goals / Non-Goals

**Goals:**
- Pure function(s) that build a breakdown DTO from a `Juntada` / subgroup list.
- Collapsible UI on the result step using MUI (Accordion or Collapse).
- Tests locking C1 and alcohol subgroup numbers.

**Non-Goals:**
- Changing settlement or cuota rules.
- Showing global balances / remainder correction in F2 (optional later).
- F3 late-add UX.
- Visual redesign beyond the new block.

## Decisions

### 1. Domain function `calcularDesglose(juntada)`
Returns ordered list:
```
{ id, nombre, total, cantidadMiembros, cuota,
  lineas: { nombre, puso, cuota, saldo }[] }
```
`saldo = puso - cuota` with `cuota = Math.ceil(total / n)`. No `corregirRestoBalances` here.

**Why:** Keeps detail explainable per group; settlement remains the only place that applies global correction.

### 2. UI: MUI Accordion under transfers
Label e.g. “Desglose por grupo”. Default `expanded={false}`. Nested per-subgroup headings with a simple list/table of lines + a totals row/header.

### 3. Wire on calculate
When computing transfers, also compute desglose and keep it in state for the result step (recompute on recalculate).

## Risks / Trade-offs

- [Users confuse local saldo vs final transfers] → Short helper text: “Saldo por grupo (antes del ajuste global de redondeo)”.
- [Ceil remainder not visible] → Acceptable in F2; transfers still correct.

## Open Questions

None for F2.
