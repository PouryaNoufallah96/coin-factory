# Services

`src/services/<provider>` is the first-class home for shared third-party provider clients and adapters with no feature owner.

Use this layer for SDK construction, provider-specific adapters, and environment-gated seams such as storage, email delivery, payment, analytics, or webhooks. Keep domain orchestration in `src/features/*`, pure cross-cutting helpers in `src/lib`, and UI state in the route or feature that owns it.

Server-only services must import `server-only` at the module entry point. Do not expose secrets, provider SDK instances, or per-request user data to client modules.
