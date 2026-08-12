## ADDED Requirements

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
