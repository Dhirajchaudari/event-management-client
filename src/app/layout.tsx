import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";

import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Onference Event Studio",
  description: "Curate conference events, speakers, and timelines."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthBootstrap />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
