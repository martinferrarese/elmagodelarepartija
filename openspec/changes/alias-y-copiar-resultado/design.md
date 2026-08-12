## Context

Result step in `ListaIntegrantes` already lists transfers and a collapsible desglose. Settlement stays in `repartija/calcular`. See proposal.md for motivation. Need UI state for aliases and a clipboard copy path without touching domain math.

## Goals / Non-Goals

**Goals:**
- Derive the creditor set from the current `transferencias` list.
- Session-only map `nombre → alias` on the result step.
- Pure helper that builds the shareable plain-text string (unit-tested).
- Copy via Clipboard API with brief success feedback.

**Non-Goals:**
- Persist aliases (localStorage / URL / backend).
- Include desglose in the copied text.
- `navigator.share`, alias format validation, deep links to Mercado Pago.
- Changing settlement, cuota, or wizard step order.

## Decisions

### 1. Creditors = unique `a` from transfers
Build `acreedores = unique(transferencias.map(t => t.a))`, stable sort by name ascending (same spirit as settlement ordering).

**Why:** Matches “solo acreedores” and updates automatically if the user edits and recalculates.

**Alternative:** Alias on full roster — rejected (noise for debtors-only).

### 2. Alias state keyed by participant name
`Record<string, string>` (or Map) in component state. Keep values across recalculates when the name still appears as creditor; unused keys can linger harmlessly or be pruned on calculate.

**Why:** Names are already the identity key in the domain; no new id type.

### 3. Pure `formatearResultadoParaCopiar(transferencias, aliases)`
Returns string. Suggested shape (Spanish, WhatsApp-friendly):

```
Transferencias
• Ferra le transfiere $8250 a Manita (alias: manita.mp)
• Cami le transfiere $2500 a Manita (alias: manita.mp)
```

Empty list → one line like `No hace falta transferir nada.`  
Omit `(alias: …)` when trimmed alias is empty.  
Do not append desglose or tagline unless we later expand scope.

**Why:** Testable without DOM; UI only calls `navigator.clipboard.writeText`.

### 4. Clipboard + feedback
Primary path: `navigator.clipboard.writeText`. On success, short ephemeral label (“Copiado”) on the button or nearby. If clipboard fails (permissions / insecure context), show a brief error; no modal textarea fallback required in v1.

**Alternative:** `navigator.share` — deferred (mobile-nice, not required).

### 5. Placement in result UI
Below the transfer list (and above or beside desglose): block “Alias de cobro” with one TextField per creditor; then primary/secondary **Copiar resultado** near “Volver a editar”. Alias fields hidden when `transferencias.length === 0`; copy button still available.

## Risks / Trade-offs

- [Clipboard blocked on some browsers / non-HTTPS] → Show short failure message; Pages is HTTPS so production is fine.
- [User expects alias to change who owes whom] → Copy/UI only; settlement unchanged (spec).
- [Long aliases break WhatsApp lines] → Accept wrap; free text, no max enforced in v1.

## Migration Plan

Ship as UI-only additive change on `main`; no data migration. Rollback = revert the PR.

## Open Questions

None blocking — copy wording above is the default unless polish tweaks labels during apply.
