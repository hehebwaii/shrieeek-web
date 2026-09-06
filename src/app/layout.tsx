import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F3F000",
};

export const metadata: Metadata = {
  title: "ShrIEEEk '26 | Digital Character Card System",
  description: "Official IEEE Event Superhero Character Card & QR XP Leveling Network",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ShrIEEEk '26",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-[#121212] text-brand-white antialiased flex flex-col items-center justify-start w-full">
        <ServiceWorkerRegister />
        <AnnouncementBanner />
        {children}
      </body>
    </html>
  );
}
