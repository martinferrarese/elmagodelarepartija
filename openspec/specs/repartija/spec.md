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
The system SHALL produce a list of transfers that bring every global balance to zero using a deterministic greedy algorithm: sort debtors and creditors by name ascending; repeatedly assign the largest possible transfer from the current debtor to the current creditor until all balances are zero. The transfer list SHALL remain the primary settlement output; a separate per-subgroup cost breakdown MAY be shown without intra-subgroup transfer arrows.

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

### Requirement: Collapsible per-subgroup breakdown on result
After showing transfers, the system SHALL offer a collapsible section that reveals a per-subgroup cost breakdown. The section MUST default to collapsed. Expanding it MUST show every subgroup from the calculated juntada.

#### Scenario: Breakdown starts collapsed
- **WHEN** the user reaches the result step with at least one transfer or an empty transfer list
- **THEN** the transfer list is visible and the subgroup breakdown section is collapsed by default

#### Scenario: Expand shows all subgroups
- **WHEN** the user expands the breakdown section
- **THEN** the system lists each subgroup included in the calculation

### Requirement: Subgroup totals and per-member lines
For each subgroup in the breakdown the system SHALL show group totals (total spent, member count, cuota with ceiling) and one line per member with amount paid, cuota, and subgroup balance (`amountPaid - cuota`). Balances in this breakdown MUST be the local subgroup values before any global ceiling-remainder correction used for settlement. The breakdown MUST NOT show intra-subgroup transfer arrows.

#### Scenario: Simple juntada breakdown
- **WHEN** one subgroup has Ferra 1300, Manita 500, Cami 0
- **THEN** the breakdown for that subgroup shows total 1800, 3 members, cuota 600, and lines Ferra puso 1300 saldo +700, Manita puso 500 saldo -100, Cami puso 0 saldo -600

#### Scenario: Alcohol subgroup breakdown
- **WHEN** alcohol has Ferra 16500 and Manita 8000
- **THEN** that subgroup breakdown shows total 24500, 2 members, cuota 12250, Ferra saldo +4250, Manita saldo -4250

### Requirement: Wizard brand chrome
The system SHALL present the product with a wizard-inspired brand: a hat logo, the name “El mago de la repartija” as the primary hero title, and the tagline “cuentas claras, no magia…”. The first viewport MUST read as this brand composition before step content.

#### Scenario: Brand visible on load
- **WHEN** the user opens the app
- **THEN** they see the hat logo, the product name as the dominant title, and the tagline “cuentas claras, no magia…”

### Requirement: Purple-dominant elegant theme
The system SHALL use a purple-dominant visual theme (deep purple field, lavender content surfaces, gold accents for primary actions and the active step). Body and form text on lavender surfaces MUST remain readable. Primary CTAs MUST use the gold accent (or equivalent high-contrast accent on purple), not a generic default purple button on white.

#### Scenario: Theme is not white-default
- **WHEN** the user views any wizard step
- **THEN** the page background is purple-dominant and step content sits on a lighter lavender surface rather than a plain white page with black title

### Requirement: Clearer step layout without flow changes
The system SHALL keep the existing three steps (roster → subgroups → results) while improving visual hierarchy: clearer step indicator, grouped subgroup blocks, and consistent spacing. Calculation behavior and validation rules MUST remain unchanged.

#### Scenario: Same steps, clearer structure
- **WHEN** the user moves through the wizard
- **THEN** the three steps remain available in the same order and subgroup entry remains a distinct block per group

### Requirement: Centered roster step heading
On the roster step, the heading that asks who is in the gathering MUST be horizontally centered within the step content panel.

#### Scenario: Heading alignment
- **WHEN** the user is on the integrantes step
- **THEN** the heading “¿Quiénes están en la juntada?” is centered

### Requirement: Distinct add-group action
The “Agregar grupo” control MUST be visually more prominent than other secondary actions on the subgroups step (such as “Volver”), while remaining distinguishable from the primary gold CTA used to calculate transfers.

#### Scenario: Add group stands out
- **WHEN** the user is on the subgroups step
- **THEN** “Agregar grupo” uses a stronger visual style than “Volver” and is not identical to “Calcular transferencias”

### Requirement: Editable subgroup names
The system SHALL allow the user to edit each subgroup’s display name. Edited names MUST appear in the subgroups step and in the result breakdown. Empty names MUST NOT be kept; the system SHALL restore a non-empty default (for example “Grupo {id}”) if the user clears the field.

#### Scenario: Rename subgroup
- **WHEN** the user changes a subgroup name from “Grupo 1” to “Alcohol” and calculates
- **THEN** the breakdown shows “Alcohol” for that subgroup

#### Scenario: Empty name rejected
- **WHEN** the user clears a subgroup name and leaves the field
- **THEN** the subgroup keeps or restores a non-empty default name

### Requirement: Optional payment alias for creditors on result
On the result step, when there is at least one transfer, the system SHALL let the user enter an optional payment alias (free text, e.g. Mercado Pago / bank alias) for each creditor — a person who appears as the recipient (`a`) of at least one transfer. Debtors-only names MUST NOT be offered an alias field. Alias values MUST NOT affect settlement calculation. Empty aliases MUST be treated as absent.

#### Scenario: Creditor can enter alias
- **WHEN** the result shows transfers where Manita receives money and Ferra only pays
- **THEN** the system shows an alias field for Manita and does not show one for Ferra

#### Scenario: Alias optional and ignored by settlement
- **WHEN** the user leaves a creditor alias empty or fills it and recalculates with the same juntada data
- **THEN** the transfer list amounts and parties remain unchanged by the alias values

#### Scenario: No transfers means no alias fields
- **WHEN** the transfer list is empty
- **THEN** the system does not show payment-alias fields

### Requirement: Copy settlement text without breakdown
The system SHALL provide a control on the result step that copies a plain-text summary of the transfer list to the clipboard. For each transfer the text MUST include payer, amount, and payee. If the payee has a non-empty alias, the text MUST include that alias with the transfer line (or with the payee). The copied text MUST NOT include the per-subgroup breakdown. When there are no transfers, the copied text MUST still be a clear settled message (e.g. that nothing needs to be transferred).

#### Scenario: Copy includes transfers and alias
- **WHEN** the result has “Ferra le transfiere $8250 a Manita”, Manita’s alias is `manita.mp`, and the user chooses to copy the result
- **THEN** the clipboard contains plain text that includes Ferra, 8250, Manita, and `manita.mp`, and does not include subgroup breakdown content

#### Scenario: Copy without alias stays clean
- **WHEN** a transfer exists, the payee alias is empty, and the user copies the result
- **THEN** the clipboard text includes that transfer without an alias placeholder or empty alias marker

#### Scenario: Copy when already settled
- **WHEN** the transfer list is empty and the user copies the result
- **THEN** the clipboard contains plain text stating that no transfers are needed
