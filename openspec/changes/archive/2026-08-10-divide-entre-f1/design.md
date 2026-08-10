## Context

Branch `divide-entre` has experimental subgroup logic centered on `divideEntre[]` per participant row, tests for multi-subgroup cases, and a UI that still always sends `divideEntre: []`. Product decisions for F1: roster + explicit subgroups, global minimum settlement via balances, ceiling integer cuota, unique names, full UI replacement, base on `main` (OpenSpec + Pages). Detail-by-subgroup and advanced late-add UX are F2/F3. See proposal.md for scope.

## Goals / Non-Goals

**Goals:**
- Domain API and tests that lock F1 acceptance cases (C1–C13 from exploration).
- Deterministic settlement from global balances.
- Wizard UI replacing the legacy screen, always keeping the app runnable as slices land.
- Small construction slices that stay green.

**Non-Goals:**
- Per-subgroup transfer detail UI (F2).
- Polished “forgot someone / add to all groups” (F3); basic edits only.
- Persistence, sharing, auth.
- Keeping the old `divideEntre` input model long-term.

## Decisions

### 1. Domain model
```
Roster: string[] (unique)
Subgrupo: { id, nombre?, miembros: { nombre, monto: int ≥ 0 }[] }  // |miembros| ≥ 2
Juntada: { roster, subgrupos }
Transferencia: { de, a, monto }  // resultado
```
**Alternatives:** keep `divideEntre` lines — rejected; mismatches how one person loads data.

### 2. Balances then settle (not greedy intra-group arrows)
For each subgroup: `cuota = Math.ceil(total / n)`, `balance += monto - cuota`.  
Then settle. Detail later (F2) can show per-subgroup cuota/puso/saldo without needing pairwise debts.

### 3. Ceiling remainder correction
`sum(balances)` after ceil may be `total - n*cuota` ≤ 0. Before settlement, apply deterministic correction: while sum &lt; 0, add 1 to the balance of the lexicographically smallest name among those with the current minimum balance (or equivalently distribute +1 to the “most negative” ties by name). Document in tests.  
**Alternatives:** float cuotas — rejected (user asked integer ceil); ignore non-zero sum — rejected (breaks settlement invariant).

### 4. Settlement algorithm
- Partition names into debtors (balance &lt; 0) and creditors (balance &gt; 0).
- Sort each list by name ascending.
- Two-pointer / greedy: transfer `min(-debtor, creditor)` recording `{ de: debtor, a: creditor, monto }`, advance when a side hits 0.
- Stable, easy to test (C2, C4).

### 5. UI replacement strategy
Replace `ListaIntegrantes` flow in place (same app entry). Construction order: domain+tests first (app still old UI briefly), then swap UI in a dedicated slice so Pages never ships a half-broken primary path mid-PR if we merge only complete slices.

### 6. Branch base
Rebase/merge `main` onto `divide-entre` so OpenSpec, Pages workflow, and homepage coexist with F1 work. OpenSpec tree was restored from `main` for this proposal; full rebase still required for code/CI parity.

### 7. Legacy code
After UI cutover, remove `divideEntre`-based entrypath and migrate/delete obsolete tests; keep reusable pure helpers only if they still match (`calcularTotalGastado`, etc.).

## Risks / Trade-offs

- [Ceil remainder confusion] → Correction rule + explicit tests with non-divisible totals.
- [Settlement ≠ “who shared with whom” intuition] → F2 detail explains balances; F1 copy can say “para saldar la juntada”.
- [Large UI swap] → Domain green before UI; thin vertical slice if needed (one subgroup only in UI first) but product F1 still requires N subgroups before calling F1 done.
- [Rebase conflicts with main] → Do rebase before heavy UI; OpenSpec archive already on main.

## Migration Plan

1. Finish rebase of `divide-entre` onto `main`.
2. Land domain + acceptance tests (app may still use old UI).
3. Land wizard UI replacing old screen.
4. Delete legacy input model/tests.
5. Deploy via existing Pages workflow on `main` after merge.

## Open Questions

None material for F1 — decisions locked (deterministic rule, ceil, unique names, UI replace, base on main).
