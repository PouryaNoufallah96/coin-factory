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
 * - rendering-svg-precision / no-giant-component (about/illustrations only) — these are
 *   machine-exported SVG art kept inline because their CSS keyframe animations target inner
 *   nodes (cf-orbit-group, cf-rocket-part, cf-star). Hand-rounding the generated path/transform
 *   data or splitting the export by paint group would risk the rendered result and churn a
 *   file that is meant to be re-exported, so both cosmetic rules are scoped off there while
 *   staying enforced for every hand-written component.
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
      {
        files: ["src/features/about/components/illustrations/**"],
        rules: [
          "react-doctor/rendering-svg-precision",
          "react-doctor/no-giant-component",
        ],
      },
    ],
  },

  supplyChain: {
    minScore: 46,
  },
};
