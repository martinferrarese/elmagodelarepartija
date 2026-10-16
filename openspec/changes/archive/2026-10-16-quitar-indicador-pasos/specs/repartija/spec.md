## MODIFIED Requirements

### Requirement: Purple-dominant elegant theme
The system SHALL use a purple-dominant visual theme (deep purple field, lavender content surfaces, gold accents for primary actions). Body and form text on lavender surfaces MUST remain readable. Primary CTAs MUST use the gold accent (or equivalent high-contrast accent on purple), not a generic default purple button on white.

#### Scenario: Theme is not white-default
- **WHEN** the user views any wizard step
- **THEN** the page background is purple-dominant and step content sits on a lighter lavender surface rather than a plain white page with black title

### Requirement: Clearer step layout without flow changes
The system SHALL keep the existing three steps (roster → subgroups → results) while improving visual hierarchy: no non-interactive step-pill header above the step title, grouped subgroup blocks, and consistent spacing. Calculation behavior and validation rules MUST remain unchanged.

#### Scenario: Same steps, clearer structure
- **WHEN** the user moves through the wizard
- **THEN** the three steps remain available in the same order, no step-indicator pills are rendered above the step content, and subgroup entry remains a distinct block per group
