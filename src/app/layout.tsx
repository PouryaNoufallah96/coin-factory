import type { Metadata } from "next";
import { Comfortaa, IBM_Plex_Sans, Inter, Parkinsans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";

// Font roles per DESIGN.md: Inter carries the UI; Parkinsans is the logo
// wordmark only; Comfortaa Bold is CTA labels only; IBM Plex Sans is footer
// legal only. Never more than two families on one screen.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const parkinsans = Parkinsans({
  subsets: ["latin"],
  variable: "--font-parkinsans",
  // next/font has no fallback metrics for Parkinsans — make the fallback
  // explicit and skip size-adjust generation (silences the build warning).
  fallback: ["sans-serif"],
  adjustFontFallback: false,
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  weight: "700",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "CoinFactory",
    template: "%s | CoinFactory",
  },
  description:
    "Swiss B2B lead qualification for real-world asset tokenization with CoinFactory AG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        "font-sans",
        inter.variable,
        parkinsans.variable,
        comfortaa.variable,
        ibmPlexSans.variable
      )}
      lang="en"
    >
      <body>
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
