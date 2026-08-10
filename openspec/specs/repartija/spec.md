# repartija Specification

## Purpose

Permite cargar una juntada por roster y subgrupos de gasto, y obtener transferencias mínimas globales para saldar de forma justa.

## Requirements

### Requirement: Roster with unique names
The system SHALL let the user maintain a roster of participants with unique names. The user MUST NOT proceed to subgroups until the roster has at least two participants.

#### Scenario: Cannot continue with fewer than two names
- **WHEN** the roster has fewer than two participants
- **THEN** the system does not allow advancing to subgroup entry

#### Scenario: Duplicate names rejected
- **WHEN** the user tries to add a name that already exists in the roster (case-sensitive exact match as entered)
- **THEN** the system rejects the addition and keeps the roster unchanged

### Requirement: Explicit subgroups with amounts
The system SHALL represent expenses as one or more subgroups. Each subgroup has at least two members drawn from the roster, and each member has a non-negative integer amount paid in that subgroup (default 0 meaning paid nothing). Negative amounts MUST be rejected.

#### Scenario: Subgroup requires at least two members
- **WHEN** the user tries to save or calculate with a subgroup that has fewer than two members
- **THEN** the system rejects that subgroup as invalid

#### Scenario: Zero amount means paid nothing
- **WHEN** a member is in a subgroup with amount 0
- **THEN** that member still shares the subgroup cost and their balance for that subgroup is based on the subgroup cuota

#### Scenario: Negative amount rejected
- **WHEN** the user enters a negative amount for a subgroup member
- **THEN** the system rejects the value

#### Scenario: Add everyone shortcut
- **WHEN** the user chooses to add all roster participants to a subgroup
- **THEN** every roster name becomes a member of that subgroup with default amount 0 unless already set

### Requirement: Ceiling cuota and global balances
For each valid subgroup the system SHALL compute `cuota = ceil(total / memberCount)` in integer currency units, then each member's subgroup balance as `amountPaid - cuota`. Global balance per person is the sum of their subgroup balances. If ceiling causes the sum of global balances to be non-zero, the system SHALL adjust balances with a documented deterministic correction so the sum of balances is zero before settlement.

#### Scenario: Simple juntada one subgroup
- **WHEN** roster is Ferra, Manita, Cami and one subgroup includes all with amounts 1300, 500, 0
- **THEN** global balances are Ferra +700, Manita -100, Cami -600 (cuota 600)

#### Scenario: Alcohol and food subgroups
- **WHEN** alcohol is Ferra 16500 and Manita 8000, and food is Ferra 0, Manita 27500, Cami 10000
- **THEN** global balances are Ferra -8250, Manita +10750, Cami -2500

### Requirement: Deterministic minimum settlement
The system SHALL produce a list of transfers that bring every global balance to zero using a deterministic greedy algorithm: sort debtors and creditors by name ascending; repeatedly assign the largest possible transfer from the current debtor to the current creditor until all balances are zero. The result SHALL be the only user-facing settlement output in F1 (no per-subgroup transfer detail).

#### Scenario: Alcohol and food transfers
- **WHEN** balances are Ferra -8250, Manita +10750, Cami -2500
- **THEN** the transfers are Ferra pays Manita 8250 and Cami pays Manita 2500

#### Scenario: Already settled
- **WHEN** all global balances are zero
- **THEN** the transfer list is empty

#### Scenario: Multiple creditors deterministic pairing
- **WHEN** one subgroup has A 2000, B 800, C 0, D 0 (all four members)
- **THEN** applying the published deterministic settlement yields transfers that zero all balances, and the transfer list matches the algorithm’s stable ordering by name

### Requirement: F1 wizard UI replaces legacy flow
The system SHALL replace the legacy single-screen “name + amount + calculate” flow with a multi-step flow: (1) roster, (2) subgroups and amounts, (3) transfer results. Basic edit of roster, subgroups, membership, and amounts MUST be supported so the user can recalculate without losing unrelated data in memory.

#### Scenario: Happy path
- **WHEN** the user completes roster, creates at least one valid subgroup with amounts, and requests calculation
- **THEN** the system shows the deterministic transfer list

#### Scenario: Recalculate after edit
- **WHEN** the user changes a subgroup amount after a result was shown and calculates again
- **THEN** the system shows an updated transfer list consistent with the new data
