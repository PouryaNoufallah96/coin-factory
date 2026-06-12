import { pixelBasedPreset, type TailwindConfig } from "react-email";

// Email clients need literal colors; keep these values aligned with DESIGN.md.
export const coinfactoryEmailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        cf: {
          border: "#5F6672",
          canvas: "#232832",
          cream: "#FFF2D1",
          creamFill: "#FFF4D7",
          muted: "#A8ABB1",
          surface: "#2D333E",
          text: "#F7F4EA",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
    },
  },
} satisfies TailwindConfig;
