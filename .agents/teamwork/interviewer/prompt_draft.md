Analyze all features represented across the existing UI in the repository and create the corresponding database tables and schema using Drizzle ORM for SQLite/Cloudflare D1.

Working directory: /Users/zerochirou/Developer/Projects/threads
Integrity mode: development

## Requirements

### R1. UI Feature Analysis
Audit all existing UI pages, components, and mockups in the project repository. Produce a catalog of all user-facing features identified from the UI (including create post, comment, edit profile, and all other interactive flows and views present).

### R2. Database Schema Definition
Design and define the database tables and schema using Drizzle ORM configured for SQLite / Cloudflare D1 (aligning with the existing project setup). Every entity, attribute, relationship, and constraint implied by the analyzed UI features must have corresponding table definitions and relations.

## Acceptance Criteria

### Feature Analysis Coverage
- [ ] Every page route and interactive component in the repository is audited, with all supported user actions and features cataloged.
- [ ] The catalog details the data inputs, displays, and states required by each feature (including posts, comments, profile editing, and all other UI-present features).

### Schema Completeness and Validity
- [ ] Drizzle ORM table schemas exist for all entities and relationships identified in the feature analysis.
- [ ] All required fields, data types, primary keys, foreign keys, and indexes match the UI data requirements.
- [ ] The schema definition passes TypeScript type checking (`pnpm tsc --noEmit` or equivalent) without errors.
