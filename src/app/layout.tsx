import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/app/shared/Header";
import OpticalAlignProvider from "@/app/shared/OpticalAlignProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stikkman UX — Coming Soon",
  description:
    "We power your digital experience transformation. Fintech, AI products, SaaS, ecommerce and healthcare. The new Stikkman UX launches 14 September 2026.",
  openGraph: {
    title: "Stikkman UX — Coming Soon",
    description:
      "We power your digital experience transformation. Launching 14 September 2026.",
    siteName: "Stikkman UX",
    type: "website",
  },
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
    >
      <body
        style={{ fontFamily: "var(--font-geist-sans)" }}
        className="min-h-full bg-white"
      >
        <Header />
        <OpticalAlignProvider />
        {children}
      </body>
    </html>
  );
}
