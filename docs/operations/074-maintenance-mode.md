# Maintenance mode behaviour

**Guide ID:** 074  
**Category:** operations  
**Applies to:** Kisaan Saathi

## Objective

Keep users informed while protecting writes during maintenance.

## Product Context

Kisaan Saathi serves farmers, agricultural experts and platform administrators. Apply this guidance to guided crop diagnostics, farm profiles, treatment tracking, weather context and multilingual advisories.

## Recommended Approach

1. Define the observable outcome, responsible role and completion signal.
2. Identify trust boundaries, data contracts, dependencies and likely failure modes.
3. Keep domain logic independently testable and infrastructure details replaceable.
4. Protect existing state with compatibility, migration and rollback planning.
5. Cover loading, empty, success, permission-denied and recoverable-error states.
6. Record privacy-safe diagnostics that connect technical failures to user impact.
7. Document trade-offs, operational ownership and intentionally deferred scope.

Account for Hindi and English copy, low-bandwidth states, safety disclaimers and expert escalation where relevant.

## Acceptance Criteria

- User impact and ownership are explicit.
- Inputs, permissions and failure behaviour are defined.
- Existing workflows remain compatible or include a migration.
- Security and privacy risks have mitigations.
- User-facing changes remain responsive and accessible.
- Automated verification covers the highest-risk paths.
- Rollout and rollback expectations are documented.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Also test relevant denied, empty, offline, timeout and narrow-screen scenarios. Database policies require separate allowed-user and denied-user checks.

## Pull Request Guidance

Keep the implementation independently reviewable. Avoid bundling dependency upgrades, formatting-only changes or unrelated refactors with this topic.
