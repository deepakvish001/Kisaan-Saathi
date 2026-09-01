# External integration contracts

**Guide ID:** 008  
**Category:** architecture  
**Applies to:** Kisaan Saathi

## Objective

Describe timeouts, retries, validation and fallbacks for third-party integrations.

## Product Context

Kisaan Saathi serves farmers, agricultural experts and platform administrators. This topic must be implemented in the context of guided crop diagnostics, farm profiles, treatment tracking, weather context and multilingual advisories.

## Engineering Guidance

1. Define the user or operational outcome before selecting an implementation.
2. Write the data contract, validation rules, permission boundary and failure behaviour.
3. Keep domain decisions separate from rendering and infrastructure details.
4. Preserve existing user data and provide a migration or rollback path when state changes.
5. Handle loading, empty, success, recoverable-error and denied states explicitly.
6. Add observability that helps diagnose failures without recording secrets or sensitive user data.
7. Document intentional trade-offs and follow-up work in the pull request.

Account for Hindi and English copy, low-bandwidth states, safety disclaimers and expert escalation where relevant.

## Acceptance Criteria

- The intended outcome and affected user roles are explicit.
- Input limits, invalid values and permission failures have defined behaviour.
- The change follows least-privilege access and data-minimisation principles.
- Existing workflows remain backward compatible or have a documented migration.
- User-facing states are responsive, keyboard accessible and understandable.
- Automated checks cover the highest-risk success and failure paths.
- Operational or support documentation is updated when behaviour changes.

## Verification

Run the repository checks relevant to the change:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

For database or policy changes, also verify allowed and denied access with separate test users. For UI changes, verify keyboard operation, narrow screens and a slow-network profile.

## Review Boundaries

Keep the implementing pull request focused on this topic. Separate unrelated refactors, dependency upgrades and formatting-only changes so reviewers can assess behaviour and risk independently.
