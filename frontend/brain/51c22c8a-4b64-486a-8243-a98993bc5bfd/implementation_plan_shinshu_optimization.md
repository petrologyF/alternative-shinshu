# Implementation Plan: Shinshu University Optimization & Official Branding

This plan consolidates all previous requirements into a final, actionable roadmap to transition from the Tsukuba/KdB heritage to an official Shinshu University identity.

## User Review Required

> [!IMPORTANT]
> **Zod Schema Location Search**
> I will perform one final deep-search for the `subjectCode` Zod schema to apply the `.min(7).max(10)` fix. This is critical to resolve the validation errors currently blocking 8-character Shinshu course codes.

> [!WARNING]
> **Branding Uniformity**
> I will perform a project-wide search for Tsukuba's signature purple (#6600cc / #60c / #512da8) and replace it with **Shinshu Green (#004831 / DIC 389)**. I will also introduce **#c3d600** as the yellow-green accent color for active/hover states.

## Proposed Changes

### Data Model & Validation

#### [MODIFY] [Zod Schema Location (TBD)](file:///c:/Users/climb/Documents/practice/alternative-shinshu/frontend/src/)
- Correct the `subjectCode` validation from `.length(7)` to `.min(7).max(10)`.

#### [MODIFY] [subject.ts](file:///c:/Users/climb/Documents/practice/alternative-shinshu/frontend/src/utils/subject.ts)
- Implement `OpeningDepartment`, `Campus`, `Category`, and `isLottery` fields as previously planned.

### Color Branding & UI

#### [MODIFY] [style.ts](file:///c:/Users/climb/Documents/practice/alternative-shinshu/frontend/src/utils/style.ts)
- Update global color constants:
    - `colorGreen`: `#004831` (Shinshu Green)
    - `colorAccent`: `#c3d600` (Yellow-Green)
- Audit all CSS and Emotion styles for heritage purple and replace with the new palette.

#### [MODIFY] [Assets & Icons](file:///c:/Users/climb/Documents/practice/alternative-shinshu/frontend/public/)
- Generate/Replace the favicon/logo with a minimalist "S" (Shinshu) icon in the new green.

### Rebranding Sweep

#### [MODIFY] [All Files](file:///c:/Users/climb/Documents/practice/alternative-shinshu/frontend/src/)
- Systematically replace "KdB" with "**信州大学 シラバス（非公式）**" or "**信大シラバス**" in:
    - Browser `<title>` (index.html)
    - Headers and Search Buttons
    - Footer Disclaimer & SOAR Mention
    - CSV Export Filenames

## Open Questions

- **Campus Heuristic**: Confirmed: using a `!(year === '1')` check for specialized faculties to map to Nagano/Ueda/Minamiminowa.
- **Specific Green**: User specified `#004831`. This will be treated as the source of truth over previous DIC389 guesses (#006633).

## Verification Plan

### Automated Tests
- `npx tsc -b` to ensure all type changes and schema updates are sound.

### Manual Verification
- Attempt to add an 8-character course (e.g., `SA401100`) and confirm no Zod error occurs.
- Visual inspection: All buttons, hover states, and headers must be green (#004831) or yellow-green (#c3d600).
- Check the footer for the required registration disclaimer.
