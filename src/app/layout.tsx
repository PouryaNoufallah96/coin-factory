import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Comfortaa, IBM_Plex_Sans, Inter, Parkinsans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/config/env/client";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/site";
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
  metadataBase: new URL(env.NEXT_PUBLIC_AUTH_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  icons: {
    apple: "/icons/pwa/apple-touch-icon.png",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [{ url: "/icons/pwa/og-banner.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/icons/pwa/og-banner.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#232832",
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
        <SerwistProvider
          disable={process.env.NODE_ENV === "development"}
          swUrl="/sw.js"
        >
          <NuqsAdapter>
            <QueryProvider>{children}</QueryProvider>
          </NuqsAdapter>
          <InstallPrompt />
          <Toaster
            closeButton
            expand
            position="top-left"
            toastOptions={{
              classNames: {
                toast:
                  "w-[calc(100vw-2rem)]! max-w-[calc(100vw-2rem)]! whitespace-normal! sm:w-max! sm:max-w-[80vw]!",
                error:
                  "bg-cf-error! text-cf-text-on-error! border-0! rounded-(--cf-radius-alert)! min-h-14 font-medium pr-15!",
                icon: "text-cf-text-on-error!",
                closeButton:
                  "!left-auto !right-2 !top-1/2 ![transform:translateY(-50%)] !size-6 [&>svg]:!size-4 bg-cf-error! border-0! text-cf-text-on-error! hover:opacity-70!",
              },
            }}
          />
        </SerwistProvider>
      </body>
    </html>
  );
}
