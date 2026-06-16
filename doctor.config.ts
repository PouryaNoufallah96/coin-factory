/**
 * Manual React Doctor scans should stay at zero errors and zero warnings. Every ignore here
 * is a documented false positive, not a quality concession:
 * - jsx-no-constructed-context-values / no-prop-callback-in-effect —
 *   memoization-shaped rules are moot in a React Compiler codebase (the
 *   compiler auto-memoizes; avoid manual useMemo/useCallback unless profiling justifies it).
 * - deslop/* — dead-code reachability is unreliable under Next.js
 *   auto-discovery (routes, JSX-invoked Server Actions, dynamic import()
 *   targets); prefer `pnpm react-doctor`.
 * - nextjs-no-native-script (funnel-resume-guard only) — the resume guard needs a
 *   render-blocking inline <script> that runs before first paint to hide the
 *   server-rendered landing for a returning visitor; next/script beforeInteractive is
 *   hydration-timed (and must live in the root layout), so it cannot prevent the flash.
 *   Scoped to the one file so the rule still guards every other script.
 * - supplyChain.minScore 50→46 accepts `server-only` (official Vercel guard;
 *   composite dragged down solely by the one-line-stub `quality` axis).
 * - ignore.files excludes docs and hidden local tooling artifacts; React Doctor is the
 *   product React gate.
 * Anything else react-doctor reports must be FIXED in code — never added here
 * without a rationale in this comment.
 */
export default {
  ignore: {
    files: [".*/**", "docs/**"],
    rules: [
      "react-doctor/jsx-no-constructed-context-values",
      "react-doctor/no-prop-callback-in-effect",
      "deslop/unused-export",
      "deslop/unused-file",
      "deslop/unused-dependency",
      "deslop/unused-dev-dependency",
    ],
    overrides: [
      {
        files: ["src/features/inquiries/components/funnel-resume-guard.tsx"],
        rules: ["react-doctor/nextjs-no-native-script"],
      },
    ],
  },
  supplyChain: {
    minScore: 46,
  },
};
