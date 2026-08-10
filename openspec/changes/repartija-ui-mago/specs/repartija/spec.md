## ADDED Requirements

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
