import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { PwaProvider } from "@/components/pwa-provider";
import { UnitsProvider } from "@/components/units-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SubscriptionProvider } from "@/lib/billing/subscription-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroVision - Digital Twin of Your Farm",
  description: "Manage your fields, animals, machinery, workers, and finances from one intelligent platform.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgroVision",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <UnitsProvider>
            <CurrencyProvider>
              <LanguageProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <PwaProvider>
                      {children}
                    </PwaProvider>
                  </SubscriptionProvider>
                </AuthProvider>
              </LanguageProvider>
            </CurrencyProvider>
          </UnitsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
