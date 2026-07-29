import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/app/StoreProvider";
import { SessionProvider } from "next-auth/react";

import openGraph from "./opengraph-image.jpg";
import MaintenancePage from "./MaintenancePage";
import { MaintenanceNotice } from "./MaintenanceNotice";
import SetNecessaryCookies from "./SetNecessaryCookies";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";

const monse = Montserrat({
  subsets: ["latin"],
  variable: "--font-monserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const tradegothic = localFont({
  src: "../public/fonts/gothic_extended.otf",
  variable: "--font-tradegothic",
  display: "swap",
});

export const metadata = {
  title: {
    default: "TryTravelTrip",
    template: "%s | TryTravelTrip",
  },

  description:
    "TryTravelTrip helps you discover flights, hotels, and travel options for your next journey.",

  keywords: [
    "travel",
    "flights",
    "hotels",
    "travel booking",
    "flight search",
    "hotel search",
    "TryTravelTrip",
  ],

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.trytraveltrip.com",
  ),

  openGraph: {
    title: "TryTravelTrip",
    description:
      "Discover flights, hotels, and travel options for your next journey.",
    siteName: "TryTravelTrip",
    images: [
      {
        url: openGraph.src,
        width: openGraph.width,
        height: openGraph.height,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TryTravelTrip",
    description:
      "Discover flights, hotels, and travel options for your next journey.",
    images: [openGraph.src],
  },
};

export default async function RootLayout({ children }) {
  let websiteConfig = {};

  if (process.env.MONGODB_URI) {
    try {
      const { getOneDoc } = await import("@/lib/db/getOperationDB");

      websiteConfig = await getOneDoc(
        "WebsiteConfig",
        {},
        ["websiteConfig"],
        60,
      );
    } catch (error) {
      console.error(
        "Website configuration could not be loaded:",
        error.message,
      );
    }
  }

  const maintenanceMode = websiteConfig?.maintenanceMode ?? {
    enabled: false,
  };

  const alloweRoutesWhileMaintenance =
    maintenanceMode?.allowlistedRoutes ?? [];

  const currentPathname = headers().get("x-pathname");

  return (
    <html lang="en" className={`${tradegothic.variable} ${monse.variable}`}>
      <body className={monse.className}>
        {maintenanceMode.enabled === true &&
        !alloweRoutesWhileMaintenance.some(
          (path) =>
            path === currentPathname ||
            (path !== "/" && currentPathname?.startsWith(path)),
        ) ? (
          <MaintenancePage
            message={maintenanceMode.message}
            startsAt={maintenanceMode.startsAt || 0}
            endsAt={maintenanceMode.endsAt || 0}
          />
        ) : (
          <StoreProvider>
            <SessionProvider>
              <div className="mx-auto max-w-[1440px]">
                <MaintenanceNotice maintenanceMode={maintenanceMode} />
                {children}
              </div>
            </SessionProvider>
          </StoreProvider>
        )}

        <NextTopLoader showSpinner={false} color="hsl(159, 44%, 69%)" />
        <Toaster richColors closeButton expand position="top-right" />
        <SetNecessaryCookies />
        <Analytics />
      </body>
    </html>
  );
}