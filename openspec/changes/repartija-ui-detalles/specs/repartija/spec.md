## ADDED Requirements

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
