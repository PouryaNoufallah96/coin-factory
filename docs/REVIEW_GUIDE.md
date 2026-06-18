# Review Guide

<!-- rz-review:generated:start -->
## Project Facts

- Project: coin-factory
- Project kinds: HTTP service, Static web UI
- Package manager: pnpm

## Baseline Review Rules

### R1. Review behavior

Report only concrete issues that can affect correctness, security, maintainability, performance, accessibility, or user experience. Do not comment on style preferences unless this guide or the changed project conventions require it.

### R2. Severity

- blocker: must fix before merge because it can break production, expose data, corrupt state, or block core workflows.
- major: should fix before merge because it creates a real defect, regression risk, or hard-to-maintain design.
- minor: useful improvement with limited risk.
- nit: small cleanup; avoid posting unless it is clearly tied to project conventions.

### R3. Evidence

Every Review Finding must cite the changed code and explain the failure mode. Prefer one precise comment over several broad comments.

### R4. Project conventions

When this guide conflicts with discovered project conventions, prefer the explicit human-written sections in this file and the docs referenced by REVIEW_INDEX.md.

### R5. Generated and vendored code

Do not review generated, vendored, lockfile, build output, coverage output, or binary files unless the change directly modifies build/runtime behavior.

### R6. Security boundaries

Flag exposed secrets, unsafe shell execution, SQL/string injection, missing auth checks, unsafe webhook validation, and unvalidated external input at service boundaries.

### R7. Frontend quality

For frontend changes, check responsive behavior, accessibility basics, loading/error states, state consistency, and whether UI text or controls can overflow on narrow screens.

### R8. Backend quality

For backend changes, check input validation, error handling, idempotency, observability, transaction boundaries, API contract stability, and data consistency.
<!-- rz-review:generated:end -->

<!-- rz-review:human:start -->
## Project-Specific Rules

Add human-owned review rules here. Keep each rule actionable and include examples when false positives are likely.
<!-- rz-review:human:end -->
