import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { brandCss, brandFontHref, getBrand } from "@/lib/brand";
import { DEFAULT_TRUST_YAML, safeParseTrustCenter } from "@/lib/trust-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parsed = safeParseTrustCenter(DEFAULT_TRUST_YAML);
const siteTitle = parsed.ok
  ? `${parsed.data.company.name} | Trust Center`
  : "Trust Center Builder";
const siteDescription = parsed.ok
  ? parsed.data.company.description
  : "Generate a polished trust center from YAML and centralize document requests.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = getBrand();
  const fontHref = brandFontHref(brand);

  return (
    <html lang="en">
      <head>
        {fontHref ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={fontHref} />
          </>
        ) : null}
        {/* Brand tokens last so they win over the defaults in globals.css. */}
        <style dangerouslySetInnerHTML={{ __html: brandCss(brand) }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
