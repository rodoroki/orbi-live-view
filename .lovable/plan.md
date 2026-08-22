# Implementation Plan - ORBI LIVE Refinement V0.2.2

Establish the architecture for internationalization (i18n), SEO, and taxonomy to prepare ORBI LIVE for global expansion while preserving the immersive planetary design.

## User Review Required

> [!IMPORTANT]
> This plan focuses on backend/architectural structure. No new visual features or real API integrations will be added in this step.

- **i18n Implementation**: Should we use a specific library like `i18next` or `react-intl`, or a lightweight custom solution for this prototype phase?
- **Route Structure**: The plan proposes path-based locales (e.g., `/en/`, `/pt-br/`). Confirm if you want to implement the actual routing changes now or just the internal capability.

## Proposed Changes

### Internationalization (i18n)
- Create a centralized locale structure in `src/lib/i18n/`.
- Implement a language selector (PT | EN | ES) in the header.
- Define initial translation keys for core UI elements (Events, Layers, Atmosphere, etc.).
- Add language detection logic with fallback to English.

### SEO & Metadata
- Update `src/routes/__root.tsx` and `src/routes/index.tsx` to support localized meta tags (Title, Description, Open Graph).
- Prepare the architecture for `hreflang` and `canonical` tags.

### Taxonomy & Data Structure
- Create `src/lib/taxonomy.ts` to define Categories, Tags, and Geographical Entities.
- Categories: `Natural Events`, `Weather`, `Atmosphere`, `Ocean`, `Climate`, etc.
- Tags: `wildfire`, `earthquake`, `volcano`, `storm`, etc.
- Geographical Entities: Structure for `countries`, `regions`, `coordinates`.

### UI Integration
- Update `AppShell.tsx` to include the discrete language selector.
- Refactor `ContextCard.tsx` and `MapControls.tsx` to use the new translation system.

## Technical Details
- **i18n Store**: Use a simple React Context or TanStack Query state for managing the current locale.
- **Routing**: Utilize TanStack Router's path parameters or sub-routes for locale-specific paths if required.
- **Taxonomy Types**: Define robust Zod schemas for Categories and Tags to ensure data integrity for future API integrations.

## Execution Sequence
1. Create `src/lib/i18n/` directory and translation files.
2. Implement `useTranslation` hook and `I18nProvider`.
3. Create `src/lib/taxonomy.ts` with initial definitions.
4. Update `AppShell.tsx` with the language selector.
5. Refactor existing components to use translated strings.
6. Enhance SEO metadata in route definitions.
