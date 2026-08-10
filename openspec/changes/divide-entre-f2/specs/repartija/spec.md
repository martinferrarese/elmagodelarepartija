## ADDED Requirements

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
