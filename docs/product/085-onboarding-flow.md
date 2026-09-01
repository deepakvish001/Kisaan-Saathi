# User onboarding workflow

**Guide ID:** 085  
**Category:** product  
**Applies to:** Kisaan Saathi

## Objective

Define the shortest safe path from first visit to first meaningful outcome.

## Product Context

Kisaan Saathi serves farmers, agricultural experts and platform administrators. Apply this guidance to guided crop diagnostics, farm profiles, treatment tracking, weather context and multilingual advisories.

## Design and Engineering Guidance

1. Start with a concrete user outcome, responsible role and measurable completion condition.
2. Define data contracts, validation constraints, access rules and failure recovery before implementation.
3. Keep domain decisions separate from presentation, persistence and external-service adapters.
4. Protect existing state with backward compatibility, migration notes and an achievable rollback.
5. Design loading, empty, success, denied, offline and recoverable-error states deliberately.
6. Add privacy-safe diagnostics that connect product symptoms to technical causes.
7. Capture trade-offs, rollout assumptions and intentionally excluded scope in the implementing PR.

Account for Hindi and English copy, low-bandwidth states, safety disclaimers and expert escalation where relevant.

## Acceptance Criteria

- The affected user and outcome are clear.
- Input limits and permission failures are defined.
- Least privilege and data minimisation are preserved.
- Existing behaviour remains compatible or is migrated safely.
- The workflow is responsive, keyboard operable and understandable.
- Automated checks cover the highest-risk success and failure paths.
- Release, support and rollback expectations are documented.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Manually verify keyboard operation, narrow layouts, slow connectivity, empty data and a denied user. For database changes, test allowed and denied identities separately.

## Review Scope

Implement this topic in a focused pull request. Keep unrelated refactoring, dependency upgrades and formatting changes separate so reviewers can assess product behaviour and risk independently.
