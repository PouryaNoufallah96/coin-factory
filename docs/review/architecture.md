# Architecture Review Context

<!-- rz-review:generated:start -->
## Detected Stack

- Zod environment/config validation
- React/Next frontend
- Static public assets
- Route modules
- Service modules
- Server modules
- Docker

## Architecture Shape

- The project exposes HTTP service, Static web UI behavior.
- Source code is organized around these top-level areas:
- .husky
- docs
- drizzle
- public
- src

## Review Focus

- Check whether changes preserve the existing module boundaries.
- Check whether service, route, CLI, and storage changes keep responsibilities separated.
- Check whether new dependencies are justified by real complexity.
- Check whether generated Project Knowledge still matches changed architecture after large refactors.
<!-- rz-review:generated:end -->

<!-- rz-review:human:start -->
## Human Architecture Notes

Document architectural boundaries, non-obvious tradeoffs, and areas where future Review Findings should be stricter or more forgiving.
<!-- rz-review:human:end -->
