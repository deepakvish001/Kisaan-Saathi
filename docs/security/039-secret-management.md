# Secret management

**Guide ID:** 039  
**Category:** security  
**Applies to:** Kisaan Saathi

## Objective

Keep privileged credentials outside browser bundles, logs and source control.

## Product Context

Kisaan Saathi serves farmers, agricultural experts and platform administrators. Apply this guidance to guided crop diagnostics, farm profiles, treatment tracking, weather context and multilingual advisories.

## Engineering Guidance

1. Begin with the user or operational outcome and define measurable completion.
2. Document data contracts, validation limits, permission boundaries and failure behaviour.
3. Keep domain rules separate from UI rendering and infrastructure adapters.
4. Preserve existing data and provide migration and rollback notes for state changes.
5. Handle loading, empty, success, denied and recoverable-error states explicitly.
6. Add privacy-safe diagnostics for important failures and external dependencies.
7. Record intentional trade-offs and deferred work in the implementing pull request.

Account for Hindi and English copy, low-bandwidth states, safety disclaimers and expert escalation where relevant.

## Acceptance Criteria

- Affected roles and intended outcomes are unambiguous.
- Invalid input and unauthorised access have explicit behaviour.
- Least privilege and data minimisation are maintained.
- Existing workflows remain compatible or have a migration plan.
- User-facing interactions are responsive and keyboard accessible.
- High-risk success and failure paths have automated verification.
- Support or operational guidance changes with behaviour.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

For data policies, test allowed and denied users separately. For UI work, test narrow screens, keyboard-only use and a slow network.

## Review Boundaries

Keep implementation focused on this topic. Submit unrelated refactors, dependency updates and formatting changes separately so risk and behaviour remain easy to review.
