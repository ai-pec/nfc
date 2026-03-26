import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tapfolio",
  description:
    "Premium NFC-powered portfolio hosting with AI-assisted setup, secure media storage, and admin controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${manrope.variable} ${cormorant.variable} min-h-full flex flex-col`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
